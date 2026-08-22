import test from 'node:test';
import assert from 'node:assert/strict';

import { harvestDocument, mapThreadPost, canonicalPostUrl } from '../src/sources/threads.mjs';

function makeCtx() {
  const skipped = new Set();
  const items = [];
  return {
    has() {
      return false;
    },
    skip(url) {
      skipped.add(url);
    },
    excluded(text) {
      return /spam/i.test(text);
    },
    add(item) {
      items.push(item);
    },
    items,
    skipped,
  };
}

function threadArticle({ text, time = '2026-01-01T00:00:00Z', rel = '1d' }) {
  const timeEl = {
    getAttribute(k) {
      return k === 'datetime' ? time : null;
    },
    textContent: rel,
  };
  const textEl = { textContent: text };
  return {
    querySelector(sel) {
      if (sel === 'time') return timeEl;
      if (sel.includes('post-text') || sel.includes('dir')) return textEl;
      return null;
    },
    textContent: text,
  };
}

function threadAnchor(href, article) {
  return {
    href,
    getAttribute(k) {
      return k === 'href' ? href : null;
    },
    closest() {
      return article;
    },
  };
}

test('canonicalPostUrl and mapThreadPost normalize thread permalinks', () => {
  const url = 'https://www.threads.net/@dev/post/abc123?x=1';
  assert.equal(canonicalPostUrl(url), 'https://www.threads.net/@dev/post/abc123');
  const item = mapThreadPost({ url, text: 'hello', likes: 3 });
  assert.equal(item.s, 'threads');
  assert.equal(item.h, '@dev');
  assert.equal(mapThreadPost({ url: '/nope' }), null);
  assert.equal(
    canonicalPostUrl('https://www.threads.com/@dev/post/abc123?x=1'),
    'https://www.threads.com/@dev/post/abc123',
  );
});

test('harvestDocument collects thread posts and skips excluded text', () => {
  const url = 'https://www.threads.net/@dev/post/abc123';
  const doc = {
    querySelectorAll(sel) {
      if (sel === 'a[href*="/post/"]') {
        return [threadAnchor(url, threadArticle({ text: 'GPT release notes' }))];
      }
      return [];
    },
  };
  const ctx = makeCtx();
  const stats = harvestDocument(doc, ctx);
  assert.equal(stats.artSeen, 1);
  assert.equal(stats.parsedOk, 1);
  assert.equal(stats.fresh, 1);
  assert.equal(ctx.items.length, 1);
  assert.equal(ctx.items[0].s, 'threads');
  assert.match(ctx.items[0].t, /GPT/);

  const spamUrl = 'https://www.threads.net/@x/post/spam1';
  const spamDoc = {
    querySelectorAll() {
      return [threadAnchor(spamUrl, threadArticle({ text: 'spam offer' }))];
    },
  };
  const ctx2 = makeCtx();
  const stats2 = harvestDocument(spamDoc, ctx2);
  assert.equal(stats2.fresh, 1);
  assert.equal(ctx2.items.length, 0);
  assert.ok(ctx2.skipped.has(spamUrl));
});

test('harvestDocument dedupes duplicate anchors and skips already collected URLs', () => {
  const url = 'https://www.threads.net/@a/post/dup';
  const anchor = threadAnchor(url, threadArticle({ text: 'hello threads' }));
  const dupDoc = { querySelectorAll: () => [anchor, anchor] };
  const ctx = makeCtx();
  const stats = harvestDocument(dupDoc, ctx);
  assert.equal(stats.artSeen, 1);
  assert.equal(ctx.items.length, 1);

  const ctx2 = {
    has(u) {
      return u === url;
    },
    skip() {},
    excluded() {
      return false;
    },
    add() {
      throw new Error('should not add');
    },
  };
  const stats2 = harvestDocument(dupDoc, ctx2);
  assert.equal(stats2.parsedOk, 1);
  assert.equal(stats2.fresh, 0);
});
