import assert from "node:assert/strict";
import { test } from "node:test";
import { CSV_HEAD, itemToCsvRow, itemToFull, blankItem, considerItem } from "../src/schema.mjs";
import { tweetFromApi, harvest } from "../src/sources/x.mjs";
import { pickSource } from "../src/sources/index.mjs";

test("CSV 헤더 끝에 source 컬럼", () => {
  const cols = CSV_HEAD.replace(/^\uFEFF/, "").trim().split(",");
  assert.equal(cols[cols.length - 1], "source");
  assert.equal(cols.length, 25);
});

test("JSON 풀네임에 source 필드", () => {
  const full = itemToFull(blankItem({ n: "a", t: "hi", u: "https://x.com/a/status/1", s: "reddit" }), 0);
  assert.equal(full.source, "reddit");
  assert.equal(full.no, 1);
  const row = itemToCsvRow(blankItem({ s: "threads" }), 0);
  assert.ok(row.endsWith("threads"));
});

test("X GraphQL harvest 회귀", () => {
  const tweets = new Map();
  const ctx = {
    tweets,
    skippedSet: new Set(),
    fExcluded: () => false,
    sourceId: "x",
    skippedCount: 0,
    apiFresh: 0,
    apiCount: 0,
    updateProgress() {},
    updateFoot() {},
  };
  const node = {
    rest_id: "1234567890123456789",
    legacy: {
      full_text: "hello from claude",
      created_at: "Wed Aug 06 00:00:00 +0000 2026",
      reply_count: 1,
      retweet_count: 2,
      favorite_count: 3,
      bookmark_count: 4,
      lang: "en",
      entities: { hashtags: [{ text: "ai" }], user_mentions: [], urls: [] },
    },
    core: {
      user_results: {
        result: { legacy: { screen_name: "foo", name: "Foo" } },
      },
    },
    views: { count: "10" },
  };
  tweetFromApi(node, ctx);
  assert.equal(tweets.size, 1);
  const it = [...tweets.values()][0];
  assert.equal(it.s, "x");
  assert.equal(it.h, "@foo");
  assert.equal(it.l, 3);
  assert.equal(it.v, 10);
  harvest({ data: { tweet: node } }, ctx);
  assert.equal(tweets.size, 1);
});

test("considerItem 필터 스킵", () => {
  const ctx = {
    tweets: new Map(),
    skippedSet: new Set(),
    fExcluded: () => true,
    sourceId: "x",
    skippedCount: 0,
  };
  const n = considerItem(ctx, "https://x.com/a/status/1", blankItem({ t: "nope" }));
  assert.equal(n, 1);
  assert.equal(ctx.tweets.size, 0);
  assert.equal(ctx.skippedCount, 1);
});

test("pickSource 호스트 매핑", () => {
  assert.equal(pickSource("x.com", {}).source.id, "x");
  assert.equal(pickSource("www.reddit.com", {}).source.id, "reddit");
  assert.equal(pickSource("www.threads.net", {}).source.id, "threads");
  assert.equal(pickSource("www.threads.com", {}).source.id, "threads");
  assert.equal(pickSource("threads.com", {}).source.id, "threads");
  assert.equal(pickSource("threads.net", {}).source.id, "threads");
  assert.equal(pickSource("www.linkedin.com", {}).error, "linkedin-off");
  assert.equal(pickSource("www.linkedin.com", { linkedinEnabled: true }).source.id, "linkedin");
  assert.equal(pickSource("example.com", {}).error, "no-match");
});
