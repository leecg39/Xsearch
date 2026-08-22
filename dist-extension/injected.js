(() => {
  var __defProp = Object.defineProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // src/topics.mjs
  var BASE_DROP = "k.?pop|\uC544\uC774\uB3CC|\uCE74\uBC31|\uD32C\uC0AC\uC778|\uCE58\uD0A8|\uD53C\uC790|\uBC30\uB2EC|\uCFE0\uD3F0|\uD560\uC778|\uC774\uBCA4\uD2B8|\uACBD\uD488|\uCD94\uCCA8|\uC57C\uAD6C|\uCD95\uAD6C|\uB18D\uAD6C|\uC62C\uB9BC\uD53D|\uC6D4\uB4DC\uCEF5|\uC120\uAC70|\uB300\uD1B5\uB839|\uAD6D\uD68C|\uC815\uB2F9|\uD0C4\uD575|\uB4DC\uB77C\uB9C8|\uC608\uB2A5|\uC6F9\uD230|\uD654\uC7A5\uD488|\uBDF0\uD2F0|\uD328\uC158|\uB2E4\uC774\uC5B4\uD2B8|iran|israel|gaza|ukraine|russia|missile|ceasefire|bomb(?:ing)?|troops|military|\\bwar\\b|mueller|impeach|\\bmaga\\b|democrat|republican|\\bsenate\\b|\\bcongress\\b|xbox|playstation|nintendo|esport|valorant|minecraft|league.of.legends|evangelion|anime(?!\\.js)|manga|cosplay|cortisol|\\bworkout\\b|anxiety|meditation|lemonade|dividend|hedge.fund";
  var FINANCE_DROP = BASE_DROP.split("|").filter((p) => p !== "dividend" && p !== "hedge.fund").join("|");
  var TOPICS = {
    ai: {
      name: "AI",
      reKeep: "\\bai\\b|\uC778\uACF5\uC9C0\uB2A5|\uC0DD\uC131\uD615|\uAC70\uB300\uC5B8\uC5B4|\uC5B8\uC5B4\uBAA8\uB378|\uD655\uC0B0\uBAA8\uB378|\uCD08\uAC70\uB300|\uB525\uB7EC\uB2DD|\uBA38\uC2E0\uB7EC\uB2DD|\uAC15\uD654\uD559\uC2B5|\uD30C\uC778\uD29C\uB2DD|\uC784\uBCA0\uB529|\uBA40\uD2F0\uBAA8\uB2EC|\uC2E0\uACBD\uB9DD|\uCD94\uB860\uBAA8\uB378|\uD504\uB86C\uD504\uD2B8|claude|gpt|openai|anthropic|gemini|grok|\\bllm\\b|copilot|cursor|midjourney|perplexity|hugging.?face|transformer|langchain|llamaindex|crew.?ai|autogen|\\bllama\\b|mistral|qwen|deepseek|\\bsora\\b|runway|\\bsuno\\b|\\bpika\\b|\\bdevin\\b|windsurf|ollama|\\bvllm\\b|stable.?diffusion|fine.?tun|\\brag\\b|neural|deep.?learn|machine.?learn|robot|automat|vibe.?cod|\\bmcp\\b|semiconductor|quantum|github|docker|kubernetes|\\bpython\\b|\\brust\\b|kotlin|nextjs|supabase|vercel|n8n|zapier",
      reWeak: "\\bmeta\\b|\\bchip\\b|\\bmodel\\b|\uBAA8\uB378|\\btoken\\b|\uD1A0\uD070|\\bagent\\b|\uC5D0\uC774\uC804\uD2B8|apple|google|microsoft|nvidia|tesla|\\bapi\\b|cloud|server|database|startup|\uC2A4\uD0C0\uD2B8\uC5C5|saas|crypto|blockchain|web3|\\bgpu\\b|\\bcpu\\b|cod(?:ing|e\\b|ex)|pipeline|embed|vector|swift|\\breact\\b|typescript",
      reDrop: BASE_DROP,
      kw: {
        en: "\\b(ai|ml|llm|gpt|agi|rl|sota|gpu|tpu)\\b|openai|chatgpt|claude|anthropic|gemini|deepmind|copilot|cursor|codex|grok|llama|mistral|qwen|deepseek|midjourney|diffusion|transformer|agentic|agents?\\b|benchmark|inference|fine-?tun|hugging ?face|nvidia|robotic|autonomous|prompt|token|dataset|neural|frontier model|open[- ]?weight",
        ko: "\uC778\uACF5\uC9C0\uB2A5|\uC0DD\uC131\uD615|\uAC70\uB300\uC5B8\uC5B4|\uC5B8\uC5B4\uBAA8\uB378|\uBAA8\uB378|\uC5D0\uC774\uC804\uD2B8|\uD504\uB86C\uD504\uD2B8|\uCD94\uB860|\uD30C\uC778\uD29C\uB2DD|\uBCA4\uCE58\uB9C8\uD06C|\uBC18\uB3C4\uCCB4|\uB85C\uBD07|\uC790\uC728\uC8FC\uD589|\uCC57\uBD07|\uC624\uD508\uC18C\uC2A4|\uCF54\uB529|\uAC1C\uBC1C\uC790|\uB525\uB7EC\uB2DD|\uBA38\uC2E0\uB7EC\uB2DD",
        jazh: "\u4EBA\u5DE5\u77E5\u80FD|\u751F\u6210AI|\u30A8\u30FC\u30B8\u30A7\u30F3\u30C8|\u30E2\u30C7\u30EB|\u63A8\u8AD6|\u4EBA\u5DE5\u667A\u80FD|\u5927\u6A21\u578B|\u667A\u80FD\u4F53|\u5F00\u6E90|\u63A8\u7406"
      }
    },
    dev: {
      name: "\uAC1C\uBC1C/\uD14C\uD06C",
      reKeep: "\uAC1C\uBC1C\uC790|\uD504\uB85C\uADF8\uB798\uBC0D|\uCF54\uB529|\uC624\uD508\uC18C\uC2A4|\uAE43\uD5C8\uBE0C|\uB9AC\uD329\uD1A0\uB9C1|\uB514\uBC84\uAE45|\uBC30\uD3EC\uD588|github|gitlab|\\bgit\\b|docker|kubernetes|\\bk8s\\b|devops|cicd|ci/cd|\\bapi\\b|\\bsdk\\b|\\bcli\\b|open.?source|changelog|\\bpython\\b|javascript|typescript|\\brust\\b|golang|\\bjava\\b|kotlin|swift|\\bc\\+\\+\\b|\\breact\\b|\\bvue\\b|svelte|nextjs|nuxt|node\\.?js|deno|\\bbun\\b|webpack|vite|tailwind|postgres|mysql|sqlite|redis|mongodb|graphql|supabase|firebase|vercel|netlify|cloudflare|\\baws\\b|\\bgcp\\b|azure|terraform|linux",
      reWeak: "\uC11C\uBC84|\uB370\uC774\uD130\uBCA0\uC774\uC2A4|\uD074\uB77C\uC6B0\uB4DC|\uBC31\uC5D4\uB4DC|\uD504\uB860\uD2B8\uC5D4\uB4DC|\uD480\uC2A4\uD0DD|\uCEE4\uBC0B|\uBA38\uC9C0|\uBC30\uD3EC|server|database|cloud|backend|frontend|full.?stack|commit|merge|deploy|pipeline|framework|library|package|\\bnpm\\b|pnpm|yarn|regex|algorithm|vscode|\\bide\\b|terminal|\uC18C\uD504\uD2B8\uC6E8\uC5B4|software|\uD14C\uD06C|\\btech\\b",
      reDrop: BASE_DROP,
      kw: {
        en: "\\b(dev|developer|coding|programming|software|github|docker|kubernetes|api|sdk|framework|backend|frontend|deploy|release|opensource)\\b|open[- ]?source|typescript|javascript|\\bpython\\b|\\brust\\b|golang|kotlin|\\breact\\b|nextjs|node\\.?js",
        ko: "\uAC1C\uBC1C|\uAC1C\uBC1C\uC790|\uCF54\uB529|\uD504\uB85C\uADF8\uB798\uBC0D|\uC624\uD508\uC18C\uC2A4|\uBC30\uD3EC|\uBC31\uC5D4\uB4DC|\uD504\uB860\uD2B8\uC5D4\uB4DC|\uC11C\uBC84|\uB370\uC774\uD130\uBCA0\uC774\uC2A4|\uD074\uB77C\uC6B0\uB4DC|\uC18C\uD504\uD2B8\uC6E8\uC5B4",
        jazh: "\u958B\u767A|\u30B3\u30FC\u30C7\u30A3\u30F3\u30B0|\u30AA\u30FC\u30D7\u30F3\u30BD\u30FC\u30B9|\u30C7\u30D7\u30ED\u30A4|\u30BD\u30D5\u30C8\u30A6\u30A7\u30A2|\u5F00\u53D1|\u5F00\u6E90|\u90E8\u7F72|\u8F6F\u4EF6"
      }
    },
    finance: {
      name: "\uACBD\uC81C/\uAE08\uC735",
      reKeep: "\uC8FC\uC2DD|\uC99D\uC2DC|\uCF54\uC2A4\uD53C|\uCF54\uC2A4\uB2E5|\uB098\uC2A4\uB2E5|\uD658\uC728|\uAE08\uB9AC|\uC778\uD50C\uB808|\uBB3C\uAC00|\uC5F0\uC900|\uD55C\uAD6D\uC740\uD589|\uCC44\uAD8C|\uBC30\uB2F9|\uC7AC\uD14C\uD06C|\uBE44\uD2B8\uCF54\uC778|\uC774\uB354\uB9AC\uC6C0|\uCF54\uC778|\uAC00\uC0C1\uC790\uC0B0|\uC554\uD638\uD654\uD3D0|\uAD00\uC138|\uBB34\uC5ED|\uC218\uCD9C\uC785|nasdaq|s&p|dow jones|\\bfed\\b|fomc|interest rate|inflation|\\bcpi\\b|\\bpce\\b|bond|treasury|yield|dividend|earnings|\\bipo\\b|bitcoin|ethereum|crypto|stablecoin|\\betf\\b|recession|\\bgdp\\b|tariff|hedge.fund",
      reWeak: "\uB2EC\uB7EC|\uC5D4\uD654|\uC704\uC548\uD654|\uC720\uAC00|\uAE08\uAC12|\uC6D0\uC790\uC7AC|\uBD80\uB3D9\uC0B0|\uACBD\uAE30|\uACE0\uC6A9|\uC2E4\uC5C5|\uB9E4\uCD9C|\uC2E4\uC801|\uC2DC\uAC00\uCD1D\uC561|\uACBD\uC81C|\uD22C\uC790|\uD380\uB4DC|market|economy|dollar|yen|\\boil\\b|gold|real estate|employment|revenue|market cap|fund|investor|\uC8FC\uAC00",
      reDrop: FINANCE_DROP,
      kw: {
        en: "\\b(stock|stocks|market|fed|fomc|inflation|bond|yield|earnings|ipo|etf|bitcoin|ethereum|crypto|tariff|gdp|recession|dividend)\\b|nasdaq|s&p ?500|interest rate",
        ko: "\uC8FC\uC2DD|\uC99D\uC2DC|\uCF54\uC2A4\uD53C|\uB098\uC2A4\uB2E5|\uAE08\uB9AC|\uD658\uC728|\uC778\uD50C\uB808|\uACBD\uC81C|\uC5F0\uC900|\uCC44\uAD8C|\uBC30\uB2F9|\uD22C\uC790|\uBE44\uD2B8\uCF54\uC778|\uCF54\uC778|\uAD00\uC138|\uC2E4\uC801",
        jazh: "\u682A\u5F0F|\u682A\u4FA1|\u91D1\u5229|\u5229\u4E0A\u3052|\u5229\u4E0B\u3052|\u7D4C\u6E08|\u80A1\u7968|\u5229\u7387|\u7ECF\u6D4E|\u901A\u80C0"
      }
    },
    startup: {
      name: "\uC2A4\uD0C0\uD2B8\uC5C5/\uBE44\uC988",
      reKeep: "\uC2A4\uD0C0\uD2B8\uC5C5|\uCC3D\uC5C5|\uC2DC\uB4DC \uD22C\uC790|\uC2DC\uB9AC\uC988|\uD22C\uC790 \uC720\uCE58|\uD380\uB529|\uBC38\uB958\uC5D0\uC774\uC158|\uC720\uB2C8\uCF58|\uC5D1\uC2EF|\uC778\uC218\uD569\uBCD1|\uD53C\uBD07|startup|founder|co-?founder|seed round|series [a-e]\\b|funding|raised|valuation|unicorn|\\bacquisition\\b|merger|m&a|pivot|y combinator|demo day|venture capital|\\bvc\\b|\\bsaas\\b|\\barr\\b|\\bmrr\\b|churn|product[- ]market fit|\uB7F0\uCE6D|launch",
      reWeak: "\uB9E4\uCD9C|\uC131\uC7A5|\uC0AC\uC6A9\uC790|\uAD6C\uB3C5|\uBE44\uC988\uB2C8\uC2A4|\uC0AC\uC5C5|\uAE30\uC5C5\uAC00|\uB9C8\uCF00\uD305|\uADF8\uB85C\uC2A4|\uCC44\uC6A9|\uC81C\uD488 \uCD9C\uC2DC|revenue|growth|users|subscriber|business|marketing|hiring|product|roadmap|\\bb2b\\b|\\bb2c\\b|\uCD9C\uC2DC",
      reDrop: BASE_DROP,
      kw: {
        en: "\\b(startup|startups|founder|funding|raised|valuation|unicorn|acquisition|saas|venture|launch)\\b|series [a-e]|seed round|product[- ]market fit",
        ko: "\uC2A4\uD0C0\uD2B8\uC5C5|\uCC3D\uC5C5|\uD22C\uC790 \uC720\uCE58|\uD380\uB529|\uC720\uB2C8\uCF58|\uC778\uC218|\uD569\uBCD1|\uCD9C\uC2DC|\uB7F0\uCE6D|\uB9E4\uCD9C",
        jazh: "\u30B9\u30BF\u30FC\u30C8\u30A2\u30C3\u30D7|\u5275\u696D|\u8CC7\u91D1\u8ABF\u9054|\u8CB7\u53CE|\u521B\u4E1A|\u878D\u8D44|\u6536\u8D2D|\u521D\u521B"
      }
    },
    custom: {
      name: "\uC790\uC720 \uC785\uB825",
      reKeep: "",
      reWeak: "",
      reDrop: "",
      kw: { en: "", ko: "", jazh: "" }
    }
  };
  var DEFAULT_TOPIC = "ai";
  var NOTHING = /$^/;
  function normalizeTopicKey(key) {
    return TOPICS[key] ? key : DEFAULT_TOPIC;
  }
  function compileRe(src, fallback) {
    if (src) {
      try {
        return new RegExp(src, "i");
      } catch {
      }
    }
    if (fallback instanceof RegExp) return fallback;
    if (typeof fallback === "string" && fallback) {
      try {
        return new RegExp(fallback, "i");
      } catch {
      }
    }
    return NOTHING;
  }
  function resolveTopicFilters(topicKey, custom = {}) {
    const isCustom = topicKey === "custom";
    if (isCustom) {
      const fb = TOPICS[DEFAULT_TOPIC];
      return {
        key: "custom",
        name: TOPICS.custom.name,
        reKeep: compileRe(custom.reKeep, fb.reKeep),
        reWeak: compileRe(custom.reWeak, fb.reWeak),
        reDrop: compileRe(custom.reDrop, fb.reDrop)
      };
    }
    const key = normalizeTopicKey(topicKey);
    const t = TOPICS[key];
    return {
      key,
      name: t.name,
      reKeep: compileRe(t.reKeep),
      reWeak: compileRe(t.reWeak),
      reDrop: compileRe(t.reDrop)
    };
  }

  // src/sources/match.mjs
  var SOURCE_LABELS = {
    x: "X",
    reddit: "Reddit",
    threads: "Threads",
    linkedin: "LinkedIn"
  };
  function hostOf(host) {
    return String(host || "").toLowerCase().replace(/^www\./, "");
  }
  function matchReddit(host) {
    const h = hostOf(host);
    return h === "reddit.com" || h.endsWith(".reddit.com");
  }
  function matchThreads(host) {
    const h = hostOf(host);
    return h === "threads.net" || h.endsWith(".threads.net") || h === "threads.com" || h.endsWith(".threads.com");
  }
  function matchLinkedin(host) {
    const h = hostOf(host);
    return h === "linkedin.com" || h.endsWith(".linkedin.com");
  }
  function detectSource(host) {
    if (matchReddit(host)) return "reddit";
    if (matchThreads(host)) return "threads";
    if (matchLinkedin(host)) return "linkedin";
    return "x";
  }
  function sourceLabel(id3) {
    return SOURCE_LABELS[id3] || SOURCE_LABELS.x;
  }

  // src/sources/schema.mjs
  var SOURCE_IDS = ["x", "reddit", "threads", "linkedin"];
  function emptyItem(overrides = {}) {
    return {
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
      ...overrides
    };
  }
  function withSource(item, sourceId) {
    const s = SOURCE_IDS.includes(sourceId) ? sourceId : "x";
    return { ...item, s };
  }
  function csvEsc(s) {
    if (s == null) return "";
    s = String(s).replace(/[\n\r]+/g, " ").trim();
    if (/^[=+\-@]/.test(s)) s = "'" + s;
    return /[,"\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }
  var CSV_HEADER = "\uFEFF\uBC88\uD638,\uC774\uB984,\uD578\uB4E4,\uC778\uC99D,\uD14D\uC2A4\uD2B8,\uC5B8\uC5B4,\uC2DC\uAC04,\uC0C1\uB300\uC2DC\uAC04,URL,\uB313\uAE00,RT,\uC88B\uC544\uC694,\uBD81\uB9C8\uD06C,\uC870\uD68C,\uD574\uC2DC\uD0DC\uADF8,\uBA58\uC158,\uC778\uB77C\uC778\uB9C1\uD06C,\uC778\uC6A9\uC791\uC131\uC790,\uC778\uC6A9\uB0B4\uC6A9,\uC778\uC6A9URL,\uBBF8\uB514\uC5B4,\uBBF8\uB514\uC5B4URL,\uAE30\uC0AC\uC81C\uBAA9,\uAE30\uC0AC\uBBF8\uB9AC\uBCF4\uAE30,source\n";
  function csvRow(it, i) {
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
  function jsonItem(it, i) {
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
  function csvBody(items) {
    return CSV_HEADER + items.map((it, i) => csvRow(it, i)).join("\n");
  }
  function jsonData(items) {
    return items.map((it, i) => jsonItem(it, i));
  }

  // src/sources/reddit.mjs
  function parseLocation(href) {
    let u;
    try {
      u = new URL(href);
    } catch {
      return { kind: "front", sort: "hot", q: "", sub: "" };
    }
    const path = u.pathname.replace(/\/+$/, "") || "/";
    const q = u.searchParams.get("q") || "";
    if (path.startsWith("/search") || path === "/" && q) {
      return {
        kind: "search",
        q,
        sort: u.searchParams.get("sort") || "relevance",
        sub: u.searchParams.get("restrict_sr") === "on" ? u.searchParams.get("subreddit") || "" : ""
      };
    }
    const sub = path.match(/^\/r\/([^/]+)/);
    if (sub) {
      const name = decodeURIComponent(sub[1]);
      if (name === "all" || name === "popular") {
        const rest2 = path.slice(("/r/" + sub[1]).length);
        const sort2 = (rest2.match(/^\/(hot|new|top|rising)/) || [])[1] || "hot";
        return { kind: "front", sort: sort2, q: "", sub: name };
      }
      const rest = path.slice(("/r/" + sub[1]).length);
      const sort = (rest.match(/^\/(hot|new|top|rising)/) || [])[1] || "hot";
      return { kind: "subreddit", sub: name, sort, q: "" };
    }
    const rootSort = (path.match(/^\/(hot|new|top|rising)/) || [])[1];
    return { kind: "front", sort: rootSort || "hot", q: "", sub: "" };
  }
  function listingUrl(loc, after) {
    const q = new URLSearchParams({ limit: "100" });
    if (after) q.set("after", after);
    if (loc.kind === "search") {
      q.set("q", loc.q || "");
      q.set("sort", loc.sort || "relevance");
      const path = loc.sub ? `/r/${encodeURIComponent(loc.sub)}/search.json` : "/search.json";
      return `${path}?${q}`;
    }
    if (loc.kind === "subreddit") {
      const sort = loc.sort || "hot";
      return `/r/${encodeURIComponent(loc.sub)}/${sort}.json?${q}`;
    }
    if (loc.sub === "all" || loc.sub === "popular") {
      return `/r/${loc.sub}/${loc.sort || "hot"}.json?${q}`;
    }
    return `/${loc.sort || "hot"}.json?${q}`;
  }
  function childrenOf(json) {
    const ch = json && json.data && json.data.children;
    return Array.isArray(ch) ? ch : [];
  }
  function afterOf(json) {
    const after = json && json.data && json.data.after;
    return after || null;
  }
  function absUrl(permalink) {
    if (!permalink) return "";
    if (/^https?:\/\//i.test(permalink)) return permalink;
    return "https://www.reddit.com" + (permalink.startsWith("/") ? permalink : "/" + permalink);
  }
  function mapChild(child) {
    if (!child || child.kind && child.kind !== "t3" || !child.data) return null;
    const d = child.data;
    const permalink = d.permalink || (d.id ? `/comments/${d.id}` : "");
    const url = absUrl(permalink);
    if (!url) return null;
    const title = d.title || "";
    const selftext = d.selftext || "";
    const text = selftext ? title + "\n\n" + selftext : title;
    const author = d.author || "";
    const sub = d.subreddit || d.subreddit_name_prefixed || "";
    const ext = d.url && d.url !== url ? d.url : "";
    const isVid = !!(d.is_video || d.post_hint === "hosted:video" || d.post_hint === "rich:video");
    const isImg = d.post_hint === "image" || !!d.preview && !isVid;
    return emptyItem({
      n: author,
      h: author ? "u/" + author : "",
      t: text,
      d: d.created_utc ? new Date(d.created_utc * 1e3).toISOString() : "",
      u: url,
      r: d.num_comments || 0,
      w: 0,
      l: typeof d.score === "number" ? d.score : 0,
      v: 0,
      b: 0,
      lg: "",
      vf: 0,
      ht: sub ? "r/" + String(sub).replace(/^r\//, "") : "",
      mn: "",
      lk: ext,
      md: isVid ? "vid" : isImg ? "img" : "",
      mu: isImg && ext ? ext : "",
      s: "reddit"
    });
  }
  function backoffMs(attempt, baseDelay) {
    const base = Math.max(6e3, Number(baseDelay) || 6e3);
    const n = Math.max(0, Number(attempt) || 0);
    return Math.min(6e4, base * Math.pow(2, n));
  }
  var MAX_429 = 6;

  // src/sources/threads.mjs
  var threads_exports = {};
  __export(threads_exports, {
    canonicalPostUrl: () => canonicalPostUrl,
    handleFromUrl: () => handleFromUrl,
    harvestDocument: () => harvestDocument,
    id: () => id,
    init: () => init,
    mapThreadPost: () => mapThreadPost,
    match: () => match
  });
  var id = "threads";
  function match(host) {
    return matchThreads(host);
  }
  function init() {
    return { mode: "dom" };
  }
  function canonicalPostUrl(href) {
    try {
      const u = new URL(href, "https://www.threads.net");
      const m = u.pathname.match(/^\/(@[^/]+)\/post\/([^/?#]+)/);
      if (!m) return "";
      const host = /(?:^|\.)threads\.com$/i.test(u.hostname) ? "www.threads.com" : "www.threads.net";
      return "https://" + host + "/" + m[1] + "/post/" + m[2];
    } catch {
    }
    return "";
  }
  function handleFromUrl(url) {
    const m = String(url).match(/threads\.(?:net|com)\/(@[^/]+)\//);
    return m ? m[1] : "";
  }
  function mapThreadPost(raw) {
    const url = canonicalPostUrl(raw.url || raw.href || "");
    if (!url) return null;
    const handle = raw.handle || handleFromUrl(url) || "";
    return emptyItem({
      n: raw.name || handle.replace(/^@/, ""),
      h: handle.startsWith("@") ? handle : handle ? "@" + handle : "",
      t: raw.text || "",
      d: raw.time || "",
      rd: raw.relTime || "",
      u: url,
      r: raw.replies || 0,
      w: raw.reposts || 0,
      l: raw.likes || 0,
      v: 0,
      b: 0,
      s: "threads"
    });
  }
  function articleRoot(el) {
    return el.closest("article") || el.closest("[data-pressable-container]") || el.closest('div[role="article"]') || el.parentElement;
  }
  function harvestDocument(doc, ctx) {
    const anchors = doc.querySelectorAll('a[href*="/post/"]');
    let artSeen = 0;
    let parsedOk = 0;
    let fresh = 0;
    const seen = /* @__PURE__ */ new Set();
    for (const a of anchors) {
      const url = canonicalPostUrl(a.href || a.getAttribute("href") || "");
      if (!url || seen.has(url)) continue;
      seen.add(url);
      artSeen++;
      const root = articleRoot(a);
      if (!root) continue;
      parsedOk++;
      if (ctx.has(url)) continue;
      const timeEl = root.querySelector("time");
      const textEl = root.querySelector('[data-testid="post-text"]') || root.querySelector('[dir="auto"]');
      const text = (textEl ? textEl.textContent : root.textContent || "").replace(/\s+/g, " ").trim().slice(0, 4e3);
      if (ctx.excluded(text)) {
        ctx.skip(url);
        fresh++;
        continue;
      }
      const item = mapThreadPost({
        url,
        handle: handleFromUrl(url),
        text,
        time: timeEl ? timeEl.getAttribute("datetime") || "" : "",
        relTime: timeEl ? (timeEl.textContent || "").trim() : ""
      });
      if (!item) continue;
      ctx.add(item);
      fresh++;
    }
    return { artSeen, parsedOk, fresh };
  }

  // src/sources/linkedin.mjs
  var linkedin_exports = {};
  __export(linkedin_exports, {
    canonicalActivityUrl: () => canonicalActivityUrl,
    harvestDocument: () => harvestDocument2,
    id: () => id2,
    init: () => init2,
    mapLinkedinPost: () => mapLinkedinPost,
    match: () => match2
  });
  var id2 = "linkedin";
  function match2(host) {
    return matchLinkedin(host);
  }
  function init2() {
    return { mode: "dom", defaultOff: true };
  }
  function canonicalActivityUrl(urnOrHref) {
    const s = String(urnOrHref || "");
    const urn = s.match(/urn:li:activity:(\d+)/);
    if (urn) return "https://www.linkedin.com/feed/update/urn:li:activity:" + urn[1];
    try {
      const u = new URL(s, "https://www.linkedin.com");
      if (/\/feed\/update\//.test(u.pathname) || /\/posts\//.test(u.pathname)) {
        return u.origin + u.pathname.replace(/\/+$/, "");
      }
    } catch {
    }
    return "";
  }
  function mapLinkedinPost(raw) {
    const url = canonicalActivityUrl(raw.url || raw.urn || "");
    if (!url) return null;
    const handle = raw.handle || "";
    return emptyItem({
      n: raw.name || handle,
      h: handle,
      t: raw.text || "",
      d: raw.time || "",
      rd: raw.relTime || "",
      u: url,
      r: raw.comments || 0,
      w: raw.reposts || 0,
      l: raw.likes || 0,
      v: 0,
      b: 0,
      s: "linkedin"
    });
  }
  function rootOf(el) {
    return el.closest("[data-urn]") || el.closest(".feed-shared-update-v2") || el.closest("article") || el.parentElement;
  }
  function parseCount(label) {
    const m = String(label || "").replace(/,/g, "").match(/([\d.]+)\s*([KkMm만]?)/);
    if (!m) return 0;
    const n = parseFloat(m[1]);
    if (/[Kk]/.test(m[2])) return Math.floor(n * 1e3);
    if (m[2] === "\uB9CC") return Math.floor(n * 1e4);
    if (/[Mm]/.test(m[2])) return Math.floor(n * 1e6);
    return Math.floor(n);
  }
  function harvestDocument2(doc, ctx) {
    const nodes = doc.querySelectorAll(
      '[data-urn*="urn:li:activity"], .feed-shared-update-v2, article[data-id]'
    );
    let artSeen = 0;
    let parsedOk = 0;
    let fresh = 0;
    const seen = /* @__PURE__ */ new Set();
    const list = nodes.length ? nodes : doc.querySelectorAll('a[href*="/feed/update/"], a[href*="/posts/"]');
    for (const el of list) {
      artSeen++;
      const urn = el.getAttribute && el.getAttribute("data-urn");
      const href = el.getAttribute && (el.getAttribute("href") || "") || el.querySelector && (el.querySelector('a[href*="/feed/update/"]') || el.querySelector('a[href*="/posts/"]') || {}).href || "";
      const url = canonicalActivityUrl(urn || href);
      if (!url || seen.has(url)) continue;
      seen.add(url);
      parsedOk++;
      if (ctx.has(url)) continue;
      const root = rootOf(el) || el;
      const textEl = root.querySelector && (root.querySelector(".feed-shared-update-v2__description") || root.querySelector(".update-components-text") || root.querySelector('[data-test-id="main-feed-activity-card"] span[dir="ltr"]'));
      const nameEl = root.querySelector && root.querySelector(".update-components-actor__name, .feed-shared-actor__name");
      const timeEl = root.querySelector && root.querySelector("time");
      const text = (textEl && textEl.textContent || "").replace(/\s+/g, " ").trim().slice(0, 4e3);
      if (ctx.excluded(text)) {
        ctx.skip(url);
        fresh++;
        continue;
      }
      const likeEl = root.querySelector && root.querySelector(".social-details-social-counts__reactions-count");
      const item = mapLinkedinPost({
        url,
        name: nameEl ? nameEl.textContent.replace(/\s+/g, " ").trim() : "",
        text,
        time: timeEl ? timeEl.getAttribute("datetime") || "" : "",
        relTime: timeEl ? (timeEl.textContent || "").trim() : "",
        likes: parseCount(likeEl && likeEl.textContent)
      });
      if (!item) continue;
      ctx.add(item);
      fresh++;
    }
    return { artSeen, parsedOk, fresh };
  }

  // src/collector.js
  void (async function twcMain() {
    var KEY = "_twc";
    var EXT = window.__twcConfig || null;
    var sourceId = detectSource(location && location.hostname || "");
    if (sourceId === "linkedin" && !(EXT && EXT.enableLinkedIn)) {
      alert(
        "LinkedIn \uC218\uC9D1\uC740 \uBD07 \uD0D0\uC9C0\xB7\uACC4\uC815 \uC81C\uD55C \uC704\uD5D8\uC774 \uC788\uC5B4 \uAE30\uBCF8 \uAEBC\uC838 \uC788\uC2B5\uB2C8\uB2E4.\n\uD655\uC7A5 \uC635\uC158\uC5D0\uC11C LinkedIn \uC218\uC9D1\uC744 \uCF20 \uB4A4 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC138\uC694."
      );
      return;
    }
    var doc = document;
    var store = null;
    try {
      store = window.localStorage;
    } catch (e) {
    }
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
        "\uC218\uC9D1\uD560 \uD2B8\uC717 \uAC2F\uC218:",
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
    var filterMode = EXT && EXT.filterMode ? 1 : 0;
    var skippedCount = 0, lastSaved = tweets.size, fixMulti = 0, fixClamp = 0;
    var zeroStreak = 0, selWarned = 0, artSeen = 0, parsedOk = 0, stall = 0, cooldowns = 0;
    var saveDisabled = 0, quotaWarned = 0;
    var apiFresh = 0, apiCount = 0, incStep = 2e3;
    var loadingReq = 0, loadWait = 0;
    var topicFilters = resolveTopicFilters(EXT && EXT.topic || DEFAULT_TOPIC, {
      reKeep: EXT && EXT.reKeep,
      reWeak: EXT && EXT.reWeak,
      reDrop: EXT && EXT.reDrop
    });
    var topicKey = topicFilters.key;
    var topicName = topicFilters.name;
    var RE_KEEP = topicFilters.reKeep;
    var RE_WEAK = topicFilters.reWeak;
    var RE_DROP = topicFilters.reDrop;
    function filterBtnLabel() {
      return filterMode ? "\uD544\uD130: " + topicName : "\uD544\uD130 OFF";
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
    var CSS = "<style>:host{" + (isDark ? "--bg:#15202b;--fg:#e7e9ea;--sub:#8b98a5;--line:#38444d;--chip:#1e2732" : "--bg:#ffffff;--fg:#0f1419;--sub:#536471;--line:#eff3f4;--chip:#f7f9fa") + ";--ac:#1d9bf0}*{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif}.p{width:268px;background:var(--bg);color:var(--fg);border:1px solid var(--line);border-radius:14px;box-shadow:0 8px 28px rgba(0,0,0,.28);overflow:hidden;font-size:13px;line-height:1.45}.hd{display:flex;align-items:center;gap:6px;padding:9px 8px 9px 12px;cursor:move;border-bottom:1px solid var(--line);user-select:none}.ttl{font-weight:700;font-size:12.5px;flex:1}.ver{font-size:10px;color:var(--sub);background:var(--chip);padding:1px 6px;border-radius:20px}.ic{width:22px;height:22px;border:0;background:transparent;color:var(--sub);border-radius:6px;cursor:pointer;font-size:12px;line-height:1;display:flex;align-items:center;justify-content:center}.ic:hover{background:var(--chip);color:var(--fg)}.bd{padding:12px}.num{display:flex;align-items:baseline;gap:5px;margin-bottom:8px}.num b{font-size:26px;font-weight:800;letter-spacing:-.5px;font-variant-numeric:tabular-nums}.num s{text-decoration:none;color:var(--sub);font-size:12.5px}.bar{height:5px;background:var(--chip);border-radius:20px;overflow:hidden;margin-bottom:9px}.bar i{display:block;height:5px;width:0px;background:var(--ac);border-radius:20px;transition:width .3s}.met{display:flex;gap:10px;font-size:11px;color:var(--sub);font-variant-numeric:tabular-nums;margin-bottom:10px;min-height:16px}.met span{white-space:nowrap}.st{display:flex;align-items:center;gap:7px;font-size:11.5px;padding:6px 9px;border-radius:8px;background:var(--chip);margin-bottom:11px}.dot{width:7px;height:7px;border-radius:20px;background:var(--ac);flex:none}.row{display:flex;gap:6px;margin-bottom:6px}.btn{flex:1;border:1px solid var(--line);background:var(--chip);color:var(--fg);border-radius:8px;padding:7px 4px;font-size:11.5px;font-weight:600;cursor:pointer;white-space:nowrap}.btn:hover{border-color:var(--ac)}.btn.on{background:var(--ac);border-color:var(--ac);color:#fff}.btn.dg{color:#f4212e}.spd{display:flex;align-items:center;gap:6px;margin-bottom:6px}.lab{font-size:11px;color:var(--sub);flex:none}.val{flex:1;text-align:center;font-size:11.5px;font-variant-numeric:tabular-nums;color:var(--sub)}.stp{flex:none;min-width:50px}.foot{font-size:10.5px;color:var(--sub);padding-top:8px;margin-top:2px;border-top:1px solid var(--line);display:flex;gap:10px;flex-wrap:wrap}.fr{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;font-size:11.5px;color:var(--sub)}.fr b{color:var(--fg);font-variant-numeric:tabular-nums}input[type=number]{width:72px;background:var(--chip);border:1px solid var(--line);color:var(--fg);border-radius:6px;padding:4px 6px;font-size:11.5px}select{background:var(--chip);border:1px solid var(--line);color:var(--fg);border-radius:6px;padding:4px 6px;font-size:11.5px}input[type=checkbox]{accent-color:var(--ac)}.ck{display:flex;align-items:center;gap:6px;cursor:pointer}.hide{display:none}</style>";
    var host = doc.createElement("div");
    host.style.cssText = "all:initial;position:fixed;top:12px;right:12px;z-index:2147483647";
    var root = host.attachShadow({ mode: "open" });
    root.innerHTML = CSS + '<div class="p"><div class="hd" id="hd"><span id="ico"><img src="data:image/png;base64,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" alt="" style="width:15px;height:15px;vertical-align:-2px"></span><span class="ttl" id="ttl">Xsearch</span><span class="ver">v5.0.0</span><button class="ic" id="min" title="\uC811\uAE30">\u2500</button><button class="ic hide" id="cls" title="\uB2EB\uAE30">\u2715</button></div><div class="bd" id="bd"><div class="num"><b id="cnt">0</b><s id="tgt"></s></div><div class="bar"><i id="bar"></i></div><div class="met"><span id="tm">0:00</span><span id="eta"></span><span id="rate"></span></div><div class="st"><span class="dot" id="dot"></span><span id="msg">\uC2DC\uC791\uD558\uB294 \uC911</span></div><div class="row"><button class="btn" id="pz" title="\uC218\uC9D1\uC744 \uC7A0\uC2DC \uBA48\uCDC4\uB2E4\uAC00 \uB2E4\uC2DC \uC2DC\uC791">\uC77C\uC2DC\uC815\uC9C0</button><button class="btn dg" id="sp" title="\uC9C0\uAE08\uAE4C\uC9C0 \uC218\uC9D1\uD55C \uAC83\uC744 \uC800\uC7A5\uD558\uACE0 \uC885\uB8CC">\uC911\uB2E8\xB7\uC800\uC7A5</button></div><div class="spd"><span class="lab">\uC18D\uB3C4</span><button class="btn stp" id="fa" title="\uC774\uB3D9 \uC0AC\uC774 \uB300\uAE30\uB97C \uC904\uC5EC \uBE60\uB974\uAC8C (\uACFC\uD558\uBA74 \uAD00\uB828\uC131\u2193\xB7\uCC28\uB2E8 \uC704\uD5D8)">\uBE60\uB974\uAC8C</button><span class="val" id="dly"></span><button class="btn stp" id="sl" title="\uC774\uB3D9 \uC0AC\uC774 \uB300\uAE30\uB97C \uB298\uB824 \uCC9C\uCC9C\uD788 (\uAD00\uB828\uC131\u2191)">\uB290\uB9AC\uAC8C</button></div><div class="row"><button class="btn" id="flt" title="\uC218\uC9D1 \uB300\uC0C1: \uC804\uCCB4 \u2194 \uD1A0\uD53D\uB9CC">\uD544\uD130 OFF</button></div><div class="foot hide" id="foot"><span id="apc"></span><span id="skp"></span><span id="fix"></span><span id="qw"></span></div></div></div>';
    doc.body.appendChild(host);
    function $(id3) {
      return root.getElementById(id3);
    }
    var elCnt = $("cnt"), elTgt = $("tgt"), elBar = $("bar"), elTm = $("tm"), elEta = $("eta"), elRate = $("rate");
    var elDot = $("dot"), elMsg = $("msg"), elDly = $("dly"), elFoot = $("foot"), elSkp = $("skp"), elFix = $("fix"), elQw = $("qw"), elApc = $("apc");
    var btnFlt = $("flt");
    if (sourceId !== "x") {
      $("ttl").textContent = "Xsearch \xB7 " + sourceLabel(sourceId);
    }
    btnFlt.textContent = filterBtnLabel();
    if (filterMode) {
      btnFlt.classList.add("on");
    }
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
    function snowflakeDate(url) {
      try {
        var mm = url.match(/status\/(\d+)/);
        return mm ? new Date(Number(BigInt(mm[1]) >> 22n) + 1288834974657).toISOString() : "";
      } catch (e) {
        return "";
      }
    }
    function parseNum(s) {
      if (!s) {
        return 0;
      }
      var mm = String(s).trim().replace(/,/g, "").match(/^([\d.]+)\s*([KkMm천만]?)$/);
      if (!mm) {
        return 0;
      }
      var num = parseFloat(mm[1]);
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
    function readMetric(btn) {
      if (!btn) {
        return 0;
      }
      var nums = [];
      btn.querySelectorAll("span").forEach(function(sp) {
        var tx = sp.textContent.trim();
        if (tx && /^[\d,.KkMm천만]+$/.test(tx)) {
          nums.push(tx);
        }
      });
      if (nums.length >= 2) {
        fixMulti++;
        return parseNum(nums[nums.length - 1]);
      }
      return parseNum(btn.textContent);
    }
    function findRetry() {
      var btns = doc.querySelectorAll('[role="button"],button');
      for (var i = 0; i < btns.length; i++) {
        var tx = (btns[i].innerText || "").trim();
        if (tx.length < 30 && /다시 시도|재시도|Retry|Try again|새로고침|Reload/i.test(tx)) {
          return btns[i];
        }
      }
      return null;
    }
    function feedState() {
      var col = doc.querySelector('[data-testid="primaryColumn"]') || doc;
      var cells = col.querySelectorAll('[data-testid="cellInnerDiv"]');
      var last = cells[cells.length - 1];
      var tx = last && !last.querySelector("article") && last.innerText || "";
      if (/문제가 발생했|다시 시도|Something went wrong|Try again|Retry/i.test(tx)) {
        return "error";
      }
      if (/더 이상|모두 확인했|다 보셨|끝까지|You.?re all caught up|caught up|No more/i.test(
        tx
      )) {
        return "end";
      }
      var pbs = col.querySelectorAll('[role="progressbar"]');
      for (var pi = 0; pi < pbs.length; pi++) {
        if (pbs[pi].getBoundingClientRect().height >= 10) {
          return "loading";
        }
      }
      return "idle";
    }
    async function clickShowMore() {
      var cands = [].slice.call(
        doc.querySelectorAll(
          'article[data-testid="tweet"] button, article[data-testid="tweet"] div[role="button"], article[data-testid="tweet"] span'
        )
      ).filter(function(el) {
        var tx = (el.innerText || "").trim();
        return tx === "Show more" || tx === "\uB354 \uBCF4\uAE30" || tx === "Show" || tx === "\uB354\uBCF4\uAE30";
      });
      var done = 0;
      for (var i = 0; i < cands.length; i++) {
        try {
          cands[i].click();
          done++;
          await sleep(80);
        } catch (e) {
        }
      }
      return done;
    }
    function parseTweets() {
      var arts = doc.querySelectorAll('article[data-testid="tweet"]');
      if (!arts.length) {
        arts = doc.querySelectorAll('article[role="article"]');
      }
      artSeen = arts.length;
      parsedOk = 0;
      var fresh2 = 0;
      arts.forEach(function(art) {
        try {
          var url = "";
          var stLinks = art.querySelectorAll('a[href*="/status/"]');
          for (var i = 0; i < stLinks.length; i++) {
            var mu = stLinks[i].href.match(
              /^https?:\/\/[^\/]+\/[^\/]+\/status\/\d+/
            );
            if (mu) {
              url = mu[0];
              break;
            }
          }
          if (!url) {
            return;
          }
          parsedOk++;
          if (tweets.has(url) || skippedSet.has(url)) {
            return;
          }
          var userEl = art.querySelector('[data-testid="User-Name"]') || art.querySelector('[data-testid="User-Names"]');
          var nameSpan = userEl ? userEl.querySelector("span") : null;
          var userLink = art.querySelector('[data-testid="User-Name"] a') || art.querySelector('a[role="link"][href^="/"]');
          var textEls = art.querySelectorAll('[data-testid="tweetText"]');
          var textEl = textEls[0] || null;
          var timeEl = art.querySelector("time");
          var text = textEl ? textEl.textContent.trim() : "";
          var coverImgs = art.querySelectorAll(
            '[data-testid="article-cover-image"] img'
          );
          var isArticle = coverImgs.length > 0;
          var artTitle = "", artPrev = "";
          if (isArticle) {
            var cover = art.querySelector('[data-testid="article-cover-image"]');
            var box = cover.closest('div[role="link"]') || (cover.parentElement ? cover.parentElement.parentElement : null);
            var lines = (box ? box.innerText : "").split("\n").map(function(s) {
              return s.trim();
            }).filter(Boolean);
            var ai = lines.findIndex(function(s) {
              return s === "\uAE30\uC0AC" || s === "Article";
            });
            artTitle = ai >= 0 ? lines[ai + 1] || "" : lines[0] || "";
            artPrev = ai >= 0 ? lines.slice(ai + 2).join(" ").slice(0, 500) : "";
            var artBlock = (artTitle ? "[\uAE30\uC0AC] " + artTitle : "") + (artPrev ? "\n" + artPrev : "");
            text = text ? text + (artBlock ? "\n\n" + artBlock : "") : artBlock;
          }
          var quoted = null;
          if (textEls.length >= 2) {
            var qEl = textEls[1];
            var qBox = qEl.closest('div[role="link"]') || qEl.parentElement;
            var qUser = qBox ? qBox.querySelector('[data-testid="User-Name"]') : null;
            var qTime = qBox ? qBox.querySelector("time") : null;
            var qUrl = "";
            var qLinks = qBox ? qBox.querySelectorAll('a[href*="/status/"]') : [];
            for (var j = 0; j < qLinks.length; j++) {
              var mq = qLinks[j].href.match(
                /^https?:\/\/[^\/]+\/[^\/]+\/status\/\d+/
              );
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
          if (fExcluded(text)) {
            skippedCount++;
            skippedSet.add(url);
            fresh2++;
            return;
          }
          var replyBtn = art.querySelector('[data-testid="reply"]');
          var rtBtn = art.querySelector('[data-testid="retweet"]');
          var likeBtn = art.querySelector('[data-testid="like"]');
          var photos = art.querySelectorAll('[data-testid="tweetPhoto"] img');
          var vids = art.querySelectorAll("video");
          var hasImg = photos.length > 0, hasVid = vids.length > 0;
          var mediaType = isArticle ? "article" : hasImg && hasVid ? "img+vid" : hasImg ? "img" : hasVid ? "vid" : "";
          var mediaUrls = [];
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
          var grp = art.querySelector('[role="group"]');
          var aria = grp ? grp.getAttribute("aria-label") : "";
          var M0 = { r: 0, w: 0, l: 0, b: 0, v: 0 };
          if (aria) {
            [
              ["r", /([\d,.]+\s*[KkMm천만]?)\s*(?:repl|댓글|답글)/i],
              [
                "w",
                /([\d,.]+\s*[KkMm천만]?)\s*(?:repost|retweet|재게시|리트윗|리포스트)/i
              ],
              ["l", /([\d,.]+\s*[KkMm천만]?)\s*(?:like|마음에 들|좋아요)/i],
              ["b", /([\d,.]+\s*[KkMm천만]?)\s*(?:bookmark|북마크)/i],
              ["v", /([\d,.]+\s*[KkMm천만]?)\s*(?:view|조회)/i]
            ].forEach(function(pair) {
              var mm = aria.match(pair[1]);
              if (mm) {
                M0[pair[0]] = parseNum(mm[1].replace(/\s+/g, ""));
              }
            });
          }
          var hasR = aria && /(repl|댓글|답글)/i.test(aria);
          var hasW = aria && /(repost|retweet|재게시|리트윗|리포스트)/i.test(aria);
          var hasL = aria && /(like|마음에 들|좋아요)/i.test(aria);
          var replies = hasR ? M0.r : readMetric(replyBtn);
          var retweets = hasW ? M0.w : readMetric(rtBtn);
          var likes = hasL ? M0.l : readMetric(likeBtn);
          var bookmarks = M0.b, views = M0.v;
          if (!views) {
            var an = art.querySelector('a[href*="/analytics"]');
            if (an) {
              views = parseNum(an.textContent);
            }
          }
          if (!views) {
            var allLinks = art.querySelectorAll('a[role="link"]');
            for (var k = 0; k < allLinks.length; k++) {
              var al = allLinks[k].getAttribute("aria-label") || "";
              if (/view|조회/i.test(al)) {
                var mv = al.match(/([\d,.]+\s*[KkMm천만]?)/);
                if (mv) {
                  views = parseNum(mv[1].replace(/\s+/g, ""));
                  break;
                }
              }
            }
          }
          if (views > 0 && likes > views) {
            likes = Math.min(M0.l, views);
            fixClamp++;
          }
          if (views > 0 && replies > views) {
            replies = Math.min(M0.r, views);
            fixClamp++;
          }
          if (views > 0 && retweets > views) {
            retweets = Math.min(M0.w, views);
            fixClamp++;
          }
          var lang = textEl && textEl.getAttribute("lang") || "";
          var verified = !!art.querySelector('svg[data-testid="icon-verified"]');
          var relTime = timeEl ? timeEl.textContent.trim() : "";
          var hashtags = [], mentions = [], extLinks = [];
          if (textEl) {
            hashtags = [].slice.call(textEl.querySelectorAll('a[href*="/hashtag/"]')).map(function(a) {
              return a.textContent.trim();
            });
            mentions = [].slice.call(textEl.querySelectorAll('a[role="link"]')).filter(function(a) {
              try {
                return /^\/[A-Za-z0-9_]+$/.test(new URL(a.href).pathname);
              } catch (e) {
                return false;
              }
            }).map(function(a) {
              return a.textContent.trim();
            });
            extLinks = [].slice.call(textEl.querySelectorAll('a[role="link"]')).filter(function(a) {
              var hf = a.href;
              return hf && !hf.includes("/hashtag/") && !hf.includes("x.com/") && !hf.includes("twitter.com/");
            }).map(function(a) {
              return a.href;
            });
          }
          tweets.set(
            url,
            withSource(
              {
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
              },
              "x"
            )
          );
          fresh2++;
        } catch (e) {
        }
      });
      updateFoot();
      if (artSeen >= 3 && parsedOk === 0) {
        zeroStreak++;
        if (zeroStreak >= 3 && !selWarned) {
          selWarned = 1;
          setStatus(RED, "\uC120\uD0DD\uC790 \uD655\uC778 \uD544\uC694 (X DOM \uBCC0\uACBD?)");
        }
      } else if (parsedOk > 0) {
        zeroStreak = 0;
      }
      return fresh2;
    }
    function tweetFromApi(node) {
      try {
        var tw = node;
        if (tw.tweet) {
          tw = tw.tweet;
        }
        if (tw.retweeted_status_result && tw.retweeted_status_result.result) {
          var rr = tw.retweeted_status_result.result;
          tw = rr.tweet || rr;
        }
        var lg2 = tw.legacy;
        if (!lg2 || typeof lg2.full_text !== "string" || !tw.rest_id) {
          return;
        }
        var ur = tw.core && tw.core.user_results && tw.core.user_results.result;
        var ul = ur && ur.legacy || {};
        var uc = ur && ur.core || {};
        var screen = ul.screen_name || uc.screen_name || "";
        var uname = ul.name || uc.name || "";
        var url = "https://x.com/" + (screen || "i") + "/status/" + tw.rest_id;
        if (tweets.has(url) || skippedSet.has(url)) {
          return;
        }
        var text = lg2.full_text;
        var nt = tw.note_tweet && tw.note_tweet.note_tweet_results && tw.note_tweet.note_tweet_results.result;
        if (nt && nt.text) {
          text = nt.text;
        }
        var quoted = null;
        var qr = tw.quoted_status_result && tw.quoted_status_result.result;
        if (qr) {
          qr = qr.tweet || qr;
          var qlg = qr.legacy;
          var qur = qr.core && qr.core.user_results && qr.core.user_results.result;
          var qul = qur && qur.legacy || {};
          var quc = qur && qur.core || {};
          if (qlg) {
            var qScreen = qul.screen_name || quc.screen_name || "";
            quoted = {
              user: (qul.name || quc.name || "") + " @" + qScreen,
              text: qlg.full_text || "",
              time: qlg.created_at ? new Date(qlg.created_at).toISOString() : "",
              url: "https://x.com/" + (qScreen || "i") + "/status/" + (qr.rest_id || "")
            };
            text = text + "\n\n[\uC778\uC6A9] " + quoted.user + ": " + quoted.text;
          }
        }
        if (fExcluded(text)) {
          skippedCount++;
          skippedSet.add(url);
          apiFresh++;
          return;
        }
        var ents = lg2.entities || {};
        var media = lg2.extended_entities && lg2.extended_entities.media || ents.media || [];
        var mediaUrls = [];
        var hasImg = 0, hasVid = 0;
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
        var md = hasImg && hasVid ? "img+vid" : hasImg ? "img" : hasVid ? "vid" : "";
        var vcount = tw.views && tw.views.count ? parseInt(tw.views.count, 10) || 0 : 0;
        tweets.set(
          url,
          withSource(
            {
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
            },
            "x"
          )
        );
        apiFresh++;
        apiCount++;
      } catch (e) {
      }
    }
    function harvest(obj) {
      try {
        var stack = [obj];
        while (stack.length) {
          var cur = stack.pop();
          if (!cur || typeof cur !== "object") {
            continue;
          }
          if (cur.promotedMetadata) {
            continue;
          }
          if (cur.rest_id && cur.legacy && typeof cur.legacy.full_text === "string") {
            tweetFromApi(cur);
            continue;
          }
          for (var k2 in cur) {
            var v2 = cur[k2];
            if (v2 && typeof v2 === "object") {
              stack.push(v2);
            }
          }
        }
        if (apiFresh) {
          updateProgress();
          updateFoot();
        }
      } catch (e) {
      }
    }
    var xhrProto = XMLHttpRequest.prototype;
    var origOpen = xhrProto.open, origSend = xhrProto.send, netHooked = 0;
    function unhookNet() {
      if (netHooked) {
        try {
          xhrProto.open = origOpen;
          xhrProto.send = origSend;
        } catch (e) {
        }
        netHooked = 0;
      }
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
      elDly.textContent = delay + "ms";
    };
    $("sl").onclick = function() {
      delay = Math.min(5e3, delay + 200);
      elDly.textContent = delay + "ms";
    };
    btnFlt.onclick = function() {
      filterMode = filterMode ? 0 : 1;
      btnFlt.textContent = filterBtnLabel();
      btnFlt.classList.toggle("on", !!filterMode);
      skippedSet.clear();
    };
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
      unhookNet();
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
    function harvestCtx() {
      return {
        has: function(u) {
          return tweets.has(u) || skippedSet.has(u);
        },
        skip: function(u) {
          skippedCount++;
          skippedSet.add(u);
        },
        excluded: fExcluded,
        add: function(item) {
          tweets.set(item.u, withSource(item, sourceId));
        }
      };
    }
    async function waitPaused() {
      while (paused && !stopFlag) {
        setStatus(GRAY, "\uC77C\uC2DC\uC815\uC9C0");
        await sleep(300);
        pausedMs += 300;
      }
    }
    async function collectReddit() {
      var loc = parseLocation(location.href);
      var after = null;
      var attempt429 = 0;
      var redditDelay = Math.max(delay, 6e3);
      while (!stopFlag && tweets.size < target) {
        await waitPaused();
        if (stopFlag) break;
        var url = listingUrl(loc, after);
        setStatus(BLUE, "Reddit JSON \uC218\uC9D1 \uC911");
        var res;
        try {
          res = await fetch(url, {
            credentials: "include",
            headers: { accept: "application/json" }
          });
        } catch (e) {
          setStatus(RED, "\uB124\uD2B8\uC6CC\uD06C \uC624\uB958");
          await sleep(redditDelay);
          continue;
        }
        if (res.status === 429) {
          var wait = backoffMs(attempt429, redditDelay);
          attempt429++;
          if (attempt429 > MAX_429) {
            setStatus(RED, "Reddit 429 \uD55C\uB3C4 \uCD08\uACFC");
            break;
          }
          setStatus("#ff7a00", "Reddit 429 \u2014 " + wait + "ms \uB300\uAE30");
          await sleep(wait);
          continue;
        }
        attempt429 = 0;
        if (!res.ok) {
          setStatus(RED, "Reddit HTTP " + res.status);
          break;
        }
        var json = await res.json();
        var children = childrenOf(json);
        var fresh2 = 0;
        for (var ri = 0; ri < children.length; ri++) {
          var item = mapChild(children[ri]);
          if (!item || !item.u) continue;
          if (tweets.has(item.u) || skippedSet.has(item.u)) continue;
          if (fExcluded(item.t)) {
            skippedCount++;
            skippedSet.add(item.u);
            fresh2++;
            continue;
          }
          tweets.set(item.u, item);
          fresh2++;
        }
        after = afterOf(json);
        updateProgress();
        updateFoot();
        if (tweets.size - lastSaved >= 50) {
          saveCheckpoint();
          lastSaved = tweets.size;
        }
        if (tweets.size >= target) break;
        if (!after || children.length === 0) {
          setStatus("#00ba7c", "\uD53C\uB4DC \uB05D");
          break;
        }
        if (fresh2 === 0) {
          stall++;
          if (stall >= 4) break;
        } else {
          stall = 0;
        }
        await sleep(redditDelay + 200 * Math.random());
      }
    }
    async function collectDomFeed(adapter) {
      var ctx = harvestCtx();
      for (var iter2 = 0; iter2 < 3e3 && !stopFlag; iter2++) {
        await waitPaused();
        if (stopFlag) break;
        var harvested = adapter.harvestDocument(doc, ctx);
        var fresh2 = harvested.fresh || 0;
        artSeen = harvested.artSeen || 0;
        parsedOk = harvested.parsedOk || 0;
        if (artSeen >= 3 && parsedOk === 0) {
          zeroStreak++;
          if (zeroStreak >= 3 && !selWarned) {
            selWarned = 1;
            setStatus(RED, "\uC120\uD0DD\uC790 \uD655\uC778 \uD544\uC694 (" + sourceLabel(sourceId) + " DOM \uBCC0\uACBD?)");
          }
        } else if (parsedOk > 0) {
          zeroStreak = 0;
        }
        updateProgress();
        updateFoot();
        if (tweets.size >= target) break;
        if (fresh2 > 0) {
          stall = 0;
          cooldowns = 0;
          setStatus(BLUE, "\uC218\uC9D1 \uC911");
          if (tweets.size - lastSaved >= 50) {
            saveCheckpoint();
            lastSaved = tweets.size;
          }
          goDown();
          await sleep(delay + 200 * Math.random());
        } else {
          stall++;
          setStatus(GRAY, "\uC815\uCCB4 " + stall + "/16");
          goDown();
          await sleep(delay + Math.min(300 * stall, 2e3));
          if (stall >= 16) {
            cooldowns++;
            if (cooldowns >= 3) break;
            setStatus("#ff7a00", "\uB85C\uB529 \uB300\uAE30 \u2014 \uCFE8\uB2E4\uC6B4 " + cooldowns + "/3 (30\uCD08)");
            await sleep(3e4);
            stall = 0;
          }
        }
      }
    }
    if (sourceId === "x") {
      try {
        var GQL = /[/]graphql[/].*(Home|Search|List|UserTweets|Bookmarks|Community|TweetDetail)/i;
        xhrProto.open = function(m, u) {
          try {
            this.__twcU = u;
          } catch (e) {
          }
          return origOpen.apply(this, arguments);
        };
        xhrProto.send = function() {
          try {
            var self = this;
            if (self.__twcU && GQL.test(self.__twcU)) {
              loadingReq++;
              self.addEventListener("loadend", function() {
                if (loadingReq > 0) {
                  loadingReq--;
                }
              });
              self.addEventListener("load", function() {
                try {
                  var t = self.responseText;
                  if (t && t.charAt(0) === "{") {
                    harvest(JSON.parse(t));
                  }
                } catch (e) {
                }
              });
            }
          } catch (e) {
          }
          return origSend.apply(this, arguments);
        };
        netHooked = 1;
      } catch (e) {
      }
    }
    setStatus(BLUE, "\uC218\uC9D1 \uC911");
    try {
      if (sourceId === "reddit") {
        await collectReddit();
      } else if (sourceId === "threads") {
        await collectDomFeed(threads_exports);
      } else if (sourceId === "linkedin") {
        await collectDomFeed(linkedin_exports);
      } else
        for (var iter = 0; iter < 3e3 && !stopFlag; iter++) {
          if (paused) {
            setStatus(GRAY, "\uC77C\uC2DC\uC815\uC9C0");
            await sleep(300);
            pausedMs += 300;
            iter--;
            continue;
          }
          await clickShowMore();
          var fresh = parseTweets() + apiFresh;
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
            var state = feedState();
            if (state === "error") {
              setStatus("#ff7a00", "\uC18C\uD504\uD2B8\uBE14\uB85D \u2014 \uC7AC\uC2DC\uB3C4 \uB300\uAE30");
              var rb = findRetry();
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
              setStatus("#ffd400", "\uC0C8 \uD2B8\uC717 \uBD88\uB7EC\uC624\uB294 \uC911");
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
      unhookNet();
      saveCheckpoint();
      clearInterval(timer);
      setStatus(RED, "\uC624\uB958: " + err.message);
      alert(
        "\uC5D0\uB7EC \uBC1C\uC0DD: " + err.message + "\n" + tweets.size + "\uAC1C \uC800\uC7A5\uB428. \uBD81\uB9C8\uD06C\uB97C \uB2E4\uC2DC \uD074\uB9AD\uD558\uBA74 \uC774\uC5B4\uD558\uAE30 \uAC00\uB2A5"
      );
      return;
    }
    unhookNet();
    if (sourceId === "x") {
      await clickShowMore();
      parseTweets();
    }
    saveCheckpoint();
    clearInterval(timer);
    updateProgress();
    var results = Array.from(tweets.values()).slice(0, target);
    if (!results.length) {
      cleanup();
      alert("\uC218\uC9D1\uB41C \uD2B8\uC717 \uC5C6\uC74C");
      return;
    }
    var dNow = /* @__PURE__ */ new Date();
    var dateStr = new Date(dNow.getTime() - dNow.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
    $("ico").textContent = "\u2705";
    $("ttl").textContent = "\uC218\uC9D1 \uC644\uB8CC";
    $("cls").classList.remove("hide");
    var briefBtnLabel = topicName + " \uBE0C\uB9AC\uD551\uC73C\uB85C \uBCF4\uB0B4\uAE30";
    $("bd").innerHTML = '<div class="num"><b>' + results.length.toLocaleString() + "</b><s>\uAC1C \uC218\uC9D1" + (skippedCount ? " \xB7 " + skippedCount + "\uAC74 \uC81C\uC678" : "") + '</s></div><div class="row"><button class="btn" id="dc">CSV</button><button class="btn" id="dj">JSON</button><button class="btn" id="db">' + briefBtnLabel + "</button></div>";
    function download(content, mime, fname) {
      if (EXT) {
        window.postMessage({ __twc: "download", content, mime, fname }, "*");
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
      download(csvBody(results), "text/csv;charset=utf-8", "tw_" + dateStr + ".csv");
    };
    function jsonData2() {
      return jsonData(results);
    }
    $("dj").onclick = function() {
      download(
        JSON.stringify(jsonData2(), null, 2),
        "application/json;charset=utf-8",
        "tw_" + dateStr + ".json"
      );
    };
    var BRIEF_FAIL_MSG = EXT ? "\uBE0C\uB9AC\uD551 \uBE4C\uB354\uC5D0 \uC5F0\uACB0\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.\n\uD655\uC7A5 \uC124\uC815\uC5D0\uC11C \uBE4C\uB354 \uC8FC\uC18C\uC640 \uC778\uC99D \uC815\uBCF4\uB97C \uD655\uC778\uD558\uC138\uC694." : "\uBE0C\uB9AC\uD551 \uBE4C\uB354 \uC11C\uBC84(127.0.0.1:8787)\uC5D0 \uC5F0\uACB0\uD558\uC9C0 \uBABB\uD588\uC2B5\uB2C8\uB2E4.\n\uD504\uB85C\uC81D\uD2B8 \uD3F4\uB354\uC5D0\uC11C npm run news \uB97C \uC2E4\uD589\uD55C \uB4A4 \uB2E4\uC2DC \uC2DC\uB3C4\uD558\uC138\uC694.";
    function sendBrief() {
      var fname = "tw_" + dateStr + ".json";
      var btn = $("db");
      if (EXT) {
        let finish = function(ok, error) {
          if (settled) {
            return;
          }
          settled = 1;
          clearTimeout(timer2);
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
          b.textContent = briefBtnLabel;
          b.disabled = false;
          alert(BRIEF_FAIL_MSG + (error ? "\n\n(" + error + ")" : ""));
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
        var timer2 = setTimeout(function() {
          finish(0, "\uC751\uB2F5 \uC2DC\uAC04 \uCD08\uACFC");
        }, 15e3);
        window.addEventListener("message", onResult);
        window.postMessage(
          { __twc: "brief", content: JSON.stringify(jsonData2()), fname, topic: topicKey },
          "*"
        );
        return;
      }
      var base = "http://127.0.0.1:8787";
      fetch(base + "/api/import", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ fileName: fname, tweets: jsonData2(), topic: topicKey })
      }).then(function(r) {
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
      }).catch(function() {
        alert(BRIEF_FAIL_MSG);
      });
    }
    $("db").onclick = sendBrief;
    if (EXT && EXT.briefAuto) {
      sendBrief();
    }
  })();
})();
