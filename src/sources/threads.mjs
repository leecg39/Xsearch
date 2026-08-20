import { considerItem, parseNum } from "../schema.mjs";

function postUrl(a) {
  try {
    const href = a.href || a.getAttribute("href") || "";
    const m = href.match(/^https?:\/\/(?:www\.)?threads\.(?:com|net)\/[^?]*/);
    if (m && /\/post\//.test(m[0])) {
      return m[0];
    }
    if (/\/post\//.test(href)) {
      return new URL(href, "https://www.threads.com").href.split("?")[0];
    }
  } catch {
    /* ignore */
  }
  return "";
}

function parseCard(el, ctx) {
  const links = el.querySelectorAll("a[href*='/post/']");
  let url = "";
  for (let i = 0; i < links.length; i++) {
    url = postUrl(links[i]);
    if (url) {
      break;
    }
  }
  if (!url) {
    return 0;
  }
  ctx.parsedOk++;
  const timeEl = el.querySelector("time");
  const textEl =
    el.querySelector('[data-text="true"]') ||
    el.querySelector("span[dir='auto']") ||
    el.querySelector("div[dir='auto']");
  const text = (textEl ? textEl.textContent : el.innerText || "").trim().slice(0, 4000);
  const userLink = el.querySelector(
    'a[href^="/@"], a[href*="threads.com/@"], a[href*="threads.net/@"]'
  );
  let handle = "";
  if (userLink) {
    const p = (userLink.getAttribute("href") || "").split("?")[0];
    const m = p.match(/@([^/]+)/);
    handle = m ? "@" + m[1] : "";
  }
  const imgs = el.querySelectorAll("img");
  const mediaUrls = [];
  imgs.forEach(function (im) {
    if (im.src && !/emoji|avatar|profile/i.test(im.src)) {
      mediaUrls.push(im.src);
    }
  });
  return considerItem(ctx, url, {
    n: userLink ? (userLink.textContent || "").trim() : "",
    h: handle,
    t: text,
    d: (timeEl && timeEl.getAttribute("datetime")) || "",
    rd: timeEl ? timeEl.textContent.trim() : "",
    u: url,
    r: 0,
    w: 0,
    l: parseNum(el.getAttribute("aria-label") || ""),
    v: 0,
    b: 0,
    lg: "",
    vf: 0,
    ht: "",
    mn: "",
    lk: "",
    md: mediaUrls.length ? "img" : "",
    mu: mediaUrls.join(" | "),
    at: "",
    ap: "",
    q: null,
    s: "threads",
  });
}

export const threadsSource = {
  id: "threads",
  match(host) {
    return /(^|\.)threads\.(com|net)$/i.test(String(host || ""));
  },
  init(ctx) {
    this.ctx = ctx;
  },
  parseDom() {
    const ctx = this.ctx;
    const doc = ctx.doc;
    let arts = doc.querySelectorAll('div[data-pressable-container="true"]');
    if (arts.length < 3) {
      arts = doc.querySelectorAll('article, div[role="article"]');
    }
    ctx.artSeen = arts.length;
    ctx.parsedOk = 0;
    let fresh = 0;
    arts.forEach(function (el) {
      try {
        fresh += parseCard(el, ctx);
      } catch {
        /* ignore */
      }
    });
    ctx.updateFoot();
    if (ctx.artSeen >= 3 && ctx.parsedOk === 0) {
      ctx.zeroStreak++;
      if (ctx.zeroStreak >= 3 && !ctx.selWarned) {
        ctx.selWarned = 1;
        ctx.setStatus(ctx.RED, "선택자 확인 필요 (Threads DOM 변경?)");
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
