// Xsearch — service worker
// 역할: 시작 오케스트레이션(config 주입 → injected.js 실행) + chrome.downloads 저장

const DEFAULTS = {
  target: 200,
  delay: 2000,
  filterMode: 0,
  autoStart: false,
  topic: "ai",
  reKeep: "",
  reWeak: "",
  reDrop: "",
  briefAuto: false, // 수집 완료 시 자동으로 브리핑 내보내기
  builderUrl: "https://news.soverin.cloud",
  builderUsername: "xsearch",
  builderPassword: "",
  enableLinkedIn: false,
};

// 빌드 시 src/topics.mjs의 키 목록으로 치환된다 ({{TOPIC_KEYS_JSON}}).
const TOPIC_KEYS = {{TOPIC_KEYS_JSON}};

const SOURCE_URL_RE = [
  /^https:\/\/(x|twitter)\.com\//,
  /^https:\/\/([a-z0-9-]+\.)?reddit\.com\//,
  /^https:\/\/(www\.)?threads\.(net|com)\//,
  /^https:\/\/([a-z0-9-]+\.)?linkedin\.com\//,
];

function isSupportedUrl(url) {
  return SOURCE_URL_RE.some((re) => re.test(url || ""));
}

function migrateConfig(stored) {
  const cfg = { ...DEFAULTS, ...stored };
  if (stored.topic == null || stored.topic === "") {
    cfg.topic = stored.reKeep || stored.reWeak || stored.reDrop ? "custom" : "ai";
  }
  return cfg;
}

async function getConfig() {
  const stored = await chrome.storage.local.get(null);
  return migrateConfig(stored);
}

// MAIN world에 설정을 심는다 (injected.js보다 먼저 실행되어야 함)
function setConfig(cfg) {
  window.__twcConfig = cfg;
}

async function startCollector(tabId) {
  const cfg = await getConfig();
  clearBadge(); // 이전 실행에서 남은 오류 배지 정리

  // content script는 페이지 로드 시에만 들어간다. 확장을 다시 로드하면 이미 열린
  // 탭에서 중계자가 사라져 브리핑 전송이 조용히 유실되므로 매번 재주입한다.
  // bridge.js는 __twcBridgeLoaded 가드로 중복 등록을 막는다.
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["bridge.js"],
    });
  } catch (e) {
    console.warn("bridge 재주입 실패:", e.message);
  }

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
  if (!tab.id || !isSupportedUrl(tab.url || "")) return;
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
    .catch((e) => {
      // 탭이 닫혔거나 content script가 없는 경우. 조용히 삼키면 수집기는
      // 15초 타임아웃까지 기다리다 엉뚱한 원인을 표시하므로 흔적을 남긴다.
      console.warn("브리핑 결과를 탭에 전달하지 못했습니다:", e.message);
    });
}

// 브리핑 내보내기: 수집 JSON을 원격 또는 로컬 뉴스 빌더로 보내고 빌더 탭을 연다.
async function exportBrief(content, fname, tabId, topic) {
  const { builderUrl, builderUsername, builderPassword } = await chrome.storage.local.get({
    builderUrl: DEFAULTS.builderUrl,
    builderUsername: DEFAULTS.builderUsername,
    builderPassword: DEFAULTS.builderPassword,
  });
  const base = (builderUrl || DEFAULTS.builderUrl).replace(/\/+$/, "");
  try {
    const tweets = JSON.parse(content);
    const headers = { "content-type": "application/json" };
    if (builderPassword) {
      headers.authorization = "Basic " + btoa((builderUsername || DEFAULTS.builderUsername) + ":" + builderPassword);
    }
    const res = await fetch(base + "/api/import", {
      method: "POST",
      headers,
      body: JSON.stringify({ fileName: fname || "tw_export.json", tweets, topic: topic || "ai" }),
    });
    if (res.status === 401) throw new Error("빌더 인증 실패 — 확장 설정의 사용자명과 비밀번호를 확인하세요");
    if (!res.ok) throw new Error("HTTP " + res.status);
    const j = await res.json();
    if (!j || !j.id) {
      throw new Error("빌더 응답에 id 없음");
    }
    await chrome.tabs.create({ url: base + "/builder?import=" + j.id });
    notifyBrief(tabId, true);
  } catch (e) {
    console.error("브리핑 내보내기 실패:", e);
    flashBadge("ERR", "브리핑 내보내기 실패 — 확장 설정의 빌더 주소와 인증 정보를 확인하세요", 10000);
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
    exportBrief(msg.content, msg.fname, sender.tab && sender.tab.id, msg.topic);
    return;
  }
  // 수집 패널에서 고른 관심사를 옵션 설정에 반영한다. 알 수 없는 키는 무시한다.
  if (msg && msg.__twc === "prefs") {
    const next = {};
    if (TOPIC_KEYS.includes(msg.topic)) {
      next.topic = msg.topic;
    }
    if (msg.filterMode != null) {
      next.filterMode = msg.filterMode ? 1 : 0;
    }
    if (Object.keys(next).length > 0) {
      chrome.storage.local
        .set(next)
        .catch((e) => console.warn("관심사 설정 저장 실패:", e.message));
    }
    return;
  }
});
