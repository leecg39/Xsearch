// 토픽 프리셋 단일 소스 — collector(번들) · 확장 옵션(JSON 인라인) · newsgen이 공유한다.

const AI_KEEP =
  String.raw`\bai\b|인공지능|생성형|거대언어|언어모델|확산모델|초거대|딥러닝|머신러닝|강화학습|파인튜닝|임베딩|멀티모달|신경망|추론모델|프롬프트|claude|gpt|openai|anthropic|gemini|grok|\bllm\b|copilot|cursor|midjourney|perplexity|hugging.?face|transformer|langchain|llamaindex|crew.?ai|autogen|\bllama\b|mistral|qwen|deepseek|\bsora\b|runway|\bsuno\b|\bpika\b|\bdevin\b|windsurf|ollama|\bvllm\b|stable.?diffusion|fine.?tun|\brag\b|neural|deep.?learn|machine.?learn|robot|automat|vibe.?cod|\bmcp\b|semiconductor|quantum|github|docker|kubernetes|\bpython\b|\brust\b|kotlin|nextjs|supabase|vercel|n8n|zapier`;

const AI_WEAK =
  String.raw`\bmeta\b|\bchip\b|\bmodel\b|모델|\btoken\b|토큰|\bagent\b|에이전트|apple|google|microsoft|nvidia|tesla|\bapi\b|cloud|server|database|startup|스타트업|saas|crypto|blockchain|web3|\bgpu\b|\bcpu\b|cod(?:ing|e\b|ex)|pipeline|embed|vector|swift|\breact\b|typescript`;

const NOISE_DROP =
  String.raw`k.?pop|아이돌|컴백|팬사인|치킨|피자|배달|쿠폰|할인|이벤트|경품|추첨|야구|축구|농구|올림픽|월드컵|선거|대통령|국회|정당|탄핵|드라마|예능|웹툰|화장품|뷰티|패션|다이어트|iran|israel|gaza|ukraine|russia|missile|ceasefire|bomb(?:ing)?|troops|military|\bwar\b|mueller|impeach|\bmaga\b|democrat|republican|\bsenate\b|\bcongress\b|xbox|playstation|nintendo|esport|valorant|minecraft|league.of.legends|evangelion|anime(?!\.js)|manga|cosplay|cortisol|\bworkout\b|anxiety|meditation|lemonade`;

const AI_DROP = NOISE_DROP + String.raw`|dividend|hedge.`;

export const TOPIC_KEYS = ["ai", "dev", "finance", "startup", "custom"];

/** 수집 패널·옵션 UI용 관심사 칩 (custom 제외 — 정규식은 옵션에서만) */
export const INTEREST_CHOICES = [
  { key: "ai", short: "AI", name: "AI" },
  { key: "dev", short: "개발", name: "개발/테크" },
  { key: "finance", short: "금융", name: "경제/금융" },
  { key: "startup", short: "비즈", name: "스타트업/비즈" },
];

