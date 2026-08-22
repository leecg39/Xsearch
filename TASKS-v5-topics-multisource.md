# Xsearch v5.0 구현 지시서 — 토픽 카테고리 + 멀티 소스

> 이 문서는 Cursor(코딩 에이전트)를 위한 실행 지시서다.
> 아래 Phase를 순서대로 구현하고, 각 Phase 완료 시 검증 게이트를 통과시켜라.

## 목표

1. **토픽 카테고리**: 수집 필터를 AI 단일 하드코딩에서 선택 가능한 프리셋(AI / 개발·테크 / 경제·금융 / 스타트업·비즈 + 자유 입력)으로 확장하고, newsgen 브리핑도 토픽에 맞게 생성
2. **멀티 소스**: X 외에 Reddit(공개 JSON API) → Threads(DOM) → LinkedIn(DOM, 마지막·기본 OFF) 순으로 수집 소스 확장

## 현재 구조 (탐색 완료)

- `src/collector.js` (1222줄 단일 IIFE): X 전용. XHR 후킹(GraphQL harvest) + DOM 파싱 이중 수집, 정규화 오브젝트(단축키 `n/h/t/d/u/r/w/l/v/b/ht/mn/lk/md/mu/at/ap/q`), localStorage(`_twc`) 체크포인트, CSV(24컬럼)/JSON/브리핑 납납(`POST /api/import`)
- 필터: `src/collector.js:86-103` — RE_KEEP/RE_WEAK/RE_DROP AI 하드코딩. 확장 모드에서는 `ext/options.js`의 자유 정규식이 `window.__twcConfig`(EXT)로 주입되어 `extRe()`가 오버라이드. 프리셋 개념 없음
- 패널 필터 토글: `btnFlt` (`src/collector.js:845` 부근), "필터 OFF ↔ AI만"
- `ext/manifest.json`: host_permissions/content_scripts = x.com·twitter.com만. `ext/background.js:46` URL 가드 `/^https:\/\/(x|twitter)\.com\//` 하드코딩. `DEFAULTS`는 `ext/background.js:4-16`
- `newsgen/lib/preprocess.mjs:5-7`: RE_EN/RE_KO/RE_JA_ZH AI 키워드 하드코딩, `aiHits()` 0~3점 가중. `newsgen/lib/llm.mjs`: "5분 AI 뉴스" 프롬프트 하드코딩
- 빌드: `build.mjs` → `tools/lib.mjs:prepareCollectorSource()` 치환 → `dist/xsearch-v{ver}.html` + `dist-extension/`. `{{RE_*}}` 플레이스홀더는 `build.mjs:extractRegexSource()`가 collector 소스에서 추출해 options.js에 주입. 버전 단일 소스 = `package.json`
- 테스트: `test/*.test.mjs`, Node 22 `node:test` ESM. 컨벤션: 함수당 테스트, 버그당 회귀 테스트, 분기 커버
- **풀 게이트**: `npm test && npm run build && npm run check && npm run verify`

## 공통 규칙

- 기존 X 수집 동작과 기존 테스트는 반드시 그린 유지 (로직 변경 최소, 순수 분리만)
- 기존 코드 스타일(단축키 스키마, 주석 한국어, 정규식 소스 문자열 관리)을 따른다
- 새 기능은 테스트와 함께 추가. `custom`/기본값 폼백 등 분기 커버 필수
- 커밋/푸시는 하지 않는다

---

## Phase 1 — 토픽 카테고리

### 1-1. `src/topics.mjs` (새 파일, ESM)

```js
export const TOPICS = {
  ai:      { name: 'AI',          reKeep: '...', reWeak: '...', reDrop: '...', kw: { en: '...', ko: '...', jazh: '...' } },
  dev:     { name: '개발/테크',    ... },
  finance: { name: '경제/금융',    ... },
  startup: { name: '스타트업/비즈', ... },
  custom:  { name: '자유 입력',    reKeep: '', reWeak: '', reDrop: '', kw: { en: '', ko: '', jazh: '' } },
};
```

