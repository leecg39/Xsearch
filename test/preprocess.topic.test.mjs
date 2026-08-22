import test from 'node:test';
import assert from 'node:assert/strict';

import { aiHits, topicHits, prepareCandidates, toPromptLines } from '../newsgen/lib/preprocess.mjs';

test('topicHits scores finance and dev separately from AI', () => {
  assert.ok(topicHits('연준 금리와 나스닥 ETF', 'finance') > 0);
  assert.equal(topicHits('연준 금리와 나스닥 ETF', 'ai'), 0);
  assert.ok(topicHits('TypeScript docker kubernetes', 'dev') > 0);
  assert.ok(topicHits('시리즈 A 투자 유치 유니콘', 'startup') > 0);
});

test('aiHits is an alias of topicHits(..., ai)', () => {
  const text = 'OpenAI GPT benchmark inference';
  assert.equal(aiHits(text), topicHits(text, 'ai'));
  assert.equal(aiHits(''), topicHits('', 'ai'));
  assert.equal(aiHits(null), 0);
});

test('custom topic with empty keywords scores zero', () => {
  assert.equal(topicHits('OpenAI GPT', 'custom'), 0);
});

test('prepareCandidates can rank a finance topic above AI noise', () => {
  const common = { likes: 10, retweets: 2, bookmarks: 1, replies: 1, views: 1000, time: '2026-08-10T15:30:00Z' };
  const rows = prepareCandidates([
    { ...common, url: 'https://x.com/a/1', text: 'OpenAI GPT agent', handle: 'ai' },
    { ...common, url: 'https://x.com/a/2', text: '연준 금리 인하와 코스피', handle: 'fin' },
  ], { topic: 'finance' });

  assert.equal(rows[0].t.handle, 'fin');
});

test('toPromptLines prefixes non-X sources before the handle', () => {
  const cand = (t) => ({ i: 1, label: '🔥', kst: { label: '08-10 11:45' }, t });
  const reddit = toPromptLines([cand({ handle: 'u/spez', name: 'spez', text: '본문', source: 'reddit' })]);
  assert.match(reddit.split('\n')[0], /\[reddit\] u\/spez/);

  const x = toPromptLines([cand({ handle: '@dev', name: '개발자', text: '본문' })]);
  assert.match(x.split('\n')[0], /^\[1\] 🔥 @dev /);
});
