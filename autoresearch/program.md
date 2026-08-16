# Research Directive — 소스 테스트 커버리지 상승

## 목표

`newsgen/lib/**` 소스의 테스트 커버리지를 올린다. CLAUDE.md의 "100% 커버리지가 목표"를 향한다.

## Frozen Metric (수정 금지)

측정 커맨드 — 매 이터레이션 동일하게 실행한다:

```bash
node --test --experimental-test-coverage --test-coverage-exclude='test/**' 2>&1 \
 | grep -E "^# all files" \
 | awk -F'|' '{gsub(/ /,"",$2);gsub(/ /,"",$3);gsub(/ /,"",$4); printf "%.2f", ($2+$3+$4)/3}'
```

- composite = (line% + branch% + funcs%) / 3
- 방향: **higher_is_better**
- `--test-coverage-exclude='test/**'` 는 테스트 파일 자신이 점수를 부풀리는 것을 막는다. 절대 제거하지 않는다.

## Baseline (2026-08-16)

| 지표 | 값 |
|------|-----|
| composite | 58.52 |
| line | 66.45 |
| branch | 60.55 |
| funcs | 48.57 |
| 테스트 | 17 pass / 0 fail |

파일별 헤드룸:

| 파일 | line | branch | funcs |
|------|------|--------|-------|
| grok-auth.mjs | 22.27 | 100.00 | 0.00 |
| llm.mjs | 44.34 | 76.47 | 25.00 |
| preprocess.mjs | 68.03 | 58.97 | 75.00 |
| archive.mjs | 93.73 | 48.72 | 73.68 |
| template.mjs | 98.25 | 50.00 | 100.00 |
| job-control.mjs | 100.00 | 100.00 | 100.00 |

## Scope

| 범위 | 경로 | 권한 |
|------|------|------|
| target | `test/**` | ✅ 수정 가능 |
| 소스 | `newsgen/**`, `src/**`, `tools/**`, `build.mjs` | ❌ 수정 금지 |
| 메트릭 정의 | 이 파일의 Frozen Metric 절 | ❌ 수정 금지 |

## Guard (모두 통과해야 keep)

1. `npm test` exit 0 — 기존 17개 테스트가 하나도 깨지지 않는다.
2. `git diff --name-only HEAD~1` 결과가 `test/` 아래 파일만 포함한다.

Guard 실패 시 소스가 아니라 **테스트 구현을 적응**시킨다. 소스를 고쳐 통과시키는 것은 금지.

## 금지 사항 (메트릭 게이밍)

- assertion 없는 테스트로 라인만 실행시키기
- `--test-coverage-exclude` 조작
- 커버리지가 낮은 파일을 측정 대상에서 제외
- 기존 테스트 삭제·약화

모든 새 테스트는 **관찰 가능한 동작을 assert** 해야 한다.

## 힌트

- `grok-auth.mjs` 는 funcs 0% — 순수 함수부터 진입점을 찾는다. 네트워크 호출은 주입·스텁 가능한 경계를 우선한다.
- `llm.mjs` 는 프로바이더 분기(anthropic/openai/gemini/grok)가 넓다. 파싱·검증 유틸이 테스트하기 쉽다.
- `archive.mjs` 는 line 93.73인데 branch 48.72 — 조건 분기(빈 목록, report 없음, digest 타입)가 미검증이다.
- `preprocess.mjs` 는 57-77, 102-122 구간이 통째로 미커버.

## Loop 설정

- 모드: Bounded
- Iterations: 10
