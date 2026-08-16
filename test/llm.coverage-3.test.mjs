import test from 'node:test';
import assert from 'node:assert/strict';

import { listModels, GROK_FALLBACK_MODELS } from '../newsgen/lib/llm.mjs';

function stubFetch(handler) {
  const original = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, init = {}) => {
    calls.push({ url: String(url), init });
    return handler(String(url));
  };
  return { calls, restore: () => { globalThis.fetch = original; } };
}

const json = (body, status = 200) => new Response(JSON.stringify(body), { status });

test('listModels reads Grok model ids from the CLI proxy', async () => {
  const s = stubFetch(() => json({ data: [{ id: 'grok-4.5' }, { id: 'grok-4.3' }] }));
  try {
    assert.deepEqual(await listModels({ provider: 'grok', apiKey: 'k' }), ['grok-4.5', 'grok-4.3']);
    assert.match(s.calls[0].url, /cli-chat-proxy\.grok\.com\/v1\/models$/);
    assert.equal(s.calls[0].init.headers.authorization, 'Bearer k');
  } finally { s.restore(); }
});

test('listModels accepts the alternate Grok models key and name field', async () => {
  const s = stubFetch(() => json({ models: [{ name: 'grok-build-0.1' }, {}] }));
  try {
    assert.deepEqual(await listModels({ provider: 'grok', apiKey: 'k' }), ['grok-build-0.1']);
  } finally { s.restore(); }
});

test('listModels falls back to the bundled Grok list when the proxy returns none', async () => {
  const s = stubFetch(() => json({ data: [] }));
  try {
    assert.deepEqual(await listModels({ provider: 'grok', apiKey: 'k' }), GROK_FALLBACK_MODELS);
  } finally { s.restore(); }
});

test('listModels maps Anthropic model ids', async () => {
  const s = stubFetch(() => json({ data: [{ id: 'claude-a' }, { id: 'claude-b' }] }));
  try {
    assert.deepEqual(await listModels({ provider: 'anthropic', apiKey: 'k' }), ['claude-a', 'claude-b']);
    assert.match(s.calls[0].url, /\/v1\/models\?limit=100$/);
  } finally { s.restore(); }
});

test('listModels keeps only chat-capable OpenAI models and sorts them', async () => {
  const s = stubFetch(() => json({
    data: [{ id: 'gpt-5' }, { id: 'whisper-1' }, { id: 'o3' }, { id: 'chatgpt-4o' }, { id: 'text-embedding-3' }],
  }));
  try {
    assert.deepEqual(await listModels({ provider: 'openai', apiKey: 'k' }), ['chatgpt-4o', 'gpt-5', 'o3']);
  } finally { s.restore(); }
});

test('listModels strips the models/ prefix and keeps only Gemini entries', async () => {
  const s = stubFetch(() => json({
    models: [{ name: 'models/gemini-2.5-pro' }, { name: 'models/embedding-001' }, {}],
  }));
  try {
    assert.deepEqual(await listModels({ provider: 'gemini', apiKey: 'k&1' }), ['gemini-2.5-pro']);
    assert.match(s.calls[0].url, /key=k%261$/);
  } finally { s.restore(); }
});

test('listModels reports the upstream status when the lookup fails', async () => {
  const s = stubFetch(() => json({ error: 'nope' }, 401));
  try {
    await assert.rejects(listModels({ provider: 'anthropic', apiKey: 'bad' }), /API 401/);
  } finally { s.restore(); }
});

test('listModels rejects an unknown provider', async () => {
  await assert.rejects(listModels({ provider: 'mystery', apiKey: 'k' }), /알 수 없는 프로바이더: mystery/);
});
