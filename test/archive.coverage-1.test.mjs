import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { buildArchive } from '../newsgen/lib/archive.mjs';

const report = (titleMain) => JSON.stringify({
  title_main: titleMain,
  title_sub: '부제',
  description: '설명 텍스트',
  keywords_top5: ['키워드A', '키워드B'],
  sections: [{ source_ids: ['t1', 't2'] }, { source_ids: ['t3'] }],
});

async function seed(dir) {
  await writeFile(path.join(dir, '2026-08-10.html'), '<!doctype html><title>최신</title><main>본문</main>', 'utf8');
  await writeFile(path.join(dir, '2026-08-10.report.json'), report('최신 AI 브리핑'), 'utf8');
  await writeFile(path.join(dir, '2026-08-09.html'), '<!doctype html><title>이전</title><main>본문</main>', 'utf8');
  await writeFile(path.join(dir, '2026-08-09.report.json'), report('이전 AI 브리핑'), 'utf8');
  await writeFile(
    path.join(dir, '2026-08-08.html'),
    '<!doctype html><title>8월 8일 다이제스트 | 5분 AI 뉴스</title><meta name="description" content="다이제스트 설명"><main>본문</main>',
    'utf8',
  );
}

test('buildArchive renders past entries as cards and labels each entry type', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'xsearch-archive-cards-'));
  try {
    await seed(dir);

    const result = await buildArchive(dir);
    const html = await readFile(path.join(dir, 'index.html'), 'utf8');

    assert.equal(result.count, 3);

    // 최신 1건은 히어로, 나머지 2건만 카드로 렌더된다.
    const cards = html.match(/<a class="card"/g) ?? [];
    assert.equal(cards.length, 2);
    assert.match(html, /<h1 class="hero-title">최신 AI 브리핑<\/h1>/);
    assert.doesNotMatch(html, /<a class="card" href="2026-08-10\.html"/);

    // report.json이 있으면 'AI 브리핑', 제목에 다이제스트가 있으면 '다이제스트'로 분류된다.
    const digestCard = html.match(/<a class="card" href="2026-08-08\.html"[\s\S]*?<\/a>/)?.[0] ?? '';
    const aiCard = html.match(/<a class="card" href="2026-08-09\.html"[\s\S]*?<\/a>/)?.[0] ?? '';
    assert.match(aiCard, /AI 브리핑/);
    assert.match(digestCard, /다이제스트/);

    // 다이제스트 카드는 report.json이 없으므로 읽기 시간 표기가 붙지 않는다.
    assert.doesNotMatch(digestCard, /\d+분/);
    assert.match(aiCard, /\d+분/);

    // 카드 메타는 MM-DD (요일) 형식이다. 2026-08-09는 일요일.
    assert.match(aiCard, /08-09 \(일\)/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('buildArchive groups past entries by month and marks every published day on the calendar', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'xsearch-archive-cal-'));
  try {
    await seed(dir);

    await buildArchive(dir);
    const html = await readFile(path.join(dir, 'index.html'), 'utf8');

    // 지난 발행분은 월별로 묶이고 건수가 표기된다.
    assert.match(html, /<div class="month-head">2026년 8월/);
    assert.match(html, /2건<\/span>/);

    // 달력에는 발행된 3일이 모두 링크로 찍힌다.
    const marked = [...html.matchAll(/class="cal-day has" href="([^"]+)"/g)].map((m) => m[1]);
    assert.deepEqual(marked, ['2026-08-08.html', '2026-08-09.html', '2026-08-10.html']);

    // 발행되지 않은 날은 링크가 아니라 일반 셀이다.
    assert.match(html, /<span class="cal-day">7<\/span>/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('buildArchive renders an empty-state page when the directory has no briefings', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'xsearch-archive-empty-'));
  try {
    const result = await buildArchive(dir);
    const html = await readFile(path.join(dir, 'index.html'), 'utf8');

    assert.equal(result.count, 0);
    assert.match(html, /아직 발행된 브리핑이 없습니다/);
    assert.doesNotMatch(html, /<a class="card"/);
    assert.doesNotMatch(html, /class="cal-day has"/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
