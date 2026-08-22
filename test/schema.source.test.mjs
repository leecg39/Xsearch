import test from 'node:test';
import assert from 'node:assert/strict';

import { csvBody, jsonData, emptyItem, withSource, csvEsc } from '../src/sources/schema.mjs';
import { detectSource, isSupportedUrl, sourceLabel } from '../src/sources/match.mjs';
import { match as matchX } from '../src/sources/x.mjs';
import { mapThreadPost, canonicalPostUrl } from '../src/sources/threads.mjs';
import { mapLinkedinPost, canonicalActivityUrl } from '../src/sources/linkedin.mjs';

test('CSV appends a source column after the original 24 fields', () => {
  const csv = csvBody([emptyItem({ n: 'A', h: '@a', t: 'hello', u: 'https://x.com/a/1', s: 'x' })]);
  const header = csv.split('\n')[0];
  const cols = header.replace(/^\uFEFF/, '').split(',');
  assert.equal(cols[cols.length - 1], 'source');
  assert.equal(cols.length, 25);
  assert.match(csv.split('\n')[1], /,x$/);
});

test('jsonData includes a source field and defaults missing source to x', () => {
  const rows = jsonData([emptyItem({ n: 'A', h: '@a', t: 'hello', u: 'https://x.com/a/1' })]);
  assert.equal(rows[0].source, 'x');
  const reddit = jsonData([emptyItem({ u: 'https://reddit.com/r/x', s: 'reddit' })]);
  assert.equal(reddit[0].source, 'reddit');
});

test('withSource rejects unknown ids', () => {
  assert.equal(withSource({ u: '1' }, 'reddit').s, 'reddit');
  assert.equal(withSource({ u: '1' }, 'myspace').s, 'x');
});

test('csvEsc quotes commas and neutralises formula injection', () => {
  assert.equal(csvEsc('a,b'), '"a,b"');
  assert.equal(csvEsc('=1+1'), "'=1+1");
  assert.equal(csvEsc(null), '');
});

test('detectSource maps hosts and URL guard accepts supported sites', () => {
  assert.equal(detectSource('x.com'), 'x');
  assert.equal(matchX('twitter.com'), true);
  assert.equal(matchX('reddit.com'), false);
  assert.equal(detectSource('www.reddit.com'), 'reddit');
  assert.equal(detectSource('old.reddit.com'), 'reddit');
  assert.equal(detectSource('www.threads.net'), 'threads');
  assert.equal(detectSource('www.threads.com'), 'threads');
  assert.equal(detectSource('www.linkedin.com'), 'linkedin');
  assert.equal(detectSource('example.com'), 'x');
  assert.equal(sourceLabel('reddit'), 'Reddit');
  assert.equal(isSupportedUrl('https://www.reddit.com/r/ai/'), true);
  assert.equal(isSupportedUrl('https://www.threads.net/@ada/post/abc'), true);
  assert.equal(isSupportedUrl('https://www.threads.com/@ada/post/abc'), true);
  assert.equal(isSupportedUrl('https://example.com/'), false);
});

test('Threads mapper canonicalises post URLs', () => {
  const url = canonicalPostUrl('https://www.threads.net/@ada/post/abc?utm=1');
  assert.equal(url, 'https://www.threads.net/@ada/post/abc');
  const item = mapThreadPost({ url, text: 'hello', likes: 3 });
  assert.equal(item.s, 'threads');
  assert.equal(item.h, '@ada');
  assert.equal(item.l, 3);
  assert.equal(mapThreadPost({ url: '/nope' }), null);
});

test('LinkedIn mapper builds activity URLs from URNs', () => {
  const url = canonicalActivityUrl('urn:li:activity:12345');
  assert.equal(url, 'https://www.linkedin.com/feed/update/urn:li:activity:12345');
  const item = mapLinkedinPost({ urn: 'urn:li:activity:12345', name: 'Ada', text: 'hire' });
  assert.equal(item.s, 'linkedin');
  assert.equal(item.n, 'Ada');
  assert.equal(mapLinkedinPost({ url: '/nope' }), null);
});