- `ai` 프리셋의 reKeep/reWeak/reDrop은 현재 `src/collector.js:88,92,96` 정규식 소스를 **그대로** 이동 (문자열로)
- `kw.en/ko/jazh`는 현재 `newsgen/lib/preprocess.mjs:5-7` 정규식 소스를 이동 (ai 기준), 나머지 토픽은 주제에 맞게 작성
- dev/finance/startup 프리셋 작성 시: reKeep=핵심 키워드, reWeak=넓은 관련 키워드, reDrop=제외 주제. 영어는 `\b` 경계, 한글은 부분 일치 (기존 패턴 준수)
- 브라우저 스크립트에는 빌드 시 JSON 인라인, newsgen(Node)은 직접 import → 정규식은 반드시 **소스 문자열**로 저장

### 1-2. collector 연동 (`src/collector.js`)

- 상단에 인라인 토픽: `var TOPICS = {{TOPICS_JSON}};` (빌드 치환, 빌드 전 개발용으로는 기본 객체 폼백 처리)
- `EXT.topic` 키로 프리셋 해석: `topic !== 'custom'`이면 TOPICS에서 RE 3종 생성, `custom` 또는 topic 없음이면 기존 `extRe(EXT.reKeep, fallback)` 경로 유지. 폼백(fallback)은 `TOPICS.ai`
- 패널 필터 버튼 라벨에 토픽명 표시 (예: "필터: AI"). 북마클릿 모드(EXT 없음)는 `ai` 기본
- `/api/import` POST body에 `topic` 필드 추가

### 1-3. 확장 옵션 UI (`ext/options.html`, `ext/options.js`, `ext/background.js`)

- 토픽 `<select>` 추가. 프리셋 선택 시 reKeep/reWeak/reDrop 입력 필드에 프리셋 값을 표시하고 읽기 전용 처리, `custom`이면 지금처럼 편집 가능
- `ext/background.js` `DEFAULTS`에 `topic: 'ai'` 추가. 마이그레이션: 저장된 topic이 없고 사용자 정규식(reKeep 등)이 있으면 `custom`으로 간주
- `build.mjs`: `src/topics.mjs`를 import해 `TOPICS` JSON을 options.js의 `{{TOPICS_JSON}}`에 치환 (기존 `{{RE_*}}` 추출 방식 확장)

### 1-4. newsgen 파라미터화

- `newsgen/lib/preprocess.mjs`: RE_EN/RE_KO/RE_JA_ZH 하드코딩 제거 → `import { TOPICS } from '../../src/topics.mjs'`, `topicHits(text, topic)` 추가(기존 aiHits와 동일 로직을 토픽 키워드로). `aiHits(text)`는 `topicHits(text, 'ai')` 별칭으로 유지 (기존 테스트 호환)
- `newsgen/server.mjs`: `/api/import`가 `topic` 수신 → import 레코드/잡에 전달 (없으면 `'ai'`)
- `newsgen/lib/llm.mjs`: 프롬프트의 "AI 뉴스"·타이틀을 토픽명(`TOPICS[topic].name`)으로 파라미터화
- `newsgen/public/index.html`: 빌더 UI에 토픽 표시 (가능하면 선택 드롭다운)

### Phase 1 테스트 + 게이트

- `test/topics.test.mjs` (신규): 각 프리셋 정규식이 의도 샘플에 매칭/비매칭, custom 폼백, 잘못된 정규식 폼백
- `test/preprocess.topic.test.mjs` (신규): `topicHits` 토픽별 점수, `aiHits` 별칭 동치
- `npm test && npm run build && npm run check && npm run verify` 통과

---

## Phase 2 — 멀티 소스 (순차: Reddit → Threads → LinkedIn)

### 2-1. 소스 어댑터 구조

