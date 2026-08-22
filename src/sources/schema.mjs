// 수집 아이템 정규화 스키마 + CSV/JSON 직렬화.
// 단축키: n/h/t/d/rd/u/r/w/l/v/b/lg/vf/ht/mn/lk/md/mu/at/ap/q/s
// CSV는 기존 24컬럼 뒤에 source를 붙여 25컬럼. 구버전 파서는 앞 24개만 읽으면 된다.

export const SOURCE_IDS = ['x', 'reddit', 'threads', 'linkedin'];

export function emptyItem(overrides = {}) {
  return {
    n: '',
    h: '',
    t: '',
    d: '',
    rd: '',
    u: '',
    r: 0,
    w: 0,
    l: 0,
    v: 0,
    b: 0,
    lg: '',
    vf: 0,
    ht: '',
    mn: '',
    lk: '',
    md: '',
    mu: '',
    at: '',
    ap: '',
    q: null,
    s: 'x',
    ...overrides,
  };
}

export function withSource(item, sourceId) {
  const s = SOURCE_IDS.includes(sourceId) ? sourceId : 'x';
  return { ...item, s };
}

export function csvEsc(s) {
  if (s == null) return '';
  s = String(s)
    .replace(/[\n\r]+/g, ' ')
    .trim();
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return /[,"\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

export const CSV_HEADER =
  '\uFEFF번호,이름,핸들,인증,텍스트,언어,시간,상대시간,URL,댓글,RT,좋아요,북마크,조회,해시태그,멘션,인라인링크,인용작성자,인용내용,인용URL,미디어,미디어URL,기사제목,기사미리보기,source\n';

export function csvRow(it, i) {
  return [
    i + 1,
    csvEsc(it.n),
    csvEsc(it.h),
    it.vf,
    csvEsc(it.t),
    csvEsc(it.lg),
    csvEsc(it.d),
    csvEsc(it.rd),
    csvEsc(it.u),
    it.r,
    it.w,
    it.l,
    it.b,
    it.v,
    csvEsc(it.ht || ''),
    csvEsc(it.mn || ''),
    csvEsc(it.lk || ''),
    csvEsc(it.q ? it.q.user : ''),
    csvEsc(it.q ? it.q.text : ''),
    csvEsc(it.q ? it.q.url : ''),
    it.md,
    csvEsc(it.mu || ''),
    csvEsc(it.at || ''),
    csvEsc(it.ap || ''),
    csvEsc(it.s || 'x'),
  ].join(',');
}

export function jsonItem(it, i) {
  return {
    no: i + 1,
    name: it.n,
    handle: it.h,
    verified: !!it.vf,
    text: it.t,
    lang: it.lg || null,
    time: it.d,
    relTime: it.rd,
    url: it.u,
    replies: it.r,
    retweets: it.w,
    likes: it.l,
    bookmarks: it.b,
    views: it.v,
    hashtags: it.ht ? it.ht.split(' ') : [],
    mentions: it.mn ? it.mn.split(' ') : [],
    inlineLinks: it.lk ? it.lk.split(' | ') : [],
    quoted: it.q || null,
    media: it.md || null,
    mediaUrls: it.mu ? it.mu.split(' | ') : [],
    articleTitle: it.at || null,
    articlePreview: it.ap || null,
    source: it.s || 'x',
  };
}

export function csvBody(items) {
  return CSV_HEADER + items.map((it, i) => csvRow(it, i)).join('\n');
}

export function jsonData(items) {
  return items.map((it, i) => jsonItem(it, i));
}
