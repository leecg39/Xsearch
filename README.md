# Xsearch (멀티 소스 수집 북마클릿)

X·Reddit·Threads·LinkedIn 피드를 수집해 CSV/JSON으로 저장하고, 토픽별 브리핑까지 내보내는 북마클릿 + Chrome 확장 프로그램입니다.

## 구조

```text
├── src/
│   ├── collector.js              # 수집 코어 (패널·스크롤·체크포인트·내보내기)
│   ├── topics.mjs                # 토픽 프리셋 단일 소스 (필터 정규식 + newsgen 키워드)
│   ├── schema.mjs                # 단축키 스키마 ↔ CSV/JSON
│   ├── sources/                  # 사이트 어댑터 (x / reddit / threads / linkedin)
│   └── installer.template.html
├── ext/                          # Chrome 확장 껍데기 (MV3)
├── newsgen/                      # 토픽 뉴스 빌더
├── test/                         # node --test
├── dist/xsearch-v5.0.0.html
└── dist-extension/
```

## 사용법

```bash
npm install
npm test && npm run build && npm run check && npm run verify
npm run news       # 뉴스 빌더 → http://127.0.0.1:8787
```

### 방법 A — Chrome 확장 (권장)

1. `chrome://extensions` → 개발자 모드 → Load Unpacked → `dist-extension/`
2. x.com / reddit.com / threads.com 피드에서 툴바 아이콘 클릭
3. 옵션에서 **토픽 카테고리**, 목표 갯수, 속도, 자동 시작, 빌더 주소 설정
4. LinkedIn은 봇 탐지·계정 제한 위험이 커서 **기본 꺼짐**. 옵션에서 허용한 뒤에만 동작하며 느린 딜레이·소량을 권장합니다.

### 토픽 카테고리

- **AI** (북마클릿 기본) / **개발·테크** / **경제·금융** / **스타트업·비즈** / **자유 입력**
- 프리셋은 KEEP/WEAK/DROP 정규식이 채워지고 읽기 전용. 자유 입력만 직접 수정.
- 기존에 커스텀 정규식을 저장해 둔 사용자는 자동으로 **자유 입력**으로 마이그레이션됩니다.
- 브리핑 내보내기 시 토픽이 빌더로 전달되어 프롬프트·가중치가 맞춰집니다.

### 소스

| 소스 | 방식 | 비고 |
|---|---|---|
| X | GraphQL harvest + DOM | 기존과 동일 |
| Reddit | 공개 JSON (`/hot.json` 등) | 레이트리밋 시 지수 백오프. DOM 파싱 없음 |
| Threads | 피드 DOM | 선택자 변경 시 패널 경고 |
| LinkedIn | 피드 DOM | 옵션 기본 OFF |

CSV는 기존 24컬럼 뒤에 `source` 컬럼이 붙습니다. JSON에는 `source` 필드가 있습니다.

### 방법 B — 북마클릿

`dist/xsearch-v{버전}.html`에서 버튼을 북마크바로 드래그. 기본 토픽은 AI. 북마클릿 사용자는 새 버전을 **다시 등록**해야 합니다.

## 수정 워크플로

1. `src/` (코어·토픽·어댑터) 또는 `ext/` 수정
2. `package.json` version 올리기
3. `npm test && npm run build && npm run check && npm run verify`
4. 확장 Load Unpacked 새로고침, 북마클릿은 설치 페이지에서 재등록