export const TOPICS = {
  ai: {
    name: "AI",
    short: "AI",
    reKeep: AI_KEEP,
    reWeak: AI_WEAK,
    reDrop: AI_DROP,
    kwEn: String.raw`\b(ai|ml|llm|gpt|agi|rl|sota|gpu|tpu)\b|openai|chatgpt|claude|anthropic|gemini|deepmind|copilot|cursor|codex|grok|llama|mistral|qwen|deepseek|midjourney|diffusion|transformer|agentic|agents?\b|benchmark|inference|fine-?tun|hugging ?face|nvidia|robotic|autonomous|prompt|token|dataset|neural|frontier model|open[- ]?weight`,
    kwKo: "인공지능|생성형|거대언어|언어모델|모델|에이전트|프롬프트|추론|파인튜닝|벤치마크|반도체|로봇|자율주행|챗봇|오픈소스|코딩|개발자|딥러닝|머신러닝",
    kwJaZh: "人工知能|生成AI|エージェント|モデル|推論|人工智能|大模型|智能体|开源|推理",
  },
  dev: {
    name: "개발/테크",
    short: "개발",
    reKeep:
      String.raw`\bgithub\b|gitlab|docker|kubernetes|\bk8s\b|\bpython\b|\brust\b|kotlin|golang|\bgo\b|typescript|\breact\b|nextjs|next\.js|nodejs|vuejs|svelte|linux|ubuntu|devops|ci.?cd|vscode|jetbrains|오픈소스|오픈.소스|프로그래밍|개발자|코딩|프레임워크|배포|리팩터|리팩토|풀스택|백엔드|프론트엔드|데이터베이스|postgres|mysql|redis|supabase|vercel|cloudflare|\bwasm\b|webassembly`,
    reWeak:
      String.raw`\bapi\b|cloud|server|database|software|engineer|\bcode\b|bug|commit|repo|스택|라이브러리|패키지|apple|google|microsoft|amazon|aws|azure|\bgpu\b|\bcpu\b|pipeline|typescript|javascript`,
    reDrop: NOISE_DROP,
    kwEn: String.raw`\b(github|gitlab|docker|kubernetes|python|rust|typescript|javascript|react|linux|devops|backend|frontend|refactor|postgres|redis)\b|open.?source|vscode|nodejs|next\.?js`,
    kwKo: "개발|코딩|프로그래밍|오픈소스|프레임워크|배포|백엔드|프론트엔드|리팩터|데이터베이스|개발자",
    kwJaZh: "開発|プログラミング|オープンソース|フレームワーク|后端|前端|开源",
  },
  finance: {
    name: "경제/금융",
    short: "금융",
    reKeep:
      String.raw`연준|\bfed\b|\bfomc\b|기준금리|금리인하|금리인상|인플레이션|환율|코스피|코스닥|나스닥|nasdaq|s&p|다우|채권|국채|gdp|cpi|ppi|실업률|경기침체|리세션|실적발표|어닝|배당|etf|\bfomc\b|비트코인|이더리움|bitcoin|ethereum|\bbtc\b|\beth\b|환율|원달러|엔화|유가|wti|금값|금리`,
    reWeak:
      String.raw`시장|투자|경제|금융|주식|증시|펀드|bank|stock|market|crypto|환율|실적|매출|영업이익|per|pbr|배당|hedge|dividend`,
    reDrop: NOISE_DROP,
    kwEn: String.raw`\b(fed|fomc|cpi|gdp|nasdaq|inflation|recession|etf|yield|bitcoin|ethereum|btc|eth)\b|interest rate|s&p|treasury`,
    kwKo: "금리|인플레|환율|주식|증시|연준|코스피|채권|실적|배당|경기침체|비트코인|이더리움",
    kwJaZh: "金利|インフレ|為替|株価|景気|利率|通胀|股市",
  },
  startup: {
    name: "스타트업/비즈",
    short: "비즈",
    reKeep:
      String.raw`스타트업|유니콘|시리즈.?[abc]|펀딩|투자라운드|액셀러레이터|\bycombinator\b|\byc\b|시드투자|시드라운드|런웨이|피봇|product.?market|\bpmf\b|\bm&a\b|\bipo\b|인수합병|창업|saas|\bb2b\b|\bb2c\b|arr\b|mrr\b|그로스|go.to.market`,
    reWeak:
      String.raw`startup|founder|vc\b|venture|투자|사업|매출|고객|프로덕트|스타트업|엔젤|라운드|exit`,
    reDrop: NOISE_DROP,
    kwEn: String.raw`\b(startup|founder|yc|saas|b2b|ipo|series [abc]|pmf|arr|mrr)\b|y combinator|product.market|fundraising`,
    kwKo: "스타트업|유니콘|펀딩|시리즈|창업|인수합병|액셀러레이터|런웨이|피봇|매출",
    kwJaZh: "スタートアップ|資金調達|起業|独角兽|创业",
  },
  custom: {
    name: "자유 입력",
    short: "자유",
    reKeep: "",
    reWeak: "",
    reDrop: "",
    kwEn: "",
    kwKo: "",
    kwJaZh: "",
  },
};

const NEVER = /$^/;

export function topicOf(key) {
  return TOPICS[key] || TOPICS.ai;
}

export function compileRe(src, fallback) {
  if (src == null || src === "") {
    return fallback || NEVER;
  }
  try {
    return new RegExp(src, "i");
  } catch {
    return fallback || NEVER;
  }
}

/**
 * EXT.topic + 커스텀 정규식 → RE 3종.
 * custom이거나 알 수 없는 키면 전달된 reKeep/reWeak/reDrop을 쓰고, 깨진 식은 프리셋(또는 NEVER)로 폴백.
 */
export function resolveTopicFilters(topicKey, custom = {}) {
  const key = TOPIC_KEYS.includes(topicKey) ? topicKey : "ai";
  const preset = topicOf(key);
  if (key === "custom") {
    return {
      key: "custom",
      name: preset.name,
      RE_KEEP: compileRe(custom.reKeep, NEVER),
      RE_WEAK: compileRe(custom.reWeak, NEVER),
      RE_DROP: compileRe(custom.reDrop, NEVER),
    };
  }
  return {
    key,
    name: preset.name,
    RE_KEEP: compileRe(custom.reKeep || preset.reKeep, compileRe(preset.reKeep)),
    RE_WEAK: compileRe(custom.reWeak || preset.reWeak, compileRe(preset.reWeak)),
    RE_DROP: compileRe(custom.reDrop || preset.reDrop, compileRe(preset.reDrop)),
  };
}

export function topicHits(text, topicKey = "ai") {
  if (!text) return 0;
  const spec = topicOf(topicKey);
  const en = compileRe(spec.kwEn, NEVER);
  const ko = compileRe(spec.kwKo, NEVER);
  const zh = compileRe(spec.kwJaZh, NEVER);
  let hits = 0;
  if (spec.kwEn && en.test(text)) hits++;
  if (spec.kwKo && ko.test(text)) hits++;
  if (spec.kwJaZh && zh.test(text)) hits++;
  if (spec.kwEn) {
    const multi = (text.match(new RegExp(en.source, "gi")) || []).length;
    if (multi >= 3) hits++;
  }
  return Math.min(hits, 3);
}

export function migrateTopic(cfg) {
  if (cfg && TOPIC_KEYS.includes(cfg.topic)) return cfg.topic;
  if (cfg && (cfg.reKeep || cfg.reWeak || cfg.reDrop)) return "custom";
  return "ai";
}
