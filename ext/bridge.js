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
  chrome.runtime.sendMessage({ __twc: "download", url, fname: d.fname }, () => {
    // lastError를 읽지 않으면 "Unchecked runtime.lastError" 콘솔 오류가 남는다.
    if (chrome.runtime.lastError) {
      console.warn("다운로드 응답 없음:", chrome.runtime.lastError.message);
    }
    URL.revokeObjectURL(url);
  });
  setTimeout(() => URL.revokeObjectURL(url), 5 * 60 * 1000);
});

// background → MAIN world 중계: 브리핑 전송 결과를 수집기 UI에 알린다
chrome.runtime.onMessage.addListener((msg) => {
  if (msg && msg.__twc === "brief-result") {
    window.postMessage(
      { __twc: "brief-result", ok: !!msg.ok, error: msg.error || "" },
      "*",
    );
  }
});

// 자동 시작: 옵션에서 켜두면 페이지 로드 후 수집기 실행
chrome.storage.local
  .get({ autoStart: false })
  .then((cfg) => {
    if (cfg.autoStart) {
      chrome.runtime.sendMessage({ __twc: "start" });
    }
  })
  .catch((e) => {
    // 확장 재설치·업데이트 직후에는 컨텍스트가 무효화되어 실패할 수 있다
    console.warn("자동 시작 설정을 읽지 못했습니다:", e.message);
  });
