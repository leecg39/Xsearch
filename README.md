# 트윗 수집기 (X 게시물 수집 북마클릿)

x.com 피드를 자동 스크롤하며 트윗을 수집해 CSV/JSON으로 저장하는 북마클릿입니다.
기존에 한 파일(`tweet-collector-v4.6.3.html`) 안에 한 줄 문자열로 박혀 있던 소스를
읽기 좋은 프로젝트 구조로 분리하고, 빌드로 설치 페이지를 자동 생성합니다.
기능은 원본 v4.6.3과 동일합니다(검증 스크립트로 확인).

## 구조

```text
├── src/
│   ├── collector.js              # 수집기 본체 소스 (여기를 수정)
│   └── installer.template.html   # 설치 페이지 템플릿 ({{VERSION}}, {{BM_CODE}})
├── ext/                          # Chrome 확장 껍데기 (MV3)
│   ├── manifest.json             # version은 __TWC_VERSION__ 플레이스홀더
│   ├── background.js             # 시작 오케스트레이션 + chrome.downloads
│   ├── bridge.js                 # content script: postMessage 중계 + 자동 시작
│   └── options.html/js           # 설정 UI (필터 정규식·목표·속도·자동 시작)
├── build.mjs                     # 빌드 스크립트 (북마클릿 + 확장 듀얼 타깃)
├── tools/
│   ├── lib.mjs                   # 공용: 북마클릿 변환·디코드
│   ├── extract.mjs               # (1회용) 원본 HTML → src/collector.js 복원
│   ├── dev.mjs                   # watch 자동 재빌드 (npm run dev)
│   └── verify.mjs                # 빌드 무결성 검증
├── dist/
│   └── tweet-collector-v4.7.0.html   # 북마클릿 설치 페이지
├── dist-extension/               # 확장 프로그램 (Load Unpacked 대상)
└── tweet-collector-v4.6.3.html   # 원본 레퍼런스 (수정하지 말 것)
```

## 동작 원리 (확장)

`collector.js` 수집 코어는 `world: "MAIN"`으로 그대로 주입된다. 확장은 얇은 껍데기:
시작 전 `window.__twcConfig`에 설정을 심고(없으면 북마클릿 모드로 동작), 완료 시
postMessage로 CSV/JSON을 받아 `chrome.downloads`로 `Downloads/tweets/`에 저장한다.

## 사용법

```bash
npm install        # 최초 1회
npm run build      # dist/ (북마클릿) + dist-extension/ (확장) 생성
npm run dev        # watch 모드: src/·ext/ 저장 시 자동 재빌드
```

### 방법 A — Chrome 확장 프로그램 (권장, v4.7.0~)

1. `chrome://extensions` → 개발자 모드 ON → "압축해제된 확장 프로그램 로드" → `dist-extension/` 선택
2. x.com 피드에서 **툴바 아이콘 클릭** → 자동 수집 시작 (북마크 재등록 불필요)
3. 확장 상세 → "확장 프로그램 옵션"에서 필터 정규식·목표 갯수·속도·자동 시작 설정
4. 완료되면 `Downloads/tweets/tw_YYYY-MM-DD.csv` / `.json`으로 자동 저장

### 방법 B — 북마클릿 (기존)

1. `dist/tweet-collector-v{버전}.html`을 브라우저로 연다.
2. 파란 버튼을 **북마크바로 드래그**해 등록한다.
   (주소창에 직접 붙여넣으면 Chrome이 `javascript:` 접두사를 지우므로 반드시 북마크로 사용)
3. x.com 피드(홈·검색·리스트·북마크 등)에서 북마크를 클릭 → 목표 갯수 입력 → 자동 수집.
4. 완료되면 `tw_YYYY-MM-DD.csv` / `.json` 다운로드 (파일명은 기기 로컬 날짜 기준).

## 수정 워크플로

1. `src/collector.js` 수정 (패널 UI 문구, 필터 정규식, 딜레이 기본값 등).
2. `package.json`의 `version`을 올린다 (수집기 패널·설치 페이지·파일명에 자동 반영).
3. 필요하면 `src/installer.template.html`의 변경 이력 카드(정적 텍스트)를 갱신한다.
4. `npm run build` 실행 → 새 `dist/tweet-collector-v{버전}.html` 생성.
5. 브라우저에서 새 설치 페이지를 열어 **북마크를 다시 등록**한다 (기존 북마크는 자동 갱신되지 않음).

```bash
npm run check      # src/collector.js 구문 검사
npm run verify     # 빌드 무결성 검증 (북마클릿이 소스와 일치하는지 + 확장 산출물 상태)
```

## 빌드 동작

- esbuild로 **공백만 압축** (식별자 변경·구문 최적화 없음 → 원본과 로직 동일 보장)
- `charset: ascii`로 문자열 내 한글·이모지를 `\uXXXX` 이스케이프 (ASCII-safe 북마클릿)
- `javascript:void (...)()` 접두사로 감싸 템플릿의 `{{BM_CODE}}` 자리에 JS 문자열 리터럴로 삽입
  (`<` → `\u003c` 이스케이프로 `</script>` 파싱 깨짐 방지)
- 버전은 `package.json`의 `version` 한 곳에서 관리

## 주요 기능 (v4.6.3 원본 그대로)

- **이중 수집**: XHR 후킹으로 X GraphQL API 응답(Home/Search/UserTweets/Bookmarks 등) 가로채기 + DOM 파싱 보조
- **추출 항목**: 이름·핸들·인증·본문(인용/기사/노트 트윗 포함)·시간·댓글/RT/좋아요/북마크/조회수·해시태그·멘션·링크·미디어 URL 등 24개 컬럼
- **생존 장치**: localStorage 체크포인트(이어하기), 소프트블록 재시도, 정체 감지 → 쿨다운, 피드 끝 감지
- **컨트롤**: 일시정지 / 중단·저장 / 속도(200~5000ms, 기본 2000) / AI 필터(OFF ↔ AI만)

## 참고 파일

- `demo.mp4` — 실제 수집 동작 데모 영상
- `image1.png` — 설치 페이지 스크린샷
