// Xsearch — 옵션 페이지
// 기본 정규식은 빌드 시 collector.js에서 추출해 주입된다 ({{RE_*}} 플레이스홀더).

const DEFAULT_REGEX = {
  reKeep: {{RE_KEEP}},
  reWeak: {{RE_WEAK}},
  reDrop: {{RE_DROP}},
};

const DEFAULTS = {
  target: 200,
  delay: 2000,
  filterMode: 0,
  autoStart: false,
  reKeep: "",
  reWeak: "",
  reDrop: "",
  briefAuto: false,
  builderUrl: "https://news.soverin.cloud",
  builderUsername: "xsearch",
  builderPassword: "",
};

const $ = (id) => document.getElementById(id);

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
  $("reKeep").value = cfg.reKeep;
  $("reWeak").value = cfg.reWeak;
  $("reDrop").value = cfg.reDrop;
  $("briefAuto").checked = !!cfg.briefAuto;
  $("builderUrl").value = cfg.builderUrl;
  $("builderUsername").value = cfg.builderUsername;
  $("builderPassword").value = cfg.builderPassword;
}

async function save() {
  const ok = ["Keep", "Weak", "Drop"]
    .map((k) => validateRe("re" + k, "err" + k))
    .every(Boolean);
  if (!ok) return;
  const cfg = {
    target: Math.max(1, parseInt($("target").value, 10) || DEFAULTS.target),
    delay: Math.min(5000, Math.max(200, parseInt($("delay").value, 10) || DEFAULTS.delay)),
    filterMode: parseInt($("filterMode").value, 10) ? 1 : 0,
    autoStart: $("autoStart").checked,
    reKeep: $("reKeep").value.trim(),
    reWeak: $("reWeak").value.trim(),
    reDrop: $("reDrop").value.trim(),
    briefAuto: $("briefAuto").checked,
    builderUrl: $("builderUrl").value.trim() || DEFAULTS.builderUrl,
    builderUsername: $("builderUsername").value.trim() || DEFAULTS.builderUsername,
    builderPassword: $("builderPassword").value,
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
  $("reKeep").value = DEFAULT_REGEX.reKeep;
  $("reWeak").value = DEFAULT_REGEX.reWeak;
  $("reDrop").value = DEFAULT_REGEX.reDrop;
  $("briefAuto").checked = false;
  $("builderUrl").value = DEFAULTS.builderUrl;
  $("builderUsername").value = DEFAULTS.builderUsername;
  $("builderPassword").value = DEFAULTS.builderPassword;
}

$("save").addEventListener("click", save);
$("reset").addEventListener("click", () => {
  resetDefaults();
  save();
});
for (const k of ["Keep", "Weak", "Drop"]) {
  $("re" + k).addEventListener("input", () => validateRe("re" + k, "err" + k));
}
load();
