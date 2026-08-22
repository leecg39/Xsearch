import test from 'node:test';
import assert from 'node:assert/strict';

import { chatLLM } from '../newsgen/lib/llm.mjs';

/** 전역 fetch를 핸들러로 대체하고, 기록된 요청과 복원 함수를 돌려준다. */
function stubFetch(handler) {
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), init, body: init.body ? JSON.parse(init.body) : null });
    return handler(String(url), calls.length);
  };
  return { calls, restore: () => { globalThis.fetch = original; } };
}

const json = (body, status = 200) => new Response(JSON.stringify(body), { status });
const text = (body, status = 200) => new Response(body, { status });

const ask = (provider, extra = {}) =>
  chatLLM({ provider, model: 'm1', apiKey: 'k1', system: 'sys', user: 'usr', ...extra });

test('chatLLM sends SuperGrok requests to the CLI proxy with identity headers', async () => {
  const s = stubFetch(() => json({ output_text: '그록 응답' }));
  try {
    assert.equal(await ask('grok'), '그록 응답');

    const [call] = s.calls;
    assert.match(call.url, /cli-chat-proxy\.grok\.com\/v1\/responses$/);
    assert.equal(call.init.headers.authorization, 'Bearer k1');
    assert.equal(call.init.headers['x-xai-token-auth'], 'xai-grok-cli');
    assert.equal(call.body.stream, false);
    assert.equal(call.body.instructions, 'sys');
  } finally { s.restore(); }
});

test('chatLLM sanitizes backslash sequences in Grok prompt text before JSON encode', async () => {
  const s = stubFetch(() => json({ output_text: 'ok' }));
  try {
    await chatLLM({
      provider: 'grok', model: 'm1', apiKey: 'k1',
      system: 'sys', user: 'path C:\\Users\\x and \\u12 cut',
    });
    const text = s.calls[0].body.input[0].content[0].text;
    assert.equal(text.includes('\\'), false);
    assert.match(text, /C:＼Users＼x/);
    assert.match(text, /＼u12/);
  } finally { s.restore(); }
});

test('chatLLM reads Grok output from a structured message array', async () => {
  const s = stubFetch(() => json({
    output: [
      { type: 'reasoning', content: [{ type: 'output_text', text: '무시됨' }] },
      { type: 'message', content: [{ type: 'output_text', text: '앞' }, { type: 'refusal', text: 'x' }] },
      { type: 'message', content: [{ type: 'output_text', text: '뒤' }] },
    ],
  }));
  try {
    assert.equal(await ask('grok'), '앞뒤');
  } finally { s.restore(); }
});

test('chatLLM accumulates Grok SSE deltas when no completed event arrives', async () => {
  const sse = [
    'data: {"type":"response.output_text.delta","delta":"스"}',
    'data: 손상된 payload',
    'data: {"type":"response.output_text.delta","delta":"트림"}',
    'data: [DONE]',
  ].join('\n');
  const s = stubFetch(() => text(sse));
  try {
    assert.equal(await ask('grok'), '스트림');
  } finally { s.restore(); }
});

test('chatLLM prefers the Grok completed event over accumulated deltas', async () => {
  const sse = [
    'data: {"type":"response.output_text.delta","delta":"부분"}',
    'data: {"type":"response.completed","response":{"output_text":"최종"}}',
  ].join('\n');
  const s = stubFetch(() => text(sse));
  try {
    assert.equal(await ask('grok'), '최종');
  } finally { s.restore(); }
});

test('chatLLM explains that a Grok 403 means the subscription tier is not eligible', async () => {
  const s = stubFetch(() => json({ error: { message: 'forbidden' } }, 403));
  try {
    await assert.rejects(ask('grok'), (e) => {
      assert.equal(e.status, 403);
      assert.match(e.message, /그록 프록시 403/);
      assert.match(e.message, /구독 등급/);
      return true;
    });
  } finally { s.restore(); }
});

test('chatLLM fails loudly when a Grok response carries no text at all', async () => {
  const s = stubFetch(() => text('event: ping\n'));
  try {
    await assert.rejects(ask('grok'), /텍스트를 찾지 못했습니다/);
  } finally { s.restore(); }
});

test('chatLLM joins Anthropic content blocks', async () => {
  const s = stubFetch(() => json({ content: [{ text: '가' }, { text: '나' }, {}] }));
  try {
    assert.equal(await ask('anthropic'), '가나');

    const [call] = s.calls;
    assert.match(call.url, /api\.anthropic\.com\/v1\/messages$/);
    assert.equal(call.init.headers['x-api-key'], 'k1');
    assert.equal(call.init.headers['anthropic-version'], '2023-06-01');
  } finally { s.restore(); }
});

test('chatLLM returns the first OpenAI choice', async () => {
  const s = stubFetch(() => json({ choices: [{ message: { content: '오픈AI' } }] }));
  try {
    assert.equal(await ask('openai'), '오픈AI');
    assert.equal(s.calls[0].body.response_format.type, 'json_object');
  } finally { s.restore(); }
});

test('chatLLM retries OpenAI with legacy parameters when the modern ones are rejected', async () => {
  const s = stubFetch((_url, n) => (n === 1
    ? json({ error: { message: 'Unsupported parameter: max_completion_tokens' } }, 400)
    : json({ choices: [{ message: { content: '레거시 성공' } }] })));
  try {
    assert.equal(await ask('openai'), '레거시 성공');
    assert.equal(s.calls.length, 2);
    assert.equal(s.calls[1].body.max_tokens, 16000);
    assert.equal(s.calls[1].body.max_completion_tokens, undefined);
    assert.equal(s.calls[1].body.response_format, undefined);
  } finally { s.restore(); }
});

test('chatLLM propagates OpenAI errors that are not a parameter mismatch', async () => {
  const s = stubFetch(() => json({ error: { message: 'rate limited' } }, 429));
  try {
    await assert.rejects(ask('openai'), (e) => {
      assert.equal(e.status, 429);
      assert.match(e.message, /API 429: rate limited/);
      return true;
    });
    assert.equal(s.calls.length, 1); // 재시도하지 않는다
  } finally { s.restore(); }
});

test('chatLLM surfaces a non-JSON error body verbatim', async () => {
  const s = stubFetch(() => text('<html>502 Bad Gateway</html>', 502));
  try {
    await assert.rejects(ask('anthropic'), /API 502: <html>502 Bad Gateway<\/html>/);
  } finally { s.restore(); }
});

test('chatLLM joins Gemini parts and encodes the model into the URL', async () => {
  const s = stubFetch(() => json({ candidates: [{ content: { parts: [{ text: '제' }, { text: '미나이' }] } }] }));
  try {
    assert.equal(await ask('gemini', { model: 'gemini-2.5/pro' }), '제미나이');
    assert.match(s.calls[0].url, /models\/gemini-2\.5%2Fpro:generateContent\?key=k1$/);
  } finally { s.restore(); }
});

test('chatLLM rejects an unknown provider', async () => {
  await assert.rejects(ask('mystery'), /알 수 없는 프로바이더: mystery/);
});
