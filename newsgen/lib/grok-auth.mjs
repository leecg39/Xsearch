// SuperGrok(X Premium+) 구독 인증 — xAI OAuth 2.0 기기 코드 방식(RFC 8628).
// 유료 api.x.ai 키 대신 구독 계정으로 로그인해 Grok CLI 채팅 프록시
// (cli-chat-proxy.grok.com)를 쓴다. 토큰은 newsgen/.auth/grok.json에 0600으로 저장.
import { readFileSync, writeFileSync, mkdirSync, renameSync, rmSync, existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const GROK = {
  deviceUrl: 'https://auth.x.ai/oauth2/device/code',
  tokenUrl: 'https://auth.x.ai/oauth2/token',
  clientId: 'b1a00492-073a-47ea-816f-4c329264a828', // 공개 Grok-CLI 클라이언트 (secret 없음)
  scope: 'openid profile email offline_access grok-cli:access api:access conversations:read conversations:write',
  proxyBase: 'https://cli-chat-proxy.grok.com/v1',
  // CLI 프록시는 이 식별 헤더가 없으면 미자격 API 클라이언트로 취급한다
  identityHeaders: {
    'x-xai-token-auth': 'xai-grok-cli',
    'x-grok-client-identifier': 'grok-shell',
    'x-grok-client-version': '0.2.93',
  },
};

const AUTH_DIR = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '.auth');
const AUTH_FILE = path.join(AUTH_DIR, 'grok.json');
const EXP_BUFFER_S = 300; // 만료 5분 전부터 갱신

// ---------- 토큰 파일 ----------
function loadTokens() {
  try { return JSON.parse(readFileSync(AUTH_FILE, 'utf-8')).tokens || null; }
  catch { return null; }
}

function saveTokens(tokens) {
  mkdirSync(AUTH_DIR, { recursive: true });
  const tmp = AUTH_FILE + '.tmp';
  writeFileSync(tmp, JSON.stringify({ tokens, last_refresh: new Date().toISOString() }, null, 2), { mode: 0o600 });
  renameSync(tmp, AUTH_FILE);
}

export function logout() {
  try { rmSync(AUTH_FILE); } catch {}
  device = null;
}

/** JWT exp 클레임 비검증 디코드 (실패 시 null) */
function jwtExp(token) {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString());
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch { return null; }
}

function jwtClaims(token) {
  try { return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString()); }
  catch { return {}; }
}

export function getStatus() {
  const tokens = loadTokens();
  const st = {
    connected: false, account: null, expiresAt: null,
    pending: Boolean(device && device.status === 'pending'),
    userCode: device?.status === 'pending' ? device.user_code : null,
    verificationUri: device?.status === 'pending' ? (device.verification_uri_complete || device.verification_uri) : null,
    error: device?.status === 'error' ? device.error : null,
  };
  if (tokens?.access_token) {
    st.connected = true;
    const exp = jwtExp(tokens.access_token);
    if (exp) st.expiresAt = new Date(exp * 1000).toISOString();
    const claims = jwtClaims(tokens.id_token || tokens.access_token);
    st.account = claims.email || claims.preferred_username || claims.sub || null;
  }
  return st;
}

// ---------- OAuth HTTP ----------
async function postForm(url, params) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded', accept: 'application/json' },
    body: new URLSearchParams(params).toString(),
    signal: AbortSignal.timeout(30000),
  });
  const text = await res.text();
  let json = {};
  try { json = JSON.parse(text); } catch {}
  return { ok: res.ok, status: res.status, json, text };
}

// ---------- 기기 코드 흐름 ----------
let device = null; // {status:'pending'|'done'|'error', user_code, verification_uri, verification_uri_complete, error}

