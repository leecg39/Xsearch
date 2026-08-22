// Xsearch — 옵션 페이지
// 토픽 프리셋은 빌드 시 src/topics.mjs에서 JSON으로 주입된다 ({"ai":{"name":"AI","reKeep":"\\bai\\b|인공지능|생성형|거대언어|언어모델|확산모델|초거대|딥러닝|머신러닝|강화학습|파인튜닝|임베딩|멀티모달|신경망|추론모델|프롬프트|claude|gpt|openai|anthropic|gemini|grok|\\bllm\\b|copilot|cursor|midjourney|perplexity|hugging.?face|transformer|langchain|llamaindex|crew.?ai|autogen|\\bllama\\b|mistral|qwen|deepseek|\\bsora\\b|runway|\\bsuno\\b|\\bpika\\b|\\bdevin\\b|windsurf|ollama|\\bvllm\\b|stable.?diffusion|fine.?tun|\\brag\\b|neural|deep.?learn|machine.?learn|robot|automat|vibe.?cod|\\bmcp\\b|semiconductor|quantum|github|docker|kubernetes|\\bpython\\b|\\brust\\b|kotlin|nextjs|supabase|vercel|n8n|zapier","reWeak":"\\bmeta\\b|\\bchip\\b|\\bmodel\\b|모델|\\btoken\\b|토큰|\\bagent\\b|에이전트|apple|google|microsoft|nvidia|tesla|\\bapi\\b|cloud|server|database|startup|스타트업|saas|crypto|blockchain|web3|\\bgpu\\b|\\bcpu\\b|cod(?:ing|e\\b|ex)|pipeline|embed|vector|swift|\\breact\\b|typescript","reDrop":"k.?pop|아이돌|카백|팬사인|치킨|피자|배달|쿠폰|할인|이벤트|경품|추첨|야구|축구|농구|올림픽|월드컵|선거|대통령|국회|정당|탄핵|드라마|예능|웹툰|화장품|뷰티|패션|다이어트|iran|israel|gaza|ukraine|russia|missile|ceasefire|bomb(?:ing)?|troops|military|\\bwar\\b|mueller|impeach|\\bmaga\\b|democrat|republican|\\bsenate\\b|\\bcongress\\b|xbox|playstation|nintendo|esport|valorant|minecraft|league.of.legends|evangelion|anime(?!\\.js)|manga|cosplay|cortisol|\\bworkout\\b|anxiety|meditation|lemonade|dividend|hedge.fund","kw":{"en":"\\b(ai|ml|llm|gpt|agi|rl|sota|gpu|tpu)\\b|openai|chatgpt|claude|anthropic|gemini|deepmind|copilot|cursor|codex|grok|llama|mistral|qwen|deepseek|midjourney|diffusion|transformer|agentic|agents?\\b|benchmark|inference|fine-?tun|hugging ?face|nvidia|robotic|autonomous|prompt|token|dataset|neural|frontier model|open[- ]?weight","ko":"인공지능|생성형|거대언어|언어모델|모델|에이전트|프롬프트|추론|파인튜닝|벤치마크|반도체|로봇|자율주행|챗봇|오픈소스|코딩|개발자|딥러닝|머신러닝","jazh":"人工知能|生成AI|エージェント|モデル|推論|人工智能|大模型|智能体|开源|推理"}},"dev":{"name":"개발/테크","reKeep":"개발자|프로그래밍|코딩|오픈소스|깃허브|리팩토링|디버깅|배포했|github|gitlab|\\bgit\\b|docker|kubernetes|\\bk8s\\b|devops|cicd|ci/cd|\\bapi\\b|\\bsdk\\b|\\bcli\\b|open.?source|changelog|\\bpython\\b|javascript|typescript|\\brust\\b|golang|\\bjava\\b|kotlin|swift|\\bc\\+\\+\\b|\\breact\\b|\\bvue\\b|svelte|nextjs|nuxt|node\\.?js|deno|\\bbun\\b|webpack|vite|tailwind|postgres|mysql|sqlite|redis|mongodb|graphql|supabase|firebase|vercel|netlify|cloudflare|\\baws\\b|\\bgcp\\b|azure|terraform|linux","reWeak":"서버|데이터베이스|클라우드|백엔드|프론트엔드|풀스택|커밋|머지|배포|server|database|cloud|backend|frontend|full.?stack|commit|merge|deploy|pipeline|framework|library|package|\\bnpm\\b|pnpm|yarn|regex|algorithm|vscode|\\bide\\b|terminal|소프트웨어|software|테크|\\btech\\b","reDrop":"k.?pop|아이돌|카백|팬사인|치킨|피자|배달|쿠폰|할인|이벤트|경품|추첨|야구|축구|농구|올림픽|월드컵|선거|대통령|국회|정당|탄핵|드라마|예능|웹툰|화장품|뷰티|패션|다이어트|iran|israel|gaza|ukraine|russia|missile|ceasefire|bomb(?:ing)?|troops|military|\\bwar\\b|mueller|impeach|\\bmaga\\b|democrat|republican|\\bsenate\\b|\\bcongress\\b|xbox|playstation|nintendo|esport|valorant|minecraft|league.of.legends|evangelion|anime(?!\\.js)|manga|cosplay|cortisol|\\bworkout\\b|anxiety|meditation|lemonade|dividend|hedge.fund","kw":{"en":"\\b(dev|developer|coding|programming|software|github|docker|kubernetes|api|sdk|framework|backend|frontend|deploy|release|opensource)\\b|open[- ]?source|typescript|javascript|\\bpython\\b|\\brust\\b|golang|kotlin|\\breact\\b|nextjs|node\\.?js","ko":"개발|개발자|코딩|프로그래밍|오픈소스|배포|백엔드|프론트엔드|서버|데이터베이스|클라우드|소프트웨어","jazh":"開発|コーディング|オープンソース|デプロイ|ソフトウェア|开发|开源|部署|软件"}},"finance":{"name":"경제/금융","reKeep":"주식|증시|코스피|코스닥|나스닥|환율|금리|인플레|물가|연준|한국은행|채권|배당|재테크|비트코인|이더리움|코인|가상자산|암호화폐|관세|무역|수출입|nasdaq|s&p|dow jones|\\bfed\\b|fomc|interest rate|inflation|\\bcpi\\b|\\bpce\\b|bond|treasury|yield|dividend|earnings|\\bipo\\b|bitcoin|ethereum|crypto|stablecoin|\\betf\\b|recession|\\bgdp\\b|tariff|hedge.fund","reWeak":"달러|엔화|위안화|유가|금값|원자재|부동산|경기|고용|실업|매출|실적|시가총액|경제|투자|펀드|market|economy|dollar|yen|\\boil\\b|gold|real estate|employment|revenue|market cap|fund|investor|주가","reDrop":"k.?pop|아이돌|카백|팬사인|치킨|피자|배달|쿠폰|할인|이벤트|경품|추첨|야구|축구|농구|올림픽|월드컵|선거|대통령|국회|정당|탄핵|드라마|예능|웹툰|화장품|뷰티|패션|다이어트|iran|israel|gaza|ukraine|russia|missile|ceasefire|bomb(?:ing)?|troops|military|\\bwar\\b|mueller|impeach|\\bmaga\\b|democrat|republican|\\bsenate\\b|\\bcongress\\b|xbox|playstation|nintendo|esport|valorant|minecraft|league.of.legends|evangelion|anime(?!\\.js)|manga|cosplay|cortisol|\\bworkout\\b|anxiety|meditation|lemonade","kw":{"en":"\\b(stock|stocks|market|fed|fomc|inflation|bond|yield|earnings|ipo|etf|bitcoin|ethereum|crypto|tariff|gdp|recession|dividend)\\b|nasdaq|s&p ?500|interest rate","ko":"주식|증시|코스피|나스닥|금리|환율|인플레|경제|연준|채권|배당|투자|비트코인|코인|관세|실적","jazh":"株式|株価|金利|利上げ|利下げ|経済|股票|利率|经济|通胀"}},"startup":{"name":"스타트업/비즈","reKeep":"스타트업|창업|시드 투자|시리즈|투자 유치|펀딩|밸류에이션|유니콘|엑싯|인수합병|피봇|startup|founder|co-?founder|seed round|series [a-e]\\b|funding|raised|valuation|unicorn|\\bacquisition\\b|merger|m&a|pivot|y combinator|demo day|venture capital|\\bvc\\b|\\bsaas\\b|\\barr\\b|\\bmrr\\b|churn|product[- ]market fit|런칭|launch","reWeak":"매출|성장|사용자|구독|비즈니스|사업|기업가|마케팅|그로스|채용|제품 출시|revenue|growth|users|subscriber|business|marketing|hiring|product|roadmap|\\bb2b\\b|\\bb2c\\b|출시","reDrop":"k.?pop|아이돌|카백|팬사인|치킨|피자|배달|쿠폰|할인|이벤트|경품|추첨|야구|축구|농구|올림픽|월드컵|선거|대통령|국회|정당|탄핵|드라마|예능|웹툰|화장품|뷰티|패션|다이어트|iran|israel|gaza|ukraine|russia|missile|ceasefire|bomb(?:ing)?|troops|military|\\bwar\\b|mueller|impeach|\\bmaga\\b|democrat|republican|\\bsenate\\b|\\bcongress\\b|xbox|playstation|nintendo|esport|valorant|minecraft|league.of.legends|evangelion|anime(?!\\.js)|manga|cosplay|cortisol|\\bworkout\\b|anxiety|meditation|lemonade|dividend|hedge.fund","kw":{"en":"\\b(startup|startups|founder|funding|raised|valuation|unicorn|acquisition|saas|venture|launch)\\b|series [a-e]|seed round|product[- ]market fit","ko":"스타트업|창업|투자 유치|펀딩|유니콘|인수|합병|출시|런칭|매출","jazh":"スタートアップ|創業|資金調達|買収|创业|融资|收购|初创"}},"custom":{"name":"자유 입력","reKeep":"","reWeak":"","reDrop":"","kw":{"en":"","ko":"","jazh":""}}}).

