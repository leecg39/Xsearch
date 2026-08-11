import test from 'node:test';
import assert from 'node:assert/strict';

import { pageShell } from '../newsgen/lib/template.mjs';

test('pageShell escapes metadata and builds the news.soverin.cloud canonical URL', () => {
  const html = pageShell({
    title: 'A "B" <C> & D | 오늘의 AI 브리핑',
    description: '설명 "인용" <태그>',
    date: '2026-08-11',
    bodyHtml: '<p>본문</p>',
  });

  assert.match(html, /<link rel="canonical" href="https:\/\/news\.soverin\.cloud\/output\/2026-08-11\.html">/);
  assert.match(html, /<title>A &quot;B&quot; &lt;C&gt; &amp; D \| 오늘의 AI 브리핑<\/title>/);
  assert.match(html, /<meta name="description" content="설명 &quot;인용&quot; &lt;태그&gt;">/);
  assert.doesNotMatch(html, /<title>[^<]*<C>/);
});

test('pageShell uses the 1200x630 OG image in Open Graph, Twitter, and JSON-LD', () => {
  const html = pageShell({ title: '테스트', description: '설명', date: '2026-08-11', bodyHtml: '' });
  const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];

  assert.ok(jsonLd, 'JSON-LD script must be present');
  const data = JSON.parse(jsonLd);
  assert.deepEqual(data.image, ['https://news.soverin.cloud/og-image.jpg']);
  assert.match(html, /<meta property="og:image:width" content="1200">/);
  assert.match(html, /<meta property="og:image:height" content="630">/);
  assert.match(html, /<meta name="twitter:card" content="summary_large_image">/);
});
