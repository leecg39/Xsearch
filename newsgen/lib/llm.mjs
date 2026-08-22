// LLM 호출(Grok 구독·Anthropic·OpenAI·Gemini)과 '5분 AI 뉴스' 편집 프롬프트, 구조화 JSON 파싱.
import { GROK } from './grok-auth.mjs';
import { DEFAULT_TOPIC, briefingBrand, normalizeTopicKey } from '../../src/topics.mjs';

export const ENV_KEYS = {
  grok: 'XAI_OAUTH_TOKEN', // SuperGrok OAuth 액세스 토큰을 직접 넣는 우회 경로
  anthropic: 'ANTHROPIC_API_KEY',
  openai: 'OPENAI_API_KEY',
  gemini: 'GEMINI_API_KEY',
};

// CLI 프록시가 내려주는 참고용 모델 목록 (목록 API 실패 시 폴백)
export const GROK_FALLBACK_MODELS = ['grok-4.5', 'grok-build-0.1', 'grok-4.3', 'grok-4.20-0309-reasoning', 'grok-4.20-0309-non-reasoning'];

const TIMEOUT_MS = 300_000;

function short(s, n = 400) { return String(s || '').slice(0, n); }

async function post(url, headers, body) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json', ...headers },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const text = await res.text();
  if (!res.ok) {
    let msg = text;
    try { const j = JSON.parse(text); msg = j.error?.message || j.message || text; } catch {}
    const err = new Error(`API ${res.status}: ${short(msg)}`);
    err.status = res.status;
    throw err;
  }
  return JSON.parse(text);
}

/** Grok CLI 프록시(OpenAI Responses 형식) 응답에서 본문 텍스트 추출 — JSON·SSE 모두 대응 */
function parseResponsesOutput(text) {
  const fromResponse = (j) => {
    if (typeof j.output_text === 'string' && j.output_text) return j.output_text;
    const out = Array.isArray(j.output) ? j.output : [];
    return out
      .filter((o) => o.type === 'message')
      .flatMap((o) => (Array.isArray(o.content) ? o.content : []))
      .filter((c) => c.type === 'output_text')
      .map((c) => c.text || '')
      .join('');
  };
  const trimmed = String(text || '').trim();
  if (trimmed.startsWith('{')) {
    return fromResponse(JSON.parse(trimmed));
  }
  // SSE: response.completed 이벤트의 최종 응답을 우선, 없으면 델타 누적
  let deltas = '';
  for (const line of trimmed.split('\n')) {
    if (!line.startsWith('data:')) continue;
    const payload = line.slice(5).trim();
    if (!payload || payload === '[DONE]') continue;
    try {
      const ev = JSON.parse(payload);
      if (ev.type === 'response.completed' && ev.response) return fromResponse(ev.response);
      if (ev.type === 'response.output_text.delta' && typeof ev.delta === 'string') deltas += ev.delta;
    } catch {}
  }
  if (deltas) return deltas;
  throw new Error('그록 프록시 응답에서 텍스트를 찾지 못했습니다');
}

