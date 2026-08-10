# Xsearch News 배포 시나리오

- 대상: `https://news.soverin.cloud`
- 범위: 공개 아카이브, 인증 빌더/API, 확장 가져오기, 생성 작업, Grok OAuth, Docker/Traefik 배포
- 깊이: standard (25)
- 형식: mixed test/threat scenarios
- 생성 시각: 2026-08-10 21:11 KST

## S001 공개 아카이브 탐색

**Dimension:** happy_path  
**Severity:** High

**Actors:** 방문자, 뉴스 서버  
**Precondition:** DNS와 HTTPS가 정상이다.  
**Trigger:** 방문자가 `/`와 `/output/`을 연다.  
**Flow:** `/` 요청 → `/output/` 리다이렉트 → 최신 기사 열기 → OG/썸네일 로드.  
**Expected Outcome:** 리다이렉트 302, 아카이브·기사·이미지 200, 링크가 새 도메인을 가리킨다.  
**What Could Go Wrong:** 잘못된 리다이렉트, 이미지 404, 구 도메인 canonical.  
**Severity Rationale:** 공개 서비스의 핵심 진입 경로다.  
**Evidence:** 운영 프로브 통과. OG 1200×630, 썸네일 640×336.

## S002 인증 경계

**Dimension:** permission  
**Severity:** Critical

**Actors:** 비인증 방문자, 인증 사용자, Traefik  
**Precondition:** Basic 인증 미들웨어가 연결되어 있다.  
**Trigger:** 두 사용자가 `/builder`와 `/api/health`를 요청한다.  
**Flow:** 무자격 요청 → 올바른 자격증명 요청 → 잘못된 비밀번호 요청.  
**Expected Outcome:** 각각 401, 200, 401이다.  
**What Could Go Wrong:** 공개 API 노출, 인증 우회, 공개 아카이브까지 잠김.  
**Severity Rationale:** 생성 API와 OAuth 상태를 보호하는 유일한 외부 경계다.  
**Evidence:** 운영 프로브 통과.

## S003 확장 가져오기에서 빌더 자동 로드

**Dimension:** integration  
**Severity:** High

**Actors:** Chrome 확장, Traefik, 빌더  
**Precondition:** 확장 옵션에 원격 URL·사용자명·비밀번호가 저장되어 있다.  
**Trigger:** 사용자가 수집 결과를 브리핑으로 내보낸다.  
**Flow:** 확장 POST `/api/import` → ID 수신 → `/builder?import=<id>` 열기 → GET 데이터 → 폼 자동 채움.  
**Expected Outcome:** Authorization 헤더가 전송되고 업로드 없이 데이터가 로드된다.  
**What Could Go Wrong:** CORS 실패, 비밀번호 미저장, 가져오기 ID 만료.  
**Severity Rationale:** 실제 제작 흐름의 핵심 연결부다.  
**Evidence:** 정적 계약 확인, 실제 확장 브라우저 시나리오는 보류.

## S004 원격 Grok 승인 흐름

**Dimension:** state_transition  
**Severity:** High

**Actors:** 인증 사용자, 빌더, xAI OAuth  
**Precondition:** `NEWSGEN_APPROVAL_MODE=client`다.  
**Trigger:** 사용자가 SuperGrok 연결을 누른다.  
**Flow:** 기기 코드 발급 → 새 승인 창 → 상태 폴링 → 토큰 저장 → 모델 조회.  
**Expected Outcome:** 팝업 실패 시 직접 열기 링크가 있고, 연결 후 계정 상태가 갱신된다.  
**What Could Go Wrong:** 팝업 차단, 승인 코드 만료, 폴링 상태 고착.  
**Severity Rationale:** AI 브리핑 생성 가능 여부를 결정한다.  
**Evidence:** 코드 경로 확인, 외부 계정 승인은 보류.

## S005 컨테이너 재생성 후 데이터 지속

**Dimension:** recovery  
**Severity:** High

**Actors:** 운영자, Docker Compose, 뉴스 서버  
**Precondition:** output/auth 호스트 볼륨에 파일이 있다.  
**Trigger:** 앱 컨테이너를 재생성한다.  
**Flow:** 기존 파일 해시 기록 → 재생성 → health 대기 → 아카이브와 OAuth 상태 재확인.  
**Expected Outcome:** 기사·토큰이 유지되고 health가 healthy로 복귀한다.  
**What Could Go Wrong:** 볼륨 마운트 누락, UID 권한 오류, 토큰 손실.  
**Severity Rationale:** 장애 복구와 재배포 안전성에 직결된다.  
**Evidence:** 볼륨 구성과 현재 healthy 확인, 실제 재생성은 보류.

