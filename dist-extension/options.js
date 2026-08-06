// Xsearch — 옵션 페이지
// 기본 정규식은 빌드 시 collector.js에서 추출해 주입된다 ({{RE_*}} 플레이스홀더).

const DEFAULT_REGEX = {
  reKeep: "\\bai\\b|인공지능|생성형|거대언어|언어모델|확산모델|초거대|딥러닝|머신러닝|강화학습|파인튜닝|임베딩|멀티모달|신경망|추론모델|프롬프트|claude|gpt|openai|anthropic|gemini|grok|\\bllm\\b|copilot|cursor|midjourney|perplexity|hugging.?face|transformer|langchain|llamaindex|crew.?ai|autogen|\\bllama\\b|mistral|qwen|deepseek|\\bsora\\b|runway|\\bsuno\\b|\\bpika\\b|\\bdevin\\b|windsurf|ollama|\\bvllm\\b|stable.?diffusion|fine.?tun|\\brag\\b|neural|deep.?learn|machine.?learn|robot|automat|vibe.?cod|\\bmcp\\b|semiconductor|quantum|github|docker|kubernetes|\\bpython\\b|\\brust\\b|kotlin|nextjs|supabase|vercel|n8n|zapier",
  reWeak: "\\bmeta\\b|\\bchip\\b|\\bmodel\\b|모델|\\btoken\\b|토큰|\\bagent\\b|에이전트|apple|google|microsoft|nvidia|tesla|\\bapi\\b|cloud|server|database|startup|스타트업|saas|crypto|blockchain|web3|\\bgpu\\b|\\bcpu\\b|cod(?:ing|e\\b|ex)|pipeline|embed|vector|swift|\\breact\\b|typescript",
  reDrop: "k.?pop|아이돌|컴백|팬사인|치킨|피자|배달|쿠폰|할인|이벤트|경품|추첨|야구|축구|농구|올림픽|월드컵|선거|대통령|국회|정당|탄핵|드라마|예능|웹툰|화장품|뷰티|패션|다이어트|iran|israel|gaza|ukraine|russia|missile|ceasefire|bomb(?:ing)?|troops|military|\\bwar\\b|mueller|impeach|\\bmaga\\b|democrat|republican|\\bsenate\\b|\\bcongress\\b|xbox|playstation|nintendo|esport|valorant|minecraft|league.of.legends|evangelion|anime(?!\\.js)|manga|cosplay|cortisol|\\bworkout\\b|anxiety|meditation|lemonade|dividend|hedge.fund",
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
  builderUrl: "http://127.0.0.1:8787",
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
