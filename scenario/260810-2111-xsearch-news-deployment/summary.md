# 오토리서치 요약

## 범위와 결과

- 시나리오: 25개
- 탐색 차원: 12/12
- Critical: 3, High: 10, Medium: 10, Low: 2
- 운영 통과 확인: 공개 경로, 인증 경계, 입력 기본 검증, 경로 탈출 방지, CORS preflight, TLS 인증서, OG 이미지 크기·해시
- 실제 결함 재현: 3개
- 정적 고위험 결함: 4개

## 우선 수정 대상

1. **S011 — 저장형 XSS:** `fileName`·`lang`을 `innerHTML`에 직접 결합한다. `textContent`/DOM 생성으로 교체하고 회귀 테스트가 필요하다.
2. **S025 — 배포 드리프트:** 운영에만 존재하는 OG/thumbnail source와 파일을 로컬 작업 트리로 되돌려 다음 재배포 회귀를 막아야 한다.
3. **S007 — 날짜 무결성:** 정규식뿐 아니라 실제 UTC 달력 날짜인지 검증해야 한다.
4. **S018/S019 — 동시성·비용:** 날짜별 잠금, 전체 작업 큐/상한, 중복 제출 방지가 필요하다.
5. **S006/S009/S010 — 오류 계약:** malformed JSON과 크기 초과는 400/413, 미지원 provider는 400 JSON이어야 한다.
6. **S014/S017 — 방어층:** 보안 헤더와 rate limit을 Traefik 또는 앱에 추가한다.

## 운영 증거

- `/output/`, 날짜별 기사, `/og-image.jpg`, `/thumbnail.jpg`: 200
- `/builder`, `/api/health`: 비인증 401 / 인증 200
- TLS: `CN=soverin.cloud`, Google Trust Services, 2026-10-04 만료
- 컨테이너: `xsearch-news-app-1`, healthy
- OG: 1200×630, 로컬·운영 SHA-256 일치
- 썸네일: 640×336, 운영에만 존재
- 잘못된 날짜 테스트 산출물: 운영 경로에서 제거 후 `/docker/xsearch-news/data/qa-quarantine/2026-02-30.html.qa-20260810`로 이동, 아카이브 3건 복구

## QA 보류 조건

브라우저 기반 Standard QA와 수정 작업은 기존 미커밋 변경 보존 방식 및 gstack 업그레이드 선택이 필요하다. 현재 코드 변경은 수행하지 않았다.

## handoff_hint

`S011,S025,S007,S018,S019,S006,S009,S010,S014,S017` 순으로 Standard QA에서 재현·수정한다. 먼저 작업 트리를 기준선 커밋으로 보존한 뒤, 브라우저 PoC와 모바일/콘솔/네트워크 회귀를 실행한다.