export async function startConnect() {
  const r = await postForm(GROK.deviceUrl, { client_id: GROK.clientId, scope: GROK.scope });
  if (!r.ok || !r.json.device_code) {
    throw new Error(`기기 코드 발급 실패 (HTTP ${r.status}): ${(r.json.error_description || r.json.error || r.text).slice(0, 200)}`);
  }
  const d = r.json;
  device = {
    status: 'pending',
    device_code: d.device_code,
    user_code: d.user_code,
    verification_uri: d.verification_uri,
    verification_uri_complete: d.verification_uri_complete,
    deadline: Date.now() + (d.expires_in || 900) * 1000,
    interval: Math.max(1, d.interval || 5) * 1000,
  };
  pollLoop(device);
  return {
    user_code: d.user_code,
    verification_uri: d.verification_uri,
    verification_uri_complete: d.verification_uri_complete,
    expires_in: d.expires_in || 900,
  };
}

async function pollLoop(session) {
  while (device === session && session.status === 'pending') {
    if (Date.now() > session.deadline) {
      session.status = 'error';
      session.error = '인증 시간이 만료되었습니다. 다시 연결을 시작하세요.';
      return;
    }
    await new Promise((r) => setTimeout(r, session.interval));
    if (device !== session || session.status !== 'pending') return;
    try {
      const r = await postForm(GROK.tokenUrl, {
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
        client_id: GROK.clientId,
        device_code: session.device_code,
      });
      const err = r.json.error;
      if (r.ok && r.json.access_token) {
        if (!r.json.refresh_token) {
          session.status = 'error';
          session.error = '토큰 응답에 refresh_token이 없습니다.';
          return;
        }
        saveTokens({
          access_token: r.json.access_token,
          refresh_token: r.json.refresh_token,
          id_token: r.json.id_token,
        });
        session.status = 'done';
        return;
      }
      if (err === 'authorization_pending') continue;
      if (err === 'slow_down') {
        session.interval = Math.min(session.interval + 5000, 30000);
        continue;
      }
      session.status = 'error';
      session.error = err === 'expired_token' ? '코드가 만료되었습니다. 다시 시도하세요.'
        : err === 'access_denied' || err === 'authorization_denied' ? '사용자가 승인을 거부했습니다.'
        : `토큰 발급 실패: ${(r.json.error_description || err || r.text).slice(0, 200)}`;
      return;
    } catch (e) {
      // 네트워크 일시 오류는 다음 주기에 재시도
      if (Date.now() > session.deadline) {
        session.status = 'error';
        session.error = `네트워크 오류: ${e.message}`;
        return;
      }
    }
  }
}

// ---------- 액세스 토큰 (자동 갱신, 단일 비행) ----------
let refreshing = null;

export async function getAccessToken() {
  const tokens = loadTokens();
  if (!tokens?.access_token) return null;
  const exp = jwtExp(tokens.access_token);
  if (!exp || Date.now() / 1000 < exp - EXP_BUFFER_S) return tokens.access_token;

  // 갱신 필요 — refresh 토큰은 1회용(회전)이라 동시 갱신은 단일 비행으로 직렬화
  if (!refreshing) {
    refreshing = (async () => {
      try {
        const cur = loadTokens(); // 재확인: 다른 흐름이 이미 갱신했을 수 있음
        const curExp = jwtExp(cur?.access_token || '');
        if (curExp && Date.now() / 1000 < curExp - EXP_BUFFER_S) return cur.access_token;
        const r = await postForm(GROK.tokenUrl, {
          grant_type: 'refresh_token',
          client_id: GROK.clientId,
          refresh_token: cur.refresh_token,
        });
        if (r.ok && r.json.access_token && r.json.refresh_token) {
          saveTokens({
            access_token: r.json.access_token,
            refresh_token: r.json.refresh_token,
            id_token: r.json.id_token || cur.id_token,
          });
          return r.json.access_token;
        }
        if (r.status === 403) {
          throw new Error('SuperGrok 구독 등급이 CLI/API 접근을 지원하지 않습니다 (403). 구독 등급을 확인하세요.');
        }
        if (r.status === 400 || r.status === 401) {
          logout();
          throw new Error('그록 인증이 만료되었습니다. SuperGrok 계정을 다시 연결하세요.');
        }
        throw new Error(`토큰 갱신 실패 (HTTP ${r.status}): ${(r.json.error_description || r.json.error || '').slice(0, 200)}`);
      } finally {
        refreshing = null;
      }
    })();
  }
  return refreshing;
}
