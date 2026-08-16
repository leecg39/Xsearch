import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { buildArchive } from '../newsgen/lib/archive.mjs';

async function withDir(fn) {
  const dir = await mkdtemp(path.join(tmpdir(), 'xsearch-archive-meta-'));
  try { return await fn(dir); } finally { await rm(dir, { recursive: true, force: true }); }
}

const read = (dir) => readFile(path.join(dir, 'index.html'), 'utf8');

test('buildArchive labels a plain HTML page that is neither a report nor a digest', async () => {
  await withDir(async (dir) => {
    await writeFile(path.join(dir, '2026-08-10.html'), '<!doctype html><title>최신</title><main>x</main>', 'utf8');
    await writeFile(path.join(dir, '2026-08-09.html'), '<!doctype html><title>수기 작성 페이지</title><main>x</main>', 'utf8');

    const html = await read(dir);
    const card = html.match(/<a class="card" href="2026-08-09\.html"[\s\S]*?<\/a>/)?.[0] ?? '';

    assert.match(card, />HTML</);
    assert.match(card, /수기 작성 페이지/);
  });
});

test('buildArchive strips the newsletter suffix from page titles', async () => {
  await withDir(async (dir) => {
    await writeFile(path.join(dir, '2026-08-10.html'), '<!doctype html><title>본 제목 | 5분 AI 뉴스</title><main>x</main>', 'utf8');

    const html = await read(dir);

    assert.match(html, /<h1 class="hero-title">본 제목<\/h1>/);
    assert.doesNotMatch(html, /5분 AI 뉴스<\/h1>/);
  });
});

test('buildArchive strips a trailing date from page titles', async () => {
  await withDir(async (dir) => {
    await writeFile(path.join(dir, '2026-08-10.html'), '<!doctype html><title>본 제목 — 2026-08-10 브리핑</title><main>x</main>', 'utf8');

    const html = await read(dir);

    assert.match(html, /<h1 class="hero-title">본 제목<\/h1>/);
  });
});

test('buildArchive leaves the description empty when the page has no meta description', async () => {
  await withDir(async (dir) => {
    await writeFile(path.join(dir, '2026-08-10.html'), '<!doctype html><title>제목만</title><main>x</main>', 'utf8');

    const html = await read(dir);

    assert.match(html, /<p class="hero-desc"><\/p>/);
  });
});

test('buildArchive does not count inlined images or scripts as reading time', async () => {
  await withDir(async (dir) => {
    const bloat = [
      '<!doctype html><title>가벼운 글</title>',
      `<img src="data:image/png;base64,${'A'.repeat(200000)}">`,
      `<script>${'x'.repeat(100000)}</script>`,
      `<style>${'y'.repeat(100000)}</style>`,
      '<main>짧은 본문</main>',
    ].join('');
    await writeFile(path.join(dir, '2026-08-10.html'), bloat, 'utf8');

    const html = await read(dir);

    // 본문이 짧으므로 인라인 자산이 아무리 커도 최소값 3분에 머문다.
    assert.match(html, /3분 읽기/);
    assert.doesNotMatch(html, /\d{3,}분 읽기/);
  });
});

test('buildArchive shows dashes for section and source counts when there is no report', async () => {
  await withDir(async (dir) => {
    await writeFile(path.join(dir, '2026-08-10.html'), '<!doctype html><title>다이제스트 모음</title><main>x</main>', 'utf8');

    const html = await read(dir);
    const stats = html.match(/<div class="hero-stats">[\s\S]*?<\/div>\s*<\/div>/)?.[0] ?? '';

    assert.match(stats, /—/);
  });
});

test('buildArchive counts sections and source tweets from the report', async () => {
  await withDir(async (dir) => {
    await writeFile(path.join(dir, '2026-08-10.html'), '<!doctype html><title>보고서</title><main>x</main>', 'utf8');
    await writeFile(path.join(dir, '2026-08-10.report.json'), JSON.stringify({
      title_main: '보고서 제목',
      description: '설명',
      keywords_top5: ['k1'],
      sections: [{ source_ids: [1, 2, 3] }, { source_ids: [4] }, { source_ids: [] }],
    }), 'utf8');

    const html = await read(dir);
    const stats = html.match(/<div class="hero-stats">[\s\S]*?<\/div>\s*<\/div>/)?.[0] ?? '';

    assert.match(stats, /<b>3<\/b><s>섹션<\/s>/);
    assert.match(stats, /<b>4<\/b><s>출처 트윗<\/s>/);
    assert.match(html, /<span class="kw">#k1<\/span>/);
  });
});

test('buildArchive ignores files that are not date-named briefings', async () => {
  await withDir(async (dir) => {
    await writeFile(path.join(dir, '2026-08-10.html'), '<!doctype html><title>진짜</title><main>x</main>', 'utf8');
    await writeFile(path.join(dir, 'draft.html'), '<!doctype html><title>초안</title>', 'utf8');
    await writeFile(path.join(dir, '2026-8-1.html'), '<!doctype html><title>잘못된 형식</title>', 'utf8');

    const result = await buildArchive(dir);
    const html = await read(dir);

    assert.equal(result.count, 1);
    assert.doesNotMatch(html, /초안/);
    assert.doesNotMatch(html, /잘못된 형식/);
  });
});
