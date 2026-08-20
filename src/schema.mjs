// 수집 아이템 단축키 스키마 ↔ CSV/JSON 풀네임.

export const CSV_HEAD =
  "\uFEFF번호,이름,핸들,인증,텍스트,언어,시간,상대시간,URL,댓글,RT,좋아요,북마크,조회,해시태그,멘션,인라인링크,인용작성자,인용내용,인용URL,미디어,미디어URL,기사제목,기사미리보기,source\n";

export function parseNum(s) {
  if (!s) {
    return 0;
  }
  const mm = String(s)
    .trim()
    .replace(/,/g, "")
    .match(/^([\d.]+)\s*([KkMm천만]?)$/);
  if (!mm) {
    return 0;
  }
  const num = parseFloat(mm[1]);
  if (/[Kk천]/.test(mm[2])) {
    return ~~(1e3 * num);
  }
  if (/만/.test(mm[2])) {
    return ~~(1e4 * num);
  }
  if (/[Mm]/.test(mm[2])) {
    return ~~(1e6 * num);
  }
  return ~~num;
}

export function csvEsc(s) {
  if (s == null) {
    return "";
  }
  s = String(s)
    .replace(/[\n\r]+/g, " ")
    .trim();
  if (/^[=+\-@]/.test(s)) {
    s = "'" + s;
  }
  return /[,"\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

export function blankItem(over) {
  return Object.assign(
    {
      n: "",
      h: "",
      t: "",
      d: "",
      rd: "",
      u: "",
      r: 0,
      w: 0,
      l: 0,
      v: 0,
      b: 0,
      lg: "",
      vf: 0,
      ht: "",
      mn: "",
      lk: "",
      md: "",
      mu: "",
      at: "",
      ap: "",
      q: null,
      s: "x",
    },
    over || {},
  );
}

export function itemToFull(it, i) {
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
    replies: it.r || 0,
    retweets: it.w || 0,
    likes: it.l || 0,
    bookmarks: it.b || 0,
    views: it.v || 0,
    hashtags: it.ht ? it.ht.split(" ") : [],
    mentions: it.mn ? it.mn.split(" ") : [],
    inlineLinks: it.lk ? it.lk.split(" | ") : [],
    quoted: it.q || null,
    media: it.md || null,
    mediaUrls: it.mu ? it.mu.split(" | ") : [],
    articleTitle: it.at || null,
    articlePreview: it.ap || null,
    source: it.s || "x",
  };
}

export function itemToCsvRow(it, i) {
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
    csvEsc(it.ht || ""),
    csvEsc(it.mn || ""),
    csvEsc(it.lk || ""),
    csvEsc(it.q ? it.q.user : ""),
    csvEsc(it.q ? it.q.text : ""),
    csvEsc(it.q ? it.q.url : ""),
    it.md,
    csvEsc(it.mu || ""),
    csvEsc(it.at || ""),
    csvEsc(it.ap || ""),
    csvEsc(it.s || "x"),
  ].join(",");
}

/** 필터에 걸리거나 중복이면 스킵. 반환값 1 = 루프상 fresh(스킵 포함). */
export function considerItem(ctx, url, item) {
  if (!url) {
    return 0;
  }
  if (ctx.tweets.has(url) || ctx.skippedSet.has(url)) {
    return 0;
  }
  if (ctx.fExcluded(item.t || "")) {
    ctx.skippedCount++;
    ctx.skippedSet.add(url);
    return 1;
  }
  if (!item.s) {
    item.s = ctx.sourceId || "x";
  }
  ctx.tweets.set(url, item);
  return 1;
}
