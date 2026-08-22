import test from 'node:test';
import assert from 'node:assert/strict';

import {
  TOPICS,
  DEFAULT_TOPIC,
  topicOf,
  normalizeTopicKey,
  topicEntries,
  topicKeywordsMap,
  compileRe,
  resolveTopicFilters,
  keepText,
  briefingBrand,
} from '../src/topics.mjs';

test('topicOf falls back to AI for unknown keys', () => {
  assert.equal(topicOf('ai').name, 'AI');
  assert.equal(topicOf('nope'), TOPICS[DEFAULT_TOPIC]);
});

test('normalizeTopicKey and topicEntries cover every preset', () => {
  assert.equal(normalizeTopicKey('finance'), 'finance');
  assert.equal(normalizeTopicKey(''), DEFAULT_TOPIC);
  const ids = topicEntries().map((t) => t.id);
  assert.deepEqual(ids, ['ai', 'dev', 'finance', 'startup', 'custom']);
});

test('AI preset keeps GPT/claude and drops k-pop', () => {
  const f = resolveTopicFilters('ai');
  assert.equal(keepText('OpenAI GPT-5 and Claude', f), true);
  assert.equal(keepText('인공지능 모델 공개', f), true);
  assert.equal(keepText('아이돌 컴백 공연', f), false);
});

test('dev preset matches coding posts and ignores celebrity news', () => {
  const f = resolveTopicFilters('dev');
  assert.equal(keepText('TypeScript와 Rust로 CLI를 리팩토링했다', f), true);
  assert.equal(keepText('오늘 야구 경기 결과', f), false);
});

test('finance preset keeps stocks and does not drop dividend', () => {
  const f = resolveTopicFilters('finance');
  assert.equal(keepText('연준 금리와 배당 공시', f), true);
  assert.equal(keepText('k-pop 아이돌 신곡', f), false);
  assert.equal(keepText('quarterly dividend from the ETF', f), true);
});

test('startup preset matches funding rounds', () => {
  const f = resolveTopicFilters('startup');
  assert.equal(keepText('시리즈 B 투자 유치, ARR 성장', f), true);
  assert.equal(keepText('올림픽 축구 결승', f), false);
});

test('custom uses caller regex and falls back to AI when empty', () => {
  const own = resolveTopicFilters('custom', { reKeep: '고양이', reWeak: '', reDrop: '' });
  assert.equal(keepText('고양이 사진', own), true);
  assert.equal(keepText('오늘 점심 메뉴', own), false);
});

test('custom invalid regex falls back to the AI keep pattern', () => {
  const f = resolveTopicFilters('custom', { reKeep: '(unclosed' });
  assert.equal(keepText('OpenAI GPT', f), true);
});

test('compileRe falls back when the pattern is invalid', () => {
  const fb = /ok/i;
  assert.equal(compileRe('(unclosed', fb), fb);
  assert.equal(compileRe('', /x/i).source, 'x');
  assert.equal(compileRe(null).source, '$^');
});

test('unknown topic key uses the AI preset filters', () => {
  const f = resolveTopicFilters('mystery');
  assert.equal(f.key, 'ai');
  assert.equal(f.name, 'AI');
  assert.equal(keepText('Claude and GPT', f), true);
});

test('topicKeywordsMap exposes kw patterns for every preset', () => {
  const map = topicKeywordsMap();
  assert.ok(map.ai.en.includes('gpt'));
  assert.ok(map.dev.ko.includes('개발'));
  assert.deepEqual(map.custom, { en: '', ko: '', jazh: '' });
});

test('briefingBrand names the newsletter after the topic', () => {
  assert.deepEqual(briefingBrand('ai').newsletter, '오늘의 AI 브리핑');
  assert.equal(briefingBrand('finance').newsLabel, '경제/금융 뉴스');
  assert.equal(briefingBrand('nope').key, 'ai');
});
