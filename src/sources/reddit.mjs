// Reddit 공개 JSON API 어댑터. DOM 파싱 없이 same-origin fetch만 사용.
import { emptyItem } from './schema.mjs';
import { matchReddit } from './match.mjs';

export const id = 'reddit';

export function match(host) {
  return matchReddit(host);
}

export function init() {
  return { mode: 'api' };
}

/**
 * 현재 탭 URL에서 리스팅 종류를 읽는다.
 * /r/{sub}/(hot|new|top|rising), /search, 프론트(/·/hot·/r/all·/r/popular)
 */
export function parseLocation(href) {
  let u;
  try {
    u = new URL(href);
  } catch {
    return { kind: 'front', sort: 'hot', q: '', sub: '' };
  }
  const path = (u.pathname.replace(/\/+$/, '') || '/') ;
  const q = u.searchParams.get('q') || '';
  if (path.startsWith('/search') || (path === '/' && q)) {
    return {
      kind: 'search',
      q,
      sort: u.searchParams.get('sort') || 'relevance',
      sub: u.searchParams.get('restrict_sr') === 'on' ? u.searchParams.get('subreddit') || '' : '',
    };
  }
  const sub = path.match(/^\/r\/([^/]+)/);
  if (sub) {
    const name = decodeURIComponent(sub[1]);
    if (name === 'all' || name === 'popular') {
      const rest = path.slice(('/r/' + sub[1]).length);
      const sort = (rest.match(/^\/(hot|new|top|rising)/) || [])[1] || 'hot';
      return { kind: 'front', sort, q: '', sub: name };
    }
    const rest = path.slice(('/r/' + sub[1]).length);
    const sort = (rest.match(/^\/(hot|new|top|rising)/) || [])[1] || 'hot';
    return { kind: 'subreddit', sub: name, sort, q: '' };
  }
  const rootSort = (path.match(/^\/(hot|new|top|rising)/) || [])[1];
  return { kind: 'front', sort: rootSort || 'hot', q: '', sub: '' };
}

export function listingUrl(loc, after) {
  const q = new URLSearchParams({ limit: '100' });
  if (after) q.set('after', after);
  if (loc.kind === 'search') {
    q.set('q', loc.q || '');
    q.set('sort', loc.sort || 'relevance');
    const path = loc.sub ? `/r/${encodeURIComponent(loc.sub)}/search.json` : '/search.json';
    return `${path}?${q}`;
  }
  if (loc.kind === 'subreddit') {
    const sort = loc.sort || 'hot';
    return `/r/${encodeURIComponent(loc.sub)}/${sort}.json?${q}`;
  }
  if (loc.sub === 'all' || loc.sub === 'popular') {
    return `/r/${loc.sub}/${loc.sort || 'hot'}.json?${q}`;
  }
  return `/${loc.sort || 'hot'}.json?${q}`;
}

export function childrenOf(json) {
  const ch = json && json.data && json.data.children;
  return Array.isArray(ch) ? ch : [];
}

export function afterOf(json) {
  const after = json && json.data && json.data.after;
  return after || null;
}

function absUrl(permalink) {
  if (!permalink) return '';
  if (/^https?:\/\//i.test(permalink)) return permalink;
  return 'https://www.reddit.com' + (permalink.startsWith('/') ? permalink : '/' + permalink);
}

/** listing child {kind,data} → 공통 스키마. t3(포스트)만. */
export function mapChild(child) {
  if (!child || (child.kind && child.kind !== 't3') || !child.data) return null;
  const d = child.data;
  const permalink = d.permalink || (d.id ? `/comments/${d.id}` : '');
  const url = absUrl(permalink);
  if (!url) return null;
  const title = d.title || '';
  const selftext = d.selftext || '';
  const text = selftext ? title + '\n\n' + selftext : title;
  const author = d.author || '';
  const sub = d.subreddit || d.subreddit_name_prefixed || '';
  const ext = d.url && d.url !== url ? d.url : '';
  const isVid = !!(d.is_video || d.post_hint === 'hosted:video' || d.post_hint === 'rich:video');
  const isImg = d.post_hint === 'image' || (!!d.preview && !isVid);
  return emptyItem({
    n: author,
    h: author ? 'u/' + author : '',
    t: text,
    d: d.created_utc ? new Date(d.created_utc * 1000).toISOString() : '',
    u: url,
    r: d.num_comments || 0,
    w: 0,
    l: typeof d.score === 'number' ? d.score : 0,
    v: 0,
    b: 0,
    lg: '',
    vf: 0,
    ht: sub ? 'r/' + String(sub).replace(/^r\//, '') : '',
    mn: '',
    lk: ext,
    md: isVid ? 'vid' : isImg ? 'img' : '',
    mu: isImg && ext ? ext : '',
    s: 'reddit',
  });
}

/**
 * 429 지수 백오프 대기(ms). attempt 0 = 첫 429.
 * 상한 60초. 베이스는 설정 delay를 쓰되 Reddit 레이트리밋(~10/min)을 위해 최소 6초.
 */
export function backoffMs(attempt, baseDelay) {
  const base = Math.max(6000, Number(baseDelay) || 6000);
  const n = Math.max(0, Number(attempt) || 0);
  return Math.min(60000, base * Math.pow(2, n));
}

export const MAX_429 = 6;
