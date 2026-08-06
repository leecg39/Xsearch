// Xsearch — service worker
// 역할: 시작 오케스트레이션(config 주입 → injected.js 실행) + chrome.downloads 저장

const DEFAULTS = {
  target: 200,
  delay: 2000,
  filterMode: 0,
  autoStart: false,
  reKeep: "",
  reWeak: "",
  reDrop: "",
  briefAuto: false, // 수집 완료 시 자동으로 브리핑 내보내기
  builderUrl: "http://127.0.0.1:8787", // 5분 AI 뉴스 빌더 주소 (npm run news)
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
  clearBadge(); // 이전 실행에서 남은 오류 배지 정리

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

// 배지 알림: service worker는 유휴 상태에서 종료되므로 setTimeout 정리가
// 실행되지 않을 수 있다. 워커가 살아 있는 동안은 타이머로, 종료된 경우에는
// 다음 수집 시작(startCollector)이나 브라우저 시작 시점에 배지를 지운다.
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

// 브리핑 전송 결과를 수집기 UI(MAIN world)로 되돌려 준다. bridge.js가 중계한다.
function notifyBrief(tabId, ok, error) {
  if (!tabId) {
    return;
  }
  chrome.tabs
    .sendMessage(tabId, { __twc: "brief-result", ok, error: error || "" })
    .catch(() => {}); // 탭이 닫혔거나 content script가 없으면 무시
}

// 브리핑 내보내기: 수집 JSON을 로컬 '5분 AI 뉴스 빌더'로 보내고 빌더 탭을 연다
async function exportBrief(content, fname, tabId) {
  const { builderUrl } = await chrome.storage.local.get({ builderUrl: DEFAULTS.builderUrl });
  const base = (builderUrl || DEFAULTS.builderUrl).replace(/\/+$/, "");
  try {
    const tweets = JSON.parse(content);
    const res = await fetch(base + "/api/import", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ fileName: fname || "tw_export.json", tweets }),
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
    return true; // sendResponse를 비동기로 호출함을 표시
  }
  if (msg && msg.__twc === "brief" && typeof msg.content === "string") {
    exportBrief(msg.content, msg.fname, sender.tab && sender.tab.id);
    return;
  }
});
