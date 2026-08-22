import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { buildArchive } from '../newsgen/lib/archive.mjs';

// Regression: ISSUE-004 — search ignored the latest hero and reported no result for its title.
// Found by /qa on 2026-08-11
// Report: .gstack/qa-reports/qa-report-news-soverin-cloud-2026-08-11.md
test('archive search indexes the latest hero together with prior cards', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'xsearch-latest-search-'));
  try {
    await writeFile(
      path.join(dir, '2026-08-11.html'),
      '<title>Muse Glimmer 공개 | 오늘의 AI 브리핑</title><meta name="description" content="최신 기사">',
      'utf8',
    );
    await buildArchive(dir);
    const html = await readFile(path.join(dir, 'index.html'), 'utf8');

    assert.match(html, /<section class="hero" data-search="muse glimmer 공개[\s\S]*?2026-08-11">/);
    assert.match(html, /querySelectorAll\('\.hero,\.card'\)/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
