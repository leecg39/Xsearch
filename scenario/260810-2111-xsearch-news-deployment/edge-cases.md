# 경계·오류 시나리오 모음

| ID | 경계 | 기대 결과 | 현재 상태 |
|---|---|---|---|
| S006 | 깨진 JSON | 400 JSON | 실패: 500 |
| S007 | `2026-02-30` | 400, 파일 없음 | 실패: 작업·파일 생성 |
| S008 | 빈/비정형 트윗 배열 | 400 | 통과 |
| S009 | 미지원 provider | 400 | 실패: 502 |
| S010 | 30MB -1/정확히/+1 | 정상/정상/413 | 보류 |
| S021 | import 10/11개, 30분 TTL | 최대 10, 만료 404 | 코드상 11개 가능 |

## 확장 기법

- Boundary: S007, S010, S021
- Missing data: S008, S009
- Malformed data: S006
- Temporal shift: S022, S024
- Concurrency amplification: S018, S019, S023
- Persona/permission shift: S002, S015–S017
