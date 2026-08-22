// Xsearch — 수집 코어 (패널·스크롤·체크포인트·필터·내보내기)
// 소스별 파싱은 src/sources/* 어댑터. 빌드 시 esbuild가 단일 IIFE로 번들한다.
import { resolveTopicFilters, INTEREST_CHOICES, TOPIC_KEYS } from "./topics.mjs";
import { CSV_HEAD, itemToFull, itemToCsvRow } from "./schema.mjs";
import { pickSource } from "./sources/index.mjs";

var PREFS_KEY = "_twc_prefs";

void (async function twcMain() {
  var EXT = window.__twcConfig || null;
  var doc = document;
  var store = null;
  try {
    store = window.localStorage;
  } catch (e) {}
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
          JSON.stringify({ topic: topic, filterMode: filterOn ? 1 : 0 }),
        );
      }
    } catch (e) {}
    try {
      window.postMessage(
        {
          __twc: "prefs",
          topic: topic,
          filterMode: filterOn ? 1 : 0,
        },
        "*",
      );
    } catch (e) {}
  }
  var prefs = loadPrefs() || {};
  var picked = pickSource(location.hostname, EXT || {});
  if (picked.error === "linkedin-off") {
    alert(
      "LinkedIn 수집은 봇 탐지·계정 제한 위험이 있어 기본 꺼져 있습니다.\n확장 옵션에서 LinkedIn 수집을 켠 뒤 다시 시도하세요.",
    );
    return;
  }
  if (picked.error === "no-match" || !picked.source) {
    alert(
      "이 사이트에서는 Xsearch를 실행할 수 없습니다. (X / Reddit / Threads / LinkedIn)\n\n" +
        "host: " +
        location.hostname +
        "\nv__TWC_VERSION__ — 북마클릿/확장을 최신으로 다시 설치·로드하세요.",
    );
    return;
  }
  var src = picked.source;
  var KEY = "_twc_" + src.id;
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
          "수집할 게시물 갯수:",
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
  if (src.id === "linkedin") {
    delay = Math.max(delay, 2500);
  }
  if (src.id === "reddit") {
    delay = Math.max(delay, 2000);
  }
  var filterMode =
    EXT && EXT.filterMode != null
      ? EXT.filterMode
        ? 1
        : 0
      : prefs.filterMode
        ? 1
        : 0;
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
  var topicKey =
    (EXT && TOPIC_KEYS.includes(EXT.topic) && EXT.topic) ||
    (TOPIC_KEYS.includes(prefs.topic) && prefs.topic) ||
    "ai";
  var customRe = {
    reKeep: EXT && EXT.reKeep,
    reWeak: EXT && EXT.reWeak,
    reDrop: EXT && EXT.reDrop,
  };
  var filters = resolveTopicFilters(topicKey, customRe);
  var RE_KEEP = filters.RE_KEEP,
    RE_WEAK = filters.RE_WEAK,
    RE_DROP = filters.RE_DROP;
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
    ";--ac:#1d9bf0}*{box-sizing:border-box;margin:0;padding:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',system-ui,sans-serif}.p{width:268px;background:var(--bg);color:var(--fg);border:1px solid var(--line);border-radius:14px;box-shadow:0 8px 28px rgba(0,0,0,.28);overflow:hidden;font-size:13px;line-height:1.45}.hd{display:flex;align-items:center;gap:6px;padding:9px 8px 9px 12px;cursor:move;border-bottom:1px solid var(--line);user-select:none}.ttl{font-weight:700;font-size:12.5px;flex:1}.ver{font-size:10px;color:var(--sub);background:var(--chip);padding:1px 6px;border-radius:20px}.ic{width:22px;height:22px;border:0;background:transparent;color:var(--sub);border-radius:6px;cursor:pointer;font-size:12px;line-height:1;display:flex;align-items:center;justify-content:center}.ic:hover{background:var(--chip);color:var(--fg)}.bd{padding:12px}.num{display:flex;align-items:baseline;gap:5px;margin-bottom:8px}.num b{font-size:26px;font-weight:800;letter-spacing:-.5px;font-variant-numeric:tabular-nums}.num s{text-decoration:none;color:var(--sub);font-size:12.5px}.bar{height:5px;background:var(--chip);border-radius:20px;overflow:hidden;margin-bottom:9px}.bar i{display:block;height:5px;width:0px;background:var(--ac);border-radius:20px;transition:width .3s}.met{display:flex;gap:10px;font-size:11px;color:var(--sub);font-variant-numeric:tabular-nums;margin-bottom:10px;min-height:16px}.met span{white-space:nowrap}.st{display:flex;align-items:center;gap:7px;font-size:11.5px;padding:6px 9px;border-radius:8px;background:var(--chip);margin-bottom:11px}.dot{width:7px;height:7px;border-radius:20px;background:var(--ac);flex:none}.row{display:flex;gap:6px;margin-bottom:6px;align-items:center}.btn{flex:1;border:1px solid var(--line);background:var(--chip);color:var(--fg);border-radius:8px;padding:7px 4px;font-size:11.5px;font-weight:600;cursor:pointer;white-space:nowrap}.btn:hover{border-color:var(--ac)}.btn.on{background:var(--ac);border-color:var(--ac);color:#fff}.btn.dg{color:#f4212e}.spd{display:flex;align-items:center;gap:6px;margin-bottom:6px}.lab{font-size:11px;color:var(--sub);flex:none}.val{flex:1;text-align:center;font-size:11.5px;font-variant-numeric:tabular-nums;color:var(--sub)}.stp{flex:none;min-width:50px}.foot{font-size:10.5px;color:var(--sub);padding-top:8px;margin-top:2px;border-top:1px solid var(--line);display:flex;gap:10px;flex-wrap:wrap}.fr{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px;font-size:11.5px;color:var(--sub)}.fr b{color:var(--fg);font-variant-numeric:tabular-nums}input[type=number]{width:72px;background:var(--chip);border:1px solid var(--line);color:var(--fg);border-radius:6px;padding:4px 6px;font-size:11.5px}select{background:var(--chip);border:1px solid var(--line);color:var(--fg);border-radius:6px;padding:4px 6px;font-size:11.5px}input[type=checkbox]{accent-color:var(--ac)}.ck{display:flex;align-items:center;gap:6px;cursor:pointer}.hide{display:none}.catlab{font-size:11px;color:var(--sub);margin-bottom:5px}.cats{display:flex;flex-wrap:wrap;gap:4px;margin-bottom:8px}.cat{border:1px solid var(--line);background:var(--chip);color:var(--fg);border-radius:20px;padding:5px 9px;font-size:10.5px;font-weight:600;cursor:pointer;line-height:1.2}.cat:hover{border-color:var(--ac)}.cat.on{background:var(--ac);border-color:var(--ac);color:#fff}.cathint{font-size:10.5px;color:var(--sub);margin-bottom:8px;min-height:14px}</style>";
  var host = doc.createElement("div");
  host.style.cssText =
    "all:initial;position:fixed;top:12px;right:12px;z-index:2147483647";
  var root = host.attachShadow({ mode: "open" });
  var catBtns =
    '<button type="button" class="cat" data-cat="">전체</button>' +
    INTEREST_CHOICES.map(function (c) {
      return (
        '<button type="button" class="cat" data-cat="' +
        c.key +
        '" title="' +
        c.name +
        '">' +
        c.short +
        "</button>"
      );
    }).join("");
  if (topicKey === "custom") {
    catBtns +=
      '<button type="button" class="cat" data-cat="custom" title="자유 입력">자유</button>';
  }
  root.innerHTML =
    CSS +
    '<div class="p"><div class="hd" id="hd"><span id="ico"><img src="__TWC_LOGO32__" alt="" style="width:15px;height:15px;vertical-align:-2px"></span><span class="ttl" id="ttl">Xsearch</span><span class="ver" id="srcv"></span><span class="ver">v__TWC_VERSION__</span><button class="ic" id="min" title="접기">─</button><button class="ic hide" id="cls" title="닫기">✕</button></div><div class="bd" id="bd"><div class="num"><b id="cnt">0</b><s id="tgt"></s></div><div class="bar"><i id="bar"></i></div><div class="met"><span id="tm">0:00</span><span id="eta"></span><span id="rate"></span></div><div class="st"><span class="dot" id="dot"></span><span id="msg">시작하는 중</span></div><div class="row"><button class="btn" id="pz" title="수집을 잠시 멈췄다가 다시 시작">일시정지</button><button class="btn dg" id="sp" title="지금까지 수집한 것을 저장하고 종료">중단·저장</button></div><div class="spd"><span class="lab">속도</span><button class="btn stp" id="fa" title="이동 사이 대기를 줄여 빠르게 (과하면 관련성↓·차단 위험)">빠르게</button><span class="val" id="dly"></span><button class="btn stp" id="sl" title="이동 사이 대기를 늘려 천천히 (관련성↑)">느리게</button></div><div class="catlab">관심사 필터</div><div class="cats" id="cats">' +
    catBtns +
    '</div><div class="cathint" id="cathint"></div><div class="foot hide" id="foot"><span id="apc"></span><span id="skp"></span><span id="fix"></span><span id="qw"></span></div></div></div>';
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
  var elCats = $("cats"),
    elCatHint = $("cathint");
  $("srcv").textContent = src.id;
  function syncCatUI() {
    var buttons = elCats.querySelectorAll(".cat");
    for (var i = 0; i < buttons.length; i++) {
      var b = buttons[i];
      var k = b.getAttribute("data-cat") || "";
      var on = filterMode ? k === topicKey : k === "";
      b.classList.toggle("on", on);
    }
    elCatHint.textContent = filterMode
      ? topicName + " 관련만 수집"
      : "필터 없음 · 전체 수집";
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
  var ctx = {
    doc: doc,
    location: window.location,
    tweets: tweets,
    skippedSet: skippedSet,
    fExcluded: fExcluded,
    sourceId: src.id,
    sleep: sleep,
    delay: delay,
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
    setStatus: setStatus,
    RED: RED,
    updateProgress: updateProgress,
    updateFoot: updateFoot,
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
    ctx.delay = delay;
    elDly.textContent = delay + "ms";
  };
  $("sl").onclick = function () {
    delay = Math.min(5000, delay + 200);
    ctx.delay = delay;
    elDly.textContent = delay + "ms";
  };
  elCats.addEventListener("click", function (ev) {
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
    src.unhookNet();
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
  src.setupNetHook();
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
        setStatus(BLUE, "수집 중");
        if (tweets.size - lastSaved >= 50) {
          saveCheckpoint();
          lastSaved = tweets.size;
        }
        goDown();
        await sleep(delay + 200 * Math.random());
      } else {
        var state = src.feedState();
        if (state === "error") {
          setStatus("#ff7a00", "소프트블록 — 재시도 대기");
          var rb = src.findRetry();
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
          setStatus("#ffd400", "새 게시물 불러오는 중");
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
    src.unhookNet();
    saveCheckpoint();
    clearInterval(timer);
    setStatus(RED, "오류: " + err.message);
    alert(
      "에러 발생: " +
        err.message +
        "\n" +
        tweets.size +
        "개 저장됨. 다시 시작하면 이어하기 가능",
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
    alert("수집된 게시물 없음");
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
    '</s></div><div class="row"><button class="btn" id="dc">CSV</button><button class="btn" id="dj">JSON</button><button class="btn" id="db">브리핑으로 보내기</button></div>';
  function download(content, mime, fname) {
    if (EXT) {
      window.postMessage(
        { __twc: "download", content: content, mime: mime, fname: fname },
        "*",
      );
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
    var body = results
      .map(function (it, i) {
        return itemToCsvRow(it, i);
      })
      .join("\n");
    download(CSV_HEAD + body, "text/csv;charset=utf-8", "tw_" + dateStr + ".csv");
  };
  function jsonData() {
    return results.map(function (it, i) {
      return itemToFull(it, i);
    });
  }
  $("dj").onclick = function () {
    download(
      JSON.stringify(jsonData(), null, 2),
      "application/json;charset=utf-8",
      "tw_" + dateStr + ".json",
    );
  };
  var BUILDER_DEFAULT = "http://127.0.0.1:8787";
  // 확장 옵션의 빌더 주소를 따른다. 북마클릿 모드에는 EXT가 없어 기본값을 쓴다.
  function builderBase() {
    var u = (EXT && EXT.builderUrl) || BUILDER_DEFAULT;
    return String(u).replace(/\/+$/, "");
  }
  function isLoopback(u) {
    return /^https?:\/\/(127\.0\.0\.1|localhost|\[::1\])(:|\/|$)/i.test(u);
  }
  function briefFailText(base) {
    return (
      "브리핑 빌더 서버(" +
      base +
      ")에 연결하지 못했습니다.\n" +
      (isLoopback(base)
        ? "프로젝트 폴더에서 npm run news 를 실행했는지 확인하세요."
        : "원격 빌더 주소와 네트워크 상태를 확인하세요.")
    );
  }
  function briefBlockedText(base) {
    return (
      "브라우저가 로컬 네트워크 접근을 차단했습니다 (" +
      base +
      ").\n주소창 왼쪽 아이콘 → 사이트 설정에서 '로컬 네트워크 액세스'를 허용한 뒤 다시 시도하세요."
    );
  }
  // 서버 다운과 브라우저 차단을 구분한다.
  // granted가 아니면(prompt 포함) 차단으로 본다 — 프롬프트를 닫아도 요청은 실패한다.
  function briefFailMsg(base, cb) {
    var perms = window.navigator && window.navigator.permissions;
    if (!isLoopback(base) || !perms || !perms.query) {
      cb(briefFailText(base));
      return;
    }
    try {
      perms.query({ name: "local-network-access" }).then(
        function (st) {
          cb(st && st.state !== "granted" ? briefBlockedText(base) : briefFailText(base));
        },
        function () {
          cb(briefFailText(base));
        },
      );
    } catch (e) {
      cb(briefFailText(base));
    }
  }
  function openBuilderFallback(payload, downloadName) {
    try {
      var a = doc.createElement("a");
      var burl = URL.createObjectURL(
        new Blob([payload], { type: "application/json;charset=utf-8" }),
      );
      a.href = burl;
      a.download = downloadName || "tw_export.json";
      a.click();
      setTimeout(function () {
        URL.revokeObjectURL(burl);
      }, 1000);
    } catch (e) {}
    window.open(builderBase() + "/", "_blank");
  }
  function sendBrief() {
    var fname = "tw_" + dateStr + ".json";
    var btn = $("db");
    var payload = JSON.stringify({
      fileName: fname,
      tweets: jsonData(),
      topic: filters.key,
    });
    if (EXT) {
      if (btn) {
        btn.textContent = "전송 중…";
        btn.disabled = true;
      }
      var settled = 0;
      var briefTimer = setTimeout(function () {
        finish(0, "응답 시간 초과");
      }, 15000);
      function finish(ok, error) {
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
          b.textContent = "빌더로 전송됨";
          b.disabled = true;
          return;
        }
        b.textContent = "브리핑으로 보내기";
        b.disabled = false;
        // 확장 경로 실패 시 페이지 fetch로 한 번 더 시도
        fetchBriefDirect(payload, b, error, fname);
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
      window.postMessage({ __twc: "brief", content: payload, fname: fname }, "*");
      return;
    }
    fetchBriefDirect(payload, btn, "", fname);
  }
  function fetchBriefDirect(payload, btn, prevErr, downloadName) {
    var base = builderBase();
    if (btn) {
      btn.textContent = "전송 중…";
      btn.disabled = true;
    }
    fetch(base + "/api/import", {
      method: "POST",
      headers: { "content-type": "application/json" },
      // Chrome 142+ 로컬 네트워크 접근(LNA): 루프백 요청임을 명시해야
      // 혼합 콘텐츠 차단을 피하고 권한 프롬프트가 정상적으로 뜬다.
      targetAddressSpace: "local",
      body: payload,
    })
      .then(function (r) {
        if (!r.ok) {
          throw new Error("HTTP " + r.status);
        }
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
      .catch(function (err) {
        if (btn) {
          btn.textContent = "브리핑으로 보내기";
          btn.disabled = false;
        }
        var detail = (err && err.message) || prevErr || "";
        briefFailMsg(base, function (msg) {
          alert(
            msg +
              (detail ? "\n\n(" + detail + ")" : "") +
              "\n\nJSON을 다운로드하고 빌더 탭을 엽니다. 페이지에서 파일을 선택해 주세요.",
          );
          openBuilderFallback(payload, downloadName);
        });
      });
  }
  $("db").onclick = sendBrief;
  if (EXT && EXT.briefAuto) {
    sendBrief();
  }
})();
