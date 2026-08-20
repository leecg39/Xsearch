// 수집 JSON 전처리: 중복 제거 → 참여도 점수 × 토픽 관련도 가중 → 라벨 분류 → 후보 선별.
import { topicHits as topicHitsFromSrc } from '../../src/topics.mjs';

function num(v) { return typeof v === 'number' && isFinite(v) ? v : 0; }

export function topicHits(text, topic = 'ai') {
  return topicHitsFromSrc(text, topic);
}

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

export function handleLabel(t) {
  const s = t.source || 'x';
  const h = String(t.handle || '').replace(/^@/, '');
  if (s === 'reddit') return `[reddit] ${t.handle || ('u/' + h)}`;
  if (s === 'x' || s === 'twitter') return `@${h || '?'}`;
  return `[${s}] ${t.handle || h || '?'}`;
}

/** 업로드 데이터 요약 (UI 표시·다이제스트 헤더용) */
export function analyze(tweets, topic = 'ai') {
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

export function prepareCandidates(tweets, { limit = 110, topic = 'ai' } = {}) {
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
  picked.forEach((r, idx) => { r.i = idx + 1; });
  return picked;
}

function clip(s, n) {
  if (!s) return '';
  const one = String(s).replace(/\s+/g, ' ').trim();
  return one.length > n ? one.slice(0, n - 1) + '…' : one;
}

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