## S006 깨진 JSON 요청

**Dimension:** error  
**Severity:** Medium

**Actors:** 확장 또는 API 클라이언트, 뉴스 서버  
**Precondition:** 인증은 성공한다.  
**Trigger:** 본문이 `{`인 요청을 `/api/import`에 보낸다.  
**Flow:** 본문 읽기 → JSON 파싱 실패 → 오류 응답.  
**Expected Outcome:** 구조화된 JSON과 HTTP 400을 반환한다.  
**What Could Go Wrong:** 내부 예외를 500으로 노출해 재시도·모니터링을 왜곡한다.  
**Severity Rationale:** 데이터 손상은 없지만 오류 계약이 틀어진다.  
**Evidence:** 운영에서 500 재현.

## S007 존재하지 않는 달력 날짜

**Dimension:** edge_case  
**Severity:** High

**Actors:** 인증 사용자, 생성 API, 아카이브 빌더  
**Precondition:** 최소 1개의 유효한 트윗이 있다.  
**Trigger:** 날짜 `2026-02-30`으로 다이제스트를 생성한다.  
**Flow:** 형식 검증 → 작업 생성 → HTML 저장 → 아카이브 갱신.  
**Expected Outcome:** 실제 달력 날짜가 아니므로 400이며 파일이 생기지 않는다.  
**What Could Go Wrong:** 잘못된 발행물이 공개 아카이브에 노출된다.  
**Severity Rationale:** 공개 데이터 무결성을 직접 훼손한다.  
**Evidence:** 운영에서 200·파일 생성 재현. 테스트 파일은 격리 후 아카이브 3건으로 복구.

## S008 비어 있거나 형식이 다른 트윗 배열

**Dimension:** data_variation  
**Severity:** Medium

**Actors:** API 클라이언트, 생성 API  
**Precondition:** 인증은 성공한다.  
**Trigger:** 빈 배열 또는 `text`/`handle`이 없는 객체 배열을 보낸다.  
**Flow:** payload 검증 → 오류 응답.  
**Expected Outcome:** 작업을 만들지 않고 400을 반환한다.  
**What Could Go Wrong:** 빈 기사 생성, 런타임 예외.  
**Severity Rationale:** 잘못된 입력을 초기에 차단해야 한다.  
**Evidence:** 두 변형 모두 400 확인.

## S009 지원하지 않는 모델 공급자

**Dimension:** error  
**Severity:** Medium

**Actors:** API 클라이언트, 모델 조회 API  
**Precondition:** 인증은 성공한다.  
**Trigger:** `/api/models`에 `provider=bad`를 보낸다.  
**Flow:** 공급자 확인 → 키 확인 → 모델 조회.  
**Expected Outcome:** 외부 호출 없이 400을 반환한다.  
**What Could Go Wrong:** 알 수 없는 공급자를 외부 통합으로 넘겨 502 또는 비JSON 오류가 난다.  
**Severity Rationale:** 통합 오류와 사용자 입력 오류를 구분하지 못한다.  
**Evidence:** 운영에서 502 재현.

## S010 30MB 본문 경계

**Dimension:** edge_case  
**Severity:** Medium

**Actors:** 확장, Node HTTP 서버  
**Precondition:** 인증은 성공한다.  
**Trigger:** 제한 직전·정확히 제한·제한 초과 본문을 보낸다.  
**Flow:** 스트림 수신 → 크기 누적 → 초과 시 중단 → 응답.  
**Expected Outcome:** 허용 범위는 처리되고 초과는 명확한 413 JSON이다.  
**What Could Go Wrong:** 소켓 destroy 후 500, 이중 resolve/reject, 프록시 502.  
**Severity Rationale:** 큰 수집 데이터의 정상성과 자원 방어가 동시에 걸린다.  
**Evidence:** 코드상 `req.destroy()`와 일반 500 처리 확인, 부하 요청은 보류.

## S011 가져오기 데이터 기반 저장형 XSS

**Dimension:** abuse  
**Severity:** Critical

