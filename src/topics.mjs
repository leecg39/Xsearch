// Xsearch 토픽 프리셋 — 수집 필터(reKeep/reWeak/reDrop)와 newsgen 관련도 키워드(kw)의 단일 소스.
// 브라우저 스크립트(collector.js, options.js)에는 빌드 시 JSON으로 인라인되고,
// newsgen(Node ESM)은 이 파일을 직접 import한다.
// 정규식은 모두 소스 "문자열"로 관리한다 (new RegExp(src, 'i')로 컴파일해 사용).
// 영어는 \b 경계, 한글/CJK는 부분 일치 (\b는 한글에 동작하지 않음).

// 공통 제외 주제 (연예·스포츠·정치·전쟁·게임·건강 등). 토픽별로 일부 항목을 되살릴 수 있다.
const BASE_DROP =
  'k.?pop|아이돌|카백|팬사인|치킨|피자|배달|쿠폰|할인|이벤트|경품|추첨|야구|축구|농구|올림픽|월드컵|선거|대통령|국회|정당|탄핵|드라마|예능|웹툰|화장품|뷰티|패션|다이어트|iran|israel|gaza|ukraine|russia|missile|ceasefire|bomb(?:ing)?|troops|military|\\bwar\\b|mueller|impeach|\\bmaga\\b|democrat|republican|\\bsenate\\b|\\bcongress\\b|xbox|playstation|nintendo|esport|valorant|minecraft|league.of.legends|evangelion|anime(?!\\.js)|manga|cosplay|cortisol|\\bworkout\\b|anxiety|meditation|lemonade|dividend|hedge.fund';

// 금융 토픽에서는 배당·헤지펀드가 제외 대상이 아니라 핵심 주제다.
const FINANCE_DROP = BASE_DROP.split('|')
  .filter((p) => p !== 'dividend' && p !== 'hedge.fund')
  .join('|');

