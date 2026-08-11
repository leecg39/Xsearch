import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

// Regression: ISSUE-005 — imported fileName and lang values executed as HTML in the builder.
// Found by /qa on 2026-08-11
// Report: .gstack/qa-reports/qa-report-news-soverin-cloud-2026-08-11.md
test('builder renders imported metadata through text nodes instead of innerHTML', async () => {
  const source = await readFile(new URL('../newsgen/public/index.html', import.meta.url), 'utf8');

  assert.doesNotMatch(source, /\$\('dropMsg'\)\.innerHTML\s*=/);
  assert.doesNotMatch(source, /\$\('fileChips'\)\.innerHTML\s*=/);
  assert.match(source, /strong\.textContent\s*=\s*String\(strongText/);
  assert.match(source, /\$\('dropMsg'\)\.replaceChildren\(/);
  assert.match(source, /\$\('fileChips'\)\.replaceChildren\(fragment\)/);
});
