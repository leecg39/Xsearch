// Xsearch — 옵션 페이지
// 토픽 프리셋은 빌드 시 src/topics.mjs에서 주입된다 ({"ai":{"name":"AI","short":"AI","reKeep":"\\bai\\b|인공지능|생성형|거대언어|언어모델|확산모델|초거대|딥러닝|머신러닝|강화학습|파인튜닝|임베딩|멀티모달|신경망|추론모델|프롬프트|claude|gpt|openai|anthropic|gemini|grok|\\bllm\\b|copilot|cursor|midjourney|perplexity|hugging.?face|transformer|langchain|llamaindex|crew.?ai|autogen|\\bllama\\b|mistral|qwen|deepseek|\\bsora\\b|runway|\\bsuno\\b|\\bpika\\b|\\bdevin\\b|windsurf|ollama|\\bvllm\\b|stable.?diffusion|fine.?tun|\\brag\\b|neural|deep.?learn|machine.?learn|robot|automat|vibe.?cod|\\bmcp\\b|semiconductor|quantum|github|docker|kubernetes|\\bpython\\b|\\brust\\b|kotlin|nextjs|supabase|vercel|n8n|zapier","reWeak":"\\bmeta\\b|\\bchip\\b|\\bmodel\\b|모델|\\btoken\\b|토큰|\\bagent\\b|에이전트|apple|google|microsoft|nvidia|tesla|\\bapi\\b|cloud|server|database|startup|스타트업|saas|crypto|blockchain|web3|\\bgpu\\b|\\bcpu\\b|cod(?:ing|e\\b|ex)|pipeline|embed|vector|swift|\\breact\\b|typescript","reDrop":"k.?pop|아이돌|컴백|팬사인|치킨|피자|배달|쿠폰|할인|이벤트|경품|추첨|야구|축구|농구|올림픽|월드컵|선거|대통령|국회|정당|탄핵|드라마|예능|웹툰|화장품|뷰티|패션|다이어트|iran|israel|gaza|ukraine|russia|missile|ceasefire|bomb(?:ing)?|troops|military|\\bwar\\b|mueller|impeach|\\bmaga\\b|democrat|republican|\\bsenate\\b|\\bcongress\\b|xbox|playstation|nintendo|esport|valorant|minecraft|league.of.legends|evangelion|anime(?!\\.js)|manga|cosplay|cortisol|\\bworkout\\b|anxiety|meditation|lemonade|dividend|hedge.","kwEn":"\\b(ai|ml|llm|gpt|agi|rl|sota|gpu|tpu)\\b|openai|chatgpt|claude|anthropic|gemini|deepmind|copilot|cursor|codex|grok|llama|mistral|qwen|deepseek|midjourney|diffusion|transformer|agentic|agents?\\b|benchmark|inference|fine-?tun|hugging ?face|nvidia|robotic|autonomous|prompt|token|dataset|neural|frontier model|open[- ]?weight","kwKo":"인공지능|생성형|거대언어|언어모델|모델|에이전트|프롬프트|추론|파인튜닝|벤치마크|반도체|로봇|자율주행|챗봇|오픈소스|코딩|개발자|딥러닝|머신러닝","kwJaZh":"人工知能|生成AI|エージェント|モデル|推論|人工智能|大模型|智能体|开源|推理"},"dev":{"name":"개발/테크","short":"개발","reKeep":"\\bgithub\\b|gitlab|docker|kubernetes|\\bk8s\\b|\\bpython\\b|\\brust\\b|kotlin|golang|\\bgo\\b|typescript|\\breact\\b|nextjs|next\\.js|nodejs|vuejs|svelte|linux|ubuntu|devops|ci.?cd|vscode|jetbrains|오픈소스|오픈.소스|프로그래밍|개발자|코딩|프레임워크|배포|리팩터|리팩토|풀스택|백엔드|프론트엔드|데이터베이스|postgres|mysql|redis|supabase|vercel|cloudflare|\\bwasm\\b|webassembly","reWeak":"\\bapi\\b|cloud|server|database|software|engineer|\\bcode\\b|bug|commit|repo|스택|라이브러리|패키지|apple|google|microsoft|amazon|aws|azure|\\bgpu\\b|\\bcpu\\b|pipeline|typescript|javascript","reDrop":"k.?pop|아이돌|컴백|팬사인|치킨|피자|배달|쿠폰|할인|이벤트|경품|추첨|야구|축구|농구|올림픽|월드컵|선거|대통령|국회|정당|탄핵|드라마|예능|웹툰|화장품|뷰티|패션|다이어트|iran|israel|gaza|ukraine|russia|missile|ceasefire|bomb(?:ing)?|troops|military|\\bwar\\b|mueller|impeach|\\bmaga\\b|democrat|republican|\\bsenate\\b|\\bcongress\\b|xbox|playstation|nintendo|esport|valorant|minecraft|league.of.legends|evangelion|anime(?!\\.js)|manga|cosplay|cortisol|\\bworkout\\b|anxiety|meditation|lemonade","kwEn":"\\b(github|gitlab|docker|kubernetes|python|rust|typescript|javascript|react|linux|devops|backend|frontend|refactor|postgres|redis)\\b|open.?source|vscode|nodejs|next\\.?js","kwKo":"개발|코딩|프로그래밍|오픈소스|프레임워크|배포|백엔드|프론트엔드|리팩터|데이터베이스|개발자","kwJaZh":"開発|プログラミング|オープンソース|フレームワーク|后端|前端|开源"},"finance":{"name":"경제/금융","short":"금융","reKeep":"연준|\\bfed\\b|\\bfomc\\b|기준금리|금리인하|금리인상|인플레이션|환율|코스피|코스닥|나스닥|nasdaq|s&p|다우|채권|국채|gdp|cpi|ppi|실업률|경기침체|리세션|실적발표|어닝|배당|etf|\\bfomc\\b|비트코인|이더리움|bitcoin|ethereum|\\bbtc\\b|\\beth\\b|환율|원달러|엔화|유가|wti|금값|금리","reWeak":"시장|투자|경제|금융|주식|증시|펀드|bank|stock|market|crypto|환율|실적|매출|영업이익|per|pbr|배당|hedge|dividend","reDrop":"k.?pop|아이돌|컴백|팬사인|치킨|피자|배달|쿠폰|할인|이벤트|경품|추첨|야구|축구|농구|올림픽|월드컵|선거|대통령|국회|정당|탄핵|드라마|예능|웹툰|화장품|뷰티|패션|다이어트|iran|israel|gaza|ukraine|russia|missile|ceasefire|bomb(?:ing)?|troops|military|\\bwar\\b|mueller|impeach|\\bmaga\\b|democrat|republican|\\bsenate\\b|\\bcongress\\b|xbox|playstation|nintendo|esport|valorant|minecraft|league.of.legends|evangelion|anime(?!\\.js)|manga|cosplay|cortisol|\\bworkout\\b|anxiety|meditation|lemonade","kwEn":"\\b(fed|fomc|cpi|gdp|nasdaq|inflation|recession|etf|yield|bitcoin|ethereum|btc|eth)\\b|interest rate|s&p|treasury","kwKo":"금리|인플레|환율|주식|증시|연준|코스피|채권|실적|배당|경기침체|비트코인|이더리움","kwJaZh":"金利|インフレ|為替|株価|景気|利率|通胀|股市"},"startup":{"name":"스타트업/비즈","short":"비즈","reKeep":"스타트업|유니콘|시리즈.?[abc]|펀딩|투자라운드|액셀러레이터|\\bycombinator\\b|\\byc\\b|시드투자|시드라운드|런웨이|피봇|product.?market|\\bpmf\\b|\\bm&a\\b|\\bipo\\b|인수합병|창업|saas|\\bb2b\\b|\\bb2c\\b|arr\\b|mrr\\b|그로스|go.to.market","reWeak":"startup|founder|vc\\b|venture|투자|사업|매출|고객|프로덕트|스타트업|엔젤|라운드|exit","reDrop":"k.?pop|아이돌|컴백|팬사인|치킨|피자|배달|쿠폰|할인|이벤트|경품|추첨|야구|축구|농구|올림픽|월드컵|선거|대통령|국회|정당|탄핵|드라마|예능|웹툰|화장품|뷰티|패션|다이어트|iran|israel|gaza|ukraine|russia|missile|ceasefire|bomb(?:ing)?|troops|military|\\bwar\\b|mueller|impeach|\\bmaga\\b|democrat|republican|\\bsenate\\b|\\bcongress\\b|xbox|playstation|nintendo|esport|valorant|minecraft|league.of.legends|evangelion|anime(?!\\.js)|manga|cosplay|cortisol|\\bworkout\\b|anxiety|meditation|lemonade","kwEn":"\\b(startup|founder|yc|saas|b2b|ipo|series [abc]|pmf|arr|mrr)\\b|y combinator|product.market|fundraising","kwKo":"스타트업|유니콘|펀딩|시리즈|창업|인수합병|액셀러레이터|런웨이|피봇|매출","kwJaZh":"スタートアップ|資金調達|起業|独角兽|创业"},"custom":{"name":"자유 입력","short":"자유","reKeep":"","reWeak":"","reDrop":"","kwEn":"","kwKo":"","kwJaZh":""}}).

