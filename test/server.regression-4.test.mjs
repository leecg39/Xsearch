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

// Regression: ISSUE-010 — responses lacked browser defense-in-depth headers.
// Found by /qa on 2026-08-11
// Report: .gstack/qa-reports/qa-report-news-soverin-cloud-2026-08-11.md
test('application responses include transport, framing, MIME, and CSP protections', async () => {
  const [port, outputDir] = await Promise.all([
    freePort(),
    mkdtemp(path.join(tmpdir(), 'xsearch-server-headers-')),
  ]);
  const child = spawn(process.execPath, ['newsgen/server.mjs'], {
    cwd: root,
    env: { ...process.env, HOST: '127.0.0.1', PORT: String(port), NEWSGEN_OUTPUT_DIR: outputDir },
    stdio: 'ignore',
  });
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    await waitForHealth(baseUrl, child);
    const response = await fetch(`${baseUrl}/api/health`);

    assert.equal(response.headers.get('strict-transport-security'), 'max-age=31536000; includeSubDomains');
    assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(response.headers.get('x-frame-options'), 'DENY');
    assert.equal(response.headers.get('referrer-policy'), 'strict-origin-when-cross-origin');
    assert.match(response.headers.get('permissions-policy'), /camera=\(\)/);
    assert.match(response.headers.get('content-security-policy'), /frame-ancestors 'none'/);
  } finally {
    child.kill('SIGTERM');
    if (child.exitCode === null) await new Promise((resolve) => child.once('exit', resolve));
    await rm(outputDir, { recursive: true, force: true });
  }
});
