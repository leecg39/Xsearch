# Testing

100% test coverage is the key to great vibe coding. Tests let you move fast, trust your instincts, and ship with confidence — without them, vibe coding is just yolo coding. With tests, it's a superpower.

## Framework

- Node.js 22 built-in test runner (`node:test`)
- No additional testing dependency
- Tests use ESM and Node's strict assertion API

## Commands

```bash
npm test
```

Run a single file:

```bash
node --test test/template.test.mjs
```

Run the full local quality gate:

```bash
npm test && npm run build && npm run check && npm run verify
```

## Test layers

- Unit tests: pure preprocessing, parsing, normalization, and template behavior under `test/`.
- Integration tests: use temporary directories to verify generated archive files and metadata.
- Smoke tests: `npm run build`, `npm run check`, and `npm run verify` validate packaged artifacts.
- E2E tests: run browser QA against `https://news.soverin.cloud` for public, authenticated, and extension flows.

## Conventions

- Name files `*.test.mjs` and use behavior-focused test names.
- Import `test` from `node:test` and strict assertions from `node:assert/strict`.
- Use temporary directories for filesystem tests and remove them in `finally`.
- Mock external APIs and never put credentials in test files.
- A bug fix must include a regression test that reproduces the original condition.
