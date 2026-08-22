import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function freePort() {
  const probe = createServer();
  await new Promise((resolve, reject) => probe.listen(0, '127.0.0.1', resolve).once('error', reject));
  const port = probe.address().port;
  await new Promise((resolve) => probe.close(resolve));
  return port;
}

async function waitForHealth(baseUrl, child) {
  for (let i = 0; i < 80; i++) {
    if (child.exitCode !== null) throw new Error(`server exited with ${child.exitCode}`);
    try {
      const response = await fetch(`${baseUrl}/api/health`);
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error('server did not become ready');
}

test('POST /api/import stores topic and GET returns it (default ai)', async () => {
  const [port, outputDir] = await Promise.all([
    freePort(),
    mkdtemp(path.join(tmpdir(), 'xsearch-import-topic-')),
  ]);
  const child = spawn(process.execPath, ['newsgen/server.mjs'], {
    cwd: root,
    env: { ...process.env, HOST: '127.0.0.1', PORT: String(port), NEWSGEN_OUTPUT_DIR: outputDir },
    stdio: 'ignore',
  });
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    await waitForHealth(baseUrl, child);
    const posted = await fetch(`${baseUrl}/api/import`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        fileName: 'tw_2026-08-18.json',
        tweets: [{ handle: 'a', text: 'hello', source: 'reddit' }],
        topic: 'finance',
      }),
    });
    assert.equal(posted.status, 200);
    const { id } = await posted.json();
    const got = await fetch(`${baseUrl}/api/import/${id}`);
    const body = await got.json();
    assert.equal(body.topic, 'finance');
    assert.equal(body.tweets[0].source, 'reddit');

    const env = await (await fetch(`${baseUrl}/api/env`)).json();
    assert.equal(env.defaultTopic, 'ai');
    assert.ok(env.topics.some((t) => t.id === 'dev'));
    assert.ok(env.topicKeywords?.ai?.en?.includes('gpt'));
    assert.ok(env.topicKeywords?.finance?.ko?.includes('주식'));

    const noTopic = await fetch(`${baseUrl}/api/import`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ tweets: [{ handle: 'b', text: 'x' }] }),
    });
    const { id: id2 } = await noTopic.json();
    const got2 = await (await fetch(`${baseUrl}/api/import/${id2}`)).json();
    assert.equal(got2.topic, 'ai');
  } finally {
    child.kill('SIGTERM');
    if (child.exitCode === null) await new Promise((resolve) => child.once('exit', resolve));
    await rm(outputDir, { recursive: true, force: true });
  }
});
