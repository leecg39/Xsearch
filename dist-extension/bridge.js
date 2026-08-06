// Xsearch — content script (isolated world)
// 역할: MAIN world의 postMessage를 background로 중계 + 자동 시작

// MAIN world(injected.js) → background 중계 (다운로드 + 브리핑 내보내기)
window.addEventListener("message", (ev) => {
  if (ev.source !== window) return;
  const d = ev.data;
  if (!d || typeof d.content !== "string") return;
  if (d.__twc === "brief") {
    // 브리핑 내보내기: background가 로컬 빌더(/api/import)로 전송 후 탭을 연다
    chrome.runtime.sendMessage({ __twc: "brief", content: d.content, fname: d.fname });
    return;
  }
  if (d.__twc !== "download") return;
  // 페이지 컨텍스트에서 blob URL 생성 (service worker는 createObjectURL 불가)
  const url = URL.createObjectURL(new Blob([d.content], { type: d.mime || "text/plain" }));
  // 다운로드 완료(또는 실패) 확인까지 revoke를 미룬다.
  // service worker가 비활성→활성 전환 중 메시지를 놓치면 5분 후에 정리한다.
  chrome.runtime.sendMessage({ __twc: "download", url, fname: d.fname }, (resp) => {
    URL.revokeObjectURL(url);
  });
  setTimeout(() => URL.revokeObjectURL(url), 5 * 60 * 1000);
});

// 자동 시작: 옵션에서 켜두면 페이지 로드 후 수집기 실행
chrome.storage.local.get({ autoStart: false }).then((cfg) => {
  if (cfg.autoStart) {
    chrome.runtime.sendMessage({ __twc: "start" });
  }
});
