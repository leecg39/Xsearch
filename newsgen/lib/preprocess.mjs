// 수집 JSON 전처리: 중복 제거 → 참여도 점수 × AI 관련도 가중 → 라벨 분류 → 후보 선별.
// 라벨 기준은 fiv.co.kr 라벨 가이드(🔥 인기 · 🔁 공유 · 💬 논쟁 · 🔖 저장 · 🚀 떠오름)를 따른다.

// \b는 한글에 동작하지 않으므로 영어(경계 필요)와 CJK(부분 일치)를 분리한다.
const RE_EN = /\b(ai|ml|llm|gpt|agi|rl|sota|gpu|tpu)\b|openai|chatgpt|claude|anthropic|gemini|deepmind|copilot|cursor|codex|grok|llama|mistral|qwen|deepseek|midjourney|diffusion|transformer|agentic|agents?\b|benchmark|inference|fine-?tun|hugging ?face|nvidia|robotic|autonomous|prompt|token|dataset|neural|frontier model|open[- ]?weight/i;
const RE_KO = /인공지능|생성형|거대언어|언어모델|모델|에이전트|프롬프트|추론|파인튜닝|벤치마크|반도체|로봇|자율주행|챗봇|오픈소스|코딩|개발자|딥러닝|머신러닝/;
const RE_JA_ZH = /人工知能|生成AI|エージェント|モデル|推論|人工智能|大模型|智能体|开源|推理/;

function num(v) { return typeof v === 'number' && isFinite(v) ? v : 0; }

export function aiHits(text) {
  if (!text) return 0;
  let hits = 0;
  if (RE_EN.test(text)) hits++;
  if (RE_KO.test(text)) hits++;
  if (RE_JA_ZH.test(text)) hits++;
  // 영어 키워드가 여러 개면 한 단계 더 인정
  const multi = (text.match(new RegExp(RE_EN.source, 'gi')) || []).length;
  if (multi >= 3) hits++;
  return Math.min(hits, 3);
}

export function engagementScore(t) {
  return (
    Math.log10(1 + num(t.likes)) +
    1.2 * Math.log10(1 + num(t.retweets)) +
    1.1 * Math.log10(1 + num(t.bookmarks)) +
    0.8 * Math.log10(1 + num(t.replies)) +
    0.3 * Math.log10(1 + num(t.views))
  );
}

export function labelOf(t) {
  const likes = num(t.likes), rts = num(t.retweets), replies = num(t.replies);
  const bm = num(t.bookmarks), views = num(t.views);
  const safeLikes = Math.max(likes, 1);
  if (views > 0 && views < 80000 && likes >= 300 && likes / views > 0.02) return '🚀';
  if (replies / safeLikes > 0.25 && replies > 80) return '💬';
  if (rts / safeLikes > 0.35 && rts > 100) return '🔁';
  if (bm / safeLikes > 0.6 && bm > 200) return '🔖';
  return '🔥';
}

export function toKst(iso) {
  const d = new Date(iso);
  if (isNaN(d)) return null;
  const k = new Date(d.getTime() + 9 * 3600 * 1000);
  const p = (n) => String(n).padStart(2, '0');
  return {
    date: `${k.getUTCFullYear()}-${p(k.getUTCMonth() + 1)}-${p(k.getUTCDate())}`,
    label: `${p(k.getUTCMonth() + 1)}-${p(k.getUTCDate())} ${p(k.getUTCHours())}:${p(k.getUTCMinutes())}`,
  };
}

/** 업로드 데이터 요약 (UI 표시·다이제스트 헤더용) */
export function analyze(tweets) {
  const langs = {};
  let aiCount = 0, minT = null, maxT = null, likesSum = 0;
  for (const t of tweets) {
    if (t.lang) langs[t.lang] = (langs[t.lang] || 0) + 1;
    if (aiHits(`${t.text || ''} ${t.quoted?.text || ''}`) > 0) aiCount++;
    likesSum += num(t.likes);
    const d = new Date(t.time);
    if (!isNaN(d)) {
      if (!minT || d < minT) minT = d;
      if (!maxT || d > maxT) maxT = d;
    }
  }
  const langTop = Object.entries(langs).sort((a, b) => b[1] - a[1]).slice(0, 4);
  return {
    total: tweets.length,
    aiCount,
    likesSum,
    langTop,
    rangeKst: minT && maxT ? `${toKst(minT.toISOString()).label} ~ ${toKst(maxT.toISOString()).label}` : '-',
  };
}

/**
 * LLM 입력/다이제스트용 후보 선별.
 * @returns {Array<{i:number,t:object,score:number,label:string,kst:{date,label}|null}>}
 */
export function prepareCandidates(tweets, { limit = 110 } = {}) {
  const seen = new Set();
  const rows = [];
  for (const t of tweets) {
    const key = t.url || `${t.handle}|${t.time}|${(t.text || '').slice(0, 40)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const hits = aiHits(`${t.text || ''} ${t.quoted?.text || ''} ${t.articleTitle || ''}`);
    const base = engagementScore(t);
    const score = base * (hits > 0 ? 1.6 + 0.3 * hits : 1);
    rows.push({ t, score, hits, label: labelOf(t), kst: t.time ? toKst(t.time) : null });
  }
  rows.sort((a, b) => b.score - a.score);
  const picked = rows.slice(0, limit);
  // LLM이 참조할 안정적 번호 부여
  picked.forEach((r, idx) => { r.i = idx + 1; });
  return picked;
}

function clip(s, n) {
  if (!s) return '';
  const one = String(s).replace(/\s+/g, ' ').trim();
  return one.length > n ? one.slice(0, n - 1) + '…' : one;
}

/** LLM 프롬프트에 넣을 압축 텍스트 라인 생성 */
export function toPromptLines(cands) {
  const lines = [];
  for (const c of cands) {
    const t = c.t;
    const media = t.media ? (String(t.media).includes('vid') ? '영상' : String(t.media).includes('img') ? '이미지' : t.media) : '-';
    const head = `[${c.i}] ${c.label} @${t.handle?.replace(/^@/, '') || '?'}${t.verified ? '✓' : ''} (${clip(t.name, 24)}) ${c.kst?.label || '?'}KST | ❤${num(t.likes)} 🔁${num(t.retweets)} 💬${num(t.replies)} 🔖${num(t.bookmarks)} 👁${num(t.views)} | 미디어:${media}`;
    lines.push(head);
    lines.push(clip(t.text, 420));
    if (t.quoted?.text) lines.push(`(인용 ${clip(t.quoted.user || '', 30)}: ${clip(t.quoted.text, 160)})`);
    if (t.articleTitle) lines.push(`(기사: ${clip(t.articleTitle, 80)})`);
    lines.push('');
  }
  return lines.join('\n');
}
