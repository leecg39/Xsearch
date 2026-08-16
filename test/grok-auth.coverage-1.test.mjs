// 주의: 이 모듈은 newsgen/.auth/grok.json (실제 SuperGrok 토큰)을 직접 읽고 지운다.
// 경로를 주입할 수 없으므로 여기서는 부작용이 없는 읽기 전용 동작만 검증한다.
// logout()·startConnect()·getAccessToken()은 실제 자격증명을 삭제하거나 네트워크를 타므로 호출하지 않는다.
import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { GROK, getStatus } from '../newsgen/lib/grok-auth.mjs';

const AUTH_FILE = fileURLToPath(new URL('../newsgen/.auth/grok.json', import.meta.url));

test('GROK points at the xAI device-code endpoints and the CLI proxy', () => {
  assert.match(GROK.deviceUrl, /^https:\/\/auth\.x\.ai\/oauth2\/device\/code$/);
  assert.match(GROK.tokenUrl, /^https:\/\/auth\.x\.ai\/oauth2\/token$/);
  assert.match(GROK.proxyBase, /^https:\/\/cli-chat-proxy\.grok\.com\/v1$/);
  assert.ok(GROK.clientId.length > 0);
});

test('GROK requests the scopes the CLI proxy needs, including refresh', () => {
  const scopes = GROK.scope.split(' ');

  assert.ok(scopes.includes('offline_access')); // 리프레시 토큰 발급에 필요
  assert.ok(scopes.includes('grok-cli:access'));
  assert.ok(scopes.includes('openid'));
});

test('GROK sends the client identity headers the proxy requires', () => {
  assert.deepEqual(Object.keys(GROK.identityHeaders).sort(), [
    'x-grok-client-identifier',
    'x-grok-client-version',
    'x-xai-token-auth',
  ]);
  assert.equal(GROK.identityHeaders['x-xai-token-auth'], 'xai-grok-cli');
});

test('getStatus reports no pending device flow before a connect is started', () => {
  const st = getStatus();

  assert.equal(st.pending, false);
  assert.equal(st.userCode, null);
  assert.equal(st.verificationUri, null);
  assert.equal(st.error, null);
});

test('getStatus returns a fully-formed status whose fields agree with each other', () => {
  const st = getStatus();

  assert.deepEqual(Object.keys(st).sort(), [
    'account', 'connected', 'error', 'expiresAt', 'pending', 'userCode', 'verificationUri',
  ]);
  assert.equal(typeof st.connected, 'boolean');

  if (st.connected) {
    // 토큰이 있으면 만료 시각은 없거나 파싱 가능한 ISO 문자열이다.
    assert.ok(st.expiresAt === null || !Number.isNaN(Date.parse(st.expiresAt)));
    assert.ok(st.account === null || typeof st.account === 'string');
  } else {
    assert.equal(st.expiresAt, null);
    assert.equal(st.account, null);
  }
});

test('getStatus never writes to or removes the stored credentials', () => {
  const before = existsSync(AUTH_FILE) ? statSync(AUTH_FILE).mtimeMs : null;

  getStatus();
  getStatus();

  const after = existsSync(AUTH_FILE) ? statSync(AUTH_FILE).mtimeMs : null;
  assert.equal(after, before);
});
