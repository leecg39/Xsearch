import test from 'node:test';
import assert from 'node:assert/strict';

import { buildUserPrompt, normalizeReport, systemPrompt } from '../newsgen/lib/llm.mjs';

const minimal = { sections: [{ title: 'T', bullets: ['b'] }] };

test('systemPrompt and user prompt swap in the topic brand', () => {
  const sys = systemPrompt('finance');
  assert.match(sys, /오늘의 금융\/경제 브리핑/);
  assert.match(sys, /금융\/경제 뉴스/);
  assert.doesNotMatch(sys, /오늘의 AI 브리핑/);

  const user = buildUserPrompt({
    date: '2026-08-18',
    cands: [{ i: 1 }],
    promptLines: '[1] 본문',
    topic: 'ent',
  });
  assert.match(user, /오늘의 엔터 브리핑/);
});

test('normalizeReport title fallback uses the topic news label', () => {
  const ai = normalizeReport(minimal, '2026-08-10');
  assert.equal(ai.title_main, '2026-08-10 AI 뉴스');
  assert.equal(ai.topic, 'ai');
  const fin = normalizeReport(minimal, '2026-08-10', 'finance');
  assert.equal(fin.title_main, '2026-08-10 금융/경제 뉴스');
  assert.equal(fin.topic, 'finance');
  const unknown = normalizeReport(minimal, '2026-08-10', 'nope');
  assert.equal(unknown.topic, 'ai');
});
