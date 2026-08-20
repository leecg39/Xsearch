import { parseNum, considerItem } from "../schema.mjs";

function snowflakeDate(url) {
  try {
    const mm = url.match(/status\/(\d+)/);
    return mm
      ? new Date(Number(BigInt(mm[1]) >> 22n) + 1288834974657).toISOString()
      : "";
  } catch {
    return "";
  }
}

function readMetric(ctx, btn) {
  if (!btn) {
    return 0;
  }
  const nums = [];
  btn.querySelectorAll("span").forEach(function (sp) {
    const tx = sp.textContent.trim();
    if (tx && /^[\d,.KkMm천만]+$/.test(tx)) {
      nums.push(tx);
    }
  });
  if (nums.length >= 2) {
    ctx.fixMulti++;
    return parseNum(nums[nums.length - 1]);
  }
  return parseNum(btn.textContent);
}

export function tweetFromApi(node, ctx) {
  try {
    let tw = node;
    if (tw.tweet) {
      tw = tw.tweet;
    }
    if (tw.retweeted_status_result && tw.retweeted_status_result.result) {
      const rr = tw.retweeted_status_result.result;
      tw = rr.tweet || rr;
    }
    const lg2 = tw.legacy;
    if (!lg2 || typeof lg2.full_text !== "string" || !tw.rest_id) {
      return;
    }
    const ur = tw.core && tw.core.user_results && tw.core.user_results.result;
    const ul = (ur && ur.legacy) || {};
    const uc = (ur && ur.core) || {};
    const screen = ul.screen_name || uc.screen_name || "";
    const uname = ul.name || uc.name || "";
    const url = "https://x.com/" + (screen || "i") + "/status/" + tw.rest_id;
    let text = lg2.full_text;
    const nt =
      tw.note_tweet &&
      tw.note_tweet.note_tweet_results &&
      tw.note_tweet.note_tweet_results.result;
    if (nt && nt.text) {
      text = nt.text;
    }
    let quoted = null;
    let qr = tw.quoted_status_result && tw.quoted_status_result.result;
    if (qr) {
      qr = qr.tweet || qr;
      const qlg = qr.legacy;
      const qur =
        qr.core && qr.core.user_results && qr.core.user_results.result;
      const qul = (qur && qur.legacy) || {};
      const quc = (qur && qur.core) || {};
      if (qlg) {
        const qScreen = qul.screen_name || quc.screen_name || "";
        quoted = {
          user: (qul.name || quc.name || "") + " @" + qScreen,
          text: qlg.full_text || "",
          time: qlg.created_at ? new Date(qlg.created_at).toISOString() : "",
          url:
            "https://x.com/" +
            (qScreen || "i") +
            "/status/" +
            (qr.rest_id || ""),
        };
        text = text + "\n\n[인용] " + quoted.user + ": " + quoted.text;
      }
    }
    const ents = lg2.entities || {};
    const media =
      (lg2.extended_entities && lg2.extended_entities.media) || ents.media || [];
    const mediaUrls = [];
    let hasImg = 0,
      hasVid = 0;
    media.forEach(function (m) {
      if (m.type === "photo") {
        hasImg = 1;
      } else {
        hasVid = 1;
      }
      if (m.media_url_https) {
        mediaUrls.push(m.media_url_https);
      }
    });
    const md =
      hasImg && hasVid ? "img+vid" : hasImg ? "img" : hasVid ? "vid" : "";
    const vcount =
      tw.views && tw.views.count ? parseInt(tw.views.count, 10) || 0 : 0;
    const before = ctx.tweets.size;
    const n = considerItem(ctx, url, {
      n: uname,
      h: "@" + screen,
      t: text,
      d: lg2.created_at
        ? new Date(lg2.created_at).toISOString()
        : snowflakeDate(url),
      rd: "",
      u: url,
      r: lg2.reply_count || 0,
      w: lg2.retweet_count || 0,
      l: lg2.favorite_count || 0,
      v: vcount,
      b: lg2.bookmark_count || 0,
      lg: lg2.lang || "",
      vf:
        ur &&
        (ur.is_blue_verified ||
          ul.verified ||
          (ur.verification && ur.verification.verified))
          ? 1
          : 0,
      ht: (ents.hashtags || [])
        .map(function (x) {
          return "#" + x.text;
        })
        .join(" "),
      mn: (ents.user_mentions || [])
        .map(function (x) {
          return "@" + x.screen_name;
        })
        .join(" "),
      lk: (ents.urls || [])
        .map(function (x) {
          return x.expanded_url;
        })
        .filter(Boolean)
        .join(" | "),
      md: md,
      mu: mediaUrls.join(" | "),
      at: "",
      ap: "",
      q: quoted,
      s: "x",
    });
    if (n) {
      ctx.apiFresh++;
      if (ctx.tweets.size > before) {
        ctx.apiCount++;
      }
    }
  } catch {
    /* ignore malformed GraphQL nodes */
  }
}

