// Xsearch — 북마클릿 본체 소스
// x.com 페이지에서 실행되어 자동 스크롤하며 트윗을 수집하고 CSV/JSON으로 저장한다.
// 빌드(`npm run build`) 시 공백 압축 + javascript: 접두사가 붙어 설치 페이지에 삽입된다.
// __TWC_VERSION__ 플레이스홀더는 빌드 시 package.json의 version으로 치환된다.
void (async function twcMain() {
  var KEY = "_twc";
  // 확장 프로그램 모드: background가 주입한 설정. 없으면 북마클릿 모드(기존 동작).
  var EXT = window.__twcConfig || null;
  var doc = document;
  var store = null;
  try {
    store = window.localStorage;
  } catch (e) {}
  if (window.__twc44Cleanup) {
    if (!confirm("수집기가 이미 실행 중입니다. 재시작할까요?")) {
      return;
    }
    try {
      window.__twc44Cleanup();
    } catch (e) {}
  }
  var saved = null;
  try {
    var rawSaved = store ? store.getItem(KEY) : null;
    if (rawSaved) {
      saved = JSON.parse(rawSaved);
    }
  } catch (e) {}
  var resume = 0;
  if (saved && saved.length > 0) {
    resume = confirm("이전 수집 데이터 " + saved.length + "개 있음. 이어하기?")
      ? 1
      : 0;
  }
  var target = EXT
    ? Math.max(1, parseInt(EXT.target, 10) || 200)
    : parseInt(
        prompt(
          "수집할 트윗 갯수:",
          resume && saved ? String(Math.max(200, saved.length + 200)) : "200",
        ),
        10,
      );
  if (!target) {
    return;
  }
  var tweets = new Map();
  if (resume && saved) {
    saved.forEach(function (it) {
      tweets.set(it.u, it);
    });
  }
  var skippedSet = new Set();
  var stopFlag = 0,
    paused = 0,
    delay = EXT && EXT.delay ? Math.min(5000, Math.max(200, +EXT.delay)) : 2000,
    t0 = Date.now(),
    pausedMs = 0;
  var filterMode = EXT && EXT.filterMode ? 1 : 0;
  var skippedCount = 0,
    lastSaved = tweets.size,
    fixMulti = 0,
    fixClamp = 0;
  var zeroStreak = 0,
    selWarned = 0,
    artSeen = 0,
    parsedOk = 0,
    stall = 0,
    cooldowns = 0;
  var saveDisabled = 0,
    quotaWarned = 0;
  var apiFresh = 0,
    apiCount = 0,
    incStep = 2000;
  var loadingReq = 0,
    loadWait = 0;
  // 확장 모드에서는 옵션 페이지에서 저장한 정규식 소스로 덮어쓴다.
  function extRe(src, fallback) {
    if (EXT && src) {
      try {
        return new RegExp(src, "i");
      } catch (e) {}
    }
    return fallback;
  }
  var RE_KEEP = extRe(
    EXT && EXT.reKeep,
    /\bai\b|인공지능|생성형|거대언어|언어모델|확산모델|초거대|딥러닝|머신러닝|강화학습|파인튜닝|임베딩|멀티모달|신경망|추론모델|프롬프트|claude|gpt|openai|anthropic|gemini|grok|\bllm\b|copilot|cursor|midjourney|perplexity|hugging.?face|transformer|langchain|llamaindex|crew.?ai|autogen|\bllama\b|mistral|qwen|deepseek|\bsora\b|runway|\bsuno\b|\bpika\b|\bdevin\b|windsurf|ollama|\bvllm\b|stable.?diffusion|fine.?tun|\brag\b|neural|deep.?learn|machine.?learn|robot|automat|vibe.?cod|\bmcp\b|semiconductor|quantum|github|docker|kubernetes|\bpython\b|\brust\b|kotlin|nextjs|supabase|vercel|n8n|zapier/i,
  );
  var RE_WEAK = extRe(
    EXT && EXT.reWeak,
    /\bmeta\b|\bchip\b|\bmodel\b|모델|\btoken\b|토큰|\bagent\b|에이전트|apple|google|microsoft|nvidia|tesla|\bapi\b|cloud|server|database|startup|스타트업|saas|crypto|blockchain|web3|\bgpu\b|\bcpu\b|cod(?:ing|e\b|ex)|pipeline|embed|vector|swift|\breact\b|typescript/i,
  );
  var RE_DROP = extRe(
    EXT && EXT.reDrop,
    /k.?pop|아이돌|컴백|팬사인|치킨|피자|배달|쿠폰|할인|이벤트|경품|추첨|야구|축구|농구|올림픽|월드컵|선거|대통령|국회|정당|탄핵|드라마|예능|웹툰|화장품|뷰티|패션|다이어트|iran|israel|gaza|ukraine|russia|missile|ceasefire|bomb(?:ing)?|troops|military|\bwar\b|mueller|impeach|\bmaga\b|democrat|republican|\bsenate\b|\bcongress\b|xbox|playstation|nintendo|esport|valorant|minecraft|league.of.legends|evangelion|anime(?!\.js)|manga|cosplay|cortisol|\bworkout\b|anxiety|meditation|lemonade|dividend|hedge.fund/i,
  );
  function fExcluded(t) {
    if (!filterMode) {
      return false;
    }
    return !(t && (RE_KEEP.test(t) || (RE_WEAK.test(t) && !RE_DROP.test(t))));
  }
  var BLUE = "#1d9bf0",
    GRAY = "#8b98a5",
    RED = "#f4212e";
  var isDark = (function () {
    try {
      var bg = (getComputedStyle(doc.body).backgroundColor || "").match(/\d+/g);
      if (bg && bg.length >= 3) {
        return 0.299 * +bg[0] + 0.587 * +bg[1] + 0.114 * +bg[2] < 128;
      }
    } catch (e) {}
    return !!(
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    );
  })();
  var CSS =
    "<style>:host{" +
    (isDark
      ? "--bg:#15202b;--fg:#e7e9ea;--sub:#8b98a5;--line:#38444d;--chip:#1e2732"
      : "--bg:#ffffff;--fg:#0f1419;--sub:#536471;--line:#eff3f4;--chip:#f7f9fa") +
    ";--ac:#1d9bf0}*{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif}.p{width:268px;background:var(--bg);color:var(--fg);border:1px solid var(--line);border-radius:14px;box-shadow:0 8px 28px rgba(0,0,0,.28);overflow:hidden;font-size:13px;line-height:1.45}.hd{display:flex;align-items:center;gap:6px;padding:9px 8px 9px 12px;cursor:move;border-bottom:1px solid var(--line);user-select:none}.ttl{font-weight:700;font-size:12.5px;flex:1}.ver{font-size:10px;color:var(--sub);background:var(--chip);padding:1px 6px;border-radius:20px}.ic{width:22px;height:22px;border:0;background:transparent;color:var(--sub);border-radius:6px;cursor:pointer;font-size:12px;line-height:1;display:flex;align-items:center;justify-content:center}.ic:hover{background:var(--chip);color:var(--fg)}.bd{padding:12px}.num{display:flex;align-items:baseline;gap:5px;margin-bottom:8px}.num b{font-size:26px;font-weight:800;letter-spacing:-.5px;font-variant-numeric:tabular-nums}.num s{text-decoration:none;color:var(--sub);font-size:12.5px}.bar{height:5px;background:var(--chip);border-radius:20px;overflow:hidden;margin-bottom:9px}.bar i{display:block;height:5px;width:0px;background:var(--ac);border-radius:20px;transition:width .3s}.met{display:flex;gap:10px;font-size:11px;color:var(--sub);font-variant-numeric:tabular-nums;margin-bottom:10px;min-height:16px}.met span{white-space:nowrap}.st{display:flex;align-items:center;gap:7px;font-size:11.5px;padding:6px 9px;border-radius:8px;background:var(--chip);margin-bottom:11px}.dot{width:7px;height:7px;border-radius:20px;background:var(--ac);flex:none}.row{display:flex;gap:6px;margin-bottom:6px}.btn{flex:1;border:1px solid var(--line);background:var(--chip);color:var(--fg);border-radius:8px;padding:7px 4px;font-size:11.5px;font-weight:600;cursor:pointer;white-space:nowrap}.btn:hover{border-color:var(--ac)}.btn.on{background:var(--ac);border-color:var(--ac);color:#fff}.btn.dg{color:#f4212e}.spd{display:flex;align-items:center;gap:6px;margin-bottom:6px}.lab{font-size:11px;color:var(--sub);flex:none}.val{flex:1;text-align:center;font-size:11.5px;font-variant-numeric:tabular-nums;color:var(--sub)}.stp{flex:none;min-width:50px}.foot{font-size:10.5px;color:var(--sub);padding-top:8px;margin-top:2px;border-top:1px solid var(--line);display:flex;gap:10px;flex-wrap:wrap}.fr{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;font-size:11.5px;color:var(--sub)}.fr b{color:var(--fg);font-variant-numeric:tabular-nums}input[type=number]{width:72px;background:var(--chip);border:1px solid var(--line);color:var(--fg);border-radius:6px;padding:4px 6px;font-size:11.5px}select{background:var(--chip);border:1px solid var(--line);color:var(--fg);border-radius:6px;padding:4px 6px;font-size:11.5px}input[type=checkbox]{accent-color:var(--ac)}.ck{display:flex;align-items:center;gap:6px;cursor:pointer}.hide{display:none}</style>";
  var host = doc.createElement("div");
  host.style.cssText =
    "all:initial;position:fixed;top:12px;right:12px;z-index:2147483647";
  var root = host.attachShadow({ mode: "open" });
  root.innerHTML =
    CSS +
    '<div class="p"><div class="hd" id="hd"><span id="ico"><img src="__TWC_LOGO32__" alt="" style="width:15px;height:15px;vertical-align:-2px"></span><span class="ttl" id="ttl">Xsearch</span><span class="ver">v__TWC_VERSION__</span><button class="ic" id="min" title="접기">─</button><button class="ic hide" id="cls" title="닫기">✕</button></div><div class="bd" id="bd"><div class="num"><b id="cnt">0</b><s id="tgt"></s></div><div class="bar"><i id="bar"></i></div><div class="met"><span id="tm">0:00</span><span id="eta"></span><span id="rate"></span></div><div class="st"><span class="dot" id="dot"></span><span id="msg">시작하는 중</span></div><div class="row"><button class="btn" id="pz" title="수집을 잠시 멈췄다가 다시 시작">일시정지</button><button class="btn dg" id="sp" title="지금까지 수집한 것을 저장하고 종료">중단·저장</button></div><div class="spd"><span class="lab">속도</span><button class="btn stp" id="fa" title="이동 사이 대기를 줄여 빠르게 (과하면 관련성↓·차단 위험)">빠르게</button><span class="val" id="dly"></span><button class="btn stp" id="sl" title="이동 사이 대기를 늘려 천천히 (관련성↑)">느리게</button></div><div class="row"><button class="btn" id="flt" title="수집 대상: 전체 ↔ AI만">필터 OFF</button></div><div class="foot hide" id="foot"><span id="apc"></span><span id="skp"></span><span id="fix"></span><span id="qw"></span></div></div></div>';
  doc.body.appendChild(host);
  function $(id) {
    return root.getElementById(id);
  }
  var elCnt = $("cnt"),
    elTgt = $("tgt"),
    elBar = $("bar"),
    elTm = $("tm"),
    elEta = $("eta"),
    elRate = $("rate");
  var elDot = $("dot"),
    elMsg = $("msg"),
    elDly = $("dly"),
    elFoot = $("foot"),
    elSkp = $("skp"),
    elFix = $("fix"),
    elQw = $("qw"),
    elApc = $("apc");
  var btnFlt = $("flt");
  if (filterMode) {
    btnFlt.textContent = "AI만";
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
    return (Date.now() - t0 - pausedMs) / 1000;
  }
  function updateProgress() {
    elCnt.textContent = tweets.size.toLocaleString();
    elBar.style.width =
      Math.max(0, Math.min(242, Math.round((242 * tweets.size) / target))) +
      "px";
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
    elSkp.textContent = skippedCount ? "건너뜀 " + skippedCount : "";
    elFix.textContent =
      fixMulti + fixClamp ? "보정 " + (fixMulti + fixClamp) : "";
    elQw.textContent = quotaWarned ? "저장공간 초과" : "";
    any = apiCount || skippedCount || fixMulti + fixClamp || quotaWarned;
    if (any) {
      elFoot.classList.remove("hide");
    }
  }
  function sleep(ms) {
    return new Promise(function (rs) {
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
    return se
      ? Math.max(0, se.scrollHeight - (window.scrollY + window.innerHeight))
      : 0;
  }
  function saveCheckpoint() {
    if (saveDisabled || !store) {
      return;
    }
    var arr = Array.from(tweets.values());
    try {
      store.setItem(KEY, JSON.stringify(arr));
      return;
    } catch (e) {}
    try {
      var lite = arr.map(function (it) {
        var cp = Object.assign({}, it);
        cp.mu = "";
        cp.ap = "";
        return cp;
      });
      store.setItem(KEY, JSON.stringify(lite));
      return;
    } catch (e) {}
    saveDisabled = 1;
    quotaWarned = 1;
    updateFoot();
  }
  function snowflakeDate(url) {
    try {
      var mm = url.match(/status\/(\d+)/);
      return mm
        ? new Date(Number(BigInt(mm[1]) >> 22n) + 1288834974657).toISOString()
        : "";
    } catch (e) {
      return "";
    }
  }
  function parseNum(s) {
    if (!s) {
      return 0;
    }
    var mm = String(s)
      .trim()
      .replace(/,/g, "")
      .match(/^([\d.]+)\s*([KkMm천만]?)$/);
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
    btn.querySelectorAll("span").forEach(function (sp) {
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
      if (
        tx.length < 30 &&
        /다시 시도|재시도|Retry|Try again|새로고침|Reload/i.test(tx)
      ) {
        return btns[i];
      }
    }
    return null;
  }
  function feedState() {
    var col = doc.querySelector('[data-testid="primaryColumn"]') || doc;
    var cells = col.querySelectorAll('[data-testid="cellInnerDiv"]');
    var last = cells[cells.length - 1];
    var tx = (last && !last.querySelector("article") && last.innerText) || "";
    if (
      /문제가 발생했|다시 시도|Something went wrong|Try again|Retry/i.test(tx)
    ) {
      return "error";
    }
    if (
      /더 이상|모두 확인했|다 보셨|끝까지|You.?re all caught up|caught up|No more/i.test(
        tx,
      )
    ) {
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
    var cands = [].slice
      .call(
        doc.querySelectorAll(
          'article[data-testid="tweet"] button, article[data-testid="tweet"] div[role="button"], article[data-testid="tweet"] span',
        ),
      )
      .filter(function (el) {
        var tx = (el.innerText || "").trim();
        return (
          tx === "Show more" ||
          tx === "더 보기" ||
          tx === "Show" ||
          tx === "더보기"
        );
      });
    var done = 0;
    for (var i = 0; i < cands.length; i++) {
      try {
        cands[i].click();
        done++;
        await sleep(80);
      } catch (e) {}
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
    var fresh = 0;
    arts.forEach(function (art) {
      try {
        var url = "";
        var stLinks = art.querySelectorAll('a[href*="/status/"]');
        for (var i = 0; i < stLinks.length; i++) {
          var mu = stLinks[i].href.match(
            /^https?:\/\/[^\/]+\/[^\/]+\/status\/\d+/,
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
        var userEl =
          art.querySelector('[data-testid="User-Name"]') ||
          art.querySelector('[data-testid="User-Names"]');
        var nameSpan = userEl ? userEl.querySelector("span") : null;
        var userLink =
          art.querySelector('[data-testid="User-Name"] a') ||
          art.querySelector('a[role="link"][href^="/"]');
        var textEls = art.querySelectorAll('[data-testid="tweetText"]');
        var textEl = textEls[0] || null;
        var timeEl = art.querySelector("time");
        var text = textEl ? textEl.textContent.trim() : "";
        var coverImgs = art.querySelectorAll(
          '[data-testid="article-cover-image"] img',
        );
        var isArticle = coverImgs.length > 0;
        var artTitle = "",
          artPrev = "";
        if (isArticle) {
          var cover = art.querySelector('[data-testid="article-cover-image"]');
          var box =
            cover.closest('div[role="link"]') ||
            (cover.parentElement ? cover.parentElement.parentElement : null);
          var lines = (box ? box.innerText : "")
            .split("\n")
            .map(function (s) {
              return s.trim();
            })
            .filter(Boolean);
          var ai = lines.findIndex(function (s) {
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
          var artBlock =
            (artTitle ? "[기사] " + artTitle : "") +
            (artPrev ? "\n" + artPrev : "");
          text = text ? text + (artBlock ? "\n\n" + artBlock : "") : artBlock;
        }
        var quoted = null;
        if (textEls.length >= 2) {
          var qEl = textEls[1];
          var qBox = qEl.closest('div[role="link"]') || qEl.parentElement;
          var qUser = qBox
            ? qBox.querySelector('[data-testid="User-Name"]')
            : null;
          var qTime = qBox ? qBox.querySelector("time") : null;
          var qUrl = "";
          var qLinks = qBox ? qBox.querySelectorAll('a[href*="/status/"]') : [];
          for (var j = 0; j < qLinks.length; j++) {
            var mq = qLinks[j].href.match(
              /^https?:\/\/[^\/]+\/[^\/]+\/status\/\d+/,
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
            url: qUrl,
          };
          text = text + "\n\n[인용] " + quoted.user + ": " + quoted.text;
        }
        if (fExcluded(text)) {
          skippedCount++;
          skippedSet.add(url);
          fresh++;
          return;
        }
        var replyBtn = art.querySelector('[data-testid="reply"]');
        var rtBtn = art.querySelector('[data-testid="retweet"]');
        var likeBtn = art.querySelector('[data-testid="like"]');
        var photos = art.querySelectorAll('[data-testid="tweetPhoto"] img');
        var vids = art.querySelectorAll("video");
        var hasImg = photos.length > 0,
          hasVid = vids.length > 0;
        var mediaType = isArticle
          ? "article"
          : hasImg && hasVid
            ? "img+vid"
            : hasImg
              ? "img"
              : hasVid
                ? "vid"
                : "";
        var mediaUrls = [];
        photos.forEach(function (im) {
          if (im.src) {
            mediaUrls.push(
              im.src
                .replace(/&name=\w+$/, "&name=orig")
                .replace(/\?name=\w+$/, "?name=orig"),
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
        var grp = art.querySelector('[role="group"]');
        var aria = grp ? grp.getAttribute("aria-label") : "";
        var M0 = { r: 0, w: 0, l: 0, b: 0, v: 0 };
        if (aria) {
          [
            ["r", /([\d,.]+\s*[KkMm천만]?)\s*(?:repl|댓글|답글)/i],
            [
              "w",
              /([\d,.]+\s*[KkMm천만]?)\s*(?:repost|retweet|재게시|리트윗|리포스트)/i,
            ],
            ["l", /([\d,.]+\s*[KkMm천만]?)\s*(?:like|마음에 들|좋아요)/i],
            ["b", /([\d,.]+\s*[KkMm천만]?)\s*(?:bookmark|북마크)/i],
            ["v", /([\d,.]+\s*[KkMm천만]?)\s*(?:view|조회)/i],
          ].forEach(function (pair) {
            var mm = aria.match(pair[1]);
            if (mm) {
              M0[pair[0]] = parseNum(mm[1].replace(/\s+/g, ""));
            }
          });
        }
        var hasR = aria && /(repl|댓글|답글)/i.test(aria);
        var hasW =
          aria && /(repost|retweet|재게시|리트윗|리포스트)/i.test(aria);
        var hasL = aria && /(like|마음에 들|좋아요)/i.test(aria);
        var replies = hasR ? M0.r : readMetric(replyBtn);
        var retweets = hasW ? M0.w : readMetric(rtBtn);
        var likes = hasL ? M0.l : readMetric(likeBtn);
        var bookmarks = M0.b,
          views = M0.v;
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
        var lang = (textEl && textEl.getAttribute("lang")) || "";
        var verified = !!art.querySelector('svg[data-testid="icon-verified"]');
        var relTime = timeEl ? timeEl.textContent.trim() : "";
        var hashtags = [],
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
              } catch (e) {
                return false;
              }
            })
            .map(function (a) {
              return a.textContent.trim();
            });
          extLinks = [].slice
            .call(textEl.querySelectorAll('a[role="link"]'))
            .filter(function (a) {
              var hf = a.href;
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
        tweets.set(url, {
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
        });
        fresh++;
      } catch (e) {}
    });
    updateFoot();
    if (artSeen >= 3 && parsedOk === 0) {
      zeroStreak++;
      if (zeroStreak >= 3 && !selWarned) {
        selWarned = 1;
        setStatus(RED, "선택자 확인 필요 (X DOM 변경?)");
      }
    } else if (parsedOk > 0) {
      zeroStreak = 0;
    }
    return fresh;
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
      var ul = (ur && ur.legacy) || {};
      var uc = (ur && ur.core) || {};
      var screen = ul.screen_name || uc.screen_name || "";
      var uname = ul.name || uc.name || "";
      var url = "https://x.com/" + (screen || "i") + "/status/" + tw.rest_id;
      if (tweets.has(url) || skippedSet.has(url)) {
        return;
      }
      var text = lg2.full_text;
      var nt =
        tw.note_tweet &&
        tw.note_tweet.note_tweet_results &&
        tw.note_tweet.note_tweet_results.result;
      if (nt && nt.text) {
        text = nt.text;
      }
      var quoted = null;
      var qr = tw.quoted_status_result && tw.quoted_status_result.result;
      if (qr) {
        qr = qr.tweet || qr;
        var qlg = qr.legacy;
        var qur =
          qr.core && qr.core.user_results && qr.core.user_results.result;
        var qul = (qur && qur.legacy) || {};
        var quc = (qur && qur.core) || {};
        if (qlg) {
          var qScreen = qul.screen_name || quc.screen_name || "";
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
      if (fExcluded(text)) {
        skippedCount++;
        skippedSet.add(url);
        apiFresh++;
        return;
      }
      var ents = lg2.entities || {};
      var media =
        (lg2.extended_entities && lg2.extended_entities.media) ||
        ents.media ||
        [];
      var mediaUrls = [];
      var hasImg = 0,
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
      var md =
        hasImg && hasVid ? "img+vid" : hasImg ? "img" : hasVid ? "vid" : "";
      var vcount =
        tw.views && tw.views.count ? parseInt(tw.views.count, 10) || 0 : 0;
      tweets.set(url, {
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
      });
      apiFresh++;
      apiCount++;
    } catch (e) {}
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
        if (
          cur.rest_id &&
          cur.legacy &&
          typeof cur.legacy.full_text === "string"
        ) {
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
    } catch (e) {}
  }
  var xhrProto = XMLHttpRequest.prototype;
  var origOpen = xhrProto.open,
    origSend = xhrProto.send,
    netHooked = 0;
  function unhookNet() {
    if (netHooked) {
      try {
        xhrProto.open = origOpen;
        xhrProto.send = origSend;
      } catch (e) {}
      netHooked = 0;
    }
  }
  function csvEsc(s) {
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
  $("min").onclick = function () {
    var bd = $("bd");
    bd.classList.toggle("hide");
    this.textContent = bd.classList.contains("hide") ? "▢" : "─";
  };
  $("pz").onclick = function () {
    paused = !paused;
    this.textContent = paused ? "재개" : "일시정지";
    this.classList.toggle("on", !!paused);
  };
  $("sp").onclick = function () {
    stopFlag = 1;
  };
  $("fa").onclick = function () {
    delay = Math.max(200, delay - 200);
    elDly.textContent = delay + "ms";
  };
  $("sl").onclick = function () {
    delay = Math.min(5000, delay + 200);
    elDly.textContent = delay + "ms";
  };
  btnFlt.onclick = function () {
    filterMode = filterMode ? 0 : 1;
    btnFlt.textContent = filterMode ? "AI만" : "필터 OFF";
    btnFlt.classList.toggle("on", !!filterMode);
    skippedSet.clear();
  };
  var dragX = 0,
    dragY = 0,
    dragging = 0;
  $("hd").addEventListener("mousedown", function (ev) {
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
  var timer = setInterval(function () {
    elTm.textContent = fmtTime(elapsedSec());
  }, 1000);
  function cleanup() {
    unhookNet();
    try {
      clearInterval(timer);
    } catch (e) {}
    doc.removeEventListener("mousemove", onMove);
    doc.removeEventListener("mouseup", onUp);
    try {
      host.remove();
    } catch (e) {}
    window.__twc44Cleanup = null;
  }
  window.__twc44Cleanup = cleanup;
  $("cls").onclick = function () {
    cleanup();
  };
  try {
    var GQL =
      /[/]graphql[/].*(Home|Search|List|UserTweets|Bookmarks|Community|TweetDetail)/i;
    xhrProto.open = function (m, u) {
      try {
        this.__twcU = u;
      } catch (e) {}
      return origOpen.apply(this, arguments);
    };
    xhrProto.send = function () {
      try {
        var self = this;
        if (self.__twcU && GQL.test(self.__twcU)) {
          loadingReq++;
          self.addEventListener("loadend", function () {
            if (loadingReq > 0) {
              loadingReq--;
            }
          });
          self.addEventListener("load", function () {
            try {
              var t = self.responseText;
              if (t && t.charAt(0) === "{") {
                harvest(JSON.parse(t));
              }
            } catch (e) {}
          });
        }
      } catch (e) {}
      return origSend.apply(this, arguments);
    };
    netHooked = 1;
  } catch (e) {}
  setStatus(BLUE, "수집 중");
  try {
    for (var iter = 0; iter < 3000 && !stopFlag; iter++) {
      if (paused) {
        setStatus(GRAY, "일시정지");
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
        setStatus(BLUE, "수집 중");
        if (tweets.size - lastSaved >= 50) {
          saveCheckpoint();
          lastSaved = tweets.size;
        }
        goDown();
        await sleep(delay + 200 * Math.random());
      } else {
        var state = feedState();
        if (state === "error") {
          setStatus("#ff7a00", "소프트블록 — 재시도 대기");
          var rb = findRetry();
          if (rb) {
            try {
              rb.click();
            } catch (e) {}
          }
          stall = 0;
          await sleep(4000 + 3000 * Math.random());
        } else if (state === "end") {
          setStatus("#00ba7c", "피드 끝");
          break;
        } else if (loadingReq > 0 || state === "loading") {
          setStatus("#ffd400", "새 트윗 불러오는 중");
          goDown();
          loadWait++;
          if (loadWait > 12) {
            loadingReq = 0;
            loadWait = 0;
          }
          await sleep(delay + 400);
        } else if (distToBottom() > 2 * window.innerHeight) {
          setStatus(BLUE, "바닥 따라잡는 중");
          stall = 0;
          for (var cu = 0; cu < 4; cu++) {
            scrollByAmt(incStep);
            await sleep(120);
          }
          await sleep(Math.max(300, delay - 400));
        } else {
          stall++;
          setStatus(GRAY, "정체 " + stall + "/16");
          goDown();
          if (stall >= 4) {
            scrollByAmt(-500);
            await sleep(150);
            goDown();
          }
          await sleep(delay + Math.min(300 * stall, 2000));
          if (stall >= 16) {
            cooldowns++;
            if (cooldowns >= 3) {
              break;
            }
            setStatus(
              "#ff7a00",
              "로딩 대기 — 쿨다운 " + cooldowns + "/3 (30초)",
            );
            await sleep(30000);
            stall = 0;
          }
        }
      }
    }
  } catch (err) {
    unhookNet();
    saveCheckpoint();
    clearInterval(timer);
    setStatus(RED, "오류: " + err.message);
    alert(
      "에러 발생: " +
        err.message +
        "\n" +
        tweets.size +
        "개 저장됨. 북마크를 다시 클릭하면 이어하기 가능",
    );
    return;
  }
  unhookNet();
  await clickShowMore();
  parseTweets();
  saveCheckpoint();
  clearInterval(timer);
  updateProgress();
  var results = Array.from(tweets.values()).slice(0, target);
  if (!results.length) {
    cleanup();
    alert("수집된 트윗 없음");
    return;
  }
  var dNow = new Date();
  var dateStr = new Date(dNow.getTime() - dNow.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
  $("ico").textContent = "✅";
  $("ttl").textContent = "수집 완료";
  $("cls").classList.remove("hide");
  $("bd").innerHTML =
    '<div class="num"><b>' +
    results.length.toLocaleString() +
    "</b><s>개 수집" +
    (skippedCount ? " · " + skippedCount + "건 제외" : "") +
    '</s></div><div class="row"><button class="btn" id="dc">CSV</button><button class="btn" id="dj">JSON</button><button class="btn" id="db">AI 브리핑으로 보내기</button></div>';
  function download(content, mime, fname) {
    if (EXT) {
      // 확장 모드: bridge.js(content script)가 받아 chrome.downloads로 저장
      window.postMessage({ __twc: "download", content: content, mime: mime, fname: fname }, "*");
    } else {
      var a = doc.createElement("a");
      var burl = URL.createObjectURL(new Blob([content], { type: mime }));
      a.href = burl;
      a.download = fname;
      a.click();
      setTimeout(function () {
        URL.revokeObjectURL(burl);
      }, 1000);
    }
    try {
      if (store) {
        store.removeItem(KEY);
      }
    } catch (e) {}
  }
  $("dc").onclick = function () {
    var head =
      "\uFEFF번호,이름,핸들,인증,텍스트,언어,시간,상대시간,URL,댓글,RT,좋아요,북마크,조회,해시태그,멘션,인라인링크,인용작성자,인용내용,인용URL,미디어,미디어URL,기사제목,기사미리보기\n";
    var body = results
      .map(function (it, i) {
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
        ].join(",");
      })
      .join("\n");
    download(head + body, "text/csv;charset=utf-8", "tw_" + dateStr + ".csv");
  };
  function jsonData() {
    return results.map(function (it, i) {
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
      };
    });
  }
  $("dj").onclick = function () {
    download(
      JSON.stringify(jsonData(), null, 2),
      "application/json;charset=utf-8",
      "tw_" + dateStr + ".json",
    );
  };
  // AI 브리핑으로 보내기: 수집분을 로컬 'Xsearch 뉴스 빌더'(newsgen)로 보낸다.
  // 확장 모드는 background가 전송·탭 열기를 담당, 북마클릿 모드는 직접 fetch.
  var BRIEF_FAIL_MSG =
    "브리핑 빌더 서버(127.0.0.1:8787)에 연결하지 못했습니다.\n프로젝트 폴더에서 npm run news 를 실행한 뒤 다시 시도하세요.";
  function sendBrief() {
    var fname = "tw_" + dateStr + ".json";
    var btn = $("db");
    if (EXT) {
      if (btn) {
        btn.textContent = "전송 중…";
        btn.disabled = true;
      }
      // 결과가 오지 않으면(서비스 워커 종료 등) 버튼이 영구히 잠기므로
      // 응답 수신 또는 타임아웃 중 먼저 오는 쪽에서 버튼을 되돌린다.
      var settled = 0;
      var timer = setTimeout(function () {
        finish(0, "응답 시간 초과");
      }, 15000);
      function finish(ok, error) {
        if (settled) {
          return;
        }
        settled = 1;
        clearTimeout(timer);
        window.removeEventListener("message", onResult);
        var b = $("db");
        if (!b) {
          return;
        }
        if (ok) {
          b.textContent = "빌더로 전송됨";
          b.disabled = true;
          return;
        }
        b.textContent = "AI 브리핑으로 보내기";
        b.disabled = false;
        alert(BRIEF_FAIL_MSG + (error ? "\n\n(" + error + ")" : ""));
      }
      function onResult(ev) {
        if (ev.source !== window) {
          return;
        }
        var d = ev.data;
        if (!d || d.__twc !== "brief-result") {
          return;
        }
        finish(d.ok, d.error);
      }
      window.addEventListener("message", onResult);
      window.postMessage(
        { __twc: "brief", content: JSON.stringify(jsonData()), fname: fname },
        "*",
      );
      return;
    }
    var base = "http://127.0.0.1:8787";
    fetch(base + "/api/import", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ fileName: fname, tweets: jsonData() }),
    })
      .then(function (r) {
        return r.json();
      })
      .then(function (j) {
        if (!j || !j.id) {
          throw new Error("id 없음");
        }
        window.open(base + "/?import=" + j.id, "_blank");
        if (btn) {
          btn.textContent = "빌더로 전송됨";
          btn.disabled = true;
        }
      })
      .catch(function () {
        alert(BRIEF_FAIL_MSG);
      });
  }
  $("db").onclick = sendBrief;
  if (EXT && EXT.briefAuto) {
    sendBrief();
  }
})();
