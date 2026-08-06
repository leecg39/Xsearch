# Xsearch (X 게시물 수집 북마클릿)

x.com 피드를 자동 스크롤하며 게시물을 수집해 CSV/JSON으로 저장하고, AI 브리핑까지 내보내는 북마클릿 + Chrome 확장 프로그램입니다.

## 구조

```text
├── src/
│   ├── collector.js              # 수집기 본체 소스 (여기를 수정)
│   └── installer.template.html   # 설치 페이지 템플릿 ({{VERSION}}, {{BM_CODE}}, {{LOGO_B64}})
├── ext/                          # Chrome 확장 껍데기 (MV3)
│   ├── manifest.json             # name: Xsearch, 아이콘 세트
│   ├── icon16/32/48/128.png       # Xsearch 로고 아이콘
│   ├── background.js             # 시작 오케스트레이션 + chrome.downloads + 브리핑 내보내기
│   ├── bridge.js                 # content script: postMessage 중계 + 자동 시작
│   └── options.html/js           # 설정 UI (필터 정규식·목표·속도·자동 시작·빌더 주소)
├── newsgen/                      # AI 뉴스 빌더 (SuperGrok 구독 인증)
│   ├── server.mjs                # 로컬 웹서비스 (127.0.0.1:8787)
│   ├── public/index.html          # 빌더 UI
│   ├── lib/                      # 전처리·LLM·렌더링·아카이브
│   └── output/                   # 생성된 브리핑 HTML + index.html 아카이브
├── build.mjs                     # 빌드 스크립트 (북마클릿 + 확장 듀얼 타깃)
├── tools/
│   ├── lib.mjs                   # 공용: 북마클릿 변환·디코드·로고 주입
│   ├── extract.mjs               # (1회용) 원본 HTML → src/collector.js 복원
│   ├── dev.mjs                   # watch 자동 재빌드 (npm run dev)
│   └── verify.mjs                # 빌드 무결성 검증
├── dist/
│   └── xsearch-v4.9.0.html       # 북마클릿 설치 페이지
├── dist-extension/              # 확장 프로그램 (Load Unpacked 대상)
└── assets/
    ├── xsearch-logo.png          # 전체 락업
    └── xsearch-mark.png          # 마크만 (아이콘용)
```

## 사용법

```bash
npm install        # 최초 1회
npm run build      # dist/ (북마클릿) + dist-extension/ (확장) 생성
npm run news       # AI 뉴스 빌더 실행 → http://127.0.0.1:8787
npm run dev        # watch 모드: src/·ext/ 저장 시 자동 재빌드
```

### 방법 A — Chrome 확장 프로그램 (권장, v4.7.0~)

1. `chrome://extensions` → 개발자 모드 ON → "압축해제된 확장 프로그램 로드" → `dist-extension/` 선택
2. x.com 피드에서 **툴바 아이콘 클릭** → 자동 수집 시작 (북마크 재등록 불필요)
3. 확장 상세 → "확장 프로그램 옵션"에서 필터 정규식·목표 갯수·속도·자동 시작·브리핑 빌더 주소 설정
4. 완료되면 `Downloads/tweets/tw_YYYY-MM-DD.csv` / `.json`으로 자동 저장

### 브리핑 내보내기 (v4.8.0~)

수집 완료 패널의 **브리핑 내보내기** 버튼을 누르면 수집분이 로컬 'Xsearch 뉴스 빌더'로 전송되고
빌더 탭이 자동으로 열린다. 빌더는 SuperGrok/X Premium+ 구독 OAuth(기기 코드 로그인)로 그록 모델을
호출해 '오늘의 AI 브리핑' 형태의 HTML(`newsgen/output/YYYY-MM-DD.html`)을 생성한다.

### 방법 B — 북마클릿 (기존)

1. `dist/xsearch-v{버전}.html`을 브라우저로 연다.
2. 파란 버튼을 **북마크바로 드래그**해 등록한다.
3. x.com 피드에서 북마크를 클릭 → 목표 갯수 입력 → 자동 수집.
4. 완료되면 `tw_YYYY-MM-DD.csv` / `.json` 다운로드.

## 수정 워크플로

1. `src/collector.js` 수정 (패널 UI 문구, 필터 정규식, 딜레이 기본값 등).
2. `package.json`의 `version`을 올린다.
3. `npm run build` 실행 → 새 `dist/xsearch-v{버전}.html` 생성.
4. 브라우저에서 새 설치 페이지를 열어 **북마크를 다시 등록**한다.

```bash
npm run check      # src/collector.js 구문 검사
npm run verify     # 빌드 무결성 검증
```

## 주요 기능

- **이중 수집**: XHR 후킹으로 X GraphQL API 응답 가로채기 + DOM 파싱 보조
- **추출 항목**: 이름·핸들·인증·본문·시간·댓글/RT/좋아요/북마크/조회수·해시태그·멘션·링크·미디어 URL 등 24개 컬럼
- **생존 장치**: localStorage 체크포인트(이어하기), 소프트블록 재시도, 정체 감지 → 쿨다운, 피드 끝 감지
- **브리핑 내보내기**: 수집분을 로컬 빌더로 전송 → SuperGrok 구독으로 AI 편집 브리핑 생성
