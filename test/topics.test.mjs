import assert from "node:assert/strict";
import { test } from "node:test";
import {
  TOPICS,
  INTEREST_CHOICES,
  resolveTopicFilters,
  topicHits,
  compileRe,
  migrateTopic,
} from "../src/topics.mjs";

test("ai 프리셋이 기존 KEEP 키워드를 매칭한다", () => {
  const { RE_KEEP } = resolveTopicFilters("ai");
  assert.equal(RE_KEEP.test("new Claude model from Anthropic"), true);
  assert.equal(RE_KEEP.test("생성형 인공지능 발표"), true);
});

test("ai 프리셋이 무관 텍스트는 KEEP에 안 걸린다", () => {
  const { RE_KEEP } = resolveTopicFilters("ai");
  assert.equal(RE_KEEP.test("오늘 저녁 치킨 쿠폰"), false);
});

test("dev 프리셋 매칭/비매칭", () => {
  const { RE_KEEP } = resolveTopicFilters("dev");
  assert.equal(RE_KEEP.test("kubernetes 배포 파이프라인"), true);
  assert.equal(RE_KEEP.test("오늘 야구 경기 결과"), false);
});

test("finance 프리셋은 배당을 DROP하지 않는다", () => {
  const { RE_KEEP, RE_DROP } = resolveTopicFilters("finance");
  assert.equal(RE_KEEP.test("연준 기준금리 인하"), true);
  assert.equal(RE_DROP.test("배당 성향과 hedge fund"), false);
});

test("startup 프리셋 매칭", () => {
  const { RE_KEEP } = resolveTopicFilters("startup");
  assert.equal(RE_KEEP.test("시리즈 B 펀딩 2000만 달러"), true);
});

test("custom 오버라이드", () => {
  const { RE_KEEP, key } = resolveTopicFilters("custom", { reKeep: "hello-world-xyz" });
  assert.equal(key, "custom");
  assert.equal(RE_KEEP.test("hello-world-xyz in text"), true);
  assert.equal(RE_KEEP.test("claude"), false);
});

test("잘못된 정규식은 폴백(매칭 없음)", () => {
  const re = compileRe("(unclosed", /$^/);
  assert.equal(re.test("anything"), false);
});

test("알 수 없는 토픽 키는 ai로 폴백", () => {
  const f = resolveTopicFilters("nope");
  assert.equal(f.key, "ai");
  assert.equal(f.name, TOPICS.ai.name);
});

test("migrateTopic: 커스텀 정규식 있으면 custom", () => {
  assert.equal(migrateTopic({ reKeep: "foo" }), "custom");
  assert.equal(migrateTopic({ topic: "dev" }), "dev");
  assert.equal(migrateTopic({}), "ai");
});

test("topicHits ai 별칭 호환", () => {
  const n = topicHits("OpenAI released GPT and Claude and Gemini models", "ai");
  assert.ok(n >= 1);
});

test("INTEREST_CHOICES 카테고리 프리셋이 실제로 매칭된다", () => {
  assert.equal(INTEREST_CHOICES.length, 4);
  const samples = {
    ai: "Anthropic Claude LLM agent",
    dev: "kubernetes docker deploy",
    finance: "연준 기준금리 인하",
    startup: "시리즈 A 펀딩 SaaS",
  };
  for (const c of INTEREST_CHOICES) {
    const { RE_KEEP, name } = resolveTopicFilters(c.key);
    assert.equal(name, c.name);
    assert.equal(RE_KEEP.test(samples[c.key]), true, c.key);
  }
});
