import test from 'node:test';
import assert from 'node:assert/strict';

import { aiHits, engagementScore, labelOf, prepareCandidates } from '../newsgen/lib/preprocess.mjs';

test('aiHits scores one point per language family and caps at three', () => {
  assert.equal(aiHits('인공지능 AI 人工知能'), 3);
  assert.equal(aiHits('인공지능 모델'), 1);
  assert.equal(aiHits('그냥 잡담'), 0);
  assert.equal(aiHits(''), 0);
  assert.equal(aiHits(null), 0);
});

test('aiHits adds a point when several English AI keywords appear together', () => {
  assert.ok(aiHits('OpenAI GPT benchmark inference') > aiHits('OpenAI 소식'));
});

test('aiHits requires word boundaries for short English acronyms', () => {
  assert.equal(aiHits('email chain'), 0); // 'ai'가 단어 안에 있으면 잡지 않는다
  assert.ok(aiHits('AI 규제') > 0);
});

test('labelOf marks a small account with an unusually high like rate as rising', () => {
  assert.equal(labelOf({ views: 10000, likes: 300 }), '🚀');
});

test('labelOf distinguishes discussion, sharing and saving patterns', () => {
  assert.equal(labelOf({ likes: 100, replies: 100 }), '💬');
  assert.equal(labelOf({ likes: 200, retweets: 101 }), '🔁');
  assert.equal(labelOf({ likes: 300, bookmarks: 201 }), '🔖');
});

test('labelOf falls back to popularity when no ratio stands out', () => {
  assert.equal(labelOf({ likes: 50 }), '🔥');
  assert.equal(labelOf({}), '🔥');
});

test('labelOf ignores ratios that clear the threshold on tiny absolute counts', () => {
  assert.equal(labelOf({ likes: 1, replies: 10 }), '🔥'); // 댓글 80건 미만
  assert.equal(labelOf({ likes: 1, retweets: 10 }), '🔥'); // 리트윗 100건 미만
  assert.equal(labelOf({ likes: 1, bookmarks: 10 }), '🔥'); // 북마크 200건 미만
});

test('labelOf does not treat a high-view post as rising', () => {
  assert.equal(labelOf({ views: 90000, likes: 5000 }), '🔥'); // 조회 8만 이상은 제외
});

test('engagementScore is zero without engagement and grows with it', () => {
  assert.equal(engagementScore({}), 0);
  assert.equal(engagementScore({ likes: 'many' }), 0); // 숫자가 아니면 0으로 취급

  assert.ok(engagementScore({ likes: 1000 }) > engagementScore({ likes: 10 }));
  assert.ok(engagementScore({ retweets: 100 }) > engagementScore({ likes: 100 })); // 리트윗 가중치가 더 높다
});

test('prepareCandidates honours the limit option and numbers survivors in order', () => {
  const tweets = Array.from({ length: 8 }, (_, n) => ({
    text: `인공지능 소식 ${n}`,
    handle: `u${n}`,
    likes: (n + 1) * 100,
    time: '2026-08-10T00:00:00Z',
    url: `https://x.com/u${n}/status/${n}`,
  }));

  const picked = prepareCandidates(tweets, { limit: 3 });

  assert.equal(picked.length, 3);
  assert.deepEqual(picked.map((c) => c.i), [1, 2, 3]);
  assert.ok(picked.every((c) => typeof c.label === 'string' && c.label.length > 0));
});

test('prepareCandidates applies a default limit when none is given', () => {
  const picked = prepareCandidates([
    { text: '인공지능', handle: 'a', likes: 5, time: '2026-08-10T00:00:00Z', url: 'https://x.com/a/1' },
  ]);

  assert.equal(picked.length, 1);
  assert.equal(picked[0].i, 1);
});

test('prepareCandidates tolerates an empty input list', () => {
  assert.deepEqual(prepareCandidates([]), []);
});