const TOPICS = {"ai":{"name":"AI","reKeep":"\\bai\\b|인공지능|생성형|거대언어|언어모델|확산모델|초거대|딥러닝|머신러닝|강화학습|파인튜닝|임베딩|멀티모달|신경망|추론모델|프롬프트|claude|gpt|openai|anthropic|gemini|grok|\\bllm\\b|copilot|cursor|midjourney|perplexity|hugging.?face|transformer|langchain|llamaindex|crew.?ai|autogen|\\bllama\\b|mistral|qwen|deepseek|\\bsora\\b|runway|\\bsuno\\b|\\bpika\\b|\\bdevin\\b|windsurf|ollama|\\bvllm\\b|stable.?diffusion|fine.?tun|\\brag\\b|neural|deep.?learn|machine.?learn|robot|automat|vibe.?cod|\\bmcp\\b|semiconductor|quantum|github|docker|kubernetes|\\bpython\\b|\\brust\\b|kotlin|nextjs|supabase|vercel|n8n|zapier","reWeak":"\\bmeta\\b|\\bchip\\b|\\bmodel\\b|모델|\\btoken\\b|토큰|\\bagent\\b|에이전트|apple|google|microsoft|nvidia|tesla|\\bapi\\b|cloud|server|database|startup|스타트업|saas|crypto|blockchain|web3|\\bgpu\\b|\\bcpu\\b|cod(?:ing|e\\b|ex)|pipeline|embed|vector|swift|\\breact\\b|typescript","reDrop":"k.?pop|아이돌|카백|팬사인|치킨|피자|배달|쿠폰|할인|이벤트|경품|추첨|야구|축구|농구|올림픽|월드컵|선거|대통령|국회|정당|탄핵|드라마|예능|웹툰|화장품|뷰티|패션|다이어트|iran|israel|gaza|ukraine|russia|missile|ceasefire|bomb(?:ing)?|troops|military|\\bwar\\b|mueller|impeach|\\bmaga\\b|democrat|republican|\\bsenate\\b|\\bcongress\\b|xbox|playstation|nintendo|esport|valorant|minecraft|league.of.legends|evangelion|anime(?!\\.js)|manga|cosplay|cortisol|\\bworkout\\b|anxiety|meditation|lemonade|dividend|hedge.fund","kw":{"en":"\\b(ai|ml|llm|gpt|agi|rl|sota|gpu|tpu)\\b|openai|chatgpt|claude|anthropic|gemini|deepmind|copilot|cursor|codex|grok|llama|mistral|qwen|deepseek|midjourney|diffusion|transformer|agentic|agents?\\b|benchmark|inference|fine-?tun|hugging ?face|nvidia|robotic|autonomous|prompt|token|dataset|neural|frontier model|open[- ]?weight","ko":"인공지능|생성형|거대언어|언어모델|모델|에이전트|프롬프트|추론|파인튜닝|벤치마크|반도체|로봇|자율주행|챗봇|오픈소스|코딩|개발자|딥러닝|머신러닝","jazh":"人工知能|生成AI|エージェント|モデル|推論|人工智能|大模型|智能体|开源|推理"}},"dev":{"name":"개발/테크","reKeep":"개발자|프로그래밍|코딩|오픈소스|깃허브|리팩토링|디버깅|배포했|github|gitlab|\\bgit\\b|docker|kubernetes|\\bk8s\\b|devops|cicd|ci/cd|\\bapi\\b|\\bsdk\\b|\\bcli\\b|open.?source|changelog|\\bpython\\b|javascript|typescript|\\brust\\b|golang|\\bjava\\b|kotlin|swift|\\bc\\+\\+\\b|\\breact\\b|\\bvue\\b|svelte|nextjs|nuxt|node\\.?js|deno|\\bbun\\b|webpack|vite|tailwind|postgres|mysql|sqlite|redis|mongodb|graphql|supabase|firebase|vercel|netlify|cloudflare|\\baws\\b|\\bgcp\\b|azure|terraform|linux","reWeak":"서버|데이터베이스|클라우드|백엔드|프론트엔드|풀스택|커밋|머지|배포|server|database|cloud|backend|frontend|full.?stack|commit|merge|deploy|pipeline|framework|library|package|\\bnpm\\b|pnpm|yarn|regex|algorithm|vscode|\\bide\\b|terminal|소프트웨어|software|테크|\\btech\\b","reDrop":"k.?pop|아이돌|카백|팬사인|치킨|피자|배달|쿠폰|할인|이벤트|경품|추첨|야구|축구|농구|올림픽|월드컵|선거|대통령|국회|정당|탄핵|드라마|예능|웹툰|화장품|뷰티|패션|다이어트|iran|israel|gaza|ukraine|russia|missile|ceasefire|bomb(?:ing)?|troops|military|\\bwar\\b|mueller|impeach|\\bmaga\\b|democrat|republican|\\bsenate\\b|\\bcongress\\b|xbox|playstation|nintendo|esport|valorant|minecraft|league.of.legends|evangelion|anime(?!\\.js)|manga|cosplay|cortisol|\\bworkout\\b|anxiety|meditation|lemonade|dividend|hedge.fund","kw":{"en":"\\b(dev|developer|coding|programming|software|github|docker|kubernetes|api|sdk|framework|backend|frontend|deploy|release|opensource)\\b|open[- ]?source|typescript|javascript|\\bpython\\b|\\brust\\b|golang|kotlin|\\breact\\b|nextjs|node\\.?js","ko":"개발|개발자|코딩|프로그래밍|오픈소스|배포|백엔드|프론트엔드|서버|데이터베이스|클라우드|소프트웨어","jazh":"開発|コーディング|オープンソース|デプロイ|ソフトウェア|开发|开源|部署|软件"}},"finance":{"name":"경제/금융","reKeep":"주식|증시|코스피|코스닥|나스닥|환율|금리|인플레|물가|연준|한국은행|채권|배당|재테크|비트코인|이더리움|코인|가상자산|암호화폐|관세|무역|수출입|nasdaq|s&p|dow jones|\\bfed\\b|fomc|interest rate|inflation|\\bcpi\\b|\\bpce\\b|bond|treasury|yield|dividend|earnings|\\bipo\\b|bitcoin|ethereum|crypto|stablecoin|\\betf\\b|recession|\\bgdp\\b|tariff|hedge.fund","reWeak":"달러|엔화|위안화|유가|금값|원자재|부동산|경기|고용|실업|매출|실적|시가총액|경제|투자|펀드|market|economy|dollar|yen|\\boil\\b|gold|real estate|employment|revenue|market cap|fund|investor|주가","reDrop":"k.?pop|아이돌|카백|팬사인|치킨|피자|배달|쿠폰|할인|이벤트|경품|추첨|야구|축구|농구|올림픽|월드컵|선거|대통령|국회|정당|탄핵|드라마|예능|웹툰|화장품|뷰티|패션|다이어트|iran|israel|gaza|ukraine|russia|missile|ceasefire|bomb(?:ing)?|troops|military|\\bwar\\b|mueller|impeach|\\bmaga\\b|democrat|republican|\\bsenate\\b|\\bcongress\\b|xbox|playstation|nintendo|esport|valorant|minecraft|league.of.legends|evangelion|anime(?!\\.js)|manga|cosplay|cortisol|\\bworkout\\b|anxiety|meditation|lemonade","kw":{"en":"\\b(stock|stocks|market|fed|fomc|inflation|bond|yield|earnings|ipo|etf|bitcoin|ethereum|crypto|tariff|gdp|recession|dividend)\\b|nasdaq|s&p ?500|interest rate","ko":"주식|증시|코스피|나스닥|금리|환율|인플레|경제|연준|채권|배당|투자|비트코인|코인|관세|실적","jazh":"株式|株価|金利|利上げ|利下げ|経済|股票|利率|经济|通胀"}},"startup":{"name":"스타트업/비즈","reKeep":"스타트업|창업|시드 투자|시리즈|투자 유치|펀딩|밸류에이션|유니콘|엑싯|인수합병|피봇|startup|founder|co-?founder|seed round|series [a-e]\\b|funding|raised|valuation|unicorn|\\bacquisition\\b|merger|m&a|pivot|y combinator|demo day|venture capital|\\bvc\\b|\\bsaas\\b|\\barr\\b|\\bmrr\\b|churn|product[- ]market fit|런칭|launch","reWeak":"매출|성장|사용자|구독|비즈니스|사업|기업가|마케팅|그로스|채용|제품 출시|revenue|growth|users|subscriber|business|marketing|hiring|product|roadmap|\\bb2b\\b|\\bb2c\\b|출시","reDrop":"k.?pop|아이돌|카백|팬사인|치킨|피자|배달|쿠폰|할인|이벤트|경품|추첨|야구|축구|농구|올림픽|월드컵|선거|대통령|국회|정당|탄핵|드라마|예능|웹툰|화장품|뷰티|패션|다이어트|iran|israel|gaza|ukraine|russia|missile|ceasefire|bomb(?:ing)?|troops|military|\\bwar\\b|mueller|impeach|\\bmaga\\b|democrat|republican|\\bsenate\\b|\\bcongress\\b|xbox|playstation|nintendo|esport|valorant|minecraft|league.of.legends|evangelion|anime(?!\\.js)|manga|cosplay|cortisol|\\bworkout\\b|anxiety|meditation|lemonade|dividend|hedge.fund","kw":{"en":"\\b(startup|startups|founder|funding|raised|valuation|unicorn|acquisition|saas|venture|launch)\\b|series [a-e]|seed round|product[- ]market fit","ko":"스타트업|창업|투자 유치|펀딩|유니콘|인수|합병|출시|런칭|매출","jazh":"スタートアップ|創業|資金調達|買収|创业|融资|收购|初创"}},"custom":{"name":"자유 입력","reKeep":"","reWeak":"","reDrop":"","kw":{"en":"","ko":"","jazh":""}}};

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
