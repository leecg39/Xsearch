// Threads(www.threads.net · www.threads.com) DOM 어댑터. 비공식 선택자라 변경 시 수집 0건 → 경고.
import { emptyItem } from './schema.mjs';
import { matchThreads } from './match.mjs';

export const id = 'threads';

export function match(host) {
  return matchThreads(host);
}

export function init() {
  return { mode: 'dom' };
}

export function canonicalPostUrl(href) {
  try {
    const u = new URL(href, 'https://www.threads.net');
    const m = u.pathname.match(/^\/(@[^/]+)\/post\/([^/?#]+)/);
    if (!m) return '';
    const host = /(?:^|\.)threads\.com$/i.test(u.hostname) ? 'www.threads.com' : 'www.threads.net';
    return 'https://' + host + '/' + m[1] + '/post/' + m[2];
  } catch {
    /* ignore */
  }
  return '';
}

export function handleFromUrl(url) {
  const m = String(url).match(/threads\.(?:net|com)\/(@[^/]+)\//);
  return m ? m[1] : '';
}

/** 테스트·DOM 공용: 필드 객체 → 정규화 아이템. */
export function mapThreadPost(raw) {
  const url = canonicalPostUrl(raw.url || raw.href || '');
  if (!url) return null;
  const handle = raw.handle || handleFromUrl(url) || '';
  return emptyItem({
    n: raw.name || handle.replace(/^@/, ''),
    h: handle.startsWith('@') ? handle : handle ? '@' + handle : '',
    t: raw.text || '',
    d: raw.time || '',
    rd: raw.relTime || '',
    u: url,
    r: raw.replies || 0,
    w: raw.reposts || 0,
    l: raw.likes || 0,
    v: 0,
    b: 0,
    s: 'threads',
  });
}

function articleRoot(el) {
  return (
    el.closest('article') ||
    el.closest('[data-pressable-container]') ||
    el.closest('div[role="article"]') ||
    el.parentElement
  );
}

/**
 * document에서 스레드 포스트를 걷어 ctx.add / ctx.skip 한다.
 * ctx: { has(url), skip(url), excluded(text), add(item) }
 */
export function harvestDocument(doc, ctx) {
  const anchors = doc.querySelectorAll('a[href*="/post/"]');
  let artSeen = 0;
  let parsedOk = 0;
  let fresh = 0;
  const seen = new Set();
  for (const a of anchors) {
    const url = canonicalPostUrl(a.href || a.getAttribute('href') || '');
    if (!url || seen.has(url)) continue;
    seen.add(url);
    artSeen++;
    const root = articleRoot(a);
    if (!root) continue;
    parsedOk++;
    if (ctx.has(url)) continue;
    const timeEl = root.querySelector('time');
    const textEl =
      root.querySelector('[data-testid="post-text"]') ||
      root.querySelector('[dir="auto"]');
    const text = (textEl ? textEl.textContent : root.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 4000);
    if (ctx.excluded(text)) {
      ctx.skip(url);
      fresh++;
      continue;
    }
    const item = mapThreadPost({
      url,
      handle: handleFromUrl(url),
      text,
      time: timeEl ? timeEl.getAttribute('datetime') || '' : '',
      relTime: timeEl ? (timeEl.textContent || '').trim() : '',
    });
    if (!item) continue;
    ctx.add(item);
    fresh++;
  }
  return { artSeen, parsedOk, fresh };
}
