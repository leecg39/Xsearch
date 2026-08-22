// 수집 JSON 전처리: 중복 제거 → 참여도 점수 × 토픽 관련도 가중 → 라벨 분류 → 후보 선별.
// 라벨 기준은 fiv.co.kr 라벨 가이드(🔥 인기 · 🔁 공유 · 💬 논쟁 · 🔖 저장 · 🚀 떠오름)를 따른다.
import { DEFAULT_TOPIC, normalizeTopicKey, topicOf } from '../../src/topics.mjs';

// 토픽별 키워드 정규식 캐시. 영어는 \b 경계, 한글/CJK는 부분 일치.
const kwCache = new Map();
function kwRes(topicKey) {
  const key = normalizeTopicKey(topicKey);
  if (kwCache.has(key)) return kwCache.get(key);
  const kw = topicOf(key).kw || {};
  const compile = (src) => {
    if (!src) return null;
    try { return new RegExp(src, 'i'); } catch { return null; }
  };
  const res = { en: compile(kw.en), ko: compile(kw.ko), jazh: compile(kw.jazh) };
  kwCache.set(key, res);
  return res;
}

function num(v) { return typeof v === 'number' && isFinite(v) ? v : 0; }

export function topicHits(text, topic = DEFAULT_TOPIC) {
  if (!text) return 0;
  const re = kwRes(topic);
  if (!re.en && !re.ko && !re.jazh) return 0;
  let hits = 0;
  if (re.en && re.en.test(text)) hits++;
  if (re.ko && re.ko.test(text)) hits++;
  if (re.jazh && re.jazh.test(text)) hits++;
  if (re.en) {
    const multi = (text.match(new RegExp(re.en.source, 'gi')) || []).length;
    if (multi >= 3) hits++;
  }
  return Math.min(hits, 3);
}

/** 기존 테스트·호출부 호환: AI 토픽 별칭. */
export function aiHits(text) {
  return topicHits(text, 'ai');
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
export function analyze(tweets, { topic = DEFAULT_TOPIC } = {}) {
  const langs = {};
  let aiCount = 0, minT = null, maxT = null, likesSum = 0;
  for (const t of tweets) {
    if (t.lang) langs[t.lang] = (langs[t.lang] || 0) + 1;
    if (topicHits(`${t.text || ''} ${t.quoted?.text || ''}`, topic) > 0) aiCount++;
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
export function prepareCandidates(tweets, { limit = 110, topic = DEFAULT_TOPIC } = {}) {
  const seen = new Set();
  const rows = [];
  for (const t of tweets) {
    const key = t.url || `${t.handle}|${t.time}|${(t.text || '').slice(0, 40)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const hits = topicHits(`${t.text || ''} ${t.quoted?.text || ''} ${t.articleTitle || ''}`, topic);
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

/**
 * LLM/그록 프록시에 넣기 전 텍스트 정규화.
 * 트윗의 `\\u`·`\\x`·끝 백슬래시가 clip으로 잘리면, 프록시가 text를
 * JSON식 언이스케이프할 때 "unexpected end of hex escape" 400을 낸다.
 */
export function sanitizePromptText(s) {
  let t = String(s ?? '');
  // 짝 없는 서로게이트 → 치환
  t = t.replace(/[\uD800-\uDBFF](?![\uDC00-\uDFFF])/g, '\uFFFD')
    .replace(/(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g, '\uFFFD');
  // JSON이 \\uXXXX로 직렬화하는 제어·구분자 제거 (본문 절단 시 hex escape 깨짐 방지)
  t = t.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u2028\u2029]/g, ' ');
  // 백슬래시는 전각으로 바꿔 이스케이프 해석 자체를 막는다
  t = t.replace(/\\/g, '＼');
  return t;
}

function clip(s, n) {
  if (!s) return '';
  const one = sanitizePromptText(s).replace(/\s+/g, ' ').trim();
  return one.length > n ? one.slice(0, n - 1) + '…' : one;
}

function handleLabel(t) {
  const raw = String(t.handle || '').replace(/^@/, '') || '?';
  const src = t.source && t.source !== 'x' ? t.source : '';
  if (src === 'reddit') return `[reddit] ${raw}`;
  if (src) return `[${src}] ${raw.startsWith('@') ? raw : '@' + raw}`;
  return '@' + raw;
}

/** LLM 프롬프트에 넣을 압축 텍스트 라인 생성 */
export function toPromptLines(cands) {
  const lines = [];
  for (const c of cands) {
    const t = c.t;
    const media = t.media ? (String(t.media).includes('vid') ? '영상' : String(t.media).includes('img') ? '이미지' : t.media) : '-';
    const head = `[${c.i}] ${c.label} ${handleLabel(t)}${t.verified ? '✓' : ''} (${clip(t.name, 24)}) ${c.kst?.label || '?'}KST | ❤${num(t.likes)} 🔁${num(t.retweets)} 💬${num(t.replies)} 🔖${num(t.bookmarks)} 👁${num(t.views)} | 미디어:${media}`;
    lines.push(head);
    lines.push(clip(t.text, 420));
    if (t.quoted?.text) lines.push(`(인용 ${clip(t.quoted.user || '', 30)}: ${clip(t.quoted.text, 160)})`);
    if (t.articleTitle) lines.push(`(기사: ${clip(t.articleTitle, 80)})`);
    lines.push('');
  }
  return lines.join('\n');
}
