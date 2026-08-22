import test from 'node:test';
import assert from 'node:assert/strict';

import { harvestDocument, mapLinkedinPost, canonicalActivityUrl } from '../src/sources/linkedin.mjs';

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

function linkedinCard({ urn, text, name, likes = '12', time = '2026-01-01T00:00:00Z' }) {
  const timeEl = {
    getAttribute(k) {
      return k === 'datetime' ? time : null;
    },
    textContent: '2h',
  };
  const card = {
    getAttribute(k) {
      return k === 'data-urn' ? urn : null;
    },
    closest(sel) {
      if (sel.includes('data-urn') || sel.includes('feed-shared-update-v2') || sel === 'article') {
        return card;
      }
      return null;
    },
    querySelector(sel) {
      if (sel.includes('description') || sel.includes('update-components-text')) {
        return { textContent: text };
      }
      if (sel.includes('actor__name')) return { textContent: name };
      if (sel === 'time') return timeEl;
      if (sel.includes('reactions-count')) return { textContent: likes };
      return null;
    },
  };
  return card;
}

test('canonicalActivityUrl and mapLinkedinPost normalize activity URLs', () => {
  const url = canonicalActivityUrl('urn:li:activity:12345');
  assert.equal(url, 'https://www.linkedin.com/feed/update/urn:li:activity:12345');
  const item = mapLinkedinPost({ urn: 'urn:li:activity:12345', name: 'Ada', text: 'hire' });
  assert.equal(item.s, 'linkedin');
  assert.equal(item.n, 'Ada');
  assert.equal(mapLinkedinPost({ url: '/nope' }), null);
});

test('harvestDocument collects linkedin feed cards', () => {
  const root = linkedinCard({
    urn: 'urn:li:activity:999',
    text: 'We raised Series A funding',
    name: 'Ada Lovelace',
    likes: '1.2K',
  });
  const doc = {
    querySelectorAll(sel) {
      if (sel.includes('data-urn')) return [root];
      return [];
    },
  };
  const ctx = makeCtx();
  const stats = harvestDocument(doc, ctx);
  assert.equal(stats.parsedOk, 1);
  assert.equal(stats.fresh, 1);
  assert.equal(ctx.items.length, 1);
  assert.equal(ctx.items[0].s, 'linkedin');
  assert.equal(ctx.items[0].n, 'Ada Lovelace');
  assert.equal(ctx.items[0].l, 1200);
  assert.match(ctx.items[0].t, /Series A/);
});

test('harvestDocument skips excluded posts and already seen URLs', () => {
  const url = 'https://www.linkedin.com/feed/update/urn:li:activity:888';
  const root = linkedinCard({
    urn: 'urn:li:activity:888',
    text: 'spam giveaway',
    name: 'Bot',
  });
  const doc = { querySelectorAll: () => [root] };
  const ctx = makeCtx();
  harvestDocument(doc, ctx);
  assert.equal(ctx.items.length, 0);
  assert.ok(ctx.skipped.has(url));

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
  const stats = harvestDocument(doc, ctx2);
  assert.equal(stats.fresh, 0);
});
