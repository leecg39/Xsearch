// Xsearch — 옵션 페이지
// 토픽 프리셋은 빌드 시 src/topics.mjs에서 주입된다 ({{TOPICS_JSON}}).

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
  builderUrl: "http://127.0.0.1:8787",
  builderUrlAlt: "http://127.0.0.1:8787",
  linkedinEnabled: false,
};

const TOPIC_ORDER = ["ai", "dev", "finance", "startup", "custom"];
const TOPIC_BLURB = {
  ai: "인공지능 · LLM · 에이전트",
  dev: "개발 · 오픈소스 · 인프라",
  finance: "금리 · 증시 · 암호화폐",
  startup: "펀딩 · SaaS · 창업",
  custom: "직접 정규식 입력",
};

const $ = (id) => document.getElementById(id);

function migrateTopic(cfg) {
  if (cfg.topic && TOPICS[cfg.topic]) return cfg.topic;
  if (cfg.reKeep || cfg.reWeak || cfg.reDrop) return "custom";
  return "ai";
}

function renderTopicCats(active) {
  const box = $("topicCats");
  box.innerHTML = "";
  for (const key of TOPIC_ORDER) {
    const spec = TOPICS[key];
    if (!spec) continue;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "cat" + (key === active ? " on" : "");
    btn.dataset.topic = key;
    btn.innerHTML =
      spec.name + "<small>" + (TOPIC_BLURB[key] || "") + "</small>";
    btn.addEventListener("click", () => selectTopic(key));
    box.appendChild(btn);
  }
}

function selectTopic(key) {
  $("topic").value = key;
  renderTopicCats(key);
  applyTopicFields(key);
  if (key !== "custom") {
    $("filterMode").value = "1";
  }
}

function applyTopicFields(key) {
  const spec = TOPICS[key] || TOPICS.ai;
  const custom = key === "custom";
  $("reKeep").readOnly = !custom;
  $("reWeak").readOnly = !custom;
  $("reDrop").readOnly = !custom;
  $("reKeep").classList.toggle("ro", !custom);
  $("reWeak").classList.toggle("ro", !custom);
  $("reDrop").classList.toggle("ro", !custom);
  if (!custom) {
    $("reKeep").value = spec.reKeep;
    $("reWeak").value = spec.reWeak;
    $("reDrop").value = spec.reDrop;
  }
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
  const cfg = await chrome.storage.local.get(DEFAULTS);
  $("target").value = cfg.target;
  $("delay").value = cfg.delay;
  $("filterMode").value = String(cfg.filterMode);
  $("autoStart").checked = !!cfg.autoStart;
  $("briefAuto").checked = !!cfg.briefAuto;
  $("builderUrl").value = cfg.builderUrl;
  $("builderUrlAlt").value = cfg.builderUrlAlt;
  $("linkedinEnabled").checked = !!cfg.linkedinEnabled;
  const topic = migrateTopic(cfg);
  $("topic").value = topic;
  if (topic === "custom") {
    $("reKeep").value = cfg.reKeep;
    $("reWeak").value = cfg.reWeak;
    $("reDrop").value = cfg.reDrop;
  }
  renderTopicCats(topic);
  applyTopicFields(topic);
}

async function save() {
  const topic = $("topic").value;
  const ok = ["Keep", "Weak", "Drop"]
    .map((k) => validateRe("re" + k, "err" + k))
    .every(Boolean);
  if (!ok) return;
  const cfg = {
    target: Math.max(1, parseInt($("target").value, 10) || DEFAULTS.target),
    delay: Math.min(5000, Math.max(200, parseInt($("delay").value, 10) || DEFAULTS.delay)),
    filterMode: parseInt($("filterMode").value, 10) ? 1 : 0,
    autoStart: $("autoStart").checked,
    topic,
    reKeep: $("reKeep").value.trim(),
    reWeak: $("reWeak").value.trim(),
    reDrop: $("reDrop").value.trim(),
    briefAuto: $("briefAuto").checked,
    builderUrl: $("builderUrl").value.trim() || DEFAULTS.builderUrl,
    builderUrlAlt: $("builderUrlAlt").value.trim() || DEFAULTS.builderUrlAlt,
    linkedinEnabled: $("linkedinEnabled").checked,
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
  $("briefAuto").checked = false;
  $("builderUrl").value = DEFAULTS.builderUrl;
  $("builderUrlAlt").value = DEFAULTS.builderUrlAlt;
  $("linkedinEnabled").checked = false;
  selectTopic("ai");
  $("filterMode").value = "0";
}

// 활성/대기 빌더 주소 교환 — VPS 주소를 지우지 않고 로컬 테스트로 전환한다
$("builderSwap").addEventListener("click", async () => {
  const active = $("builderUrl").value.trim() || DEFAULTS.builderUrl;
  const alt = $("builderUrlAlt").value.trim() || DEFAULTS.builderUrlAlt;
  $("builderUrl").value = alt;
  $("builderUrlAlt").value = active;
  await save();
});

$("save").addEventListener("click", save);
$("reset").addEventListener("click", () => {
  resetDefaults();
  save();
});
for (const k of ["Keep", "Weak", "Drop"]) {
  $("re" + k).addEventListener("input", () => validateRe("re" + k, "err" + k));
}
load();
