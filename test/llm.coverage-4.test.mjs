import test from 'node:test';
import assert from 'node:assert/strict';

import { generateReport } from '../newsgen/lib/llm.mjs';

function stubFetch(handler) {
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), body: init.body ? JSON.parse(init.body) : null });
    return handler(calls.length);
  };
  return { calls, restore: () => { globalThis.fetch = original; } };
}

/** anthropic 경로로 임의의 어시스턴트 텍스트를 돌려주는 응답 */
const reply = (assistantText, status = 200) =>
  new Response(JSON.stringify({ content: [{ text: assistantText }] }), { status });

const VALID = JSON.stringify({
  title_main: '오늘의 브리핑',
  sections: [{ title: '섹션', bullets: ['요점'] }],
});

const cands = [{ i: 1, label: '🔥', kst: { label: '08-10 11:45' }, t: { handle: 'a', text: '본문' } }];

const run = (onStatus) =>
  generateReport({ provider: 'anthropic', model: 'm', apiKey: 'k', date: '2026-08-10', cands, onStatus });

test('generateReport returns a normalized report and announces the attempt', async () => {
  const s = stubFetch(() => reply(VALID));
  const seen = [];
  try {
    const report = await run((msg) => seen.push(msg));

    assert.equal(report.date, '2026-08-10');
    assert.equal(report.title_main, '오늘의 브리핑');
    assert.equal(report.sections.length, 1);
    assert.equal(report.sentiment.pins.length, 4); // 정규화를 거쳤다
    assert.deepEqual(seen, ['anthropic m 호출 중 (시도 1/2)']);
    assert.equal(s.calls.length, 1);
  } finally { s.restore(); }
});

test('generateReport feeds the tweet list into the prompt', async () => {
  const s = stubFetch(() => reply(VALID));
  try {
    await run();

    const prompt = s.calls[0].body.messages[0].content;
    assert.match(prompt, /보고서 날짜: 2026-08-10/);
    assert.match(prompt, /후보 트윗: 1개/);
    assert.match(prompt, /@a/); // toPromptLines 결과가 포함된다
  } finally { s.restore(); }
});

test('generateReport retries once with a stricter instruction after unparsable output', async () => {
  const s = stubFetch((n) => reply(n === 1 ? '죄송합니다, JSON이 아닙니다' : VALID));
  const seen = [];
  try {
    const report = await run((msg) => seen.push(msg));

    assert.equal(report.title_main, '오늘의 브리핑');
    assert.equal(s.calls.length, 2);
    assert.deepEqual(seen, [
      'anthropic m 호출 중 (시도 1/2)',
      'anthropic m 호출 중 (시도 2/2)',
    ]);

    const first = s.calls[0].body.messages[0].content;
    const second = s.calls[1].body.messages[0].content;
    assert.doesNotMatch(first, /\[경고\]/);
    assert.match(second, /\[경고\] 직전 출력이 유효한 JSON이 아니었습니다/);
  } finally { s.restore(); }
});

test('generateReport gives up after two unparsable attempts', async () => {
  const s = stubFetch(() => reply('여전히 JSON 아님'));
  try {
    await assert.rejects(run(), /응답에서 JSON을 찾지 못했습니다/);
    assert.equal(s.calls.length, 2);
  } finally { s.restore(); }
});

test('generateReport stops immediately on an authentication failure', async () => {
  const s = stubFetch(() => new Response(JSON.stringify({ error: { message: 'bad key' } }), { status: 401 }));
  try {
    await assert.rejects(run(), (e) => {
      assert.equal(e.status, 401);
      return true;
    });
    assert.equal(s.calls.length, 1); // 재시도하지 않는다
  } finally { s.restore(); }
});

test('generateReport stops immediately when the model is not found', async () => {
  const s = stubFetch(() => new Response(JSON.stringify({ error: { message: 'no model' } }), { status: 404 }));
  try {
    await assert.rejects(run(), (e) => e.status === 404);
    assert.equal(s.calls.length, 1);
  } finally { s.restore(); }
});

test('generateReport retries a transient server error before failing', async () => {
  const s = stubFetch(() => new Response('upstream down', { status: 503 }));
  try {
    await assert.rejects(run(), (e) => {
      assert.equal(e.status, 503);
      return true;
    });
    assert.equal(s.calls.length, 2);
  } finally { s.restore(); }
});

test('generateReport works without an onStatus callback', async () => {
  const s = stubFetch(() => reply(VALID));
  try {
    const report = await generateReport({
      provider: 'anthropic', model: 'm', apiKey: 'k', date: '2026-08-10', cands,
    });
    assert.equal(report.title_main, '오늘의 브리핑');
  } finally { s.restore(); }
});