**Actors:** 악성 데이터 제공자, 인증 사용자, 빌더  
**Precondition:** 사용자가 공격자가 조작한 `fileName` 또는 `lang` 값을 포함한 데이터를 가져온다.  
**Trigger:** 빌더가 파일 정보를 표시한다.  
**Flow:** import 저장 → builder GET → `applyData` → `innerHTML` 삽입 → 스크립트 이벤트 실행.  
**Expected Outcome:** 모든 외부 문자열을 text node 또는 escaping으로 렌더링한다.  
**What Could Go Wrong:** 저장된 API 키·OAuth 관련 UI 데이터 탈취, 사용자 대신 API 호출.  
**Severity Rationale:** 빌더 origin에서 코드 실행이 가능하며 API 키 localStorage 옵션이 존재한다.  
**Evidence:** `file.name`, `lang`을 escape 없이 `innerHTML`에 결합하는 코드 확인. 브라우저 PoC는 보류.

## S012 정적 출력 경로 탈출

**Dimension:** abuse  
**Severity:** Critical

**Actors:** 외부 공격자, 정적 파일 서버  
**Precondition:** 공개 `/output/*` 라우트가 열려 있다.  
**Trigger:** 인코딩·중첩 `../` 경로로 서버 파일을 요청한다.  
**Flow:** URL 파싱 → basename 정규화 → OUT_DIR 파일만 조회.  
**Expected Outcome:** OUT_DIR 밖 파일은 절대 반환하지 않고 404다.  
**What Could Go Wrong:** `.auth/grok.json`, 환경 파일, 소스 노출.  
**Severity Rationale:** 성공 시 인증 토큰 탈취로 이어진다.  
**Evidence:** 코드의 `path.basename` 및 운영 404 확인.

## S013 공개 report JSON 노출 범위

**Dimension:** data_variation  
**Severity:** Low

**Actors:** 공개 방문자, 검색 로봇  
**Precondition:** AI 브리핑에 `.report.json` 동반 파일이 있다.  
**Trigger:** 방문자가 `/output/YYYY-MM-DD.report.json`을 요청한다.  
**Flow:** 공개 정적 라우트 → JSON 반환.  
**Expected Outcome:** 공개 의도된 필드만 있고 토큰·비밀·개인 식별 데이터가 없다.  
**What Could Go Wrong:** 향후 report 스키마에 내부 메모나 비밀이 추가돼 자동 공개된다.  
**Severity Rationale:** 현재 내용은 기사 구성 데이터지만 미래 스키마 변경 위험이 있다.  
**Evidence:** 운영 200, 현재 키 14개 점검.

## S014 브라우저 보안 헤더

**Dimension:** permission  
**Severity:** Medium

**Actors:** 브라우저, Cloudflare, Traefik, 뉴스 서버  
**Precondition:** HTTPS가 정상이다.  
**Trigger:** 아카이브·기사 응답 헤더를 검사한다.  
**Flow:** GET → 엣지/프록시 → 앱 응답.  
**Expected Outcome:** HSTS, nosniff, frame 정책, referrer 정책을 제공하고 CSP 도입 가능성을 검토한다.  
**What Could Go Wrong:** 클릭재킹, MIME 스니핑, 약한 전송 정책.  
**Severity Rationale:** XSS의 영향과 브라우저 공격면을 줄이는 방어층이다.  
**Evidence:** 운영 200 응답에서 관련 헤더가 모두 없음.

## S015 비밀번호 오류와 재사용 세션

**Dimension:** permission  
**Severity:** High

**Actors:** 인증 사용자, 비인증 사용자, 브라우저  
**Precondition:** Basic 인증이 설정되어 있다.  
**Trigger:** 무자격·오자격·정자격 요청을 순차 수행한다.  
**Flow:** 401 challenge → 자격증명 제출 → 세션 내 후속 API 호출.  
**Expected Outcome:** 정자격만 200이며 공개 경로는 자격증명 없이 200이다.  
**What Could Go Wrong:** 브라우저가 구 비밀번호를 캐시하거나 확장 설정과 서버 비밀번호가 어긋난다.  
**Severity Rationale:** 사용성 문제와 보안 경계가 동시에 발생한다.  
**Evidence:** curl 계약 통과, 확장 저장값 확인은 보류.

## S016 CORS 사전요청

