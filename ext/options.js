// Xsearch — 옵션 페이지
// 토픽 프리셋은 빌드 시 src/topics.mjs에서 JSON으로 주입된다 ({{TOPICS_JSON}}).

const TOPICS = {{TOPICS_JSON}};

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
  builderUrl: "https://news.soverin.cloud",
  builderUsername: "xsearch",
  builderPassword: "",
  enableLinkedIn: false,
};

const $ = (id) => document.getElementById(id);

function migrateConfig(stored) {
  const cfg = { ...DEFAULTS, ...stored };
  if (stored.topic == null || stored.topic === "") {
    cfg.topic = stored.reKeep || stored.reWeak || stored.reDrop ? "custom" : "ai";
  }
  if (!TOPICS[cfg.topic]) cfg.topic = "ai";
  return cfg;
}

function fillTopicSelect() {
  const sel = $("topic");
  sel.replaceChildren();
  for (const [id, t] of Object.entries(TOPICS)) {
    const opt = document.createElement("option");
    opt.value = id;
    opt.textContent = t.name;
    sel.appendChild(opt);
  }
}

function applyTopicFields(topicKey, cfg) {
  const preset = TOPICS[topicKey] || TOPICS.ai;
  const isCustom = topicKey === "custom";
  for (const k of ["reKeep", "reWeak", "reDrop"]) {
    const el = $(k);
    el.readOnly = !isCustom;
    el.classList.toggle("ro", !isCustom);
    if (isCustom) {
      el.value = (cfg && cfg[k]) || "";
    } else {
      el.value = preset[k] || "";
    }
  }
  $("customHint").classList.toggle("hide", !isCustom);
}

function validateRe(id, errId) {
  const src = $(id).value.trim();
  if (!src) {
    $(errId).textContent = "";
    return true;
  }
  try {
    new RegExp(src, "i");
    $(errId).textContent = "";
    return true;
  } catch (e) {
    $(errId).textContent = "정규식 오류: " + e.message;
    return false;
  }
}

async function load() {
  const stored = await chrome.storage.local.get(null);
  const cfg = migrateConfig(stored);
  $("target").value = cfg.target;
  $("delay").value = cfg.delay;
  $("filterMode").value = String(cfg.filterMode);
  $("autoStart").checked = !!cfg.autoStart;
  $("enableLinkedIn").checked = !!cfg.enableLinkedIn;
  $("topic").value = cfg.topic;
  applyTopicFields(cfg.topic, cfg);
  $("briefAuto").checked = !!cfg.briefAuto;
  $("builderUrl").value = cfg.builderUrl;
  $("builderUsername").value = cfg.builderUsername;
  $("builderPassword").value = cfg.builderPassword;
}

async function save() {
  const topic = $("topic").value || "ai";
  if (topic === "custom") {
    const ok = ["Keep", "Weak", "Drop"]
      .map((k) => validateRe("re" + k, "err" + k))
      .every(Boolean);
    if (!ok) return;
  }
  const cfg = {
    target: Math.max(1, parseInt($("target").value, 10) || DEFAULTS.target),
    delay: Math.min(5000, Math.max(200, parseInt($("delay").value, 10) || DEFAULTS.delay)),
    filterMode: parseInt($("filterMode").value, 10) ? 1 : 0,
    autoStart: $("autoStart").checked,
    topic,
    reKeep: topic === "custom" ? $("reKeep").value.trim() : "",
    reWeak: topic === "custom" ? $("reWeak").value.trim() : "",
    reDrop: topic === "custom" ? $("reDrop").value.trim() : "",
    briefAuto: $("briefAuto").checked,
    builderUrl: $("builderUrl").value.trim() || DEFAULTS.builderUrl,
    builderUsername: $("builderUsername").value.trim() || DEFAULTS.builderUsername,
    builderPassword: $("builderPassword").value,
    enableLinkedIn: $("enableLinkedIn").checked,
  };
  await chrome.storage.local.set(cfg);
  $("msg").textContent = "저장됨";
  setTimeout(() => ($("msg").textContent = ""), 1500);
}

function resetDefaults() {
  $("target").value = DEFAULTS.target;
  $("delay").value = DEFAULTS.delay;
  $("filterMode").value = "0";
  $("autoStart").checked = false;
  $("enableLinkedIn").checked = false;
  $("topic").value = "ai";
  applyTopicFields("ai", DEFAULTS);
  $("briefAuto").checked = false;
  $("builderUrl").value = DEFAULTS.builderUrl;
  $("builderUsername").value = DEFAULTS.builderUsername;
  $("builderPassword").value = DEFAULTS.builderPassword;
}

fillTopicSelect();
// 연결 테스트: 저장 여부와 무관하게 현재 입력값으로 빌더에 프로브 요청을 보낸다.
// 비밀번호는 화면에 출력하지 않고 길이만 알린다.
async function testBuilder() {
  const btn = $("builderTest");
  const out = $("builderTestMsg");
  const base = ($("builderUrl").value.trim() || DEFAULTS.builderUrl).replace(/\/+$/, "");
  const user = $("builderUsername").value.trim() || DEFAULTS.builderUsername;
  const pass = $("builderPassword").value;
  btn.disabled = true;
  out.textContent = "확인 중…";
  try {
    const headers = { "content-type": "application/json" };
    if (pass) {
      headers.authorization = "Basic " + btoa(user + ":" + pass);
    }
    const res = await fetch(base + "/api/import", {
      method: "POST",
      headers,
      body: JSON.stringify({
        fileName: "probe.json",
        tweets: [{ id: "probe", text: "connection test" }],
        topic: "ai",
      }),
    });
    if (res.status === 401) {
      out.textContent = pass
        ? "401 인증 실패 — 사용자명(" + user + ")과 비밀번호가 서버 등록값과 다릅니다"
        : "401 인증 실패 — 비밀번호가 비어 있습니다. 입력 후 저장하세요";
    } else if (res.ok) {
      out.textContent = "정상 (" + res.status + ") — 자격증명이 유효합니다";
    } else {
      out.textContent = "실패 (HTTP " + res.status + ") — 빌더 주소를 확인하세요";
    }
  } catch (e) {
    // btoa는 비ASCII 비밀번호에서 InvalidCharacterError를 던진다
    out.textContent =
      e.name === "InvalidCharacterError"
        ? "비밀번호에 ASCII가 아닌 문자가 있습니다 — 영문·숫자·기호로 바꿔주세요"
        : "연결 실패 — " + e.message;
  } finally {
    btn.disabled = false;
  }
}

$("builderTest").addEventListener("click", testBuilder);
$("save").addEventListener("click", save);
$("reset").addEventListener("click", () => {
  resetDefaults();
  save();
});
$("topic").addEventListener("change", () => {
  applyTopicFields($("topic").value, {
    reKeep: $("reKeep").value,
    reWeak: $("reWeak").value,
    reDrop: $("reDrop").value,
  });
});
for (const k of ["Keep", "Weak", "Drop"]) {
  $("re" + k).addEventListener("input", () => validateRe("re" + k, "err" + k));
}
load();