export async function chatLLM({ provider, model, apiKey, system, user, maxTokens = 16000 }) {
  if (provider === 'grok') {
    // SuperGrok 구독 경로: 유료 api.x.ai가 아니라 Grok CLI 채팅 프록시로 보낸다.
    // service_tier·text.verbosity·reasoning은 xAI가 400을 내는 필드라 보내지 않는다.
    // 프록시가 input text를 JSON식 언이스케이프하므로, 잘린 \\u/제어문자 잔여를 한 번 더 제거한다.
    const { sanitizePromptText } = await import('./preprocess.mjs');
    const safeSystem = sanitizePromptText(system);
    const safeUser = sanitizePromptText(user);
    const res = await fetch(`${GROK.proxyBase}/responses`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'text/event-stream',
        authorization: `Bearer ${apiKey}`,
        ...GROK.identityHeaders,
      },
      body: JSON.stringify({
        model,
        instructions: safeSystem,
        input: [{ role: 'user', content: [{ type: 'input_text', text: safeUser }] }],
        max_output_tokens: maxTokens,
        store: false,
        stream: false,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    const text = await res.text();
    if (!res.ok) {
      let msg = text;
      try { const j = JSON.parse(text); msg = j.error?.message || j.error || j.message || text; } catch {}
      if (res.status === 402 || res.status === 403) {
        msg = `구독 등급이 CLI 프록시 접근을 지원하지 않거나 인증이 유효하지 않습니다 — ${short(msg, 200)}`;
      }
      const err = new Error(`그록 프록시 ${res.status}: ${short(msg)}`);
      err.status = res.status;
      throw err;
    }
    return parseResponsesOutput(text);
  }
  if (provider === 'anthropic') {
    const j = await post('https://api.anthropic.com/v1/messages',
      { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      { model, max_tokens: maxTokens, system, messages: [{ role: 'user', content: user }] });
    return (j.content || []).map((c) => c.text || '').join('');
  }
  if (provider === 'openai') {
    const body = {
      model,
      messages: [{ role: 'system', content: system }, { role: 'user', content: user }],
      max_completion_tokens: maxTokens,
      response_format: { type: 'json_object' },
    };
    try {
      const j = await post('https://api.openai.com/v1/chat/completions', { authorization: `Bearer ${apiKey}` }, body);
      return j.choices?.[0]?.message?.content || '';
    } catch (e) {
      // 구형 모델 호환: max_completion_tokens/response_format 미지원 시 레거시 파라미터로 재시도
      if (e.status === 400 && /max_completion_tokens|response_format|unsupported/i.test(e.message)) {
        const legacy = { model, messages: body.messages, max_tokens: maxTokens };
        const j = await post('https://api.openai.com/v1/chat/completions', { authorization: `Bearer ${apiKey}` }, legacy);
        return j.choices?.[0]?.message?.content || '';
      }
      throw e;
    }
  }
  if (provider === 'gemini') {
    const j = await post(
      `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
      {},
      {
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: user }] }],
        generationConfig: { maxOutputTokens: maxTokens, responseMimeType: 'application/json' },
      });
    const parts = j.candidates?.[0]?.content?.parts || [];
    return parts.map((p) => p.text || '').join('');
  }
  throw new Error(`알 수 없는 프로바이더: ${provider}`);
}

/** 프로바이더별 사용 가능 모델 목록 조회 */
export async function listModels({ provider, apiKey }) {
  const get = async (url, headers = {}) => {
    const res = await fetch(url, { headers, signal: AbortSignal.timeout(20000) });
    if (!res.ok) throw new Error(`API ${res.status}: ${short(await res.text(), 200)}`);
    return res.json();
  };
  if (provider === 'grok') {
    const j = await get(`${GROK.proxyBase}/models`, { authorization: `Bearer ${apiKey}`, ...GROK.identityHeaders });
    const ids = (j.data || j.models || []).map((m) => m.id || m.name).filter(Boolean);
    return ids.length ? ids : GROK_FALLBACK_MODELS;
  }
  if (provider === 'anthropic') {
    const j = await get('https://api.anthropic.com/v1/models?limit=100', { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' });
    return (j.data || []).map((m) => m.id);
  }
  if (provider === 'openai') {
    const j = await get('https://api.openai.com/v1/models', { authorization: `Bearer ${apiKey}` });
    return (j.data || []).map((m) => m.id).filter((id) => /^(gpt|o\d|chatgpt)/.test(id)).sort();
  }
  if (provider === 'gemini') {
    const j = await get(`https://generativelanguage.googleapis.com/v1beta/models?pageSize=100&key=${encodeURIComponent(apiKey)}`);
    return (j.models || []).map((m) => m.name?.replace(/^models\//, '')).filter((n) => n && /gemini/.test(n));
  }
  throw new Error(`알 수 없는 프로바이더: ${provider}`);
}

export function systemPrompt(topic = DEFAULT_TOPIC) {
  const { newsletter, newsLabel, name } = briefingBrand(topic);
  return `당신은 한국어 데일리 뉴스레터 '${newsletter}'의 편집장입니다. 수집한 게시물 목록을 재료로, 하루치 ${newsLabel} 브리핑을 만듭니다.

[문체 규칙]
- 존댓말 "-습니다"체. 담백하고 단정한 신문 문체. 과장·감탄·홍보 어투 금지.
- 게시물에서 확인되는 사실만 씁니다. 원문에 없는 내용을 지어내지 않으며, 단일 출처 주장은 "~라고 밝혔습니다", "~라는 주장입니다"로 한정합니다.
- 회사·제품명은 관례적 한글 표기를 우선합니다(마이크로소프트, 오픈AI, 딥마인드, 앤트로픽, 클로드, 제미나이 등).
- 문단에서 강조할 핵심 구절 1곳은 **이렇게** 별표 두 개로 감쌉니다(전체에서 아껴 씁니다).
- 숫자는 구체적으로 씁니다(달러 금액, 퍼센트, 배수 등). 한국 독자 기준 시간은 KST입니다.

[작업 절차]
1. ${name} 주제와 무관한 게시물(스포츠, 연예, 일상, 정치 일반 등)은 전부 무시합니다.
2. 남은 게시물을 주제별로 묶어 오늘의 토픽 5~6개를 만듭니다. 참여도(❤🔁💬🔖👁)가 높고 여러 계정이 다룬 주제를 우선합니다. 마지막 토픽은 가능하면 "🆕 오늘의 신기능·신제품 출시 — (요약 키워드)" 형식의 모음 토픽으로 만듭니다.
3. 각 토픽의 제목은 사실 중심의 평서문 한 문장으로 씁니다(낚시성 금지, 번호는 붙이지 않음).
4. figure는 미디어:이미지 표시가 있는 게시물 중에서만 고르고, 해당 번호(i)를 적습니다. 캡션은 "무엇이 보이는지 한 문장 + 왜 의미 있는지 한 문장"으로 씁니다. "그림 N." 번호는 시스템이 붙이므로 쓰지 않습니다.
5. 타임라인은 게시물의 KST 시각을 그대로 사용해 시간순으로 6~9개 만듭니다.
6. 감정/온도 분석의 4개 카테고리(전환·성장·주의·과열)는 고정이며, 각 카테고리의 게이지 위치(pos, 0~100)와 오늘 데이터에 근거한 설명을 씁니다.
7. 실무 팁 6개는 오늘 게시물에서 실제로 확인된 내용만으로, 실무자가 바로 적용할 수 있게 씁니다. 근거 번호(i)를 답니다.
8. source_ids에는 그 토픽의 근거가 된 게시물 번호를 모두 나열합니다(토픽당 3~17개).

[출력 형식]
코드펜스 없이 아래 스키마의 JSON 하나만 출력합니다. 모든 문자열은 한국어입니다.
{
  "title_main": "가장 큰 뉴스의 한 문장 제목",
  "title_sub": "부제 키워드(10자 내외)",
  "description": "SEO 요약 140자 이내",
  "keywords_top5": ["키워드1","키워드2","키워드3","키워드4","키워드5"],
  "main_event": "오늘의 메인 이벤트 한 문장",
  "stats": [ {"value":"27년","label":"수치가 뜻하는 것","sub":"짧은 부연"} ],   // 정확히 4개
  "intro": "도입 문단 3~5문장",
  "hero_figure": {"i": 12, "caption": "..."} 또는 null,
  "timeline": [ {"time":"08-06 00:52","text":"한 줄 사건"} ],
  "sections": [
    {
      "title": "토픽 제목(번호 없이)",
      "bullets": ["핵심 사실 1","핵심 사실 2","핵심 사실 3"],
      "figures": [ {"i": 3, "caption": "..."} ],           // 0~2개
      "analysis": "해설 문단(맥락과 해석, 4~6문장)",
      "extra": "그 밖에: 로 시작하지 말고 내용만. 같은 주제의 나머지 소식 2~4가지",
      "tip": "시사점: 로 시작하지 말고 내용만. 실무자 관점 1~2문장",
      "tags": ["#태그1","#태그2","#태그3"],
      "source_ids": [1,2,3]
    }
  ],
  "sentiment": {
    "pins": [
      {"name":"전환","pos":8,"text":"..."},
      {"name":"성장","pos":40,"text":"..."},
      {"name":"주의","pos":70,"text":"..."},
      {"name":"과열","pos":94,"text":"..."}
    ],
    "summary": "오늘 하루 반응 요약 1~2문장"
  },
  "tips": [ {"title":"팁 제목","body":"설명 2~3문장","i":5} ],   // 정확히 6개
  "verification": "확인 방식 설명 2~3문장(어떤 출처끼리 교차확인했는지)"
}`;
}

export const SYSTEM_PROMPT = systemPrompt('ai');

export function buildUserPrompt({ date, cands, promptLines, topic = DEFAULT_TOPIC }) {
  const { newsletter } = briefingBrand(topic);
  return `보고서 날짜: ${date} (이 날짜 기준으로 "오늘"을 씁니다)
후보 트윗: ${cands.length}개 (참여도 상위순, 번호 [i]는 인용에 사용)
라벨 의미: 🔥 인기(좋아요 중심) · 🔁 공유(리트윗 비율 높음) · 💬 논쟁(댓글 비율 높음) · 🔖 저장(북마크 많음) · 🚀 떠오름(작은 계정인데 확산)

=== 트윗 목록 시작 ===
${promptLines}
=== 트윗 목록 끝 ===

위 재료로 ${date}자 '${newsletter}' JSON을 작성하세요.`;
}

export function extractJSON(text) {
  let s = String(text || '').trim();
  s = s.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '');
  const a = s.indexOf('{'), b = s.lastIndexOf('}');
  if (a === -1 || b === -1 || b <= a) throw new Error('응답에서 JSON을 찾지 못했습니다');
  s = s.slice(a, b + 1);
  try { return JSON.parse(s); }
  catch {
    // 흔한 오류(후행 콤마) 복구 시도
    return JSON.parse(s.replace(/,\s*([}\]])/g, '$1'));
  }
}

/** LLM 응답을 렌더러가 신뢰할 수 있는 형태로 정규화 */
export function normalizeReport(r, date, topic = DEFAULT_TOPIC) {
  const { newsLabel } = briefingBrand(topic);
  const str = (v, d = '') => (typeof v === 'string' && v.trim() ? v.trim() : d);
  const arr = (v) => (Array.isArray(v) ? v : []);
  const intOr = (v, d) => (Number.isFinite(Number(v)) ? Number(v) : d);

  const stats = arr(r.stats).slice(0, 4).map((s) => ({
    value: str(s?.value, '—'), label: str(s?.label, ''), sub: str(s?.sub, ''),
  }));
  while (stats.length < 4) stats.push({ value: '—', label: '', sub: '' });

  const fig = (f) => (f && Number.isFinite(Number(f.i)) ? { i: Number(f.i), caption: str(f.caption, '') } : null);

  const sections = arr(r.sections).slice(0, 7).map((s) => ({
    title: str(s?.title, '제목 없음'),
    bullets: arr(s?.bullets).map((b) => str(b)).filter(Boolean).slice(0, 5),
    figures: arr(s?.figures).map(fig).filter(Boolean).slice(0, 2),
    analysis: str(s?.analysis, ''),
    extra: str(s?.extra, ''),
    tip: str(s?.tip, ''),
    tags: arr(s?.tags).map((t) => str(t)).filter(Boolean).slice(0, 4),
    source_ids: arr(s?.source_ids).map(Number).filter(Number.isFinite),
  })).filter((s) => s.bullets.length > 0);

  if (sections.length === 0) throw new Error('LLM 응답에 유효한 섹션이 없습니다');

  const PIN_DEF = [
    { name: '전환', pos: 10 }, { name: '성장', pos: 40 }, { name: '주의', pos: 70 }, { name: '과열', pos: 92 },
  ];
  const pinsIn = arr(r.sentiment?.pins);
  const pins = PIN_DEF.map((d) => {
    const m = pinsIn.find((p) => str(p?.name) === d.name) || {};
    return { name: d.name, pos: Math.min(98, Math.max(2, intOr(m.pos, d.pos))), text: str(m.text, '') };
  });

  return {
    date,
    topic: normalizeTopicKey(topic),
    title_main: str(r.title_main, `${date} ${newsLabel}`),
    title_sub: str(r.title_sub, ''),
    description: str(r.description, str(r.intro, '').slice(0, 140)),
    keywords_top5: arr(r.keywords_top5).map((k) => str(k)).filter(Boolean).slice(0, 5),
    main_event: str(r.main_event, ''),
    stats,
    intro: str(r.intro, ''),
    hero_figure: fig(r.hero_figure),
    timeline: arr(r.timeline).map((t) => ({ time: str(t?.time, ''), text: str(t?.text, '') }))
      .filter((t) => t.time && t.text).slice(0, 10),
    sections,
    sentiment: { pins, summary: str(r.sentiment?.summary, '') },
    tips: arr(r.tips).map((t) => ({ title: str(t?.title, ''), body: str(t?.body, ''), i: intOr(t?.i, NaN) }))
      .filter((t) => t.title && t.body).slice(0, 6),
    verification: str(r.verification, ''),
  };
}

/** 편집 브리핑 생성 (파싱 실패 시 1회 재시도) */
export async function generateReport({ provider, model, apiKey, date, cands, onStatus, topic = DEFAULT_TOPIC }) {
  const user = buildUserPrompt({ date, cands, promptLines: (await import('./preprocess.mjs')).toPromptLines(cands), topic });
  const system = systemPrompt(topic);
  let lastErr;
  for (let attempt = 1; attempt <= 2; attempt++) {
    onStatus?.(`${provider} ${model} 호출 중 (시도 ${attempt}/2)`);
    const extra = attempt > 1
      ? '\n\n[경고] 직전 출력이 유효한 JSON이 아니었습니다. 이번에는 코드펜스·주석·설명 없이 유효한 JSON 객체 하나만 출력하세요.'
      : '';
    try {
      const text = await chatLLM({ provider, model, apiKey, system, user: user + extra });
      const raw = extractJSON(text);
      return normalizeReport(raw, date, topic);
    } catch (e) {
      lastErr = e;
      // 인증·모델 오류는 재시도해도 소용없으므로 즉시 중단
      if (e.status === 401 || e.status === 403 || e.status === 404) throw e;
    }
  }
  throw lastErr;
}