**Dimension:** integration  
**Severity:** Medium

**Actors:** x.com 페이지, 확장 background, Traefik  
**Precondition:** cross-origin import가 필요하다.  
**Trigger:** `OPTIONS /api/import`를 보낸다.  
**Flow:** 인증 없는 preflight 라우터 → 허용 origin/method/header → 실제 POST는 인증 라우터.  
**Expected Outcome:** OPTIONS 204, Authorization·content-type 허용, POST는 자격증명이 없으면 401.  
**What Could Go Wrong:** preflight도 인증되어 브라우저가 차단되거나 실제 POST가 공개된다.  
**Severity Rationale:** 확장·북마클릿 연동의 전제다.  
**Evidence:** 운영 OPTIONS 204와 무인증 POST 401 확인.

## S017 Basic 인증 무차별 대입

**Dimension:** abuse  
**Severity:** Medium

**Actors:** 인터넷 공격자, Cloudflare, Traefik  
**Precondition:** 도메인이 공개되어 있고 사용자명이 알려져 있다.  
**Trigger:** 공격자가 반복해 비밀번호를 시도한다.  
**Flow:** 엣지 → Traefik Basic auth → 401 반복.  
**Expected Outcome:** Cloudflare 또는 프록시에서 속도 제한·알림·차단이 적용된다.  
**What Could Go Wrong:** 제한이 없어 온라인 추측과 로그 소음이 누적된다.  
**Severity Rationale:** API가 비용 발생 작업과 OAuth 토큰에 접근한다.  
**Evidence:** Compose에 rate limit 미들웨어 없음; Cloudflare 별도 규칙은 미확인.

## S018 같은 날짜의 동시 생성

**Dimension:** concurrent  
**Severity:** High

**Actors:** 두 브라우저 세션, 생성 작업, 파일 시스템  
**Precondition:** 두 요청이 같은 날짜를 사용한다.  
**Trigger:** 거의 동시에 `/api/generate`를 호출한다.  
**Flow:** 두 작업 병렬 실행 → 같은 HTML/JSON 경로 write → 각각 archive rebuild.  
**Expected Outcome:** 날짜별 잠금 또는 명시적 충돌 정책으로 원자적 결과를 보장한다.  
**What Could Go Wrong:** 마지막 쓰기 승리, HTML/JSON 조합 불일치, archive 중간 상태.  
**Severity Rationale:** 기사 데이터가 조용히 덮어써질 수 있다.  
**Evidence:** 날짜 잠금·임시 파일 rename 없음. 실제 동시 쓰기는 보류.

## S019 생성 작업 폭주와 비용 증폭

**Dimension:** scale  
**Severity:** High

**Actors:** 인증 사용자 또는 탈취된 자격증명, LLM 공급자  
**Precondition:** API 키 또는 Grok 토큰이 연결되어 있다.  
**Trigger:** 다수의 AI 생성 요청을 빠르게 제출한다.  
**Flow:** 각 요청 즉시 running job 등록 → 병렬 외부 호출 → 메모리·CPU·비용 증가.  
**Expected Outcome:** 동시성 제한, 큐, 사용자별 속도 제한, 중복 방지가 있다.  
**What Could Go Wrong:** 비용 폭증, 1GB 컨테이너 OOM, 공급자 제한.  
**Severity Rationale:** 단일 인증 비밀 탈취가 직접 비용·가용성 사고로 이어진다.  
**Evidence:** 서버에 전역 동시성 제한이 없음.

## S020 완료 작업 정리

**Dimension:** scale  
**Severity:** Medium

**Actors:** 생성 API, 장기 실행 컨테이너  
**Precondition:** 작업이 20개 이상 누적된다.  
**Trigger:** 새 작업을 계속 생성한다.  
**Flow:** jobs Map 삽입 → 오래된 non-running 삭제 → running 보존.  
**Expected Outcome:** 완료·실패 작업은 TTL 또는 상한에 따라 확실히 제거된다.  
**What Could Go Wrong:** running 폭주 시 상한을 넘고, 새 요청이 없으면 완료 후에도 Map이 큰 채 남는다.  
**Severity Rationale:** 장기 가용성과 메모리 예측성을 해친다.  
**Evidence:** 현재 정리 로직의 조건부 삭제 확인.

## S021 가져오기 10개 상한과 TTL

