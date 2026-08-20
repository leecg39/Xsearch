# Xsearch

X·Reddit·Threads·LinkedIn 수집 북마클릿 + Chrome 확장 + 토픽 브리핑 빌더.

## 게이트

```bash
npm test && npm run build && npm run check && npm run verify
```

버전 단일 소스는 `package.json`. 산출물: `dist/xsearch-v{ver}.html`, `dist-extension/`.

## 핵심 경로

- `src/topics.mjs` — 토픽 프리셋 (필터 RE + newsgen 키워드). 브라우저에는 번들/JSON 인라인, newsgen은 ESM import.
- `src/collector.js` — 패널·스크롤·체크포인트·필터·CSV/JSON/브리핑. esbuild IIFE 번들.
- `src/sources/*.mjs` — 사이트 어댑터. X는 GraphQL+DOM, Reddit은 JSON API, Threads/LinkedIn은 DOM.
- `ext/options.js` — `{{TOPICS_JSON}}` 빌드 치환. LinkedIn은 `linkedinEnabled` 기본 false.
- `newsgen/` — `/api/import`가 `topic`을 받아 전처리·LLM 프롬프트에 반영.

## 주의

- LinkedIn: 봇 탐지·계정 제한 → 기본 OFF, 실패 시 스코프에서 빼도 됨.
- Reddit 공개 JSON: 무인증 레이트리밋(~10 req/min) → 딜레이 + 429 백오프.
- Threads: 비공식 DOM 선택자. 파싱 0건이 반복되면 기존처럼 선택자 경고.