export const TOPICS = {
  ai: {
    name: 'AI',
    reKeep:
      '\\bai\\b|인공지능|생성형|거대언어|언어모델|확산모델|초거대|딥러닝|머신러닝|강화학습|파인튜닝|임베딩|멀티모달|신경망|추론모델|프롬프트|claude|gpt|openai|anthropic|gemini|grok|\\bllm\\b|copilot|cursor|midjourney|perplexity|hugging.?face|transformer|langchain|llamaindex|crew.?ai|autogen|\\bllama\\b|mistral|qwen|deepseek|\\bsora\\b|runway|\\bsuno\\b|\\bpika\\b|\\bdevin\\b|windsurf|ollama|\\bvllm\\b|stable.?diffusion|fine.?tun|\\brag\\b|neural|deep.?learn|machine.?learn|robot|automat|vibe.?cod|\\bmcp\\b|semiconductor|quantum|github|docker|kubernetes|\\bpython\\b|\\brust\\b|kotlin|nextjs|supabase|vercel|n8n|zapier',
    reWeak:
      '\\bmeta\\b|\\bchip\\b|\\bmodel\\b|모델|\\btoken\\b|토큰|\\bagent\\b|에이전트|apple|google|microsoft|nvidia|tesla|\\bapi\\b|cloud|server|database|startup|스타트업|saas|crypto|blockchain|web3|\\bgpu\\b|\\bcpu\\b|cod(?:ing|e\\b|ex)|pipeline|embed|vector|swift|\\breact\\b|typescript',
    reDrop: BASE_DROP,
    kw: {
      en: '\\b(ai|ml|llm|gpt|agi|rl|sota|gpu|tpu)\\b|openai|chatgpt|claude|anthropic|gemini|deepmind|copilot|cursor|codex|grok|llama|mistral|qwen|deepseek|midjourney|diffusion|transformer|agentic|agents?\\b|benchmark|inference|fine-?tun|hugging ?face|nvidia|robotic|autonomous|prompt|token|dataset|neural|frontier model|open[- ]?weight',
      ko: '인공지능|생성형|거대언어|언어모델|모델|에이전트|프롬프트|추론|파인튜닝|벤치마크|반도체|로봇|자율주행|챗봇|오픈소스|코딩|개발자|딥러닝|머신러닝',
      jazh: '人工知能|生成AI|エージェント|モデル|推論|人工智能|大模型|智能体|开源|推理',
    },
  },

  dev: {
    name: '개발/테크',
    reKeep:
      '개발자|프로그래밍|코딩|오픈소스|깃허브|리팩토링|디버깅|배포했|github|gitlab|\\bgit\\b|docker|kubernetes|\\bk8s\\b|devops|cicd|ci/cd|\\bapi\\b|\\bsdk\\b|\\bcli\\b|open.?source|changelog|\\bpython\\b|javascript|typescript|\\brust\\b|golang|\\bjava\\b|kotlin|swift|\\bc\\+\\+\\b|\\breact\\b|\\bvue\\b|svelte|nextjs|nuxt|node\\.?js|deno|\\bbun\\b|webpack|vite|tailwind|postgres|mysql|sqlite|redis|mongodb|graphql|supabase|firebase|vercel|netlify|cloudflare|\\baws\\b|\\bgcp\\b|azure|terraform|linux',
    reWeak:
      '서버|데이터베이스|클라우드|백엔드|프론트엔드|풀스택|커밋|머지|배포|server|database|cloud|backend|frontend|full.?stack|commit|merge|deploy|pipeline|framework|library|package|\\bnpm\\b|pnpm|yarn|regex|algorithm|vscode|\\bide\\b|terminal|소프트웨어|software|테크|\\btech\\b',
    reDrop: BASE_DROP,
    kw: {
      en: '\\b(dev|developer|coding|programming|software|github|docker|kubernetes|api|sdk|framework|backend|frontend|deploy|release|opensource)\\b|open[- ]?source|typescript|javascript|\\bpython\\b|\\brust\\b|golang|kotlin|\\breact\\b|nextjs|node\\.?js',
      ko: '개발|개발자|코딩|프로그래밍|오픈소스|배포|백엔드|프론트엔드|서버|데이터베이스|클라우드|소프트웨어',
      jazh: '開発|コーディング|オープンソース|デプロイ|ソフトウェア|开发|开源|部署|软件',
    },
  },

  finance: {
    name: '경제/금융',
    reKeep:
      '주식|증시|코스피|코스닥|나스닥|환율|금리|인플레|물가|연준|한국은행|채권|배당|재테크|비트코인|이더리움|코인|가상자산|암호화폐|관세|무역|수출입|nasdaq|s&p|dow jones|\\bfed\\b|fomc|interest rate|inflation|\\bcpi\\b|\\bpce\\b|bond|treasury|yield|dividend|earnings|\\bipo\\b|bitcoin|ethereum|crypto|stablecoin|\\betf\\b|recession|\\bgdp\\b|tariff|hedge.fund',
    reWeak:
      '달러|엔화|위안화|유가|금값|원자재|부동산|경기|고용|실업|매출|실적|시가총액|경제|투자|펀드|market|economy|dollar|yen|\\boil\\b|gold|real estate|employment|revenue|market cap|fund|investor|주가',
    reDrop: FINANCE_DROP,
    kw: {
      en: '\\b(stock|stocks|market|fed|fomc|inflation|bond|yield|earnings|ipo|etf|bitcoin|ethereum|crypto|tariff|gdp|recession|dividend)\\b|nasdaq|s&p ?500|interest rate',
      ko: '주식|증시|코스피|나스닥|금리|환율|인플레|경제|연준|채권|배당|투자|비트코인|코인|관세|실적',
      jazh: '株式|株価|金利|利上げ|利下げ|経済|股票|利率|经济|通胀',
    },
  },

  startup: {
    name: '스타트업/비즈',
    reKeep:
      '스타트업|창업|시드 투자|시리즈|투자 유치|펀딩|밸류에이션|유니콘|엑싯|인수합병|피봇|startup|founder|co-?founder|seed round|series [a-e]\\b|funding|raised|valuation|unicorn|\\bacquisition\\b|merger|m&a|pivot|y combinator|demo day|venture capital|\\bvc\\b|\\bsaas\\b|\\barr\\b|\\bmrr\\b|churn|product[- ]market fit|런칭|launch',
    reWeak:
      '매출|성장|사용자|구독|비즈니스|사업|기업가|마케팅|그로스|채용|제품 출시|revenue|growth|users|subscriber|business|marketing|hiring|product|roadmap|\\bb2b\\b|\\bb2c\\b|출시',
    reDrop: BASE_DROP,
    kw: {
      en: '\\b(startup|startups|founder|funding|raised|valuation|unicorn|acquisition|saas|venture|launch)\\b|series [a-e]|seed round|product[- ]market fit',
      ko: '스타트업|창업|투자 유치|펀딩|유니콘|인수|합병|출시|런칭|매출',
      jazh: 'スタートアップ|創業|資金調達|買収|创业|融资|收购|初创',
    },
  },

  custom: {
    name: '자유 입력',
    reKeep: '',
    reWeak: '',
    reDrop: '',
    kw: { en: '', ko: '', jazh: '' },
  },
};

