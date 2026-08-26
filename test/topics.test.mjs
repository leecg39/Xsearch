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
  assert.deepEqual(ids, ['ai', 'finance', 'ent', 'custom']);
});

test('AI preset keeps GPT/claude and drops k-pop', () => {
  const f = resolveTopicFilters('ai');
  assert.equal(keepText('OpenAI GPT-5 and Claude', f), true);
  assert.equal(keepText('인공지능 모델 공개', f), true);
  assert.equal(keepText('아이돌 컴백 공연', f), false);
});

test('ent preset keeps celebrity, game and sports posts', () => {
  const f = resolveTopicFilters('ent');
  assert.equal(keepText('아이돌 그룹 컴백 무대', f), true);
  assert.equal(keepText('발로란트 챔피언스 우승', f), true);
  assert.equal(keepText('손흥민 EPL 결승골', f), true);
  assert.equal(keepText('대통령 선거 여론조사', f), false);
});

test('finance preset keeps stocks and does not drop dividend', () => {
  const f = resolveTopicFilters('finance');
  assert.equal(keepText('연준 금리와 배당 공시', f), true);
  assert.equal(keepText('k-pop 아이돌 신곡', f), false);
  assert.equal(keepText('quarterly dividend from the ETF', f), true);
});

test('ent preset does not swallow finance-only posts', () => {
  const f = resolveTopicFilters('ent');
  assert.equal(keepText('비트코인 ETF 승인', f), false);
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
  assert.ok(map.ent.ko.includes('연예'));
  assert.deepEqual(map.custom, { en: '', ko: '', jazh: '' });
});

test('briefingBrand names the newsletter after the topic', () => {
  assert.deepEqual(briefingBrand('ai').newsletter, '오늘의 AI 브리핑');
  assert.equal(briefingBrand('finance').newsLabel, '금융/경제 뉴스');
  assert.equal(briefingBrand('nope').key, 'ai');
});
