# Xsearch (게시물 수집 북마클릿)

X / Reddit / Threads 피드를 수집해 CSV/JSON으로 저장하고, 선택한 토픽의 브리핑까지 내보내는 북마클릿 + Chrome 확장 프로그램입니다.

## 구조

```text
├── src/
│   ├── collector.js              # 수집기 본체 (패널·스크롤·필터·납납)
│   ├── topics.mjs                # 토픽 프리셋 (필터 정규식 + newsgen 키워드)
│   ├── sources/                  # 소스 어댑터 (x / reddit / threads / linkedin)
│   └── installer.template.html   # 설치 페이지 템플릿
├── ext/                          # Chrome 확장 껍데기 (MV3)
│   ├── manifest.json             # host_permissions: x·reddit·threads·linkedin
│   ├── background.js             # 시작 오케스트레이션 + 다운로드 + 브리핑
│   ├── bridge.js                 # content script: postMessage 중계
│   └── options.html/js           # 토픽·정규식·목표·속도·LinkedIn 허용
├── newsgen/                      # 토픽별 뉴스 빌더 (SuperGrok 구독 인증)
├── build.mjs                     # esbuild 번들 → 북마클릿 + 확장
├── dist/
│   └── xsearch-v5.0.0.html       # 북마클릿 설치 페이지
└── dist-extension/              # 확장 프로그램 (Load Unpacked 대상)
```

## 사용법

```bash
npm install        # 최초 1회
npm run build      # dist/ (북마클릿) + dist-extension/ (확장) 생성
npm run news       # 뉴스 빌더 실행 → http://127.0.0.1:8787/builder
npm run dev        # watch 모드: src/·ext/ 저장 시 자동 재빌드
```

### 토픽 선택 (v5.0.0~)

확장 옵션의 **토픽**에서 프리셋을 고릅니다.

- **AI** / **개발·테크** / **경제·금융** / **스타트업·비즈** — 필터 정규식이 읽기 전용으로 채워집니다.
- **자유 입력** — KEEP / WEAK / DROP 정규식을 직접 작성합니다.
- 북마클릿 모드는 기본 **AI**입니다.
- 브리핑 빌더도 같은 토픽으로 제목·가중치를 맞춥니다.

기존에 커스텀 정규식을 저장해 둔 사용자는 자동으로 **자유 입력**으로 마이그레이션됩니다.

### 수집 소스 (v5.0.0~)

| 소스 | 방식 | 비고 |
| --- | --- | --- |
| X (x.com / twitter.com) | GraphQL harvest + DOM | 기존과 동일 |
| Reddit | 공개 JSON API (`/hot.json` 등) | 레이트리밋 ~10 req/min → 최소 6초 대기 + 429 백오프 |
| Threads | 피드 DOM | 비공식 선택자. 변경 시 패널에 경고 |
| LinkedIn | 피드 DOM | **기본 꺼짐.** 봇 탐지·계정 제한 위험이 큽니다. 옵션에서 켠 뒤에만 동작 |

확장 툴바 아이콘은 위 사이트에서만 수집기를 시작합니다.

### 방법 A — Chrome 확장 프로그램 (권장)

1. `chrome://extensions` → 개발자 모드 ON → "압축해제된 확장 프로그램 로드" → `dist-extension/` 선택
2. x.com / reddit.com / threads.net 피드에서 **툴바 아이콘 클릭**
3. 확장 옵션에서 토픽·목표 갯수·속도·자동 시작·브리핑 빌더 주소 설정
4. 완료되면 `Downloads/tweets/tw_YYYY-MM-DD.csv` / `.json`으로 자동 저장

### 브리핑 내보내기 (v4.8.0~)

수집 완료 패널의 **브리핑 내보내기** 버튼을 누르면 수집분과 토픽이 빌더로 전송됩니다.
빌더는 SuperGrok/X Premium+ 구독 OAuth로 그록 모델을 호출해 HTML(`newsgen/output/YYYY-MM-DD.html`)을 생성합니다.

### 운영 배포

- 공개 아카이브: `https://news.soverin.cloud/output/`
- 인증된 빌더: `https://news.soverin.cloud/builder`
- Hostinger Compose 템플릿: `deploy/hostinger/docker-compose.yml`

### 방법 B — 북마클릿

1. `dist/xsearch-v{버전}.html`을 브라우저로 연다.
2. 파란 버튼을 **북마크바로 드래그**해 등록한다.
3. 피드에서 북마크를 클릭 → 목표 갯수 입력 → 자동 수집.
4. **v5.0.0부터는 북마크를 다시 등록**해야 합니다 (기존 릴리스와 동일).

## 수정 워크플로

1. `src/topics.mjs` (프리셋) 또는 `src/collector.js` / `src/sources/` 를 수정합니다.
2. `package.json`의 `version`을 올린다.
3. `npm run build` 실행 → 새 `dist/xsearch-v{버전}.html` 생성.
4. 브라우저에서 새 설치 페이지를 열어 **북마크를 다시 등록**한다.

```bash
npm test && npm run build && npm run check && npm run verify
```

## 주요 기능

- **토픽 프리셋**: AI / 개발·테크 / 경제·금융 / 스타트업·비즈 / 자유 입력
- **멀티 소스**: X(이중 수집) · Reddit(JSON) · Threads(DOM) · LinkedIn(옵션, 기본 OFF)
- **추출 항목**: 기존 24컬럼 + `source` (CSV 맨 끝, 구버전 파서 호환)
- **생존 장치**: localStorage 체크포인트, 소프트블록 재시도, 정체 감지, Reddit 429 백오프
- **브리핑 내보내기**: 수집분+토픽을 빌더로 전송 → SuperGrok 구독으로 편집 브리핑 생성
