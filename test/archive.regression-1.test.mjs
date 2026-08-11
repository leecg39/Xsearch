import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { buildArchive } from '../newsgen/lib/archive.mjs';

// Regression: ISSUE-003 — the archive theme toggle exposed only the symbol "◐" to screen readers.
// Found by /qa on 2026-08-11
// Report: .gstack/qa-reports/qa-report-news-soverin-cloud-2026-08-11.md
test('archive theme toggle has a state-aware accessible name', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'xsearch-theme-a11y-'));
  try {
    await writeFile(path.join(dir, '2026-08-11.html'), '<title>테스트</title>', 'utf8');
    await buildArchive(dir);
    const html = await readFile(path.join(dir, 'index.html'), 'utf8');

    assert.match(html, /<button[^>]+type="button"[^>]+aria-label="다크 모드로 전환"/);
    assert.match(html, /라이트 모드로 전환/);
    assert.match(html, /themeBtn\.setAttribute\('aria-label',label\)/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
