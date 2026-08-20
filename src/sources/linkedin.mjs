import { considerItem, parseNum } from "../schema.mjs";

function updateUrl(el) {
  const a =
    el.querySelector('a[href*="/feed/update/"]') ||
    el.querySelector('a[href*="/posts/"]') ||
    el.querySelector('a.feed-shared-update-v2__permalink, a.app-aware-link[href*="linkedin.com/feed"]');
  if (!a) {
    return "";
  }
  try {
    return new URL(a.href, "https://www.linkedin.com").href.split("?")[0];
  } catch {
    return a.href || "";
  }
}

function parseUpdate(el, ctx) {
  const url = updateUrl(el);
  if (!url) {
    return 0;
  }
  ctx.parsedOk++;
  const nameEl =
    el.querySelector(".update-components-actor__title span[aria-hidden='true']") ||
    el.querySelector(".feed-shared-actor__name") ||
    el.querySelector(".update-components-actor__name");
  const textEl =
    el.querySelector(".feed-shared-update-v2__description") ||
    el.querySelector(".update-components-text") ||
    el.querySelector(".feed-shared-text");
  const text = (textEl ? textEl.innerText : "").trim().slice(0, 4000);
  const timeEl = el.querySelector("time");
  const likeEl =
    el.querySelector(".social-details-social-counts__reactions-count") ||
    el.querySelector("[data-test-id='social-actions__reaction-count']");
  const cmtEl = el.querySelector(".social-details-social-counts__comments");
  return considerItem(ctx, url, {
    n: nameEl ? nameEl.textContent.replace(/\s+/g, " ").trim() : "",
    h: "",
    t: text,
    d: (timeEl && (timeEl.getAttribute("datetime") || timeEl.dateTime)) || "",
    rd: timeEl ? timeEl.textContent.trim() : "",
    u: url,
    r: parseNum(cmtEl ? cmtEl.textContent : ""),
    w: 0,
    l: parseNum(likeEl ? likeEl.textContent : ""),
    v: 0,
    b: 0,
    lg: "",
    vf: 0,
    ht: "",
    mn: "",
    lk: "",
    md: el.querySelector("img") ? "img" : "",
    mu: "",
    at: "",
    ap: "",
    q: null,
    s: "linkedin",
  });
}

export const linkedinSource = {
  id: "linkedin",
  match(host) {
    return /^(www\.)?linkedin\.com$/i.test(host);
  },
  init(ctx) {
    this.ctx = ctx;
  },
  parseDom() {
    const ctx = this.ctx;
    const doc = ctx.doc;
    let arts = doc.querySelectorAll("div.feed-shared-update-v2, div[data-urn*='activity']");
    if (!arts.length) {
      arts = doc.querySelectorAll("article, div[role='article']");
    }
    ctx.artSeen = arts.length;
    ctx.parsedOk = 0;
    let fresh = 0;
    arts.forEach(function (el) {
      try {
        fresh += parseUpdate(el, ctx);
      } catch {
        /* ignore */
      }
    });
    ctx.updateFoot();
    if (ctx.artSeen >= 3 && ctx.parsedOk === 0) {
      ctx.zeroStreak++;
      if (ctx.zeroStreak >= 3 && !ctx.selWarned) {
        ctx.selWarned = 1;
        ctx.setStatus(ctx.RED, "선택자 확인 필요 (LinkedIn DOM 변경?)");
      }
    } else if (ctx.parsedOk > 0) {
      ctx.zeroStreak = 0;
    }
    return fresh;
  },
  async pollMore() {
    return 0;
  },
  feedState() {
    return "idle";
  },
  findRetry() {
    return null;
  },
  setupNetHook() {},
  unhookNet() {},
};
