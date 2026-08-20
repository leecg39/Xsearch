// Xsearch — service worker
// 역할: 시작 오케스트레이션(config 주입 → injected.js 실행) + chrome.downloads 저장

const HOST_OK = [
  { id: "x", re: /^https:\/\/(x|twitter)\.com\// },
  { id: "reddit", re: /^https:\/\/(www\.|old\.)?reddit\.com\// },
  { id: "threads", re: /^https:\/\/([a-z0-9-]+\.)?threads\.(com|net)\//i },
  { id: "linkedin", re: /^https:\/\/(www\.)?linkedin\.com\// },
];

const DEFAULTS = {
  target: 200,
  delay: 2000,
  filterMode: 0,
  autoStart: false,
  topic: "ai",
  reKeep: "",
  reWeak: "",
  reDrop: "",
  briefAuto: false,
  builderUrl: "http://127.0.0.1:8787",
  linkedinEnabled: false,
};

function sourceIdOf(url) {
  for (const h of HOST_OK) {
    if (h.re.test(url || "")) return h.id;
  }
  return null;
}

async function getConfig() {
  const cfg = await chrome.storage.local.get(DEFAULTS);
  if (!cfg.topic) {
    cfg.topic = cfg.reKeep || cfg.reWeak || cfg.reDrop ? "custom" : "ai";
  }
  return cfg;
}

function setConfig(cfg) {
  window.__twcConfig = cfg;
}

async function startCollector(tabId) {
  const cfg = await getConfig();
  clearBadge();

  await chrome.scripting.executeScript({
    target: { tabId },
    world: "MAIN",
    func: setConfig,
    args: [cfg],
  });
  await chrome.scripting.executeScript({
    target: { tabId },
    world: "MAIN",
    files: ["injected.js"],
  });
}

chrome.action.onClicked.addListener(async (tab) => {
  const sid = sourceIdOf(tab.url || "");
  if (!tab.id || !sid) return;
  if (sid === "linkedin") {
    const cfg = await getConfig();
    if (!cfg.linkedinEnabled) {
      flashBadge("OFF", "LinkedIn 수집은 옵션에서 켠 뒤에만 동작합니다", 8000);
      return;
    }
  }
  try {
    await startCollector(tab.id);
  } catch (e) {
    console.error("수집기 시작 실패:", e);
  }
});

function clearBadge() {
  chrome.action.setBadgeText({ text: "" });
  chrome.action.setTitle({ title: "Xsearch 시작" });
}

function flashBadge(text, title, ms) {
  chrome.action.setBadgeBackgroundColor({ color: "#d3543f" });
  chrome.action.setBadgeText({ text });
  if (title) {
    chrome.action.setTitle({ title });
  }
  setTimeout(clearBadge, ms);
}

chrome.runtime.onStartup.addListener(clearBadge);

function notifyBrief(tabId, ok, error) {
  if (!tabId) {
    return;
  }
  // MAIN world 수집기에 직접 전달 (content script bridge 유무와 무관)
  chrome.scripting
    .executeScript({
      target: { tabId },
      world: "MAIN",
      func: (okFlag, errMsg) => {
        window.postMessage(
          { __twc: "brief-result", ok: !!okFlag, error: errMsg || "" },
          "*",
        );
      },
      args: [!!ok, error || ""],
    })
    .catch(() => {});
  // 구버전 bridge 호환
  chrome.tabs
    .sendMessage(tabId, { __twc: "brief-result", ok, error: error || "" })
    .catch(() => {});
}

async function exportBrief(content, fname, tabId) {
  const { builderUrl } = await chrome.storage.local.get({ builderUrl: DEFAULTS.builderUrl });
  const base = (builderUrl || DEFAULTS.builderUrl).replace(/\/+$/, "");
  try {
    const parsed = JSON.parse(content);
    const tweets = Array.isArray(parsed) ? parsed : parsed.tweets;
    const topic = Array.isArray(parsed) ? "ai" : parsed.topic || "ai";
    const res = await fetch(base + "/api/import", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ fileName: fname || "tw_export.json", tweets, topic }),
    });
    if (!res.ok) throw new Error("HTTP " + res.status);
    const j = await res.json();
    if (!j || !j.id) {
      throw new Error("빌더 응답에 id 없음");
    }
    await chrome.tabs.create({ url: base + "/?import=" + j.id });
    notifyBrief(tabId, true);
  } catch (e) {
    console.error("브리핑 내보내기 실패 (빌더 서버가 꺼져 있을 수 있음):", e);
    flashBadge("ERR", "브리핑 내보내기 실패 — npm run news 로 빌더 서버를 실행하세요", 10000);
    notifyBrief(tabId, false, e.message);
  }
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.__twc === "start" && sender.tab && sender.tab.id) {
    const sid = sourceIdOf(sender.tab.url || "");
    if (!sid) return;
    if (sid === "linkedin") {
      getConfig().then((cfg) => {
        if (!cfg.linkedinEnabled) return;
        startCollector(sender.tab.id).catch((e) => console.error("자동 시작 실패:", e));
      });
      return;
    }
    startCollector(sender.tab.id).catch((e) => console.error("자동 시작 실패:", e));
    return;
  }
  if (msg && msg.__twc === "download" && msg.url) {
    chrome.downloads.download(
      {
        url: msg.url,
        filename: "tweets/" + (msg.fname || "tw_export"),
        conflictAction: "uniquify",
      },
      (downloadId) => {
        if (chrome.runtime.lastError) {
          console.error("다운로드 실패:", chrome.runtime.lastError.message, msg.fname);
          flashBadge("DL!", "", 5000);
        } else {
          console.log("다운로드 시작:", msg.fname, "id=", downloadId);
        }
        sendResponse({ ok: !chrome.runtime.lastError, id: downloadId });
      },
    );
    return true;
  }
  if (msg && msg.__twc === "brief" && typeof msg.content === "string") {
    exportBrief(msg.content, msg.fname, sender.tab && sender.tab.id);
    return;
  }
  if (msg && msg.__twc === "prefs") {
    const patch = {};
    if (typeof msg.topic === "string") patch.topic = msg.topic;
    if (msg.filterMode != null) patch.filterMode = msg.filterMode ? 1 : 0;
    if (Object.keys(patch).length) {
      chrome.storage.local.set(patch).catch((e) => console.warn("prefs 저장 실패:", e));
    }
    return;
  }
});
