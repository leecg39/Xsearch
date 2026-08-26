import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

import {
  buildArchive,
  siteBrand,
  topicFromReport,
  topicFromTitle,
} from '../newsgen/lib/archive.mjs';

test('topicFromTitle reads the newsletter suffix and falls back to AI', () => {
  assert.equal(topicFromTitle(''), 'ai');
  assert.equal(topicFromTitle('본 제목 | 5분 AI 뉴스'), 'ai');
  assert.equal(topicFromTitle('본 제목 | 오늘의 AI 브리핑'), 'ai');
  assert.equal(topicFromTitle('본 제목 | 오늘의 금융/경제 브리핑'), 'finance');
  assert.equal(topicFromTitle('본 제목 | 오늘의 엔터 브리핑'), 'ent');
  assert.equal(topicFromTitle('본 제목 | 오늘의 자유 입력 브리핑'), 'custom');
  assert.equal(topicFromTitle('본 제목 | 오늘의 없는토픽 브리핑'), 'ai');
});

test('topicFromReport prefers report.topic and ignores blanks', () => {
  assert.equal(topicFromReport({ topic: 'finance' }, '오늘의 AI 브리핑'), 'finance');
  assert.equal(topicFromReport({ topic: 'nope' }, '오늘의 금융/경제 브리핑'), 'ai');
  assert.equal(topicFromReport({ topic: '' }, '오늘의 엔터 브리핑'), 'ent');
  assert.equal(topicFromReport(null, '오늘의 금융/경제 브리핑'), 'finance');
  assert.equal(topicFromReport({}, '제목만'), 'ai');
});

test('siteBrand uses a generic name when topics are mixed', () => {
  assert.equal(siteBrand([]).newsletter, '오늘의 AI 브리핑');
  assert.equal(siteBrand(null).newsletter, '오늘의 AI 브리핑');
  assert.equal(siteBrand([{ topic: 'finance' }]).newsletter, '오늘의 금융/경제 브리핑');
  assert.equal(siteBrand([{ topic: 'finance' }, { topic: 'finance' }]).newsletter, '오늘의 금융/경제 브리핑');
  const mixed = siteBrand([{ topic: 'ai' }, { topic: 'finance' }]);
  assert.equal(mixed.key, 'mixed');
  assert.equal(mixed.newsletter, '오늘의 브리핑');
  assert.equal(siteBrand([{ topic: '' }, { topic: null }]).newsletter, '오늘의 AI 브리핑');
});

test('buildArchive brands a finance report and infers topic from digest titles', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'xsearch-archive-topic-'));
  try {
    await writeFile(path.join(dir, '2026-08-18.html'), '<!doctype html><title>최신</title><main>본문</main>', 'utf8');
    await writeFile(path.join(dir, '2026-08-18.report.json'), JSON.stringify({
      topic: 'finance',
      title_main: '금리 인하 신호',
      title_sub: '부제',
      description: '설명',
      keywords_top5: ['연준'],
      sections: [{ source_ids: ['t1'] }],
    }), 'utf8');
    await writeFile(
      path.join(dir, '2026-08-17.html'),
      '<!doctype html><title>X 트렌드 다이제스트 — 2026-08-17 | 오늘의 엔터 브리핑</title><main>다이제스트 본문</main>',
      'utf8',
    );

    const result = await buildArchive(dir);
    const html = await readFile(path.join(dir, 'index.html'), 'utf8');
    assert.equal(result.count, 2);

    assert.match(html, /<title>오늘의 브리핑 — 아카이브<\/title>/);
    assert.match(html, /토픽별 데일리 브리핑 아카이브/);
    assert.match(html, /금리 인하 신호/);
    assert.match(html, /오늘의<br>금융\/경제 브리핑/);
    assert.match(html, /금융\/경제 브리핑/);

    const digestCard = html.match(/<a class="card" href="2026-08-17\.html"[\s\S]*?<\/a>/)?.[0] ?? '';
    assert.match(digestCard, /오늘의 엔터 브리핑/);
    assert.match(digestCard, /다이제스트/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('buildArchive keeps AI chrome when every entry is the AI topic', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'xsearch-archive-ai-brand-'));
  try {
    await writeFile(path.join(dir, '2026-08-18.html'), '<!doctype html><title>최신 | 오늘의 AI 브리핑</title><main>본문</main>', 'utf8');
    await writeFile(path.join(dir, '2026-08-18.report.json'), JSON.stringify({
      title_main: '모델 발표',
      description: '설명',
      sections: [{ source_ids: ['t1'] }],
    }), 'utf8');

    await buildArchive(dir);
    const html = await readFile(path.join(dir, 'index.html'), 'utf8');
    assert.match(html, /<title>오늘의 AI 브리핑 — 아카이브<\/title>/);
    assert.match(html, /매일 아침 AI 브리핑 아카이브/);
    assert.doesNotMatch(html, /오늘의 브리핑 — 아카이브/);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('buildArchive renders category tabs only when topics differ', async () => {
  const mixed = await mkdtemp(path.join(tmpdir(), 'xsearch-archive-tabs-'));
  try {
    await writeFile(path.join(mixed, '2026-08-18.html'), '<!doctype html><title>금융</title><main>본문</main>', 'utf8');
    await writeFile(path.join(mixed, '2026-08-18.report.json'), JSON.stringify({
      topic: 'finance', title_main: '금리', title_sub: '부제', description: '설명',
      keywords_top5: ['연준'], sections: [{ source_ids: ['t1'] }],
    }), 'utf8');
    await writeFile(path.join(mixed, '2026-08-17.html'), '<!doctype html><title>엔터</title><main>본문</main>', 'utf8');
    await writeFile(path.join(mixed, '2026-08-17.report.json'), JSON.stringify({
      topic: 'ent', title_main: '컴백', title_sub: '부제', description: '설명',
      keywords_top5: ['아이돌'], sections: [{ source_ids: ['t2'] }],
    }), 'utf8');

    await buildArchive(mixed);
    const html = await readFile(path.join(mixed, 'index.html'), 'utf8');
    assert.match(html, /id="topicTabs"/);
    assert.match(html, /data-t="finance">금융\/경제</);
    assert.match(html, /data-t="ent">엔터</);
    assert.match(html, /data-topic="finance"/);
    assert.match(html, /data-topic="ent"/);
  } finally {
    await rm(mixed, { recursive: true, force: true });
  }
});

test('buildArchive hides tabs when every entry shares one topic', async () => {
  const solo = await mkdtemp(path.join(tmpdir(), 'xsearch-archive-solo-'));
  try {
    await writeFile(path.join(solo, '2026-08-18.html'), '<!doctype html><title>AI</title><main>본문</main>', 'utf8');
    await writeFile(path.join(solo, '2026-08-18.report.json'), JSON.stringify({
      topic: 'ai', title_main: '모델', title_sub: '부제', description: '설명',
      keywords_top5: ['GPT'], sections: [{ source_ids: ['t1'] }],
    }), 'utf8');

    await buildArchive(solo);
    const html = await readFile(path.join(solo, 'index.html'), 'utf8');
    assert.doesNotMatch(html, /id="topicTabs"/);
  } finally {
    await rm(solo, { recursive: true, force: true });
  }
});
