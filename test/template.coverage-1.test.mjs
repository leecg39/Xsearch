import test from 'node:test';
import assert from 'node:assert/strict';

import { pageShell } from '../newsgen/lib/template.mjs';

const shell = (over = {}) => pageShell({
  title: '제목', description: '설명', date: '2026-08-10', bodyHtml: '<main>본문</main>', ...over,
});

test('pageShell inlines the theme toggle and omits ad scripts by default', () => {
  const html = shell();

  assert.doesNotMatch(html, /adsbygoogle/);
  assert.doesNotMatch(html, /supabase-js/);
  assert.doesNotMatch(html, /visitor-tracker\.js/);
  assert.match(html, /<script>[\s\S]*?<\/script>/); // 테마 토글이 인라인으로 들어간다
});

test('pageShell switches to hosted site scripts when siteScripts is enabled', () => {
  const html = shell({ siteScripts: true });

  assert.match(html, /pagead2\.googlesyndication\.com\/pagead\/js\/adsbygoogle\.js/);
  assert.match(html, /cdn\.jsdelivr\.net\/npm\/@supabase\/supabase-js@2/);
  assert.match(html, /\.\.\/data\/visitor-tracker\.js/);
  assert.match(html, /\.\.\/data\/theme-toggle\.js/);
  assert.match(html, /\.\.\/data\/subscribe-cta\.js/);
});

test('pageShell keeps the theme toggle button in both script modes', () => {
  const plain = shell();
  const hosted = shell({ siteScripts: true });
  const button = /id="themeBtn"|theme-btn/;

  assert.match(plain, button);
  assert.match(hosted, button);
});

test('pageShell normalises a baseUrl that has no trailing slash', () => {
  const html = shell({ baseUrl: 'https://example.test/news' });

  assert.match(html, /<link rel="canonical" href="https:\/\/example\.test\/news\/2026-08-10\.html">/);
});

test('pageShell does not double the slash when baseUrl already ends with one', () => {
  const html = shell({ baseUrl: 'https://example.test/news/' });

  assert.match(html, /href="https:\/\/example\.test\/news\/2026-08-10\.html"/);
  assert.doesNotMatch(html, /news\/\/2026-08-10/);
});

test('pageShell renders the supplied body markup', () => {
  const html = shell({ bodyHtml: '<main id="지문">본문</main>' });

  assert.match(html, /<main id="지문">본문<\/main>/);
});
