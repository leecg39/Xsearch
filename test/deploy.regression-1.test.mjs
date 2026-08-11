import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('private Traefik routes are rate-limited before Basic authentication', async () => {
  const compose = await readFile(
    new URL('../deploy/hostinger/docker-compose.yml', import.meta.url),
    'utf8',
  );

  assert.match(
    compose,
    /xsearch-news-private\.middlewares: xsearch-news-rate,xsearch-news-auth/,
  );
  assert.match(compose, /xsearch-news-rate\.ratelimit\.average: "10"/);
  assert.match(compose, /xsearch-news-rate\.ratelimit\.burst: "20"/);
  assert.match(compose, /xsearch-news-rate\.ratelimit\.period: 1s/);
  assert.doesNotMatch(
    compose,
    /xsearch-news-preflight\.middlewares:/,
  );
});
