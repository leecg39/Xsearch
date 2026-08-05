// 트윗 수집기 — service worker
// 역할: 시작 오케스트레이션(config 주입 → injected.js 실행) + chrome.downloads 저장

const DEFAULTS = {
  target: 1000,
  delay: 2000,
  filterMode: 0,
  autoStart: false,
  reKeep: "",
  reWeak: "",
  reDrop: "",
};

async function getConfig() {
  const cfg = await chrome.storage.local.get(DEFAULTS);
  return cfg;
}

// MAIN world에 설정을 심는다 (injected.js보다 먼저 실행되어야 함)
function setConfig(cfg) {
  window.__twcConfig = cfg;
}

async function startCollector(tabId) {
  const cfg = await getConfig();
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
  if (!tab.id || !/^https:\/\/(x|twitter)\.com\//.test(tab.url || "")) return;
  try {
    await startCollector(tab.id);
  } catch (e) {
    console.error("수집기 시작 실패:", e);
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg && msg.__twc === "start" && sender.tab && sender.tab.id) {
    startCollector(sender.tab.id).catch((e) => console.error("자동 시작 실패:", e));
    return;
  }
  if (msg && msg.__twc === "download" && msg.url) {
    chrome.downloads.download({
      url: msg.url,
      filename: "tweets/" + (msg.fname || "tw_export"),
      conflictAction: "uniquify",
    });
    return;
  }
});
