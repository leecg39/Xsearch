import test from 'node:test';
import assert from 'node:assert/strict';

import {
  parseLocation,
  listingUrl,
  childrenOf,
  afterOf,
  mapChild,
  backoffMs,
  MAX_429,
  match,
} from '../src/sources/reddit.mjs';

const fixture = {
  data: {
    after: 't3_abc',
    children: [
      {
        kind: 't3',
        data: {
          id: 'xyz',
          title: 'GPT-5 release',
          selftext: 'details here',
          author: 'spez',
          subreddit: 'MachineLearning',
          permalink: '/r/MachineLearning/comments/xyz/gpt5/',
          score: 1200,
          num_comments: 88,
          created_utc: 1700000000,
          url: 'https://openai.com/blog',
          post_hint: 'link',
        },
      },
      { kind: 't1', data: { body: 'a comment' } },
      {
        kind: 't3',
        data: {
          id: 'img1',
          title: 'screenshot',
          author: 'bob',
          permalink: '/r/pics/comments/img1/shot/',
          score: 10,
          num_comments: 1,
          created_utc: 1700000001,
          url: 'https://i.redd.it/a.png',
          post_hint: 'image',
        },
      },
    ],
  },
};

test('match recognises reddit hosts including old.reddit', () => {
  assert.equal(match('www.reddit.com'), true);
  assert.equal(match('old.reddit.com'), true);
  assert.equal(match('x.com'), false);
});

test('parseLocation reads subreddit, search, and front page URLs', () => {
  assert.deepEqual(parseLocation('https://www.reddit.com/r/MachineLearning/hot/'), {
    kind: 'subreddit', sub: 'MachineLearning', sort: 'hot', q: '',
  });
  assert.equal(parseLocation('https://www.reddit.com/search/?q=llm&sort=new').kind, 'search');
  assert.equal(parseLocation('https://www.reddit.com/r/all/new').sub, 'all');
  assert.equal(parseLocation('https://www.reddit.com/').kind, 'front');
  assert.equal(parseLocation('not a url').kind, 'front');
});

test('listingUrl paginates with after and switches to search.json', () => {
  const sub = listingUrl({ kind: 'subreddit', sub: 'ai', sort: 'hot' }, 't3_next');
  assert.match(sub, /^\/r\/ai\/hot\.json\?/);
  assert.match(sub, /after=t3_next/);
  const search = listingUrl({ kind: 'search', q: 'llm', sort: 'relevance' });
  assert.match(search, /^\/search\.json\?/);
  assert.match(search, /q=llm/);
});

test('mapChild maps listing JSON onto the shared schema and skips comments', () => {
  const kids = childrenOf(fixture);
  assert.equal(kids.length, 3);
  assert.equal(afterOf(fixture), 't3_abc');
  assert.equal(mapChild(kids[1]), null); // t1 comment

  const post = mapChild(kids[0]);
  assert.equal(post.s, 'reddit');
  assert.equal(post.n, 'spez');
  assert.equal(post.h, 'u/spez');
  assert.equal(post.l, 1200);
  assert.equal(post.r, 88);
  assert.equal(post.v, 0);
  assert.equal(post.b, 0);
  assert.equal(post.u, 'https://www.reddit.com/r/MachineLearning/comments/xyz/gpt5/');
  assert.match(post.t, /GPT-5 release/);
  assert.match(post.t, /details here/);
  assert.equal(post.d, new Date(1700000000 * 1000).toISOString());

  const img = mapChild(kids[2]);
  assert.equal(img.md, 'img');
  assert.equal(img.mu, 'https://i.redd.it/a.png');
});

test('childrenOf and afterOf tolerate missing listing payloads', () => {
  assert.deepEqual(childrenOf(null), []);
  assert.equal(afterOf({}), null);
  assert.equal(mapChild(null), null);
  assert.equal(mapChild({ kind: 't3', data: {} }), null);
});

test('backoffMs doubles from at least 6s and caps at 60s', () => {
  assert.equal(backoffMs(0, 2000), 6000);
  assert.equal(backoffMs(1, 6000), 12000);
  assert.equal(backoffMs(10, 6000), 60000);
  assert.equal(MAX_429, 6);
});
