import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, rm, stat } from 'node:fs/promises';
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

// Regression: ISSUE-007 — a regex-valid but impossible date created a public briefing file.
// Found by /qa on 2026-08-11
// Report: .gstack/qa-reports/qa-report-news-soverin-cloud-2026-08-11.md
test('POST /api/generate rejects impossible calendar dates before creating a job', async () => {
  const [port, outputDir] = await Promise.all([
    freePort(),
    mkdtemp(path.join(tmpdir(), 'xsearch-server-date-')),
  ]);
  const child = spawn(process.execPath, ['newsgen/server.mjs'], {
    cwd: root,
    env: { ...process.env, HOST: '127.0.0.1', PORT: String(port), NEWSGEN_OUTPUT_DIR: outputDir },
    stdio: 'ignore',
  });
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    await waitForHealth(baseUrl, child);
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        tweets: [{ handle: 'qa', text: 'OpenAI test' }],
        date: '2026-02-30',
        mode: 'digest',
      }),
    });

    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: '실제 달력에 존재하는 날짜를 입력하세요' });
    await assert.rejects(stat(path.join(outputDir, '2026-02-30.html')), { code: 'ENOENT' });
  } finally {
    child.kill('SIGTERM');
    if (child.exitCode === null) await new Promise((resolve) => child.once('exit', resolve));
    await rm(outputDir, { recursive: true, force: true });
  }
});
