// LinkedIn 피드 DOM 어댑터. 봇 탐지·계정 제한 위험이 커서 옵션 기본 OFF.
import { emptyItem } from './schema.mjs';
import { matchLinkedin } from './match.mjs';

export const id = 'linkedin';

export function match(host) {
  return matchLinkedin(host);
}

export function init() {
  return { mode: 'dom', defaultOff: true };
}

export function canonicalActivityUrl(urnOrHref) {
  const s = String(urnOrHref || '');
  const urn = s.match(/urn:li:activity:(\d+)/);
  if (urn) return 'https://www.linkedin.com/feed/update/urn:li:activity:' + urn[1];
  try {
    const u = new URL(s, 'https://www.linkedin.com');
    if (/\/feed\/update\//.test(u.pathname) || /\/posts\//.test(u.pathname)) {
      return u.origin + u.pathname.replace(/\/+$/, '');
    }
  } catch {
    /* ignore */
  }
  return '';
}

export function mapLinkedinPost(raw) {
  const url = canonicalActivityUrl(raw.url || raw.urn || '');
  if (!url) return null;
  const handle = raw.handle || '';
  return emptyItem({
    n: raw.name || handle,
    h: handle,
    t: raw.text || '',
    d: raw.time || '',
    rd: raw.relTime || '',
    u: url,
    r: raw.comments || 0,
    w: raw.reposts || 0,
    l: raw.likes || 0,
    v: 0,
    b: 0,
    s: 'linkedin',
  });
}

function rootOf(el) {
  return (
    el.closest('[data-urn]') ||
    el.closest('.feed-shared-update-v2') ||
    el.closest('article') ||
    el.parentElement
  );
}

function parseCount(label) {
  const m = String(label || '').replace(/,/g, '').match(/([\d.]+)\s*([KkMm만]?)/);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  if (/[Kk]/.test(m[2])) return Math.floor(n * 1e3);
  if (m[2] === '만') return Math.floor(n * 1e4);
  if (/[Mm]/.test(m[2])) return Math.floor(n * 1e6);
  return Math.floor(n);
}

/**
 * ctx: { has(url), skip(url), excluded(text), add(item) }
 */
export function harvestDocument(doc, ctx) {
  const nodes = doc.querySelectorAll(
    '[data-urn*="urn:li:activity"], .feed-shared-update-v2, article[data-id]',
  );
  let artSeen = 0;
  let parsedOk = 0;
  let fresh = 0;
  const seen = new Set();
  const list = nodes.length ? nodes : doc.querySelectorAll('a[href*="/feed/update/"], a[href*="/posts/"]');
  for (const el of list) {
    artSeen++;
    const urn = el.getAttribute && el.getAttribute('data-urn');
    const href =
      (el.getAttribute && (el.getAttribute('href') || '')) ||
      (el.querySelector && (el.querySelector('a[href*="/feed/update/"]') || el.querySelector('a[href*="/posts/"]') || {}).href) ||
      '';
    const url = canonicalActivityUrl(urn || href);
    if (!url || seen.has(url)) continue;
    seen.add(url);
    parsedOk++;
    if (ctx.has(url)) continue;
    const root = rootOf(el) || el;
    const textEl =
      root.querySelector &&
      (root.querySelector('.feed-shared-update-v2__description') ||
        root.querySelector('.update-components-text') ||
        root.querySelector('[data-test-id="main-feed-activity-card"] span[dir="ltr"]'));
    const nameEl = root.querySelector && root.querySelector('.update-components-actor__name, .feed-shared-actor__name');
    const timeEl = root.querySelector && root.querySelector('time');
    const text = ((textEl && textEl.textContent) || '').replace(/\s+/g, ' ').trim().slice(0, 4000);
    if (ctx.excluded(text)) {
      ctx.skip(url);
      fresh++;
      continue;
    }
    const likeEl = root.querySelector && root.querySelector('.social-details-social-counts__reactions-count');
    const item = mapLinkedinPost({
      url,
      name: nameEl ? nameEl.textContent.replace(/\s+/g, ' ').trim() : '',
      text,
      time: timeEl ? timeEl.getAttribute('datetime') || '' : '',
      relTime: timeEl ? (timeEl.textContent || '').trim() : '',
      likes: parseCount(likeEl && likeEl.textContent),
    });
    if (!item) continue;
    ctx.add(item);
    fresh++;
  }
  return { artSeen, parsedOk, fresh };
}
