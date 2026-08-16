import test from 'node:test';
import assert from 'node:assert/strict';

import { buildUserPrompt, normalizeReport } from '../newsgen/lib/llm.mjs';

const minimal = { sections: [{ title: 'T', bullets: ['b'] }] };

test('buildUserPrompt embeds the date, candidate count and tweet list between markers', () => {
  const prompt = buildUserPrompt({
    date: '2026-08-10',
    cands: [{ i: 1 }, { i: 2 }, { i: 3 }],
    promptLines: '[1] 트윗 본문',
  });

  assert.match(prompt, /보고서 날짜: 2026-08-10/);
  assert.match(prompt, /후보 트윗: 3개/);

  const body = prompt.split('=== 트윗 목록 시작 ===')[1].split('=== 트윗 목록 끝 ===')[0];
  assert.equal(body.trim(), '[1] 트윗 본문');
});

test('normalizeReport pads stats to exactly four slots and fills blanks with a dash', () => {
  const out = normalizeReport({ ...minimal, stats: [{ value: '12', label: '건' }] }, '2026-08-10');

  assert.equal(out.stats.length, 4);
  assert.deepEqual(out.stats[0], { value: '12', label: '건', sub: '' });
  assert.deepEqual(out.stats[3], { value: '—', label: '', sub: '' });
});

test('normalizeReport truncates stats beyond four', () => {
  const stats = [1, 2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: 'L' }));
  const out = normalizeReport({ ...minimal, stats }, '2026-08-10');

  assert.equal(out.stats.length, 4);
  assert.equal(out.stats[3].value, '4');
});

test('normalizeReport enforces per-section caps and drops unusable entries', () => {
  const out = normalizeReport({
    sections: [
      {
        title: 'A',
        bullets: ['b1', 'b2', 'b3', 'b4', 'b5', 'b6', '', '  '],
        figures: [{ i: 1 }, { i: 2 }, { i: 3 }, { i: 'x' }],
        tags: ['t1', 't2', 't3', 't4', 't5'],
        source_ids: [1, '2', 'nope'],
      },
      { title: '빈 섹션', bullets: [] },
    ],
  }, '2026-08-10');

  assert.equal(out.sections.length, 1); // bullets 없는 섹션은 버려진다
  assert.equal(out.sections[0].bullets.length, 5);
  assert.equal(out.sections[0].figures.length, 2);
  assert.equal(out.sections[0].tags.length, 4);
  assert.deepEqual(out.sections[0].source_ids, [1, 2]); // 숫자로 못 바꾸는 값은 제외
});

test('normalizeReport keeps at most seven sections', () => {
  const sections = Array.from({ length: 9 }, (_, n) => ({ title: `S${n}`, bullets: ['b'] }));
  const out = normalizeReport({ sections }, '2026-08-10');

  assert.equal(out.sections.length, 7);
});

test('normalizeReport supplies the four sentiment pins with default positions', () => {
  const out = normalizeReport(minimal, '2026-08-10');

  assert.deepEqual(out.sentiment.pins.map((p) => p.name), ['전환', '성장', '주의', '과열']);
  assert.deepEqual(out.sentiment.pins.map((p) => p.pos), [10, 40, 70, 92]);
});

test('normalizeReport clamps pin positions into the 2-98 range and keeps pin text', () => {
  const out = normalizeReport({
    ...minimal,
    sentiment: {
      pins: [
        { name: '전환', pos: -50, text: '아래로 벗어남' },
        { name: '과열', pos: 999 },
        { name: '성장', pos: 'NaN아님' },
      ],
    },
  }, '2026-08-10');
  const byName = Object.fromEntries(out.sentiment.pins.map((p) => [p.name, p]));

  assert.equal(byName['전환'].pos, 2);
  assert.equal(byName['전환'].text, '아래로 벗어남');
  assert.equal(byName['과열'].pos, 98);
  assert.equal(byName['성장'].pos, 40); // 숫자가 아니면 기본값으로 되돌아간다
});

test('normalizeReport falls back to a generated title and an intro-derived description', () => {
  const intro = '가'.repeat(200);
  const out = normalizeReport({ ...minimal, intro }, '2026-08-10');

  assert.equal(out.title_main, '2026-08-10 AI 뉴스');
  assert.equal(out.description.length, 140);
  assert.equal(out.date, '2026-08-10');
});

test('normalizeReport drops incomplete timeline rows and tips', () => {
  const out = normalizeReport({
    ...minimal,
    timeline: [{ time: '09:00', text: '발표' }, { time: '', text: '시간 없음' }, { time: '10:00' }],
    tips: [{ title: '팁', body: '내용', i: 3 }, { title: '본문 없음' }],
  }, '2026-08-10');

  assert.deepEqual(out.timeline, [{ time: '09:00', text: '발표' }]);
  assert.equal(out.tips.length, 1);
  assert.equal(out.tips[0].i, 3);
});

test('normalizeReport rejects a hero figure without a numeric index', () => {
  const bad = normalizeReport({ ...minimal, hero_figure: { caption: '설명만' } }, '2026-08-10');
  const good = normalizeReport({ ...minimal, hero_figure: { i: 2, caption: '설명' } }, '2026-08-10');

  assert.equal(bad.hero_figure, null);
  assert.deepEqual(good.hero_figure, { i: 2, caption: '설명' });
});