**Dimension:** edge_case  
**Severity:** Low

**Actors:** 확장, imports Map  
**Precondition:** 만료되지 않은 가져오기가 10개 있다.  
**Trigger:** 11번째 가져오기를 저장한다.  
**Flow:** 저장 전 prune → size 10이면 삭제 없음 → 새 항목 추가.  
**Expected Outcome:** 저장 후에도 최대 10개이며 30분 이후 접근은 404다.  
**What Could Go Wrong:** 실제 최대가 11개가 되고 TTL 정리가 새 import 때만 실행된다.  
**Severity Rationale:** 영향은 작은 메모리·계약 불일치다.  
**Evidence:** 저장 전 prune 순서로 off-by-one 확인.

## S022 재시작 중 작업·가져오기 손실

**Dimension:** recovery  
**Severity:** Medium

**Actors:** 사용자, 컨테이너, 인메모리 작업 저장소  
**Precondition:** import 또는 generation이 진행 중이다.  
**Trigger:** 컨테이너가 재시작된다.  
**Flow:** Map 초기화 → 기존 builder 폴링/ID 조회 → 404.  
**Expected Outcome:** UI가 명확한 복구 안내를 제공하고 이미 완성된 출력은 유지된다.  
**What Could Go Wrong:** 화면이 무한 폴링하거나 사용자가 결과 손실 원인을 모른다.  
**Severity Rationale:** 배포·장애 시 사용자 작업이 끊긴다.  
**Evidence:** jobs/imports가 인메모리이며 폴링 catch가 오류를 숨김.

## S023 동시 Grok 연결 시작

**Dimension:** concurrent  
**Severity:** Medium

**Actors:** 두 브라우저 탭, OAuth device session  
**Precondition:** 아직 연결되지 않았다.  
**Trigger:** 두 탭에서 거의 동시에 연결을 누른다.  
**Flow:** 첫 device 세션 생성 → 두 번째가 전역 `device` 교체 → 첫 poll 종료.  
**Expected Outcome:** 기존 pending을 재사용하거나 새 연결 시작을 409로 거절한다.  
**What Could Go Wrong:** 첫 탭의 코드는 승인해도 상태가 완료되지 않는다.  
**Severity Rationale:** 계정 연결 UX를 불안정하게 만든다.  
**Evidence:** 단일 전역 `device` 상태 확인.

## S024 OAuth 토큰 만료와 갱신

**Dimension:** temporal  
**Severity:** High

**Actors:** 뉴스 서버, xAI OAuth, 영속 auth 볼륨  
**Precondition:** access token이 5분 이내 만료되고 refresh token이 있다.  
**Trigger:** 모델 조회 또는 생성이 토큰을 요청한다.  
**Flow:** exp 확인 → 단일 비행 refresh → 회전 토큰 원자 저장 → 요청 재개.  
**Expected Outcome:** 동시 요청에도 refresh 1회, 실패 시 재로그인 안내, 파일 0600 유지.  
**What Could Go Wrong:** 회전 토큰 경쟁, 컨테이너 UID 쓰기 실패, 영구 로그아웃.  
**Severity Rationale:** 장기 운영에서 생성 기능 지속성에 직결된다.  
**Evidence:** 단일 비행·임시 파일 rename 구현 확인, 실제 만료 시나리오는 보류.

## S025 운영 이미지와 저장소 소스 드리프트

**Dimension:** integration  
**Severity:** High

**Actors:** 개발자, 로컬 작업 트리, Docker 빌드  
**Precondition:** 운영 컨테이너에 수동 동기화된 패치가 있다.  
**Trigger:** 현재 로컬 작업 트리로 다시 빌드·배포한다.  
**Flow:** Docker COPY → 로컬 source/template/assets 사용 → 컨테이너 시작 → archive rebuild.  
**Expected Outcome:** 저장소가 운영 코드·자산의 완전한 원본이며 재배포가 동일 결과를 만든다.  
**What Could Go Wrong:** `thumbnail.jpg` 404, 새 기사의 OG가 icon128, archive가 구 스타일로 되돌아간다.  
**Severity Rationale:** 정상 운영 상태가 다음 배포에서 확실히 회귀한다.  
**Evidence:** 운영에는 OG route/template/archive/thumbnail이 있으나 로컬에는 source 변경과 thumbnail 파일이 없음.