export const DEFAULT_TOPIC = 'ai';

/** 알려진 토픽 키 목록 — 수집 패널이 외부 입력을 검증할 때 쓴다. */
export const TOPIC_KEYS = Object.keys(TOPICS);

/**
 * 수집 패널의 관심사 칩에 노출할 카테고리.
 * custom(자유 입력)은 옵션에서 정규식을 넣었을 때만 별도로 붙이므로 제외한다.
 */
export const INTEREST_CHOICES = [
  { key: 'ai', short: 'AI', name: 'AI' },
  { key: 'dev', short: '개발', name: '개발/테크' },
  { key: 'finance', short: '금융', name: '경제/금융' },
  { key: 'startup', short: '비즈', name: '스타트업/비즈' },
];

const NOTHING = /$^/;

/** 토픽 키를 프리셋으로 해석한다. 알 수 없는 키면 기본(ai)으로 폼백. */
export function topicOf(key) {
  return TOPICS[key] || TOPICS[DEFAULT_TOPIC];
}

/** 알려진 토픽 키만 통과. 그 외는 기본(ai). */
export function normalizeTopicKey(key) {
  return TOPICS[key] ? key : DEFAULT_TOPIC;
}

/** 옵션·빌더 UI용 {id, name} 목록. */
export function topicEntries() {
  return Object.keys(TOPICS).map((id) => ({ id, name: TOPICS[id].name }));
}

/** 빌더 UI·/api/env용 토픽별 관련도 키워드(en/ko/jazh). */
export function topicKeywordsMap() {
  return Object.fromEntries(
    Object.keys(TOPICS).map((id) => [id, { ...(TOPICS[id].kw || { en: '', ko: '', jazh: '' }) }]),
  );
}

/**
 * 정규식 소스 문자열을 컴파일한다.
 * 비어 있거나 잘못된 패턴이면 fallback(RegExp 또는 소스 문자열)을 쓰고,
 * fallback도 없으면 아무것도 매칭하지 않는 정규식을 반환한다.
 */
export function compileRe(src, fallback) {
  if (src) {
    try {
      return new RegExp(src, 'i');
    } catch {
      /* 잘못된 패턴 → fallback */
    }
  }
  if (fallback instanceof RegExp) return fallback;
  if (typeof fallback === 'string' && fallback) {
    try {
      return new RegExp(fallback, 'i');
    } catch {
      /* fallback 문자열도 불량이면 아래 NOTHING */
    }
  }
  return NOTHING;
}

/**
 * 수집 필터 3종을 토픽 키(+ custom 정규식)로 해석한다.
 * custom이거나 알 수 없는 키면 사용자 정규식을 쓰고, 비면 ai 프리셋으로 폼백.
 */
export function resolveTopicFilters(topicKey, custom = {}) {
  const isCustom = topicKey === 'custom';
  if (isCustom) {
    const fb = TOPICS[DEFAULT_TOPIC];
    return {
      key: 'custom',
      name: TOPICS.custom.name,
      reKeep: compileRe(custom.reKeep, fb.reKeep),
      reWeak: compileRe(custom.reWeak, fb.reWeak),
      reDrop: compileRe(custom.reDrop, fb.reDrop),
    };
  }
  const key = normalizeTopicKey(topicKey);
  const t = TOPICS[key];
  return {
    key,
    name: t.name,
    reKeep: compileRe(t.reKeep),
    reWeak: compileRe(t.reWeak),
    reDrop: compileRe(t.reDrop),
  };
}

/** KEEP에 맞거나 (WEAK이면서 DROP이 아니면) 수집 대상. */
export function keepText(text, filters) {
  return !!(text && (filters.reKeep.test(text) || (filters.reWeak.test(text) && !filters.reDrop.test(text))));
}

/** 브리핑 타이틀·프롬프트에 쓰는 토픽 표기. */
export function briefingBrand(topicKey) {
  const key = normalizeTopicKey(topicKey);
  const name = TOPICS[key].name;
  return {
    key,
    name,
    newsletter: `오늘의 ${name} 브리핑`,
    newsLabel: `${name} 뉴스`,
  };
}
