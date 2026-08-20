import assert from "node:assert/strict";
import { test } from "node:test";
import {
  mapRedditPost,
  parseRedditListing,
  redditApiPath,
  redditFetchUrl,
} from "../src/sources/reddit.mjs";
import { nextBackoffMs, shouldRetryStatus } from "../src/backoff.mjs";

const fixture = {
  kind: "Listing",
  data: {
    after: "t3_abc",
    children: [
      {
        kind: "t3",
        data: {
          author: "alice",
          subreddit: "MachineLearning",
          title: "New paper on transformers",
          selftext: "abstract here",
          permalink: "/r/MachineLearning/comments/xyz/new_paper/",
          score: 120,
          num_comments: 14,
          created_utc: 1700000000,
          is_self: true,
          url: "https://www.reddit.com/r/MachineLearning/comments/xyz/new_paper/",
        },
      },
    ],
  },
};

test("reddit JSON → 정규화 스키마", () => {
  const it = mapRedditPost(fixture.data.children[0].data);
  assert.equal(it.s, "reddit");
  assert.equal(it.l, 120);
  assert.equal(it.r, 14);
  assert.equal(it.v, 0);
  assert.equal(it.b, 0);
  assert.equal(it.h, "r/MachineLearning");
  assert.equal(it.n, "u/alice");
  assert.ok(it.u.includes("/r/MachineLearning/comments/xyz"));
  assert.ok(it.t.includes("New paper"));
});

test("페이지네이션 cursor", () => {
  const parsed = parseRedditListing(fixture);
  assert.equal(parsed.after, "t3_abc");
  assert.equal(parsed.items.length, 1);
});

test("서브레딧/검색 경로 인식", () => {
  assert.equal(redditApiPath("/r/python"), "/r/python/hot.json");
  assert.equal(redditApiPath("/r/python/new"), "/r/python/new.json");
  assert.equal(redditApiPath("/search"), "/search.json");
  assert.equal(redditApiPath("/"), "/hot.json");
  const u = redditFetchUrl({ pathname: "/search", search: "?q=llm" }, "t3_z");
  assert.ok(u.startsWith("/search.json?"));
  assert.ok(u.includes("q=llm"));
  assert.ok(u.includes("after=t3_z"));
});

test("429 백오프", () => {
  assert.equal(shouldRetryStatus(429), true);
  assert.equal(shouldRetryStatus(200), false);
  assert.equal(nextBackoffMs(2000), 4000);
  assert.equal(nextBackoffMs(20000, { cap: 30000 }), 30000);
});
