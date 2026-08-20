(() => {
  // src/topics.mjs
  var AI_KEEP = String.raw`\bai\b|인공지능|생성형|거대언어|언어모델|확산모델|초거대|딥러닝|머신러닝|강화학습|파인튜닝|임베딩|멀티모달|신경망|추론모델|프롬프트|claude|gpt|openai|anthropic|gemini|grok|\bllm\b|copilot|cursor|midjourney|perplexity|hugging.?face|transformer|langchain|llamaindex|crew.?ai|autogen|\bllama\b|mistral|qwen|deepseek|\bsora\b|runway|\bsuno\b|\bpika\b|\bdevin\b|windsurf|ollama|\bvllm\b|stable.?diffusion|fine.?tun|\brag\b|neural|deep.?learn|machine.?learn|robot|automat|vibe.?cod|\bmcp\b|semiconductor|quantum|github|docker|kubernetes|\bpython\b|\brust\b|kotlin|nextjs|supabase|vercel|n8n|zapier`;
  var AI_WEAK = String.raw`\bmeta\b|\bchip\b|\bmodel\b|모델|\btoken\b|토큰|\bagent\b|에이전트|apple|google|microsoft|nvidia|tesla|\bapi\b|cloud|server|database|startup|스타트업|saas|crypto|blockchain|web3|\bgpu\b|\bcpu\b|cod(?:ing|e\b|ex)|pipeline|embed|vector|swift|\breact\b|typescript`;
  var NOISE_DROP = String.raw`k.?pop|아이돌|컴백|팬사인|치킨|피자|배달|쿠폰|할인|이벤트|경품|추첨|야구|축구|농구|올림픽|월드컵|선거|대통령|국회|정당|탄핵|드라마|예능|웹툰|화장품|뷰티|패션|다이어트|iran|israel|gaza|ukraine|russia|missile|ceasefire|bomb(?:ing)?|troops|military|\bwar\b|mueller|impeach|\bmaga\b|democrat|republican|\bsenate\b|\bcongress\b|xbox|playstation|nintendo|esport|valorant|minecraft|league.of.legends|evangelion|anime(?!\.js)|manga|cosplay|cortisol|\bworkout\b|anxiety|meditation|lemonade`;
  var AI_DROP = NOISE_DROP + String.raw`|dividend|hedge.`;
  var TOPIC_KEYS = ["ai", "dev", "finance", "startup", "custom"];
  var INTEREST_CHOICES = [
    { key: "ai", short: "AI", name: "AI" },
    { key: "dev", short: "\uAC1C\uBC1C", name: "\uAC1C\uBC1C/\uD14C\uD06C" },
    { key: "finance", short: "\uAE08\uC735", name: "\uACBD\uC81C/\uAE08\uC735" },
    { key: "startup", short: "\uBE44\uC988", name: "\uC2A4\uD0C0\uD2B8\uC5C5/\uBE44\uC988" }
  ];
  var TOPICS = {
    ai: {
      name: "AI",
      short: "AI",
      reKeep: AI_KEEP,
      reWeak: AI_WEAK,
      reDrop: AI_DROP,
      kwEn: String.raw`\b(ai|ml|llm|gpt|agi|rl|sota|gpu|tpu)\b|openai|chatgpt|claude|anthropic|gemini|deepmind|copilot|cursor|codex|grok|llama|mistral|qwen|deepseek|midjourney|diffusion|transformer|agentic|agents?\b|benchmark|inference|fine-?tun|hugging ?face|nvidia|robotic|autonomous|prompt|token|dataset|neural|frontier model|open[- ]?weight`,
      kwKo: "\uC778\uACF5\uC9C0\uB2A5|\uC0DD\uC131\uD615|\uAC70\uB300\uC5B8\uC5B4|\uC5B8\uC5B4\uBAA8\uB378|\uBAA8\uB378|\uC5D0\uC774\uC804\uD2B8|\uD504\uB86C\uD504\uD2B8|\uCD94\uB860|\uD30C\uC778\uD29C\uB2DD|\uBCA4\uCE58\uB9C8\uD06C|\uBC18\uB3C4\uCCB4|\uB85C\uBD07|\uC790\uC728\uC8FC\uD589|\uCC57\uBD07|\uC624\uD508\uC18C\uC2A4|\uCF54\uB529|\uAC1C\uBC1C\uC790|\uB525\uB7EC\uB2DD|\uBA38\uC2E0\uB7EC\uB2DD",
      kwJaZh: "\u4EBA\u5DE5\u77E5\u80FD|\u751F\u6210AI|\u30A8\u30FC\u30B8\u30A7\u30F3\u30C8|\u30E2\u30C7\u30EB|\u63A8\u8AD6|\u4EBA\u5DE5\u667A\u80FD|\u5927\u6A21\u578B|\u667A\u80FD\u4F53|\u5F00\u6E90|\u63A8\u7406"
    },
    dev: {
      name: "\uAC1C\uBC1C/\uD14C\uD06C",
      short: "\uAC1C\uBC1C",
      reKeep: String.raw`\bgithub\b|gitlab|docker|kubernetes|\bk8s\b|\bpython\b|\brust\b|kotlin|golang|\bgo\b|typescript|\breact\b|nextjs|next\.js|nodejs|vuejs|svelte|linux|ubuntu|devops|ci.?cd|vscode|jetbrains|오픈소스|오픈.소스|프로그래밍|개발자|코딩|프레임워크|배포|리팩터|리팩토|풀스택|백엔드|프론트엔드|데이터베이스|postgres|mysql|redis|supabase|vercel|cloudflare|\bwasm\b|webassembly`,
      reWeak: String.raw`\bapi\b|cloud|server|database|software|engineer|\bcode\b|bug|commit|repo|스택|라이브러리|패키지|apple|google|microsoft|amazon|aws|azure|\bgpu\b|\bcpu\b|pipeline|typescript|javascript`,
      reDrop: NOISE_DROP,
      kwEn: String.raw`\b(github|gitlab|docker|kubernetes|python|rust|typescript|javascript|react|linux|devops|backend|frontend|refactor|postgres|redis)\b|open.?source|vscode|nodejs|next\.?js`,
      kwKo: "\uAC1C\uBC1C|\uCF54\uB529|\uD504\uB85C\uADF8\uB798\uBC0D|\uC624\uD508\uC18C\uC2A4|\uD504\uB808\uC784\uC6CC\uD06C|\uBC30\uD3EC|\uBC31\uC5D4\uB4DC|\uD504\uB860\uD2B8\uC5D4\uB4DC|\uB9AC\uD329\uD130|\uB370\uC774\uD130\uBCA0\uC774\uC2A4|\uAC1C\uBC1C\uC790",
      kwJaZh: "\u958B\u767A|\u30D7\u30ED\u30B0\u30E9\u30DF\u30F3\u30B0|\u30AA\u30FC\u30D7\u30F3\u30BD\u30FC\u30B9|\u30D5\u30EC\u30FC\u30E0\u30EF\u30FC\u30AF|\u540E\u7AEF|\u524D\u7AEF|\u5F00\u6E90"
    },
    finance: {
      name: "\uACBD\uC81C/\uAE08\uC735",
      short: "\uAE08\uC735",
      reKeep: String.raw`연준|\bfed\b|\bfomc\b|기준금리|금리인하|금리인상|인플레이션|환율|코스피|코스닥|나스닥|nasdaq|s&p|다우|채권|국채|gdp|cpi|ppi|실업률|경기침체|리세션|실적발표|어닝|배당|etf|\bfomc\b|비트코인|이더리움|bitcoin|ethereum|\bbtc\b|\beth\b|환율|원달러|엔화|유가|wti|금값|금리`,
      reWeak: String.raw`시장|투자|경제|금융|주식|증시|펀드|bank|stock|market|crypto|환율|실적|매출|영업이익|per|pbr|배당|hedge|dividend`,
      reDrop: NOISE_DROP,
      kwEn: String.raw`\b(fed|fomc|cpi|gdp|nasdaq|inflation|recession|etf|yield|bitcoin|ethereum|btc|eth)\b|interest rate|s&p|treasury`,
      kwKo: "\uAE08\uB9AC|\uC778\uD50C\uB808|\uD658\uC728|\uC8FC\uC2DD|\uC99D\uC2DC|\uC5F0\uC900|\uCF54\uC2A4\uD53C|\uCC44\uAD8C|\uC2E4\uC801|\uBC30\uB2F9|\uACBD\uAE30\uCE68\uCCB4|\uBE44\uD2B8\uCF54\uC778|\uC774\uB354\uB9AC\uC6C0",
      kwJaZh: "\u91D1\u5229|\u30A4\u30F3\u30D5\u30EC|\u70BA\u66FF|\u682A\u4FA1|\u666F\u6C17|\u5229\u7387|\u901A\u80C0|\u80A1\u5E02"
    },
    startup: {
      name: "\uC2A4\uD0C0\uD2B8\uC5C5/\uBE44\uC988",
      short: "\uBE44\uC988",
      reKeep: String.raw`스타트업|유니콘|시리즈.?[abc]|펀딩|투자라운드|액셀러레이터|\bycombinator\b|\byc\b|시드투자|시드라운드|런웨이|피봇|product.?market|\bpmf\b|\bm&a\b|\bipo\b|인수합병|창업|saas|\bb2b\b|\bb2c\b|arr\b|mrr\b|그로스|go.to.market`,
      reWeak: String.raw`startup|founder|vc\b|venture|투자|사업|매출|고객|프로덕트|스타트업|엔젤|라운드|exit`,
      reDrop: NOISE_DROP,
      kwEn: String.raw`\b(startup|founder|yc|saas|b2b|ipo|series [abc]|pmf|arr|mrr)\b|y combinator|product.market|fundraising`,
      kwKo: "\uC2A4\uD0C0\uD2B8\uC5C5|\uC720\uB2C8\uCF58|\uD380\uB529|\uC2DC\uB9AC\uC988|\uCC3D\uC5C5|\uC778\uC218\uD569\uBCD1|\uC561\uC140\uB7EC\uB808\uC774\uD130|\uB7F0\uC6E8\uC774|\uD53C\uBD07|\uB9E4\uCD9C",
      kwJaZh: "\u30B9\u30BF\u30FC\u30C8\u30A2\u30C3\u30D7|\u8CC7\u91D1\u8ABF\u9054|\u8D77\u696D|\u72EC\u89D2\u517D|\u521B\u4E1A"
    },
    custom: {
      name: "\uC790\uC720 \uC785\uB825",
      short: "\uC790\uC720",
      reKeep: "",
      reWeak: "",
      reDrop: "",
      kwEn: "",
      kwKo: "",
      kwJaZh: ""
    }
  };
  var NEVER = /$^/;
  function topicOf(key) {
    return TOPICS[key] || TOPICS.ai;
  }
  function compileRe(src, fallback) {
    if (src == null || src === "") {
      return fallback || NEVER;
    }
    try {
      return new RegExp(src, "i");
    } catch {
      return fallback || NEVER;
    }
  }
  function resolveTopicFilters(topicKey, custom = {}) {
    const key = TOPIC_KEYS.includes(topicKey) ? topicKey : "ai";
    const preset = topicOf(key);
    if (key === "custom") {
      return {
        key: "custom",
        name: preset.name,
        RE_KEEP: compileRe(custom.reKeep, NEVER),
        RE_WEAK: compileRe(custom.reWeak, NEVER),
        RE_DROP: compileRe(custom.reDrop, NEVER)
      };
    }
    return {
      key,
      name: preset.name,
      RE_KEEP: compileRe(custom.reKeep || preset.reKeep, compileRe(preset.reKeep)),
      RE_WEAK: compileRe(custom.reWeak || preset.reWeak, compileRe(preset.reWeak)),
      RE_DROP: compileRe(custom.reDrop || preset.reDrop, compileRe(preset.reDrop))
    };
  }

  // src/schema.mjs
  var CSV_HEAD = "\uFEFF\uBC88\uD638,\uC774\uB984,\uD578\uB4E4,\uC778\uC99D,\uD14D\uC2A4\uD2B8,\uC5B8\uC5B4,\uC2DC\uAC04,\uC0C1\uB300\uC2DC\uAC04,URL,\uB313\uAE00,RT,\uC88B\uC544\uC694,\uBD81\uB9C8\uD06C,\uC870\uD68C,\uD574\uC2DC\uD0DC\uADF8,\uBA58\uC158,\uC778\uB77C\uC778\uB9C1\uD06C,\uC778\uC6A9\uC791\uC131\uC790,\uC778\uC6A9\uB0B4\uC6A9,\uC778\uC6A9URL,\uBBF8\uB514\uC5B4,\uBBF8\uB514\uC5B4URL,\uAE30\uC0AC\uC81C\uBAA9,\uAE30\uC0AC\uBBF8\uB9AC\uBCF4\uAE30,source\n";
  function parseNum(s) {
    if (!s) {
      return 0;
    }
    const mm = String(s).trim().replace(/,/g, "").match(/^([\d.]+)\s*([KkMm천만]?)$/);
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
  function csvEsc(s) {
    if (s == null) {
      return "";
    }
    s = String(s).replace(/[\n\r]+/g, " ").trim();
    if (/^[=+\-@]/.test(s)) {
      s = "'" + s;
    }
    return /[,"\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  function itemToFull(it, i) {
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
      source: it.s || "x"
    };
  }
  function itemToCsvRow(it, i) {
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
      csvEsc(it.s || "x")
    ].join(",");
  }
  function considerItem(ctx, url, item) {
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

  // src/sources/x.mjs
  function snowflakeDate(url) {
    try {
      const mm = url.match(/status\/(\d+)/);
      return mm ? new Date(Number(BigInt(mm[1]) >> 22n) + 1288834974657).toISOString() : "";
    } catch {
      return "";
    }
  }
  function readMetric(ctx, btn) {
    if (!btn) {
      return 0;
    }
    const nums = [];
    btn.querySelectorAll("span").forEach(function(sp) {
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
  function tweetFromApi(node, ctx) {
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
      const ul = ur && ur.legacy || {};
      const uc = ur && ur.core || {};
      const screen = ul.screen_name || uc.screen_name || "";
      const uname = ul.name || uc.name || "";
      const url = "https://x.com/" + (screen || "i") + "/status/" + tw.rest_id;
      let text = lg2.full_text;
      const nt = tw.note_tweet && tw.note_tweet.note_tweet_results && tw.note_tweet.note_tweet_results.result;
      if (nt && nt.text) {
        text = nt.text;
      }
      let quoted = null;
      let qr = tw.quoted_status_result && tw.quoted_status_result.result;
      if (qr) {
        qr = qr.tweet || qr;
        const qlg = qr.legacy;
        const qur = qr.core && qr.core.user_results && qr.core.user_results.result;
        const qul = qur && qur.legacy || {};
        const quc = qur && qur.core || {};
        if (qlg) {
          const qScreen = qul.screen_name || quc.screen_name || "";
          quoted = {
            user: (qul.name || quc.name || "") + " @" + qScreen,
            text: qlg.full_text || "",
            time: qlg.created_at ? new Date(qlg.created_at).toISOString() : "",
            url: "https://x.com/" + (qScreen || "i") + "/status/" + (qr.rest_id || "")
          };
          text = text + "\n\n[\uC778\uC6A9] " + quoted.user + ": " + quoted.text;
        }
      }
      const ents = lg2.entities || {};
      const media = lg2.extended_entities && lg2.extended_entities.media || ents.media || [];
      const mediaUrls = [];
      let hasImg = 0, hasVid = 0;
      media.forEach(function(m) {
        if (m.type === "photo") {
          hasImg = 1;
        } else {
          hasVid = 1;
        }
        if (m.media_url_https) {
          mediaUrls.push(m.media_url_https);
        }
      });
      const md = hasImg && hasVid ? "img+vid" : hasImg ? "img" : hasVid ? "vid" : "";
      const vcount = tw.views && tw.views.count ? parseInt(tw.views.count, 10) || 0 : 0;
      const before = ctx.tweets.size;
      const n = considerItem(ctx, url, {
        n: uname,
        h: "@" + screen,
        t: text,
        d: lg2.created_at ? new Date(lg2.created_at).toISOString() : snowflakeDate(url),
        rd: "",
        u: url,
        r: lg2.reply_count || 0,
        w: lg2.retweet_count || 0,
        l: lg2.favorite_count || 0,
        v: vcount,
        b: lg2.bookmark_count || 0,
        lg: lg2.lang || "",
        vf: ur && (ur.is_blue_verified || ul.verified || ur.verification && ur.verification.verified) ? 1 : 0,
        ht: (ents.hashtags || []).map(function(x) {
          return "#" + x.text;
        }).join(" "),
        mn: (ents.user_mentions || []).map(function(x) {
          return "@" + x.screen_name;
        }).join(" "),
        lk: (ents.urls || []).map(function(x) {
          return x.expanded_url;
        }).filter(Boolean).join(" | "),
        md,
        mu: mediaUrls.join(" | "),
        at: "",
        ap: "",
        q: quoted,
        s: "x"
      });
      if (n) {
        ctx.apiFresh++;
        if (ctx.tweets.size > before) {
          ctx.apiCount++;
        }
      }
    } catch {
    }
  }
  function harvest(obj, ctx) {
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
        if (cur.rest_id && cur.legacy && typeof cur.legacy.full_text === "string") {
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
    const userEl = art.querySelector('[data-testid="User-Name"]') || art.querySelector('[data-testid="User-Names"]');
    const nameSpan = userEl ? userEl.querySelector("span") : null;
    const userLink = art.querySelector('[data-testid="User-Name"] a') || art.querySelector('a[role="link"][href^="/"]');
    const textEls = art.querySelectorAll('[data-testid="tweetText"]');
    const textEl = textEls[0] || null;
    const timeEl = art.querySelector("time");
    let text = textEl ? textEl.textContent.trim() : "";
    const coverImgs = art.querySelectorAll('[data-testid="article-cover-image"] img');
    const isArticle = coverImgs.length > 0;
    let artTitle = "", artPrev = "";
    if (isArticle) {
      const cover = art.querySelector('[data-testid="article-cover-image"]');
      const box = cover.closest('div[role="link"]') || (cover.parentElement ? cover.parentElement.parentElement : null);
      const lines = (box ? box.innerText : "").split("\n").map(function(s) {
        return s.trim();
      }).filter(Boolean);
      const ai = lines.findIndex(function(s) {
        return s === "\uAE30\uC0AC" || s === "Article";
      });
      artTitle = ai >= 0 ? lines[ai + 1] || "" : lines[0] || "";
      artPrev = ai >= 0 ? lines.slice(ai + 2).join(" ").slice(0, 500) : "";
      const artBlock = (artTitle ? "[\uAE30\uC0AC] " + artTitle : "") + (artPrev ? "\n" + artPrev : "");
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
        url: qUrl
      };
      text = text + "\n\n[\uC778\uC6A9] " + quoted.user + ": " + quoted.text;
    }
    const replyBtn = art.querySelector('[data-testid="reply"]');
    const rtBtn = art.querySelector('[data-testid="retweet"]');
    const likeBtn = art.querySelector('[data-testid="like"]');
    const photos = art.querySelectorAll('[data-testid="tweetPhoto"] img');
    const vids = art.querySelectorAll("video");
    const hasImg = photos.length > 0, hasVid = vids.length > 0;
    const mediaType = isArticle ? "article" : hasImg && hasVid ? "img+vid" : hasImg ? "img" : hasVid ? "vid" : "";
    const mediaUrls = [];
    photos.forEach(function(im) {
      if (im.src) {
        mediaUrls.push(
          im.src.replace(/&name=\w+$/, "&name=orig").replace(/\?name=\w+$/, "?name=orig")
        );
      }
    });
    vids.forEach(function(vd) {
      if (vd.poster) {
        mediaUrls.push(vd.poster);
      }
    });
    coverImgs.forEach(function(im) {
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
        ["v", /([\d,.]+\s*[KkMm천만]?)\s*(?:view|조회)/i]
      ].forEach(function(pair) {
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
    const lang = textEl && textEl.getAttribute("lang") || "";
    const verified = !!art.querySelector('svg[data-testid="icon-verified"]');
    const relTime = timeEl ? timeEl.textContent.trim() : "";
    let hashtags = [], mentions = [], extLinks = [];
    if (textEl) {
      hashtags = [].slice.call(textEl.querySelectorAll('a[href*="/hashtag/"]')).map(function(a) {
        return a.textContent.trim();
      });
      mentions = [].slice.call(textEl.querySelectorAll('a[role="link"]')).filter(function(a) {
        try {
          return /^\/[A-Za-z0-9_]+$/.test(new URL(a.href).pathname);
        } catch {
          return false;
        }
      }).map(function(a) {
        return a.textContent.trim();
      });
      extLinks = [].slice.call(textEl.querySelectorAll('a[role="link"]')).filter(function(a) {
        const hf = a.href;
        return hf && !hf.includes("/hashtag/") && !hf.includes("x.com/") && !hf.includes("twitter.com/");
      }).map(function(a) {
        return a.href;
      });
    }
    void doc;
    return considerItem(ctx, url, {
      n: nameSpan ? nameSpan.textContent.trim() : "",
      h: "@" + (userLink ? userLink.href.split("/").pop() : ""),
      t: text,
      d: timeEl && timeEl.getAttribute("datetime") || snowflakeDate(url),
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
      s: "x"
    });
  }
  var xSource = {
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
      arts.forEach(function(art) {
        try {
          fresh += parseArticle(art, ctx);
        } catch {
        }
      });
      ctx.updateFoot();
      if (ctx.artSeen >= 3 && ctx.parsedOk === 0) {
        ctx.zeroStreak++;
        if (ctx.zeroStreak >= 3 && !ctx.selWarned) {
          ctx.selWarned = 1;
          ctx.setStatus(ctx.RED, "\uC120\uD0DD\uC790 \uD655\uC778 \uD544\uC694 (X DOM \uBCC0\uACBD?)");
        }
      } else if (ctx.parsedOk > 0) {
        ctx.zeroStreak = 0;
      }
      return fresh;
    },
    async pollMore() {
      const ctx = this.ctx;
      const doc = ctx.doc;
      const cands = [].slice.call(
        doc.querySelectorAll(
          'article[data-testid="tweet"] button, article[data-testid="tweet"] div[role="button"], article[data-testid="tweet"] span'
        )
      ).filter(function(el) {
        const tx = (el.innerText || "").trim();
        return tx === "Show more" || tx === "\uB354 \uBCF4\uAE30" || tx === "Show" || tx === "\uB354\uBCF4\uAE30";
      });
      let done = 0;
      for (let i = 0; i < cands.length; i++) {
        try {
          cands[i].click();
          done++;
          await ctx.sleep(80);
        } catch {
        }
      }
      return done;
    },
    feedState() {
      const doc = this.ctx.doc;
      const col = doc.querySelector('[data-testid="primaryColumn"]') || doc;
      const cells = col.querySelectorAll('[data-testid="cellInnerDiv"]');
      const last = cells[cells.length - 1];
      const tx = last && !last.querySelector("article") && last.innerText || "";
      if (/문제가 발생했|다시 시도|Something went wrong|Try again|Retry/i.test(tx)) {
        return "error";
      }
      if (/더 이상|모두 확인했|다 보셨|끝까지|You.?re all caught up|caught up|No more/i.test(
        tx
      )) {
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
        if (tx.length < 30 && /다시 시도|재시도|Retry|Try again|새로고침|Reload/i.test(tx)) {
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
        const GQL = /[/]graphql[/].*(Home|Search|List|UserTweets|Bookmarks|Community|TweetDetail)/i;
        const origOpen = this._origOpen;
        const origSend = this._origSend;
        xhrProto.open = function(m, u) {
          try {
            this.__twcU = u;
          } catch {
          }
          return origOpen.apply(this, arguments);
        };
        xhrProto.send = function() {
          try {
            const self = this;
            if (self.__twcU && GQL.test(self.__twcU)) {
              ctx.loadingReq++;
              self.addEventListener("loadend", function() {
                if (ctx.loadingReq > 0) {
                  ctx.loadingReq--;
                }
              });
              self.addEventListener("load", function() {
                try {
                  const t = self.responseText;
                  if (t && t.charAt(0) === "{") {
                    harvest(JSON.parse(t), ctx);
                  }
                } catch {
                }
              });
            }
          } catch {
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
        }
        this._hooked = 0;
      }
    }
  };

  // src/backoff.mjs
  function nextBackoffMs(prev, { base = 2e3, cap = 3e4 } = {}) {
    const p = Number(prev) || base;
    return Math.min(cap, Math.max(base, p * 2));
  }
  function shouldRetryStatus(status) {
    return status === 429 || status === 503;
  }
  async function fetchWithBackoff(url, opts) {
    const sleep = opts.sleep;
    const maxTries = opts.maxTries || 5;
    let wait = opts.delay || 2e3;
    let lastErr;
    for (let i = 0; i < maxTries; i++) {
      const res = await fetch(url, opts.init || { credentials: "include" });
      if (shouldRetryStatus(res.status)) {
        lastErr = new Error("HTTP " + res.status);
        await sleep(wait);
        wait = nextBackoffMs(wait);
        continue;
      }
      if (!res.ok) {
        throw new Error("HTTP " + res.status);
      }
      return res.json();
    }
    throw lastErr || new Error("\uC7AC\uC2DC\uB3C4 \uD55C\uB3C4 \uCD08\uACFC");
  }

  // src/sources/reddit.mjs
  function redditApiPath(pathname) {
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
  function redditFetchUrl(loc, after) {
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
  function mapRedditPost(data) {
    const permalink = data.permalink || "";
    const url = /^https?:\/\//.test(permalink) ? permalink : "https://www.reddit.com" + permalink;
    const title = data.title || "";
    const body = data.selftext || "";
    const text = body ? title + "\n\n" + body : title;
    const img = data.post_hint === "image" && data.url ? data.url : data.thumbnail && String(data.thumbnail).startsWith("http") ? data.thumbnail : "";
    return {
      n: data.author ? "u/" + data.author : "",
      h: data.subreddit ? "r/" + data.subreddit : "",
      t: text,
      d: data.created_utc ? new Date(data.created_utc * 1e3).toISOString() : "",
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
      s: "reddit"
    };
  }
  function parseRedditListing(json) {
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
  var redditSource = {
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
          maxTries: 5
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
        ctx.setStatus(ctx.RED, "Reddit API \uC624\uB958: " + (e.message || e));
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
    setupNetHook() {
    },
    unhookNet() {
    }
  };

  // src/sources/threads.mjs
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
    const textEl = el.querySelector('[data-text="true"]') || el.querySelector("span[dir='auto']") || el.querySelector("div[dir='auto']");
    const text = (textEl ? textEl.textContent : el.innerText || "").trim().slice(0, 4e3);
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
    imgs.forEach(function(im) {
      if (im.src && !/emoji|avatar|profile/i.test(im.src)) {
        mediaUrls.push(im.src);
      }
    });
    return considerItem(ctx, url, {
      n: userLink ? (userLink.textContent || "").trim() : "",
      h: handle,
      t: text,
      d: timeEl && timeEl.getAttribute("datetime") || "",
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
      s: "threads"
    });
  }
  var threadsSource = {
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
      arts.forEach(function(el) {
        try {
          fresh += parseCard(el, ctx);
        } catch {
        }
      });
      ctx.updateFoot();
      if (ctx.artSeen >= 3 && ctx.parsedOk === 0) {
        ctx.zeroStreak++;
        if (ctx.zeroStreak >= 3 && !ctx.selWarned) {
          ctx.selWarned = 1;
          ctx.setStatus(ctx.RED, "\uC120\uD0DD\uC790 \uD655\uC778 \uD544\uC694 (Threads DOM \uBCC0\uACBD?)");
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
    setupNetHook() {
    },
    unhookNet() {
    }
  };

  // src/sources/linkedin.mjs
  function updateUrl(el) {
    const a = el.querySelector('a[href*="/feed/update/"]') || el.querySelector('a[href*="/posts/"]') || el.querySelector('a.feed-shared-update-v2__permalink, a.app-aware-link[href*="linkedin.com/feed"]');
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
    const nameEl = el.querySelector(".update-components-actor__title span[aria-hidden='true']") || el.querySelector(".feed-shared-actor__name") || el.querySelector(".update-components-actor__name");
    const textEl = el.querySelector(".feed-shared-update-v2__description") || el.querySelector(".update-components-text") || el.querySelector(".feed-shared-text");
    const text = (textEl ? textEl.innerText : "").trim().slice(0, 4e3);
    const timeEl = el.querySelector("time");
    const likeEl = el.querySelector(".social-details-social-counts__reactions-count") || el.querySelector("[data-test-id='social-actions__reaction-count']");
    const cmtEl = el.querySelector(".social-details-social-counts__comments");
    return considerItem(ctx, url, {
      n: nameEl ? nameEl.textContent.replace(/\s+/g, " ").trim() : "",
      h: "",
      t: text,
      d: timeEl && (timeEl.getAttribute("datetime") || timeEl.dateTime) || "",
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
      s: "linkedin"
    });
  }
  var linkedinSource = {
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
      arts.forEach(function(el) {
        try {
          fresh += parseUpdate(el, ctx);
        } catch {
        }
      });
      ctx.updateFoot();
      if (ctx.artSeen >= 3 && ctx.parsedOk === 0) {
        ctx.zeroStreak++;
        if (ctx.zeroStreak >= 3 && !ctx.selWarned) {
          ctx.selWarned = 1;
          ctx.setStatus(ctx.RED, "\uC120\uD0DD\uC790 \uD655\uC778 \uD544\uC694 (LinkedIn DOM \uBCC0\uACBD?)");
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
    setupNetHook() {
    },
    unhookNet() {
    }
  };

  // src/sources/index.mjs
  var SOURCES = [xSource, redditSource, threadsSource, linkedinSource];
  function pickSource(hostname, cfg) {
    const host = String(hostname || "").replace(/^www\./i, "").toLowerCase();
    const raw = String(hostname || "").toLowerCase();
    for (let i = 0; i < SOURCES.length; i++) {
      const s = SOURCES[i];
      if (s.match(raw) || s.match(host) || s.match("www." + host)) {
        if (s.id === "linkedin" && !(cfg && cfg.linkedinEnabled)) {
          return { error: "linkedin-off", source: s };
        }
        return { source: s };
      }
    }
    return { error: "no-match" };
  }

  // src/collector.js
  var PREFS_KEY = "_twc_prefs";
  void (async function twcMain() {
    var EXT = window.__twcConfig || null;
    var doc = document;
    var store = null;
    try {
      store = window.localStorage;
    } catch (e) {
    }
    function loadPrefs() {
      try {
        var raw = store ? store.getItem(PREFS_KEY) : null;
        return raw ? JSON.parse(raw) : null;
      } catch (e) {
        return null;
      }
    }
    function savePrefs(topic, filterOn) {
      try {
        if (store) {
          store.setItem(
            PREFS_KEY,
            JSON.stringify({ topic, filterMode: filterOn ? 1 : 0 })
          );
        }
      } catch (e) {
      }
      try {
        window.postMessage(
          {
            __twc: "prefs",
            topic,
            filterMode: filterOn ? 1 : 0
          },
          "*"
        );
      } catch (e) {
      }
    }
    var prefs = loadPrefs() || {};
    var picked = pickSource(location.hostname, EXT || {});
    if (picked.error === "linkedin-off") {
      alert(
        "LinkedIn \uC218\uC9D1\uC740 \uBD07 \uD0D0\uC9C0\xB7\uACC4\uC815 \uC81C\uD55C \uC704\uD5D8\uC774 \uC788\uC5B4 \uAE30\uBCF8 \uAEBC\uC838 \uC788\uC2B5\uB2C8\uB2E4.\n\uD655\uC7A5 \uC635\uC158\uC5D0\uC11C LinkedIn \uC218\uC9D1\uC744 \uCF20 \uB4A4 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC138\uC694."
      );
      return;
    }
    if (picked.error === "no-match" || !picked.source) {
      alert(
        "\uC774 \uC0AC\uC774\uD2B8\uC5D0\uC11C\uB294 Xsearch\uB97C \uC2E4\uD589\uD560 \uC218 \uC5C6\uC2B5\uB2C8\uB2E4. (X / Reddit / Threads / LinkedIn)\n\nhost: " + location.hostname + "\nv5.1.0 \u2014 \uBD81\uB9C8\uD074\uB9BF/\uD655\uC7A5\uC744 \uCD5C\uC2E0\uC73C\uB85C \uB2E4\uC2DC \uC124\uCE58\xB7\uB85C\uB4DC\uD558\uC138\uC694."
      );
      return;
    }
    var src = picked.source;
    var KEY = "_twc_" + src.id;
    if (window.__twc44Cleanup) {
      if (!confirm("\uC218\uC9D1\uAE30\uAC00 \uC774\uBBF8 \uC2E4\uD589 \uC911\uC785\uB2C8\uB2E4. \uC7AC\uC2DC\uC791\uD560\uAE4C\uC694?")) {
        return;
      }
      try {
        window.__twc44Cleanup();
      } catch (e) {
      }
    }
    var saved = null;
    try {
      var rawSaved = store ? store.getItem(KEY) : null;
      if (rawSaved) {
        saved = JSON.parse(rawSaved);
      }
    } catch (e) {
    }
    var resume = 0;
    if (saved && saved.length > 0) {
      resume = confirm("\uC774\uC804 \uC218\uC9D1 \uB370\uC774\uD130 " + saved.length + "\uAC1C \uC788\uC74C. \uC774\uC5B4\uD558\uAE30?") ? 1 : 0;
    }
    var target = EXT ? Math.max(1, parseInt(EXT.target, 10) || 200) : parseInt(
      prompt(
        "\uC218\uC9D1\uD560 \uAC8C\uC2DC\uBB3C \uAC2F\uC218:",
        resume && saved ? String(Math.max(200, saved.length + 200)) : "200"
      ),
      10
    );
    if (!target) {
      return;
    }
    var tweets = /* @__PURE__ */ new Map();
    if (resume && saved) {
      saved.forEach(function(it) {
        tweets.set(it.u, it);
      });
    }
    var skippedSet = /* @__PURE__ */ new Set();
    var stopFlag = 0, paused = 0, delay = EXT && EXT.delay ? Math.min(5e3, Math.max(200, +EXT.delay)) : 2e3, t0 = Date.now(), pausedMs = 0;
    if (src.id === "linkedin") {
      delay = Math.max(delay, 2500);
    }
    if (src.id === "reddit") {
      delay = Math.max(delay, 2e3);
    }
    var filterMode = EXT && EXT.filterMode != null ? EXT.filterMode ? 1 : 0 : prefs.filterMode ? 1 : 0;
    var skippedCount = 0, lastSaved = tweets.size, fixMulti = 0, fixClamp = 0;
    var zeroStreak = 0, selWarned = 0, artSeen = 0, parsedOk = 0, stall = 0, cooldowns = 0;
    var saveDisabled = 0, quotaWarned = 0;
    var apiFresh = 0, apiCount = 0, incStep = 2e3;
    var loadingReq = 0, loadWait = 0;
    var topicKey = EXT && TOPIC_KEYS.includes(EXT.topic) && EXT.topic || TOPIC_KEYS.includes(prefs.topic) && prefs.topic || "ai";
    var customRe = {
      reKeep: EXT && EXT.reKeep,
      reWeak: EXT && EXT.reWeak,
      reDrop: EXT && EXT.reDrop
    };
    var filters = resolveTopicFilters(topicKey, customRe);
    var RE_KEEP = filters.RE_KEEP, RE_WEAK = filters.RE_WEAK, RE_DROP = filters.RE_DROP;
    var topicName = filters.name;
    function applyFilters(key, enable) {
      if (TOPIC_KEYS.includes(key)) {
        topicKey = key;
      }
      filters = resolveTopicFilters(topicKey, customRe);
      RE_KEEP = filters.RE_KEEP;
      RE_WEAK = filters.RE_WEAK;
      RE_DROP = filters.RE_DROP;
      topicName = filters.name;
      filterMode = enable ? 1 : 0;
      skippedSet.clear();
      savePrefs(topicKey, filterMode);
      syncCatUI();
    }
    function fExcluded(t) {
      if (!filterMode) {
        return false;
      }
      return !(t && (RE_KEEP.test(t) || RE_WEAK.test(t) && !RE_DROP.test(t)));
    }
    var BLUE = "#1d9bf0", GRAY = "#8b98a5", RED = "#f4212e";
    var isDark = (function() {
      try {
        var bg = (getComputedStyle(doc.body).backgroundColor || "").match(/\d+/g);
        if (bg && bg.length >= 3) {
          return 0.299 * +bg[0] + 0.587 * +bg[1] + 0.114 * +bg[2] < 128;
        }
      } catch (e) {
      }
      return !!(window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    })();
    var CSS = "<style>:host{" + (isDark ? "--bg:#15202b;--fg:#e7e9ea;--sub:#8b98a5;--line:#38444d;--chip:#1e2732" : "--bg:#ffffff;--fg:#0f1419;--sub:#536471;--line:#eff3f4;--chip:#f7f9fa") + ";--ac:#1d9bf0}*{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif}.p{width:268px;background:var(--bg);color:var(--fg);border:1px solid var(--line);border-radius:14px;box-shadow:0 8px 28px rgba(0,0,0,.28);overflow:hidden;font-size:13px;line-height:1.45}.hd{display:flex;align-items:center;gap:6px;padding:9px 8px 9px 12px;cursor:move;border-bottom:1px solid var(--line);user-select:none}.ttl{font-weight:700;font-size:12.5px;flex:1}.ver{font-size:10px;color:var(--sub);background:var(--chip);padding:1px 6px;border-radius:20px}.ic{width:22px;height:22px;border:0;background:transparent;color:var(--sub);border-radius:6px;cursor:pointer;font-size:12px;line-height:1;display:flex;align-items:center;justify-content:center}.ic:hover{background:var(--chip);color:var(--fg)}.bd{padding:12px}.num{display:flex;align-items:baseline;gap:5px;margin-bottom:8px}.num b{font-size:26px;font-weight:800;letter-spacing:-.5px;font-variant-numeric:tabular-nums}.num s{text-decoration:none;color:var(--sub);font-size:12.5px}.bar{height:5px;background:var(--chip);border-radius:20px;overflow:hidden;margin-bottom:9px}.bar i{display:block;height:5px;width:0px;background:var(--ac);border-radius:20px;transition:width .3s}.met{display:flex;gap:10px;font-size:11px;color:var(--sub);font-variant-numeric:tabular-nums;margin-bottom:10px;min-height:16px}.met span{white-space:nowrap}.st{display:flex;align-items:center;gap:7px;font-size:11.5px;padding:6px 9px;border-radius:8px;background:var(--chip);margin-bottom:11px}.dot{width:7px;height:7px;border-radius:20px;background:var(--ac);flex:none}.row{display:flex;gap:6px;margin-bottom:6px;align-items:center}.btn{flex:1;border:1px solid var(--line);background:var(--chip);color:var(--fg);border-radius:8px;padding:7px 4px;font-size:11.5px;font-weight:600;cursor:pointer;white-space:nowrap}.btn:hover{border-color:var(--ac)}.btn.on{background:var(--ac);border-color:var(--ac);color:#fff}.btn.dg{color:#f4212e}.spd{display:flex;align-items:center;gap:6px;margin-bottom:6px}.lab{font-size:11px;color:var(--sub);flex:none}.val{flex:1;text-align:center;font-size:11.5px;font-variant-numeric:tabular-nums;color:var(--sub)}.stp{flex:none;min-width:50px}.foot{font-size:10.5px;color:var(--sub);padding-top:8px;margin-top:2px;border-top:1px solid var(--line);display:flex;gap:10px;flex-wrap:wrap}.fr{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;font-size:11.5px;color:var(--sub)}.fr b{color:var(--fg);font-variant-numeric:tabular-nums}input[type=number]{width:72px;background:var(--chip);border:1px solid var(--line);color:var(--fg);border-radius:6px;padding:4px 6px;font-size:11.5px}select{background:var(--chip);border:1px solid var(--line);color:var(--fg);border-radius:6px;padding:4px 6px;font-size:11.5px}input[type=checkbox]{accent-color:var(--ac)}.ck{display:flex;align-items:center;gap:6px;cursor:pointer}.hide{display:none}.catlab{font-size:11px;color:var(--sub);margin-bottom:5px}.cats{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px}.cat{border:1px solid var(--line);background:var(--chip);color:var(--fg);border-radius:20px;padding:5px 9px;font-size:10.5px;font-weight:600;cursor:pointer;line-height:1.2}.cat:hover{border-color:var(--ac)}.cat.on{background:var(--ac);border-color:var(--ac);color:#fff}.cathint{font-size:10.5px;color:var(--sub);margin-bottom:8px;min-height:14px}</style>";
    var host = doc.createElement("div");
    host.style.cssText = "all:initial;position:fixed;top:12px;right:12px;z-index:2147483647";
    var root = host.attachShadow({ mode: "open" });
    var catBtns = '<button type="button" class="cat" data-cat="">\uC804\uCCB4</button>' + INTEREST_CHOICES.map(function(c) {
      return '<button type="button" class="cat" data-cat="' + c.key + '" title="' + c.name + '">' + c.short + "</button>";
    }).join("");
    if (topicKey === "custom") {
      catBtns += '<button type="button" class="cat" data-cat="custom" title="\uC790\uC720 \uC785\uB825">\uC790\uC720</button>';
    }
    root.innerHTML = CSS + '<div class="p"><div class="hd" id="hd"><span id="ico"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAKRElEQVR4nI2XeZBcZbnGf9/Z+vQ2090zmT0zWSYzYZysCgEvlNygueWtElEUFC21LCwsyyrUP9TSKkVLcblcFSmuinXlFhSKsrmggApiYjJAAg4hwZAJmSWTWXu27p7u032Wz/q+DksIej1VXd3V3ee8z/u+z/O87ycGtu+R/CuXEAjDIKpWkVFEZusW3I52kBFhtcry8GFq+UWsVBIpJajXv3BZ/zSgEPqjeqAMAgKvitvWQteV79QAMAwdSBiC1t2XMvnAr1k6+DRGzMVwLGT0/wMRr1cBnWkQ6GyRIGwLJ5clu30brW/bjZ1pJCyXdSWEaSLDECMWQ1gm+X0HmP7dI9TyCwjb0b8L06g/+HXAiNcCUMHDSgU7k6FxcIB4Vyduawvxzg7sTAORV9Xg1P8M20JWq4iYq9ugKmYmk9TyeWYe/iOlk6P4KysEpVUMBcKyzwEhXg1ABy9XaNw2SPc1V+ms1Q0yjJC+TxSGOohqiZWIM/fn/Yz+8nf0ffC9ZN+0k2B1VT/HsG0MxyYoV5CVMnOHj5Pf/wTR1DjYzlkgjFf3XGWRWN/Dhms/gpVOERSKhF5Vl1gF11WMIgzHoXxqitn77qfPWuHknXdTHp/AjMX0w6NajXC1jGWbRHaMqKGZ+L/txursQfo1HescAEJlFka07blM9zOseBiuq0H4+TxO3MVOJnSQeDrOyEN/ZndHhd98WLLRLjLy4J+IwnpllBIwLRYnFzk1PEZ5fgnDEDhb36h5oZRzjgqiIMRuTJPoWUvoeViuS/n0FCdu/RHlcoC7cSOdl+wi1b6G4/cdwnv6IB+9LoURK/GOfpPPHXiOuHsva//9AlbnlxgffhE5NUFy3Trs9ZuQtRpmOoOZW0MwO4Ww63ywXiq/DH2cTCtWKqVLLmIxzeRSfoUb3mpSKzzF/955hLyw6UxUuemaGINtEZVpuKavyoxncO/TQwwNHaTRDDi/1We0YDL31zwNLR0YcVfL1mjMwPTk2RUQCkAQkOjpxlRlL5V0H1Mb1hFrynHBpiLntcV5d79HqebR3h3H6RDgSeKxury+/OYyH+q3OTQX0pcN2dYd8N19gm+fzJLyI8z4mZ6nM/AKBbBerYDMjq2aZKoiSmpuUxant5+fPnmAG65O0JANaQprFJdr/OIovDDl41Z9+lotLuoSrF8TsD7ra++YXzR5aNwh0dpGoNqrcIYhZvOaMzyoK8FSgYPVMpltgzRs7iPyvJeNSL2rXil1GUhEzuWB/ZLvP2kwEW8lvXEdMikoHR0hOTTHx7bCtdsjXCIOHTF5sZzASae1UyIMCHzMTBNWexf+xEmE42KpQHZDmq4rr6hb7hkfdxrSVPN5qs8/xwffZSNsyQ//EPH1oSb63385F2zZTClfJAgkzlsuIlhZ4qu/eIihsQm+tD5GsiBZZ1cYDwLS6TqvNNdkROwNOwhmpiAKMZSzte7ZTbyrg6hS1RpXPFgdHWffd+7g0pYVdg5a/PGQ5GtDCXZ+5lp6LruY/OQSp58bJT8+y7Gjp6k0d3LDzZ9nuWMrNz4fsDYpuND1KU+MYAWedkt9+T5GrgnnvK3a3Azt8Tu3awc0Yo5m/sitt3H8pu/xrtwYX3+Pw3xe8Ol7y+z50LvZNNhPablAMD9Ldd/DVI8d5gtv3475wghZL+D+O2/ieNtG7pkJuaIJ3uTPMf3Y76mOjtSlZxhakvb6XoyGRgy3vQ0rna5LzzQZv+vnLD49zM8u97nlakmTHfBfvymT693CbZ+4ivNTNsWSR+Ev+5ClAtUjf2Xm8LPYmSz37H0WN5HgK5+/jp/mDWoRfLEz5FOJBcTQY1SGn9Ix0DJ3MZtbMGQYnOXNjef1g2ly12HJsWerkC8zNlNl4LwN2PEUvpqOYUC4tKh93Y7HufW2nzN6eh5TZScjknGXUAhqEhJCsi0pabAkq6enqa2U9NRUWtQDrTI5RW1hUQ8PNQva3v42eq6+krtm2rn81wmGZ0w++2aTR3+/l/HRk1zS1aJJu+ayS5GVCmGxSOfOHdjNWXbv2owQBjfefAd7Uj5NFtw2b3L9VILppvXYvVu1LfurHtIr6zaK/r5LZMtbL6XnmqvwCyUtGTMRpzg+zfDt97Cb49z+Xp9PPWjwVNDP3gdu5r65Ej85MoYYHydYKSA3bOT83i6++cZ+vnjj99l758/48YDD3fPwg0oz2d5BRDyJjELNfCwHo7iAeOGQGsf/IWXg0/vJj5PevEkPISKpB8rc0EFG/+8ubn+fYNeAxRW3VCg09PE/3/w0pxsyPDa9rBUz0OBysQPfueUO9v/qt/x3r4VDyOem48xtvAAr1UCkp+CZ2WeYGCPPIIoLyogEURQx9asH6dt0PYbaYCw1nHzWDPZx1ElxNF/hYifijv+Eb9z/PO/7wPUMbBukq6uNdFOWockZbnpymPbCDN/qjbHGDNlXgCmrATeeIvL9+vqmVjTLRsxPIgp5/dlS1quyKI2OsXjgCTIX7mLuyIs09/dQfnGMpL/K5iywUMU/FfKRDpuLaz6P/u1JTgwLapGk2ZRc12RzUatDGIasRpCzIR5WCUMV3KobkaYeiJW5s2eBlFJnPrP3CYp2Dm+5QKazmbGHH2drrsZbsj4nnjA4cMKi1ZX0xySbumx8hLJ9bAEOEQt+xFIIOQt2JmHHSol9K0skm1uxG+p7QnniNGK1oJX2yjhW0jJNglKR2koBJ5VA2bdcnGPSs/jqb2HvYoxxK0Wu6HFRzOMdmYi4iDSACMHegsH+ssVk5LDJ9LgwHjBVjbCRuGuyuGmXSrEKc6fA9zQRXwGgEQg9LBQhGzuasBIxYt0bWBqb4Md+I7ENbdoHlgKfu0ePMT8/y/WtEaaQ/CRvcL/fTKJ7I1YszjPlIgeLK8Q64zjNrThJF9+rUZnNY6wu18koX3suEIKoWsPwq+S6minNLmIN7CTe2Ye5UiKKJIZlkOxuJ9Oe5ZnHH2ExXNVj9k/VBJn+LYh4gqjm4+ZaEbkWveJFUlJdKlCr1MArIzw1WpURyXMBEPlUjx1hcm03tdIqhAFuJokVs+qbcNzVJDLSbYi1G/jhxGHtal5TD/FkikRLI36pgrdYQKoAerIalOeXQQ25+VO6yq9ez62XAagTju3gT46x/OgjuDt2YSQSGqiVtjUYvZ4DYbVGemALz8+eJkzmSPb2E2tIaICEEZ5KRph16SnLlRHG5HGEAmCefTYQ55yM1M1+DZFI6cXByOQwGrOY2WY9zWSteqZ5FsKrEAkTw3UIvRre4gp+xa+Xt1pBeGXwSojlOURpWW/Kr72sc75R6GwH6VWonfhbnZ+WpUE4fW/QY1Rr2veRtoMhBEGpTGl6AanAKIudG69LTXmAWsHF65+KXh/ASyDUOmaqjbOeULi8QGXocYKZSWLbzsdIpECdDVWZ7UhzxJw+jpgdf9lulQFp0qi4/+CQ+o9Pxy8BeakzKgML/NERwsU8dvcGXRkVQZ0jzKlTiNJSvceqjfpeRcJ/GoG/AyK9zEOxksJPAAAAAElFTkSuQmCC" alt="" style="width:15px;height:15px;vertical-align:-2px"></span><span class="ttl" id="ttl">Xsearch</span><span class="ver" id="srcv"></span><span class="ver">v5.1.0</span><button class="ic" id="min" title="\uC811\uAE30">\u2500</button><button class="ic hide" id="cls" title="\uB2EB\uAE30">\u2715</button></div><div class="bd" id="bd"><div class="num"><b id="cnt">0</b><s id="tgt"></s></div><div class="bar"><i id="bar"></i></div><div class="met"><span id="tm">0:00</span><span id="eta"></span><span id="rate"></span></div><div class="st"><span class="dot" id="dot"></span><span id="msg">\uC2DC\uC791\uD558\uB294 \uC911</span></div><div class="row"><button class="btn" id="pz" title="\uC218\uC9D1\uC744 \uC7A0\uC2DC \uBA48\uCDC4\uB2E4\uAC00 \uB2E4\uC2DC \uC2DC\uC791">\uC77C\uC2DC\uC815\uC9C0</button><button class="btn dg" id="sp" title="\uC9C0\uAE08\uAE4C\uC9C0 \uC218\uC9D1\uD55C \uAC83\uC744 \uC800\uC7A5\uD558\uACE0 \uC885\uB8CC">\uC911\uB2E8\xB7\uC800\uC7A5</button></div><div class="spd"><span class="lab">\uC18D\uB3C4</span><button class="btn stp" id="fa" title="\uC774\uB3D9 \uC0AC\uC774 \uB300\uAE30\uB97C \uC904\uC5EC \uBE60\uB974\uAC8C (\uACFC\uD558\uBA74 \uAD00\uB828\uC131\u2193\xB7\uCC28\uB2E8 \uC704\uD5D8)">\uBE60\uB974\uAC8C</button><span class="val" id="dly"></span><button class="btn stp" id="sl" title="\uC774\uB3D9 \uC0AC\uC774 \uB300\uAE30\uB97C \uB298\uB824 \uCC9C\uCC9C\uD788 (\uAD00\uB828\uC131\u2191)">\uB290\uB9AC\uAC8C</button></div><div class="catlab">\uAD00\uC2EC\uC0AC \uD544\uD130</div><div class="cats" id="cats">' + catBtns + '</div><div class="cathint" id="cathint"></div><div class="foot hide" id="foot"><span id="apc"></span><span id="skp"></span><span id="fix"></span><span id="qw"></span></div></div></div>';
    doc.body.appendChild(host);
    function $(id) {
      return root.getElementById(id);
    }
    var elCnt = $("cnt"), elTgt = $("tgt"), elBar = $("bar"), elTm = $("tm"), elEta = $("eta"), elRate = $("rate");
    var elDot = $("dot"), elMsg = $("msg"), elDly = $("dly"), elFoot = $("foot"), elSkp = $("skp"), elFix = $("fix"), elQw = $("qw"), elApc = $("apc");
    var elCats = $("cats"), elCatHint = $("cathint");
    $("srcv").textContent = src.id;
    function syncCatUI() {
      var buttons = elCats.querySelectorAll(".cat");
      for (var i = 0; i < buttons.length; i++) {
        var b = buttons[i];
        var k = b.getAttribute("data-cat") || "";
        var on = filterMode ? k === topicKey : k === "";
        b.classList.toggle("on", on);
      }
      elCatHint.textContent = filterMode ? topicName + " \uAD00\uB828\uB9CC \uC218\uC9D1" : "\uD544\uD130 \uC5C6\uC74C \xB7 \uC804\uCCB4 \uC218\uC9D1";
    }
    syncCatUI();
    elTgt.textContent = "/ " + target.toLocaleString();
    elDly.textContent = delay + "ms";
    function setStatus(color, msg) {
      elDot.style.background = color;
      elMsg.textContent = msg;
    }
    function fmtTime(sec) {
      sec = Math.max(0, Math.round(sec));
      var mn = ~~(sec / 60);
      var ss = sec - 60 * mn;
      return mn + ":" + (ss < 10 ? "0" : "") + ss;
    }
    function elapsedSec() {
      return (Date.now() - t0 - pausedMs) / 1e3;
    }
    function updateProgress() {
      elCnt.textContent = tweets.size.toLocaleString();
      elBar.style.width = Math.max(0, Math.min(242, Math.round(242 * tweets.size / target))) + "px";
      var sec = elapsedSec();
      var rate = sec > 0 ? tweets.size / sec : 0;
      if (tweets.size < target && rate > 0) {
        elEta.textContent = "ETA " + fmtTime((target - tweets.size) / rate);
        elRate.textContent = (60 * rate).toFixed(0) + "/min";
      } else {
        elEta.textContent = "";
        elRate.textContent = "";
      }
    }
    function updateFoot() {
      var any = 0;
      elApc.textContent = apiCount ? "API " + apiCount : "";
      elSkp.textContent = skippedCount ? "\uAC74\uB108\uB700 " + skippedCount : "";
      elFix.textContent = fixMulti + fixClamp ? "\uBCF4\uC815 " + (fixMulti + fixClamp) : "";
      elQw.textContent = quotaWarned ? "\uC800\uC7A5\uACF5\uAC04 \uCD08\uACFC" : "";
      any = apiCount || skippedCount || fixMulti + fixClamp || quotaWarned;
      if (any) {
        elFoot.classList.remove("hide");
      }
    }
    function sleep(ms) {
      return new Promise(function(rs) {
        setTimeout(rs, ms);
      });
    }
    var ctx = {
      doc,
      location: window.location,
      tweets,
      skippedSet,
      fExcluded,
      sourceId: src.id,
      sleep,
      delay,
      get skippedCount() {
        return skippedCount;
      },
      set skippedCount(v) {
        skippedCount = v;
      },
      get apiFresh() {
        return apiFresh;
      },
      set apiFresh(v) {
        apiFresh = v;
      },
      get apiCount() {
        return apiCount;
      },
      set apiCount(v) {
        apiCount = v;
      },
      get fixMulti() {
        return fixMulti;
      },
      set fixMulti(v) {
        fixMulti = v;
      },
      get fixClamp() {
        return fixClamp;
      },
      set fixClamp(v) {
        fixClamp = v;
      },
      get artSeen() {
        return artSeen;
      },
      set artSeen(v) {
        artSeen = v;
      },
      get parsedOk() {
        return parsedOk;
      },
      set parsedOk(v) {
        parsedOk = v;
      },
      get zeroStreak() {
        return zeroStreak;
      },
      set zeroStreak(v) {
        zeroStreak = v;
      },
      get selWarned() {
        return selWarned;
      },
      set selWarned(v) {
        selWarned = v;
      },
      get loadingReq() {
        return loadingReq;
      },
      set loadingReq(v) {
        loadingReq = v;
      },
      setStatus,
      RED,
      updateProgress,
      updateFoot
    };
    src.init(ctx);
    function scrollByAmt(px) {
      var before = window.scrollY;
      window.scrollBy(0, px);
      if (window.scrollY === before) {
        var se = doc.scrollingElement || doc.documentElement;
        if (se) {
          se.scrollTop += px;
        }
      }
    }
    function goDown() {
      scrollByAmt(incStep + 200 * Math.random());
    }
    function distToBottom() {
      var se = doc.scrollingElement || doc.documentElement;
      return se ? Math.max(0, se.scrollHeight - (window.scrollY + window.innerHeight)) : 0;
    }
    function saveCheckpoint() {
      if (saveDisabled || !store) {
        return;
      }
      var arr = Array.from(tweets.values());
      try {
        store.setItem(KEY, JSON.stringify(arr));
        return;
      } catch (e) {
      }
      try {
        var lite = arr.map(function(it) {
          var cp = Object.assign({}, it);
          cp.mu = "";
          cp.ap = "";
          return cp;
        });
        store.setItem(KEY, JSON.stringify(lite));
        return;
      } catch (e) {
      }
      saveDisabled = 1;
      quotaWarned = 1;
      updateFoot();
    }
    $("min").onclick = function() {
      var bd = $("bd");
      bd.classList.toggle("hide");
      this.textContent = bd.classList.contains("hide") ? "\u25A2" : "\u2500";
    };
    $("pz").onclick = function() {
      paused = !paused;
      this.textContent = paused ? "\uC7AC\uAC1C" : "\uC77C\uC2DC\uC815\uC9C0";
      this.classList.toggle("on", !!paused);
    };
    $("sp").onclick = function() {
      stopFlag = 1;
    };
    $("fa").onclick = function() {
      delay = Math.max(200, delay - 200);
      ctx.delay = delay;
      elDly.textContent = delay + "ms";
    };
    $("sl").onclick = function() {
      delay = Math.min(5e3, delay + 200);
      ctx.delay = delay;
      elDly.textContent = delay + "ms";
    };
    elCats.addEventListener("click", function(ev) {
      var t = ev.target;
      if (!t || !t.getAttribute || !t.classList.contains("cat")) {
        return;
      }
      var key = t.getAttribute("data-cat") || "";
      if (!key) {
        applyFilters(topicKey, false);
        return;
      }
      applyFilters(key, true);
    });
    var dragX = 0, dragY = 0, dragging = 0;
    $("hd").addEventListener("mousedown", function(ev) {
      dragging = 1;
      var rc = host.getBoundingClientRect();
      dragX = ev.clientX - rc.left;
      dragY = ev.clientY - rc.top;
      ev.preventDefault();
    });
    function onMove(ev) {
      if (dragging) {
        host.style.left = ev.clientX - dragX + "px";
        host.style.top = ev.clientY - dragY + "px";
        host.style.right = "auto";
      }
    }
    function onUp() {
      dragging = 0;
    }
    doc.addEventListener("mousemove", onMove);
    doc.addEventListener("mouseup", onUp);
    var timer = setInterval(function() {
      elTm.textContent = fmtTime(elapsedSec());
    }, 1e3);
    function cleanup() {
      src.unhookNet();
      try {
        clearInterval(timer);
      } catch (e) {
      }
      doc.removeEventListener("mousemove", onMove);
      doc.removeEventListener("mouseup", onUp);
      try {
        host.remove();
      } catch (e) {
      }
      window.__twc44Cleanup = null;
    }
    window.__twc44Cleanup = cleanup;
    $("cls").onclick = function() {
      cleanup();
    };
    src.setupNetHook();
    setStatus(BLUE, "\uC218\uC9D1 \uC911");
    try {
      for (var iter = 0; iter < 3e3 && !stopFlag; iter++) {
        if (paused) {
          setStatus(GRAY, "\uC77C\uC2DC\uC815\uC9C0");
          await sleep(300);
          pausedMs += 300;
          iter--;
          continue;
        }
        await src.pollMore();
        var fresh = src.parseDom() + apiFresh;
        apiFresh = 0;
        updateProgress();
        if (tweets.size >= target) {
          break;
        }
        if (fresh > 0) {
          stall = 0;
          cooldowns = 0;
          loadWait = 0;
          setStatus(BLUE, "\uC218\uC9D1 \uC911");
          if (tweets.size - lastSaved >= 50) {
            saveCheckpoint();
            lastSaved = tweets.size;
          }
          goDown();
          await sleep(delay + 200 * Math.random());
        } else {
          var state = src.feedState();
          if (state === "error") {
            setStatus("#ff7a00", "\uC18C\uD504\uD2B8\uBE14\uB85D \u2014 \uC7AC\uC2DC\uB3C4 \uB300\uAE30");
            var rb = src.findRetry();
            if (rb) {
              try {
                rb.click();
              } catch (e) {
              }
            }
            stall = 0;
            await sleep(4e3 + 3e3 * Math.random());
          } else if (state === "end") {
            setStatus("#00ba7c", "\uD53C\uB4DC \uB05D");
            break;
          } else if (loadingReq > 0 || state === "loading") {
            setStatus("#ffd400", "\uC0C8 \uAC8C\uC2DC\uBB3C \uBD88\uB7EC\uC624\uB294 \uC911");
            goDown();
            loadWait++;
            if (loadWait > 12) {
              loadingReq = 0;
              loadWait = 0;
            }
            await sleep(delay + 400);
          } else if (distToBottom() > 2 * window.innerHeight) {
            setStatus(BLUE, "\uBC14\uB2E5 \uB530\uB77C\uC7A1\uB294 \uC911");
            stall = 0;
            for (var cu = 0; cu < 4; cu++) {
              scrollByAmt(incStep);
              await sleep(120);
            }
            await sleep(Math.max(300, delay - 400));
          } else {
            stall++;
            setStatus(GRAY, "\uC815\uCCB4 " + stall + "/16");
            goDown();
            if (stall >= 4) {
              scrollByAmt(-500);
              await sleep(150);
              goDown();
            }
            await sleep(delay + Math.min(300 * stall, 2e3));
            if (stall >= 16) {
              cooldowns++;
              if (cooldowns >= 3) {
                break;
              }
              setStatus(
                "#ff7a00",
                "\uB85C\uB529 \uB300\uAE30 \u2014 \uCFE8\uB2E4\uC6B4 " + cooldowns + "/3 (30\uCD08)"
              );
              await sleep(3e4);
              stall = 0;
            }
          }
        }
      }
    } catch (err) {
      src.unhookNet();
      saveCheckpoint();
      clearInterval(timer);
      setStatus(RED, "\uC624\uB958: " + err.message);
      alert(
        "\uC5D0\uB7EC \uBC1C\uC0DD: " + err.message + "\n" + tweets.size + "\uAC1C \uC800\uC7A5\uB428. \uB2E4\uC2DC \uC2DC\uC791\uD558\uBA74 \uC774\uC5B4\uD558\uAE30 \uAC00\uB2A5"
      );
      return;
    }
    src.unhookNet();
    await src.pollMore();
    src.parseDom();
    saveCheckpoint();
    clearInterval(timer);
    updateProgress();
    var results = Array.from(tweets.values()).slice(0, target);
    if (!results.length) {
      cleanup();
      alert("\uC218\uC9D1\uB41C \uAC8C\uC2DC\uBB3C \uC5C6\uC74C");
      return;
    }
    var dNow = /* @__PURE__ */ new Date();
    var dateStr = new Date(dNow.getTime() - dNow.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
    $("ico").textContent = "\u2705";
    $("ttl").textContent = "\uC218\uC9D1 \uC644\uB8CC";
    $("cls").classList.remove("hide");
    $("bd").innerHTML = '<div class="num"><b>' + results.length.toLocaleString() + "</b><s>\uAC1C \uC218\uC9D1" + (skippedCount ? " \xB7 " + skippedCount + "\uAC74 \uC81C\uC678" : "") + '</s></div><div class="row"><button class="btn" id="dc">CSV</button><button class="btn" id="dj">JSON</button><button class="btn" id="db">\uBE0C\uB9AC\uD551\uC73C\uB85C \uBCF4\uB0B4\uAE30</button></div>';
    function download(content, mime, fname) {
      if (EXT) {
        window.postMessage(
          { __twc: "download", content, mime, fname },
          "*"
        );
      } else {
        var a = doc.createElement("a");
        var burl = URL.createObjectURL(new Blob([content], { type: mime }));
        a.href = burl;
        a.download = fname;
        a.click();
        setTimeout(function() {
          URL.revokeObjectURL(burl);
        }, 1e3);
      }
      try {
        if (store) {
          store.removeItem(KEY);
        }
      } catch (e) {
      }
    }
    $("dc").onclick = function() {
      var body = results.map(function(it, i) {
        return itemToCsvRow(it, i);
      }).join("\n");
      download(CSV_HEAD + body, "text/csv;charset=utf-8", "tw_" + dateStr + ".csv");
    };
    function jsonData() {
      return results.map(function(it, i) {
        return itemToFull(it, i);
      });
    }
    $("dj").onclick = function() {
      download(
        JSON.stringify(jsonData(), null, 2),
        "application/json;charset=utf-8",
        "tw_" + dateStr + ".json"
      );
    };
    var BRIEF_FAIL_MSG = "\uBE0C\uB9AC\uD551 \uBE4C\uB354 \uC11C\uBC84(127.0.0.1:8787)\uC5D0 \uC5F0\uACB0\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.\n\uD504\uB85C\uC81D\uD2B8 \uD3F4\uB354\uC5D0\uC11C npm run news \uB97C \uC2E4\uD589\uD55C \uB4A4 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC138\uC694.";
    function openBuilderFallback(payload, downloadName) {
      try {
        var a = doc.createElement("a");
        var burl = URL.createObjectURL(
          new Blob([payload], { type: "application/json;charset=utf-8" })
        );
        a.href = burl;
        a.download = downloadName || "tw_export.json";
        a.click();
        setTimeout(function() {
          URL.revokeObjectURL(burl);
        }, 1e3);
      } catch (e) {
      }
      window.open("http://127.0.0.1:8787/", "_blank");
    }
    function sendBrief() {
      var fname = "tw_" + dateStr + ".json";
      var btn = $("db");
      var payload = JSON.stringify({
        fileName: fname,
        tweets: jsonData(),
        topic: filters.key
      });
      if (EXT) {
        let finish = function(ok, error) {
          if (settled) {
            return;
          }
          settled = 1;
          clearTimeout(briefTimer);
          window.removeEventListener("message", onResult);
          var b = $("db");
          if (!b) {
            return;
          }
          if (ok) {
            b.textContent = "\uBE4C\uB354\uB85C \uC804\uC1A1\uB428";
            b.disabled = true;
            return;
          }
          b.textContent = "\uBE0C\uB9AC\uD551\uC73C\uB85C \uBCF4\uB0B4\uAE30";
          b.disabled = false;
          fetchBriefDirect(payload, b, error, fname);
        }, onResult = function(ev) {
          if (ev.source !== window) {
            return;
          }
          var d = ev.data;
          if (!d || d.__twc !== "brief-result") {
            return;
          }
          finish(d.ok, d.error);
        };
        if (btn) {
          btn.textContent = "\uC804\uC1A1 \uC911\u2026";
          btn.disabled = true;
        }
        var settled = 0;
        var briefTimer = setTimeout(function() {
          finish(0, "\uC751\uB2F5 \uC2DC\uAC04 \uCD08\uACFC");
        }, 15e3);
        window.addEventListener("message", onResult);
        window.postMessage({ __twc: "brief", content: payload, fname }, "*");
        return;
      }
      fetchBriefDirect(payload, btn, "", fname);
    }
    function fetchBriefDirect(payload, btn, prevErr, downloadName) {
      var base = "http://127.0.0.1:8787";
      if (btn) {
        btn.textContent = "\uC804\uC1A1 \uC911\u2026";
        btn.disabled = true;
      }
      fetch(base + "/api/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: payload
      }).then(function(r) {
        if (!r.ok) {
          throw new Error("HTTP " + r.status);
        }
        return r.json();
      }).then(function(j) {
        if (!j || !j.id) {
          throw new Error("id \uC5C6\uC74C");
        }
        window.open(base + "/?import=" + j.id, "_blank");
        if (btn) {
          btn.textContent = "\uBE4C\uB354\uB85C \uC804\uC1A1\uB428";
          btn.disabled = true;
        }
      }).catch(function(err) {
        if (btn) {
          btn.textContent = "\uBE0C\uB9AC\uD551\uC73C\uB85C \uBCF4\uB0B4\uAE30";
          btn.disabled = false;
        }
        var detail = err && err.message || prevErr || "";
        alert(
          BRIEF_FAIL_MSG + (detail ? "\n\n(" + detail + ")" : "") + "\n\nJSON\uC744 \uB2E4\uC6B4\uB85C\uB4DC\uD558\uACE0 \uBE4C\uB354 \uD0ED\uC744 \uC5FD\uB2C8\uB2E4. \uD398\uC774\uC9C0\uC5D0\uC11C \uD30C\uC77C\uC744 \uC120\uD0DD\uD574 \uC8FC\uC138\uC694."
        );
        openBuilderFallback(payload, downloadName);
      });
    }
    $("db").onclick = sendBrief;
    if (EXT && EXT.briefAuto) {
      sendBrief();
    }
  })();
})();
