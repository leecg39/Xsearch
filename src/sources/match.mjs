// 호스트 → 수집 소스 id. 북마클릿·확장 가드·패널 표기가 같은 규칙을 쓴다.

export const SOURCE_LABELS = {
  x: 'X',
  reddit: 'Reddit',
  threads: 'Threads',
  linkedin: 'LinkedIn',
};

function hostOf(host) {
  return String(host || '')
    .toLowerCase()
    .replace(/^www\./, '');
}

export function matchX(host) {
  const h = hostOf(host);
  return h === 'x.com' || h === 'twitter.com';
}

export function matchReddit(host) {
  const h = hostOf(host);
  return h === 'reddit.com' || h.endsWith('.reddit.com');
}

export function matchThreads(host) {
  const h = hostOf(host);
  return h === 'threads.net' || h.endsWith('.threads.net')
    || h === 'threads.com' || h.endsWith('.threads.com');
}

export function matchLinkedin(host) {
  const h = hostOf(host);
  return h === 'linkedin.com' || h.endsWith('.linkedin.com');
}

/**
 * 알 수 없는 호스트는 'x'로 폼백 (기존 북마클릿이 x.com 전용이던 동작 유지).
 */
export function detectSource(host) {
  if (matchReddit(host)) return 'reddit';
  if (matchThreads(host)) return 'threads';
  if (matchLinkedin(host)) return 'linkedin';
  return 'x';
}

export function sourceLabel(id) {
  return SOURCE_LABELS[id] || SOURCE_LABELS.x;
}

/** 확장 툴바 클릭·자동시작 URL 가드. */
export const SOURCE_URL_RE = [
  /^https:\/\/(x|twitter)\.com\//,
  /^https:\/\/([a-z0-9-]+\.)?reddit\.com\//,
  /^https:\/\/(www\.)?threads\.(net|com)\//,
  /^https:\/\/([a-z0-9-]+\.)?linkedin\.com\//,
];

export function isSupportedUrl(url) {
  return SOURCE_URL_RE.some((re) => re.test(url || ''));
}
