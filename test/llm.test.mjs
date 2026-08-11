import test from 'node:test';
import assert from 'node:assert/strict';

import { extractJSON, normalizeReport } from '../newsgen/lib/llm.mjs';

test('extractJSON accepts fenced responses and repairs trailing commas', () => {
  assert.deepEqual(extractJSON('```json\n{"ok":true,"items":[1,2,],}\n```'), { ok: true, items: [1, 2] });
});

test('normalizeReport rejects a response without any renderable section', () => {
  assert.throws(() => normalizeReport({ sections: [{ title: '빈 섹션', bullets: [] }] }, '2026-08-11'), /유효한 섹션/);
});
