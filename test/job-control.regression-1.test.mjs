import test from 'node:test';
import assert from 'node:assert/strict';

import { generationAdmission } from '../newsgen/lib/job-control.mjs';

// Regression: ISSUE-009 — concurrent jobs could overwrite one date and had no global active limit.
// Found by /qa on 2026-08-11
// Report: .gstack/qa-reports/qa-report-news-soverin-cloud-2026-08-11.md
test('generation admission rejects same-date conflicts and global overflow', () => {
  const jobs = new Map([
    ['running-1', { status: 'running', date: '2026-08-11' }],
    ['completed', { status: 'done', date: '2026-08-10' }],
  ]);

  assert.deepEqual(generationAdmission(jobs, '2026-08-11', 2), {
    statusCode: 409,
    error: '2026-08-11 생성 작업이 이미 진행 중입니다',
  });
  assert.deepEqual(generationAdmission(jobs, '2026-08-12', 1), {
    statusCode: 429,
    error: '동시에 최대 1개 작업만 실행할 수 있습니다',
  });
  assert.equal(generationAdmission(jobs, '2026-08-12', 2), null);
});