- `src/sources/x.mjs`: 기존 collector의 X 전용 로직(DOM 파서 `parseTweets`, XHR/GraphQL harvest, `tweetFromApi`)을 X 어댑터로 이동 — **로직 변경 없이 순수 분리**
- `src/collector.js`에 잔류(공통 코어): 패널 UI, 자동 스크롤, 체크포인트/이어하기, 필터, CSV/JSON/브리핑 납납, 정체·소프트블록 감지
- 어댑터 인터페이스:
  ```js
  { id: 'x', match(host), init(ctx), parseDomArticle(el) → item|null, setupNetHook(harvestFn), pollMore() }
  ```
- 빌드는 esbuild 번들로 전환 가능 (단, mangle 없이 공백 압축만 — 기존 `toBookmarklet()` 동작 유지). 어려우면 현재 수동 인라인 방식 유지하고 어댑터를 같은 파일 순차 배치
- 정규화 스키마에 `s`(source: x/reddit/threads/linkedin) 추가, 기본 `'x'`. `jsonData()` 풀네임에 `source`, CSV 24컬럼 **끝에** source 컬럼 추가(기존 파서 호환)

### 2-2. Reddit (공개 JSON API, 1차)

- `src/sources/reddit.mjs`: 페이지 컨텍스트 same-origin `fetch('/r/{sub}/hot.json?limit=100&after={cursor}')` 페이지네이션. 현재 URL에서 서브레딧/피드 경로 자동 인식, 검색 페이지면 `search.json`
- 매핑: `score`→l, `num_comments`→r, `permalink`→u, `subreddit`/`author`→h/n, `created_utc`→d, `selftext`+`title`→t, `s: 'reddit'`. views/bookmarks 없음 → 0
- 레이트리밋: 기존 `delay` 설정 재사용, 429 시 지수 백오프 (기존 재시도 인프라 재활용)
- DOM 파싱 없이 API 모드만

### 2-3. Threads / LinkedIn (DOM, 2·3차)

- `src/sources/threads.mjs`: `www.threads.net` 피드 DOM 파싱 (선택자는 실제 페이지에서 조사 후 확정)
- `src/sources/linkedin.mjs`: `www.linkedin.com/feed` DOM 파싱. 봇 탐지·계정 제한 리스크 — 느린 딜레이, 소량, 옵션에서 **기본 OFF**. 실패 시 스코프 제외 가능

### 2-4. 확장 연동

- `ext/manifest.json`: host_permissions + content_scripts matches에 `https://www.reddit.com/*`, `https://old.reddit.com/*`, `https://www.threads.net/*`, (`https://www.linkedin.com/*`는 Phase 2-3 시점) 추가
- `ext/background.js:46`: URL 가드를 소스별 매핑 객체로 교체
- `ext/bridge.js`: 변경 없음
- 패널 헤더에 현재 소스 표시

### 2-5. newsgen 소스 대응

- `source` 필드 통과, `toPromptLines` 헤더에 소스 표기 (예: `[reddit] u/...`)
- `engagementScore`/`labelOf`는 누락 필드가 0 처리되어 이미 동작 — 보정 확인만

### Phase 2 테스트 + 게이트

- `test/reddit.test.mjs` (신규): fixture JSON → 정규화 매핑, cursor 페이지네이션, 429 백오프
- CSV/JSON에 source 포함 테스트, 기존 X 회귀 전부 그린
- 풀 게이트 통과

---

## Phase 3 — 릴리스

- `package.json` 버전 `5.0.0` → `npm run build` (`dist/xsearch-v5.0.0.html` + `dist-extension/`)
- CLAUDE.md / README.md 갱신: 토픽 선택 사용법, 소스별 지원 범위, LinkedIn 리스크 주의, 북마클릿 사용자 재설치 안내

## 리스크 메모

- LinkedIn: 봇 탐지 강함 → 기본 OFF, 마지막 구현, 제외 가능
- Threads: 비공식 선택자 의존 → 기존 선택자 변경 경고 장치 재사용
- Reddit 무인증 JSON: 레이트리밋 ~10 req/min → 딜레이 상향 + 백오프
