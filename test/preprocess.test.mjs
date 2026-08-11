import test from 'node:test';
import assert from 'node:assert/strict';

import { prepareCandidates, toKst } from '../newsgen/lib/preprocess.mjs';

test('prepareCandidates removes duplicate URLs and ranks AI signals above equal-engagement noise', () => {
  const common = { likes: 10, retweets: 2, bookmarks: 1, replies: 1, views: 1000, time: '2026-08-10T15:30:00Z' };
  const rows = prepareCandidates([
    { ...common, url: 'https://x.com/a/1', text: '점심 메뉴 이야기', handle: 'noise' },
    { ...common, url: 'https://x.com/a/2', text: 'OpenAI GPT agent benchmark', handle: 'ai' },
    { ...common, url: 'https://x.com/a/2', text: '중복 데이터', handle: 'duplicate' },
  ]);

  assert.equal(rows.length, 2);
  assert.equal(rows[0].t.handle, 'ai');
  assert.deepEqual(rows.map((row) => row.i), [1, 2]);
});

test('toKst crosses the UTC date boundary correctly', () => {
  assert.deepEqual(toKst('2026-08-10T15:30:00Z'), { date: '2026-08-11', label: '08-11 00:30' });
  assert.equal(toKst('not-a-date'), null);
});
