import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { buildArchive } from '../newsgen/lib/archive.mjs';

test('buildArchive publishes canonical and large OG metadata without thumbnail backgrounds', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'xsearch-archive-'));
  try {
    await writeFile(
      path.join(dir, '2026-08-10.html'),
      '<!doctype html><title>테스트 브리핑 | 오늘의 AI 브리핑</title><meta name="description" content="테스트 설명"><main>본문</main>',
      'utf8',
    );

    const result = await buildArchive(dir);
    const html = await readFile(path.join(dir, 'index.html'), 'utf8');

    assert.equal(result.count, 1);
    assert.match(html, /<link rel="canonical" href="https:\/\/news\.soverin\.cloud\/output\/">/);
    assert.match(html, /<meta property="og:image" content="https:\/\/news\.soverin\.cloud\/og-image\.jpg">/);
    assert.match(html, /<meta name="twitter:card" content="summary_large_image">/);
    assert.doesNotMatch(html, /thumbnail\.jpg/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
