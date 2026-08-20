import { considerItem } from "../schema.mjs";
import { fetchWithBackoff } from "../backoff.mjs";

export function redditApiPath(pathname) {
  const p = String(pathname || "/");
  const rm = p.match(/^\/r\/([^/]+)(?:\/(hot|new|top|rising|best)?)?\/?$/i);
  if (rm) {
    const sort = rm[2] || "hot";
    return "/r/" + rm[1] + "/" + sort + ".json";
  }
  if (/^\/search\/?$/i.test(p)) {
    return "/search.json";
  }
  const um = p.match(/^\/(?:user|u)\/([^/]+)/i);
  if (um) {
    return "/user/" + um[1] + "/submitted.json";
  }
  const cm = p.match(/^\/r\/([^/]+)\/comments\//i);
  if (cm) {
    return "/r/" + cm[1] + "/hot.json";
  }
  return "/hot.json";
}

export function redditFetchUrl(loc, after) {
  const path = redditApiPath(loc.pathname);
  const params = new URLSearchParams();
  params.set("limit", "100");
  if (after) {
    params.set("after", after);
  }
  if (/search\.json$/.test(path)) {
    const qs = new URLSearchParams(loc.search || "");
    params.set("q", qs.get("q") || "");
    params.set("sort", qs.get("sort") || "relevance");
  }
  return path + "?" + params.toString();
}

export function mapRedditPost(data) {
  const permalink = data.permalink || "";
  const url = /^https?:\/\//.test(permalink)
    ? permalink
    : "https://www.reddit.com" + permalink;
  const title = data.title || "";
  const body = data.selftext || "";
  const text = body ? title + "\n\n" + body : title;
  const img =
    data.post_hint === "image" && data.url
      ? data.url
      : data.thumbnail && String(data.thumbnail).startsWith("http")
        ? data.thumbnail
        : "";
  return {
    n: data.author ? "u/" + data.author : "",
    h: data.subreddit ? "r/" + data.subreddit : "",
    t: text,
    d: data.created_utc ? new Date(data.created_utc * 1000).toISOString() : "",
    rd: "",
    u: url,
    r: data.num_comments || 0,
    w: 0,
    l: data.score || 0,
    v: 0,
    b: 0,
    lg: "",
    vf: 0,
    ht: "",
    mn: "",
    lk: data.url && !data.is_self ? data.url : "",
    md: data.is_video ? "vid" : data.post_hint === "image" ? "img" : "",
    mu: img,
    at: "",
    ap: "",
    q: null,
    s: "reddit",
  };
}

export function parseRedditListing(json) {
  const data = json && json.data ? json.data : {};
  const children = Array.isArray(data.children) ? data.children : [];
  const items = [];
  for (let i = 0; i < children.length; i++) {
    const ch = children[i];
    if (ch && ch.data && (ch.kind === "t3" || ch.data.permalink)) {
      items.push(mapRedditPost(ch.data));
    }
  }
  return { items, after: data.after || null };
}

export const redditSource = {
  id: "reddit",
  match(host) {
    return /^(www\.|old\.|new\.)?reddit\.com$/i.test(host);
  },
  init(ctx) {
    this.ctx = ctx;
    this.after = null;
    this.ended = false;
    this.busy = false;
  },
  parseDom() {
    return 0;
  },
  async pollMore() {
    const ctx = this.ctx;
    if (this.ended || this.busy) {
      return 0;
    }
    this.busy = true;
    ctx.loadingReq++;
    try {
      const url = redditFetchUrl(ctx.location || window.location, this.after);
      const json = await fetchWithBackoff(url, {
        sleep: ctx.sleep,
        delay: ctx.delay,
        maxTries: 5,
      });
      const parsed = parseRedditListing(json);
      let fresh = 0;
      for (let i = 0; i < parsed.items.length; i++) {
        const it = parsed.items[i];
        fresh += considerItem(ctx, it.u, it);
      }
      this.after = parsed.after;
      if (!parsed.after || parsed.items.length === 0) {
        this.ended = true;
      }
      ctx.updateProgress();
      ctx.updateFoot();
      return fresh;
    } catch (e) {
      ctx.setStatus(ctx.RED, "Reddit API 오류: " + (e.message || e));
      return 0;
    } finally {
      this.busy = false;
      if (ctx.loadingReq > 0) {
        ctx.loadingReq--;
      }
    }
  },
  feedState() {
    if (this.ended) {
      return "end";
    }
    if (this.busy) {
      return "loading";
    }
    return "idle";
  },
  findRetry() {
    return null;
  },
  setupNetHook() {},
  unhookNet() {},
};
