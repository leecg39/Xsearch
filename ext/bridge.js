// 트윗 수집기 — content script (isolated world)
// 역할: MAIN world의 postMessage를 background로 중계 + 자동 시작

// MAIN world(injected.js) → background 다운로드 중계
window.addEventListener("message", (ev) => {
  if (ev.source !== window) return;
  const d = ev.data;
  if (!d || d.__twc !== "download" || typeof d.content !== "string") return;
  // 페이지 컨텍스트에서 blob URL 생성 (service worker는 createObjectURL 불가)
  const url = URL.createObjectURL(new Blob([d.content], { type: d.mime || "text/plain" }));
  chrome.runtime.sendMessage({ __twc: "download", url, fname: d.fname });
  setTimeout(() => URL.revokeObjectURL(url), 60000);
});

// 자동 시작: 옵션에서 켜두면 페이지 로드 후 수집기 실행
chrome.storage.local.get({ autoStart: false }).then((cfg) => {
  if (cfg.autoStart) {
    chrome.runtime.sendMessage({ __twc: "start" });
  }
});
