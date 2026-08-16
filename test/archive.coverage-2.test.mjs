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

/** 픽스처를 쓰고 아카이브를 생성한 뒤 index.html을 돌려준다. */
async function build(dir, files) {
  for (const [name, body] of Object.entries(files)) {
    await writeFile(path.join(dir, name), body, 'utf8');
  }
  const result = await buildArchive(dir);
  return { result, html: await readFile(path.join(dir, 'index.html'), 'utf8') };
}

const page = (title, extra = '') => `<!doctype html><title>${title}</title>${extra}<main>본문</main>`;

test('buildArchive labels a plain HTML page that is neither a report nor a digest', async () => {
  await withDir(async (dir) => {
    const { html } = await build(dir, {
      '2026-08-10.html': page('최신'),
      '2026-08-09.html': page('수기 작성 페이지'),
    });
    const card = html.match(/<a class="card" href="2026-08-09\.html"[\s\S]*?<\/a>/)?.[0] ?? '';

    assert.match(card, />HTML</);
    assert.match(card, /수기 작성 페이지/);
  });
});

test('buildArchive strips the newsletter suffix from page titles', async () => {
  await withDir(async (dir) => {
    const { html } = await build(dir, { '2026-08-10.html': page('본 제목 | 5분 AI 뉴스') });

    assert.match(html, /<h1 class="hero-title">본 제목<\/h1>/);
  });
});

test('buildArchive strips a trailing date from page titles', async () => {
  await withDir(async (dir) => {
    const { html } = await build(dir, { '2026-08-10.html': page('본 제목 — 2026-08-10 브리핑') });

    assert.match(html, /<h1 class="hero-title">본 제목<\/h1>/);
  });
});

test('buildArchive leaves the description empty when the page has no meta description', async () => {
  await withDir(async (dir) => {
    const { html } = await build(dir, { '2026-08-10.html': page('제목만') });

    assert.match(html, /<p class="hero-desc"><\/p>/);
  });
});

test('buildArchive carries the meta description into the hero', async () => {
  await withDir(async (dir) => {
    const { html } = await build(dir, {
      '2026-08-10.html': page('제목', '<meta name="description" content="요약 문장">'),
    });

    assert.match(html, /<p class="hero-desc">요약 문장<\/p>/);
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
    const { html } = await build(dir, { '2026-08-10.html': bloat });

    // 본문이 짧으므로 인라인 자산이 아무리 커도 최소값 3분에 머문다.
    assert.match(html, /3분 읽기/);
    assert.doesNotMatch(html, /\d{3,}분 읽기/);
  });
});

test('buildArchive shows dashes for section and source counts when there is no report', async () => {
  await withDir(async (dir) => {
    const { html } = await build(dir, { '2026-08-10.html': page('다이제스트 모음') });
    const stats = html.match(/<div class="hero-stats">[\s\S]*?<\/div>\s*<\/div>/)?.[0] ?? '';

    assert.match(stats, /—/);
  });
});

test('buildArchive counts sections and source tweets from the report', async () => {
  await withDir(async (dir) => {
    const { html } = await build(dir, {
      '2026-08-10.html': page('보고서'),
      '2026-08-10.report.json': JSON.stringify({
        title_main: '보고서 제목',
        description: '설명',
        keywords_top5: ['k1'],
        sections: [{ source_ids: [1, 2, 3] }, { source_ids: [4] }, { source_ids: [] }],
      }),
    });
    const stats = html.match(/<div class="hero-stats">[\s\S]*?<\/div>\s*<\/div>/)?.[0] ?? '';

    assert.match(stats, /<b>3<\/b><s>섹션<\/s>/);
    assert.match(stats, /<b>4<\/b><s>출처 트윗<\/s>/);
    assert.match(html, /<span class="kw">#k1<\/span>/);
  });
});

test('buildArchive ignores files that are not date-named briefings', async () => {
  await withDir(async (dir) => {
    const { result, html } = await build(dir, {
      '2026-08-10.html': page('진짜'),
      'draft.html': page('초안'),
      '2026-8-1.html': page('잘못된 형식'),
    });

    assert.equal(result.count, 1);
    assert.doesNotMatch(html, /초안/);
    assert.doesNotMatch(html, /잘못된 형식/);
  });
});

test('buildArchive survives a report.json that is not valid JSON', async () => {
  await withDir(async (dir) => {
    const { result, html } = await build(dir, {
      '2026-08-10.html': page('깨진 보고서'),
      '2026-08-10.report.json': '{ 깨진 JSON',
    });

    assert.equal(result.count, 1); // 항목이 사라지지 않는다
    assert.match(html, /깨진 보고서/); // report 없이 HTML 메타로 대체된다
  });
});