export function harvest(obj, ctx) {
  try {
    const stack = [obj];
    while (stack.length) {
      const cur = stack.pop();
      if (!cur || typeof cur !== "object") {
        continue;
      }
      if (cur.promotedMetadata) {
        continue;
      }
      if (
        cur.rest_id &&
        cur.legacy &&
        typeof cur.legacy.full_text === "string"
      ) {
        tweetFromApi(cur, ctx);
        continue;
      }
      for (const k2 in cur) {
        const v2 = cur[k2];
        if (v2 && typeof v2 === "object") {
          stack.push(v2);
        }
      }
    }
    if (ctx.apiFresh) {
      ctx.updateProgress();
      ctx.updateFoot();
    }
  } catch {
    /* ignore */
  }
}

function parseArticle(art, ctx) {
  const doc = ctx.doc;
  let url = "";
  const stLinks = art.querySelectorAll('a[href*="/status/"]');
  for (let i = 0; i < stLinks.length; i++) {
    const mu = stLinks[i].href.match(/^https?:\/\/[^/]+\/[^/]+\/status\/\d+/);
    if (mu) {
      url = mu[0];
      break;
    }
  }
  if (!url) {
    return 0;
  }
  ctx.parsedOk++;
  if (ctx.tweets.has(url) || ctx.skippedSet.has(url)) {
    return 0;
  }
  const userEl =
    art.querySelector('[data-testid="User-Name"]') ||
    art.querySelector('[data-testid="User-Names"]');
  const nameSpan = userEl ? userEl.querySelector("span") : null;
  const userLink =
    art.querySelector('[data-testid="User-Name"] a') ||
    art.querySelector('a[role="link"][href^="/"]');
  const textEls = art.querySelectorAll('[data-testid="tweetText"]');
  const textEl = textEls[0] || null;
  const timeEl = art.querySelector("time");
  let text = textEl ? textEl.textContent.trim() : "";
  const coverImgs = art.querySelectorAll('[data-testid="article-cover-image"] img');
  const isArticle = coverImgs.length > 0;
  let artTitle = "",
    artPrev = "";
  if (isArticle) {
    const cover = art.querySelector('[data-testid="article-cover-image"]');
    const box =
      cover.closest('div[role="link"]') ||
      (cover.parentElement ? cover.parentElement.parentElement : null);
    const lines = (box ? box.innerText : "")
      .split("\n")
      .map(function (s) {
        return s.trim();
      })
      .filter(Boolean);
    const ai = lines.findIndex(function (s) {
      return s === "기사" || s === "Article";
    });
    artTitle = ai >= 0 ? lines[ai + 1] || "" : lines[0] || "";
    artPrev =
      ai >= 0
        ? lines
            .slice(ai + 2)
            .join(" ")
            .slice(0, 500)
        : "";
    const artBlock =
      (artTitle ? "[기사] " + artTitle : "") + (artPrev ? "\n" + artPrev : "");
    text = text ? text + (artBlock ? "\n\n" + artBlock : "") : artBlock;
  }
  let quoted = null;
  if (textEls.length >= 2) {
    const qEl = textEls[1];
    const qBox = qEl.closest('div[role="link"]') || qEl.parentElement;
    const qUser = qBox ? qBox.querySelector('[data-testid="User-Name"]') : null;
    const qTime = qBox ? qBox.querySelector("time") : null;
    let qUrl = "";
    const qLinks = qBox ? qBox.querySelectorAll('a[href*="/status/"]') : [];
    for (let j = 0; j < qLinks.length; j++) {
      const mq = qLinks[j].href.match(/^https?:\/\/[^/]+\/[^/]+\/status\/\d+/);
      if (mq) {
        qUrl = mq[0];
        break;
      }
    }
    quoted = {
      user: qUser ? qUser.textContent.replace(/\s+/g, " ").trim() : "",
      text: qEl.textContent.trim(),
      time: qTime ? qTime.getAttribute("datetime") : "",
      url: qUrl,
    };
    text = text + "\n\n[인용] " + quoted.user + ": " + quoted.text;
  }
  const replyBtn = art.querySelector('[data-testid="reply"]');
  const rtBtn = art.querySelector('[data-testid="retweet"]');
  const likeBtn = art.querySelector('[data-testid="like"]');
  const photos = art.querySelectorAll('[data-testid="tweetPhoto"] img');
  const vids = art.querySelectorAll("video");
  const hasImg = photos.length > 0,
    hasVid = vids.length > 0;
  const mediaType = isArticle
    ? "article"
    : hasImg && hasVid
      ? "img+vid"
      : hasImg
        ? "img"
        : hasVid
          ? "vid"
          : "";
  const mediaUrls = [];
  photos.forEach(function (im) {
    if (im.src) {
      mediaUrls.push(
        im.src.replace(/&name=\w+$/, "&name=orig").replace(/\?name=\w+$/, "?name=orig"),
      );
    }
  });
  vids.forEach(function (vd) {
    if (vd.poster) {
      mediaUrls.push(vd.poster);
    }
  });
  coverImgs.forEach(function (im) {
    if (im.src) {
      mediaUrls.push(im.src);
    }
  });
  const grp = art.querySelector('[role="group"]');
  const aria = grp ? grp.getAttribute("aria-label") : "";
  const M0 = { r: 0, w: 0, l: 0, b: 0, v: 0 };
  if (aria) {
    [
      ["r", /([\d,.]+\s*[KkMm천만]?)\s*(?:repl|댓글|답글)/i],
      ["w", /([\d,.]+\s*[KkMm천만]?)\s*(?:repost|retweet|재게시|리트윗|리포스트)/i],
      ["l", /([\d,.]+\s*[KkMm천만]?)\s*(?:like|마음에 들|좋아요)/i],
      ["b", /([\d,.]+\s*[KkMm천만]?)\s*(?:bookmark|북마크)/i],
      ["v", /([\d,.]+\s*[KkMm천만]?)\s*(?:view|조회)/i],
    ].forEach(function (pair) {
      const mm = aria.match(pair[1]);
      if (mm) {
        M0[pair[0]] = parseNum(mm[1].replace(/\s+/g, ""));
      }
    });
  }
  const hasR = aria && /(repl|댓글|답글)/i.test(aria);
  const hasW = aria && /(repost|retweet|재게시|리트윗|리포스트)/i.test(aria);
  const hasL = aria && /(like|마음에 들|좋아요)/i.test(aria);
  let replies = hasR ? M0.r : readMetric(ctx, replyBtn);
  let retweets = hasW ? M0.w : readMetric(ctx, rtBtn);
  let likes = hasL ? M0.l : readMetric(ctx, likeBtn);
  const bookmarks = M0.b;
  let views = M0.v;
  if (!views) {
    const an = art.querySelector('a[href*="/analytics"]');
    if (an) {
      views = parseNum(an.textContent);
    }
  }
  if (!views) {
    const allLinks = art.querySelectorAll('a[role="link"]');
    for (let k = 0; k < allLinks.length; k++) {
      const al = allLinks[k].getAttribute("aria-label") || "";
      if (/view|조회/i.test(al)) {
        const mv = al.match(/([\d,.]+\s*[KkMm천만]?)/);
        if (mv) {
          views = parseNum(mv[1].replace(/\s+/g, ""));
          break;
        }
      }
    }
  }
  if (views > 0 && likes > views) {
    likes = Math.min(M0.l, views);
    ctx.fixClamp++;
  }
  if (views > 0 && replies > views) {
    replies = Math.min(M0.r, views);
    ctx.fixClamp++;
  }
  if (views > 0 && retweets > views) {
    retweets = Math.min(M0.w, views);
    ctx.fixClamp++;
  }
  const lang = (textEl && textEl.getAttribute("lang")) || "";
  const verified = !!art.querySelector('svg[data-testid="icon-verified"]');
  const relTime = timeEl ? timeEl.textContent.trim() : "";
  let hashtags = [],
    mentions = [],
    extLinks = [];
  if (textEl) {
    hashtags = [].slice
      .call(textEl.querySelectorAll('a[href*="/hashtag/"]'))
      .map(function (a) {
        return a.textContent.trim();
      });
    mentions = [].slice
      .call(textEl.querySelectorAll('a[role="link"]'))
      .filter(function (a) {
        try {
          return /^\/[A-Za-z0-9_]+$/.test(new URL(a.href).pathname);
        } catch {
          return false;
        }
      })
      .map(function (a) {
        return a.textContent.trim();
      });
    extLinks = [].slice
      .call(textEl.querySelectorAll('a[role="link"]'))
      .filter(function (a) {
        const hf = a.href;
        return (
          hf &&
          !hf.includes("/hashtag/") &&
          !hf.includes("x.com/") &&
          !hf.includes("twitter.com/")
        );
      })
      .map(function (a) {
        return a.href;
      });
  }
  void doc;
  return considerItem(ctx, url, {
    n: nameSpan ? nameSpan.textContent.trim() : "",
    h: "@" + (userLink ? userLink.href.split("/").pop() : ""),
    t: text,
    d: (timeEl && timeEl.getAttribute("datetime")) || snowflakeDate(url),
    rd: relTime,
    u: url,
    r: replies,
    w: retweets,
    l: likes,
    v: views,
    b: bookmarks,
    lg: lang,
    vf: verified ? 1 : 0,
    ht: hashtags.join(" "),
    mn: [...new Set(mentions)].join(" "),
    lk: [...new Set(extLinks)].join(" | "),
    md: mediaType,
    mu: mediaUrls.join(" | "),
    at: artTitle,
    ap: artPrev,
    q: quoted,
    s: "x",
  });
}