const TOPICS = {"ai":{"name":"AI","short":"AI","reKeep":"\\bai\\b|인공지능|생성형|거대언어|언어모델|확산모델|초거대|딥러닝|머신러닝|강화학습|파인튜닝|임베딩|멀티모달|신경망|추론모델|프롬프트|claude|gpt|openai|anthropic|gemini|grok|\\bllm\\b|copilot|cursor|midjourney|perplexity|hugging.?face|transformer|langchain|llamaindex|crew.?ai|autogen|\\bllama\\b|mistral|qwen|deepseek|\\bsora\\b|runway|\\bsuno\\b|\\bpika\\b|\\bdevin\\b|windsurf|ollama|\\bvllm\\b|stable.?diffusion|fine.?tun|\\brag\\b|neural|deep.?learn|machine.?learn|robot|automat|vibe.?cod|\\bmcp\\b|semiconductor|quantum|github|docker|kubernetes|\\bpython\\b|\\brust\\b|kotlin|nextjs|supabase|vercel|n8n|zapier","reWeak":"\\bmeta\\b|\\bchip\\b|\\bmodel\\b|모델|\\btoken\\b|토큰|\\bagent\\b|에이전트|apple|google|microsoft|nvidia|tesla|\\bapi\\b|cloud|server|database|startup|스타트업|saas|crypto|blockchain|web3|\\bgpu\\b|\\bcpu\\b|cod(?:ing|e\\b|ex)|pipeline|embed|vector|swift|\\breact\\b|typescript","reDrop":"k.?pop|아이돌|컴백|팬사인|치킨|피자|배달|쿠폰|할인|이벤트|경품|추첨|야구|축구|농구|올림픽|월드컵|선거|대통령|국회|정당|탄핵|드라마|예능|웹툰|화장품|뷰티|패션|다이어트|iran|israel|gaza|ukraine|russia|missile|ceasefire|bomb(?:ing)?|troops|military|\\bwar\\b|mueller|impeach|\\bmaga\\b|democrat|republican|\\bsenate\\b|\\bcongress\\b|xbox|playstation|nintendo|esport|valorant|minecraft|league.of.legends|evangelion|anime(?!\\.js)|manga|cosplay|cortisol|\\bworkout\\b|anxiety|meditation|lemonade|dividend|hedge.","kwEn":"\\b(ai|ml|llm|gpt|agi|rl|sota|gpu|tpu)\\b|openai|chatgpt|claude|anthropic|gemini|deepmind|copilot|cursor|codex|grok|llama|mistral|qwen|deepseek|midjourney|diffusion|transformer|agentic|agents?\\b|benchmark|inference|fine-?tun|hugging ?face|nvidia|robotic|autonomous|prompt|token|dataset|neural|frontier model|open[- ]?weight","kwKo":"인공지능|생성형|거대언어|언어모델|모델|에이전트|프롬프트|추론|파인튜닝|벤치마크|반도체|로봇|자율주행|챗봇|오픈소스|코딩|개발자|딥러닝|머신러닝","kwJaZh":"人工知能|生成AI|エージェント|モデル|推論|人工智能|大模型|智能体|开源|推理"},"dev":{"name":"개발/테크","short":"개발","reKeep":"\\bgithub\\b|gitlab|docker|kubernetes|\\bk8s\\b|\\bpython\\b|\\brust\\b|kotlin|golang|\\bgo\\b|typescript|\\breact\\b|nextjs|next\\.js|nodejs|vuejs|svelte|linux|ubuntu|devops|ci.?cd|vscode|jetbrains|오픈소스|오픈.소스|프로그래밍|개발자|코딩|프레임워크|배포|리팩터|리팩토|풀스택|백엔드|프론트엔드|데이터베이스|postgres|mysql|redis|supabase|vercel|cloudflare|\\bwasm\\b|webassembly","reWeak":"\\bapi\\b|cloud|server|database|software|engineer|\\bcode\\b|bug|commit|repo|스택|라이브러리|패키지|apple|google|microsoft|amazon|aws|azure|\\bgpu\\b|\\bcpu\\b|pipeline|typescript|javascript","reDrop":"k.?pop|아이돌|컴백|팬사인|치킨|피자|배달|쿠폰|할인|이벤트|경품|추첨|야구|축구|농구|올림픽|월드컵|선거|대통령|국회|정당|탄핵|드라마|예능|웹툰|화장품|뷰티|패션|다이어트|iran|israel|gaza|ukraine|russia|missile|ceasefire|bomb(?:ing)?|troops|military|\\bwar\\b|mueller|impeach|\\bmaga\\b|democrat|republican|\\bsenate\\b|\\bcongress\\b|xbox|playstation|nintendo|esport|valorant|minecraft|league.of.legends|evangelion|anime(?!\\.js)|manga|cosplay|cortisol|\\bworkout\\b|anxiety|meditation|lemonade","kwEn":"\\b(github|gitlab|docker|kubernetes|python|rust|typescript|javascript|react|linux|devops|backend|frontend|refactor|postgres|redis)\\b|open.?source|vscode|nodejs|next\\.?js","kwKo":"개발|코딩|프로그래밍|오픈소스|프레임워크|배포|백엔드|프론트엔드|리팩터|데이터베이스|개발자","kwJaZh":"開発|プログラミング|オープンソース|フレームワーク|后端|前端|开源"},"finance":{"name":"경제/금융","short":"금융","reKeep":"연준|\\bfed\\b|\\bfomc\\b|기준금리|금리인하|금리인상|인플레이션|환율|코스피|코스닥|나스닥|nasdaq|s&p|다우|채권|국채|gdp|cpi|ppi|실업률|경기침체|리세션|실적발표|어닝|배당|etf|\\bfomc\\b|비트코인|이더리움|bitcoin|ethereum|\\bbtc\\b|\\beth\\b|환율|원달러|엔화|유가|wti|금값|금리","reWeak":"시장|투자|경제|금융|주식|증시|펀드|bank|stock|market|crypto|환율|실적|매출|영업이익|per|pbr|배당|hedge|dividend","reDrop":"k.?pop|아이돌|컴백|팬사인|치킨|피자|배달|쿠폰|할인|이벤트|경품|추첨|야구|축구|농구|올림픽|월드컵|선거|대통령|국회|정당|탄핵|드라마|예능|웹툰|화장품|뷰티|패션|다이어트|iran|israel|gaza|ukraine|russia|missile|ceasefire|bomb(?:ing)?|troops|military|\\bwar\\b|mueller|impeach|\\bmaga\\b|democrat|republican|\\bsenate\\b|\\bcongress\\b|xbox|playstation|nintendo|esport|valorant|minecraft|league.of.legends|evangelion|anime(?!\\.js)|manga|cosplay|cortisol|\\bworkout\\b|anxiety|meditation|lemonade","kwEn":"\\b(fed|fomc|cpi|gdp|nasdaq|inflation|recession|etf|yield|bitcoin|ethereum|btc|eth)\\b|interest rate|s&p|treasury","kwKo":"금리|인플레|환율|주식|증시|연준|코스피|채권|실적|배당|경기침체|비트코인|이더리움","kwJaZh":"金利|インフレ|為替|株価|景気|利率|通胀|股市"},"startup":{"name":"스타트업/비즈","short":"비즈","reKeep":"스타트업|유니콘|시리즈.?[abc]|펀딩|투자라운드|액셀러레이터|\\bycombinator\\b|\\byc\\b|시드투자|시드라운드|런웨이|피봇|product.?market|\\bpmf\\b|\\bm&a\\b|\\bipo\\b|인수합병|창업|saas|\\bb2b\\b|\\bb2c\\b|arr\\b|mrr\\b|그로스|go.to.market","reWeak":"startup|founder|vc\\b|venture|투자|사업|매출|고객|프로덕트|스타트업|엔젤|라운드|exit","reDrop":"k.?pop|아이돌|컴백|팬사인|치킨|피자|배달|쿠폰|할인|이벤트|경품|추첨|야구|축구|농구|올림픽|월드컵|선거|대통령|국회|정당|탄핵|드라마|예능|웹툰|화장품|뷰티|패션|다이어트|iran|israel|gaza|ukraine|russia|missile|ceasefire|bomb(?:ing)?|troops|military|\\bwar\\b|mueller|impeach|\\bmaga\\b|democrat|republican|\\bsenate\\b|\\bcongress\\b|xbox|playstation|nintendo|esport|valorant|minecraft|league.of.legends|evangelion|anime(?!\\.js)|manga|cosplay|cortisol|\\bworkout\\b|anxiety|meditation|lemonade","kwEn":"\\b(startup|founder|yc|saas|b2b|ipo|series [abc]|pmf|arr|mrr)\\b|y combinator|product.market|fundraising","kwKo":"스타트업|유니콘|펀딩|시리즈|창업|인수합병|액셀러레이터|런웨이|피봇|매출","kwJaZh":"スタートアップ|資金調達|起業|独角兽|创业"},"custom":{"name":"자유 입력","short":"자유","reKeep":"","reWeak":"","reDrop":"","kwEn":"","kwKo":"","kwJaZh":""}};

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
