import test from 'node:test';
import assert from 'node:assert/strict';

import { analyze, toPromptLines } from '../newsgen/lib/preprocess.mjs';

test('analyze summarises language mix, AI share, likes and the KST time range', () => {
  const stats = analyze([
    { lang: 'ko', text: '인공지능 모델 발표', likes: 100, time: '2026-08-09T15:00:00Z' },
    { lang: 'ko', text: '점심 뭐 먹지', likes: 5, time: '2026-08-10T02:45:00Z' },
    { lang: 'en', text: 'OpenAI GPT benchmark inference', likes: 20, time: '2026-08-10T00:00:00Z' },
  ]);

  assert.equal(stats.total, 3);
  assert.equal(stats.aiCount, 2); // AI 신호가 없는 '점심' 트윗은 제외된다
  assert.equal(stats.likesSum, 125);
  assert.deepEqual(stats.langTop, [['ko', 2], ['en', 1]]); // 빈도 내림차순
  assert.equal(stats.rangeKst, '08-10 00:00 ~ 08-10 11:45');
});

test('analyze counts AI signals inside quoted tweets', () => {
  const stats = analyze([
    { text: '이거 봐', quoted: { text: '인공지능 모델 공개' }, likes: 1, time: '2026-08-10T00:00:00Z' },
  ]);

  assert.equal(stats.aiCount, 1);
});

test('analyze ignores unparsable timestamps and non-numeric likes', () => {
  const stats = analyze([
    { text: 'a', likes: 'many', time: 'not-a-date' },
    { text: 'b', likes: 7, time: '2026-08-10T02:45:00Z' },
  ]);

  assert.equal(stats.likesSum, 7); // 'many'는 0으로 취급
  assert.equal(stats.rangeKst, '08-10 11:45 ~ 08-10 11:45'); // 유효한 시각 1건만 범위에 반영
});

test('analyze returns an empty summary for no tweets', () => {
  const stats = analyze([]);

  assert.equal(stats.total, 0);
  assert.equal(stats.aiCount, 0);
  assert.equal(stats.likesSum, 0);
  assert.deepEqual(stats.langTop, []);
  assert.equal(stats.rangeKst, '-');
});

const cand = (i, t) => ({ i, label: '🔥', kst: { label: '08-10 11:45' }, t });

test('toPromptLines renders a header, body and blank separator per candidate', () => {
  const out = toPromptLines([
    cand(1, {
      handle: '@dev', verified: true, name: '개발자', text: '본문입니다',
      likes: 10, retweets: 2, replies: 1, bookmarks: 3, views: 900, media: 'img',
    }),
  ]);
  const lines = out.split('\n');

  assert.match(lines[0], /^\[1\] 🔥 @dev✓ \(개발자\) 08-10 11:45KST/);
  assert.match(lines[0], /❤10 🔁2 💬1 🔖3 👁900/);
  assert.match(lines[0], /미디어:이미지/);
  assert.equal(lines[1], '본문입니다');
  assert.equal(lines[2], ''); // 후보 사이 빈 줄
});

test('toPromptLines maps media kinds and marks missing media with a dash', () => {
  const video = toPromptLines([cand(1, { handle: 'a', text: 'x', media: 'video/mp4' })]);
  const image = toPromptLines([cand(1, { handle: 'a', text: 'x', media: 'img' })]);
  const other = toPromptLines([cand(1, { handle: 'a', text: 'x', media: 'gif' })]);
  const none = toPromptLines([cand(1, { handle: 'a', text: 'x' })]);

  assert.match(video, /미디어:영상/);
  assert.match(image, /미디어:이미지/);
  assert.match(other, /미디어:gif/);
  assert.match(none, /미디어:-/);
});

test('toPromptLines appends quoted tweets and article titles as separate lines', () => {
  const out = toPromptLines([
    cand(1, { handle: 'a', text: '본문', quoted: { user: '인용계정', text: '인용 본문' }, articleTitle: '기사 제목' }),
  ]);

  assert.match(out, /\(인용 인용계정: 인용 본문\)/);
  assert.match(out, /\(기사: 기사 제목\)/);
});

test('toPromptLines clips long text with an ellipsis and tolerates a missing handle', () => {
  const out = toPromptLines([cand(1, { text: 'ㄱ'.repeat(500) })]);
  const body = out.split('\n')[1];

  assert.equal(body.length, 420);
  assert.ok(body.endsWith('…'));
  assert.match(out, /@\?/); // handle이 없으면 물음표로 표기
});

test('toPromptLines returns an empty string for no candidates', () => {
  assert.equal(toPromptLines([]), '');
});