export const xSource = {
  id: "x",
  match(host) {
    return /^(x|twitter)\.com$/i.test(host);
  },
  init(ctx) {
    this.ctx = ctx;
  },
  parseDom() {
    const ctx = this.ctx;
    const doc = ctx.doc;
    let arts = doc.querySelectorAll('article[data-testid="tweet"]');
    if (!arts.length) {
      arts = doc.querySelectorAll('article[role="article"]');
    }
    ctx.artSeen = arts.length;
    ctx.parsedOk = 0;
    let fresh = 0;
    arts.forEach(function (art) {
      try {
        fresh += parseArticle(art, ctx);
      } catch {
        /* ignore one card */
      }
    });
    ctx.updateFoot();
    if (ctx.artSeen >= 3 && ctx.parsedOk === 0) {
      ctx.zeroStreak++;
      if (ctx.zeroStreak >= 3 && !ctx.selWarned) {
        ctx.selWarned = 1;
        ctx.setStatus(ctx.RED, "선택자 확인 필요 (X DOM 변경?)");
      }
    } else if (ctx.parsedOk > 0) {
      ctx.zeroStreak = 0;
    }
    return fresh;
  },
  async pollMore() {
    const ctx = this.ctx;
    const doc = ctx.doc;
    const cands = [].slice
      .call(
        doc.querySelectorAll(
          'article[data-testid="tweet"] button, article[data-testid="tweet"] div[role="button"], article[data-testid="tweet"] span',
        ),
      )
      .filter(function (el) {
        const tx = (el.innerText || "").trim();
        return (
          tx === "Show more" ||
          tx === "더 보기" ||
          tx === "Show" ||
          tx === "더보기"
        );
      });
    let done = 0;
    for (let i = 0; i < cands.length; i++) {
      try {
        cands[i].click();
        done++;
        await ctx.sleep(80);
      } catch {
        /* ignore */
      }
    }
    return done;
  },
  feedState() {
    const doc = this.ctx.doc;
    const col = doc.querySelector('[data-testid="primaryColumn"]') || doc;
    const cells = col.querySelectorAll('[data-testid="cellInnerDiv"]');
    const last = cells[cells.length - 1];
    const tx = (last && !last.querySelector("article") && last.innerText) || "";
    if (/문제가 발생했|다시 시도|Something went wrong|Try again|Retry/i.test(tx)) {
      return "error";
    }
    if (
      /더 이상|모두 확인했|다 보셨|끝까지|You.?re all caught up|caught up|No more/i.test(
        tx,
      )
    ) {
      return "end";
    }
    const pbs = col.querySelectorAll('[role="progressbar"]');
    for (let pi = 0; pi < pbs.length; pi++) {
      if (pbs[pi].getBoundingClientRect().height >= 10) {
        return "loading";
      }
    }
    return "idle";
  },
  findRetry() {
    const doc = this.ctx.doc;
    const btns = doc.querySelectorAll('[role="button"],button');
    for (let i = 0; i < btns.length; i++) {
      const tx = (btns[i].innerText || "").trim();
      if (
        tx.length < 30 &&
        /다시 시도|재시도|Retry|Try again|새로고침|Reload/i.test(tx)
      ) {
        return btns[i];
      }
    }
    return null;
  },
  setupNetHook() {
    const ctx = this.ctx;
    const xhrProto = XMLHttpRequest.prototype;
    this._origOpen = xhrProto.open;
    this._origSend = xhrProto.send;
    this._proto = xhrProto;
    try {
      const GQL =
        /[/]graphql[/].*(Home|Search|List|UserTweets|Bookmarks|Community|TweetDetail)/i;
      const origOpen = this._origOpen;
      const origSend = this._origSend;
      xhrProto.open = function (m, u) {
        try {
          this.__twcU = u;
        } catch {
          /* ignore */
        }
        return origOpen.apply(this, arguments);
      };
      xhrProto.send = function () {
        try {
          const self = this;
          if (self.__twcU && GQL.test(self.__twcU)) {
            ctx.loadingReq++;
            self.addEventListener("loadend", function () {
              if (ctx.loadingReq > 0) {
                ctx.loadingReq--;
              }
            });
            self.addEventListener("load", function () {
              try {
                const t = self.responseText;
                if (t && t.charAt(0) === "{") {
                  harvest(JSON.parse(t), ctx);
                }
              } catch {
                /* ignore */
              }
            });
          }
        } catch {
          /* ignore */
        }
        return origSend.apply(this, arguments);
      };
      this._hooked = 1;
    } catch {
      this._hooked = 0;
    }
  },
  unhookNet() {
    if (this._hooked && this._proto) {
      try {
        this._proto.open = this._origOpen;
        this._proto.send = this._origSend;
      } catch {
        /* ignore */
      }
      this._hooked = 0;
    }
  },
};
