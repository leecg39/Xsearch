// 5분 AI 뉴스 빌더 — 로컬·컨테이너 웹서비스 (Node 22+)
// 로컬 실행: npm run news  →  http://127.0.0.1:8787/builder
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, readdir, stat } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { analyze, prepareCandidates } from './lib/preprocess.mjs';
import { generateReport, listModels, ENV_KEYS, GROK_FALLBACK_MODELS } from './lib/llm.mjs';
import { renderReport, renderDigest, inlineImages } from './lib/render.mjs';
import * as grokAuth from './lib/grok-auth.mjs';
import { buildArchive } from './lib/archive.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(process.env.NEWSGEN_OUTPUT_DIR || path.join(ROOT, 'output'));
const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || '127.0.0.1';
const APPROVAL_MODE = process.env.NEWSGEN_APPROVAL_MODE === 'client' ? 'client' : 'ego';
const MAX_BODY = 30 * 1024 * 1024;

const jobs = new Map(); // id → {status, step, detail, startedAt, result, error}
const imports = new Map(); // id → {fileName, tweets, at} — 확장 '브리핑 내보내기' 임시 저장
const IMPORT_TTL = 30 * 60 * 1000;

function pruneImports() {
  const now = Date.now();
  for (const [k, v] of imports) if (now - v.at > IMPORT_TTL) imports.delete(k);
  while (imports.size > 10) imports.delete(imports.keys().next().value);
}

// 확장(background fetch)은 host 권한으로 통과하지만, 북마클릿 모드는
// x.com 페이지 컨텍스트에서 직접 fetch하므로 /api/import에만 CORS를 연다.
function corsHeaders() {
  return {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'POST, GET, OPTIONS',
    'access-control-allow-headers': 'authorization, content-type',
  };
}

/** grok 프로바이더의 토큰 결정: 직접 입력 > 저장된 OAuth > 환경변수 */
async function resolveGrokToken(pastedKey) {
  if (pastedKey) return pastedKey;
  const stored = await grokAuth.getAccessToken();
  if (stored) return stored;
  return process.env[ENV_KEYS.grok] || '';
}

// ---------- 승인 페이지를 ego 브라우저로 열기 ----------
// Chrome(원격 디버깅 연결)은 Cloudflare 봇 감지에 걸려 x.ai가 차단하는 사례가 있어,
// 승인 URL은 ego 브라우저 태스크 스페이스에서 열고 제어권을 사용자에게 넘긴다.
const EGO_BIN = process.env.NEWSGEN_EGO_BIN || 'ego-browser';
let egoOpenState = null; // null | 'opening' | {ok, error?}

function openApprovalInEgo(url) {
  return new Promise((resolve) => {
    const script = `
const task = await useOrCreateTaskSpace('SuperGrok 승인')
await openOrReuseTab(${JSON.stringify(url)}, { wait: true, timeout: 30 })
const h = await handOffTaskSpace(task.id)
cliLog('EGO_OK handoff=' + JSON.stringify(h))
`;
    let out = '';
    let child;
    try {
      child = spawn(EGO_BIN, ['nodejs'], { stdio: ['pipe', 'pipe', 'pipe'] });
    } catch (e) {
      return resolve({ ok: false, error: e.message });
    }
    const timer = setTimeout(() => {
      try { child.kill(); } catch {}
      resolve({ ok: false, error: 'ego 브라우저 응답 시간 초과(60초)' });
    }, 60000);
    child.stdout.on('data', (d) => { out += d; });
    child.stderr.on('data', (d) => { out += d; });
    child.on('error', (e) => {
      clearTimeout(timer);
      resolve({ ok: false, error: e.code === 'ENOENT' ? `'${EGO_BIN}' 명령을 찾을 수 없습니다 (ego-lite 설치 확인)` : e.message });
    });
    child.on('close', (code) => {
      clearTimeout(timer);
      if (out.includes('EGO_OK')) resolve({ ok: true });
      else resolve({ ok: false, error: (out.trim().split('\n').pop() || `종료 코드 ${code}`).slice(0, 200) });
    });
    child.stdin.write(script);
    child.stdin.end();
  });
}

function sendJSON(res, code, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(code, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > MAX_BODY) { reject(new Error('요청이 너무 큽니다 (30MB 제한)')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function setStep(job, step, detail = '') {
  job.step = step;
  job.detail = detail;
}

async function runJob(job, p) {
  try {
    setStep(job, 'preprocess', '중복 제거·점수화·라벨 분류');
    const stats = analyze(p.tweets);
    const cands = prepareCandidates(p.tweets, { limit: 110 });
    job.meta = { candidates: cands.length, aiCount: stats.aiCount };

    let rendered;
    let report = null;
    if (p.mode === 'ai') {
      const apiKey = p.provider === 'grok'
        ? await resolveGrokToken(p.apiKey)
        : (p.apiKey || process.env[ENV_KEYS[p.provider]] || '');
      if (!apiKey) {
        throw new Error(p.provider === 'grok'
          ? 'SuperGrok 계정이 연결되어 있지 않습니다. 설정에서 "SuperGrok 계정 연결"을 먼저 진행하세요.'
          : `${p.provider} API 키가 없습니다. 키를 입력하거나 환경변수 ${ENV_KEYS[p.provider]}를 설정하세요.`);
      }
      setStep(job, 'llm', `${p.provider} ${p.model} 호출 준비`);
      report = await generateReport({
        provider: p.provider, model: p.model, apiKey,
        date: p.date, cands,
        onStatus: (s) => setStep(job, 'llm', s),
      });
      setStep(job, 'render', '브리핑 HTML 렌더링');
      rendered = renderReport({ report, cands, baseUrl: p.baseUrl, siteScripts: p.siteScripts });
    } else {
      setStep(job, 'render', '다이제스트 HTML 렌더링');
      rendered = renderDigest({ date: p.date, cands, stats, baseUrl: p.baseUrl, siteScripts: p.siteScripts });
    }

    let html = rendered.html;
    if (p.inlineImages && rendered.imageUrls.length) {
      setStep(job, 'images', `이미지 ${rendered.imageUrls.length}장 인라인`);
      html = await inlineImages(html, rendered.imageUrls, (s) => setStep(job, 'images', s));
    }

    setStep(job, 'save', '파일 저장');
    await mkdir(OUT_DIR, { recursive: true });
    const fileName = `${p.date}.html`;
    await writeFile(path.join(OUT_DIR, fileName), html, 'utf-8');
    if (report) {
      await writeFile(path.join(OUT_DIR, `${p.date}.report.json`), JSON.stringify(report, null, 2), 'utf-8');
    }
    setStep(job, 'save', '아카이브 페이지 갱신');
    await buildArchive(OUT_DIR).catch((e) => console.error('아카이브 갱신 실패:', e.message));

    job.status = 'done';
    job.result = {
      file: fileName,
      url: `/output/${fileName}`,
      bytes: Buffer.byteLength(html),
      sections: report ? report.sections.length : 0,
      figures: rendered.imageUrls.length,
      candidates: cands.length,
      mode: p.mode,
    };
    setStep(job, 'done', '완료');
  } catch (e) {
    job.status = 'error';
    job.error = e.message || String(e);
    setStep(job, 'error', job.error);
  }
}

function validatePayload(p) {
  if (!Array.isArray(p.tweets) || p.tweets.length === 0) return '트윗 배열이 비어 있습니다';
  if (!p.tweets.some((t) => t && typeof t === 'object' && (t.text || t.handle))) return 'Xsearch 수집 형식(text/handle 필드)이 아닙니다';
  if (!/^\d{4}-\d{2}-\d{2}$/.test(p.date || '')) return '날짜 형식이 올바르지 않습니다 (YYYY-MM-DD)';
  if (!['ai', 'digest'].includes(p.mode)) return 'mode는 ai 또는 digest여야 합니다';
  if (p.mode === 'ai') {
    if (!['grok', 'anthropic', 'openai', 'gemini'].includes(p.provider)) return '프로바이더가 올바르지 않습니다';
    if (!p.model || typeof p.model !== 'string') return '모델명이 비어 있습니다';
  }
  return null;
}

const MIME = { '.html': 'text/html; charset=utf-8', '.json': 'application/json; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };

async function serveFile(res, absPath) {
  try {
    const data = await readFile(absPath);
    res.writeHead(200, { 'content-type': MIME[path.extname(absPath)] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(data);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('찾을 수 없습니다');
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const p = url.pathname;

  try {
    if (req.method === 'GET' && (p === '/' || p === '/index.html')) {
      res.writeHead(302, { location: '/output/' });
      return res.end();
    }

    if (req.method === 'GET' && (p === '/builder' || p === '/builder/')) {
      return await serveFile(res, path.join(ROOT, 'public', 'index.html'));
    }

    if (req.method === 'GET' && p === '/icon32.png') {
      return await serveFile(res, path.join(ROOT, '..', 'ext', 'icon32.png'));
    }

    if (req.method === 'GET' && p === '/icon128.png') {
      return await serveFile(res, path.join(ROOT, '..', 'ext', 'icon128.png'));
    }

    // 아카이브는 '디렉터리'로 서빙한다. index.html 안의 링크는 상대경로(2026-08-06.html)라
    // 기준 경로가 /output/ 이어야 풀린다. 슬래시 없는 경로는 리다이렉트로 맞춰준다.
    if (req.method === 'GET' && (p === '/archive' || p === '/archive/' || p === '/output')) {
      res.writeHead(302, { location: '/output/' });
      return res.end();
    }

    if (req.method === 'GET' && p === '/output/') {
      return await serveFile(res, path.join(OUT_DIR, 'index.html'));
    }

    if (req.method === 'GET' && p.startsWith('/output/')) {
      const name = path.basename(p); // 경로 탈출 방지
      return await serveFile(res, path.join(OUT_DIR, name));
    }

    if (req.method === 'GET' && p === '/api/health') {
      return sendJSON(res, 200, { ok: true });
    }

    if (req.method === 'POST' && p === '/api/archive/rebuild') {
      try {
        const r = await buildArchive(OUT_DIR);
        return sendJSON(res, 200, r);
      } catch (e) {
        return sendJSON(res, 500, { error: e.message });
      }
    }

    if (req.method === 'GET' && p === '/api/env') {
      return sendJSON(res, 200, {
        envKeys: Object.fromEntries(Object.entries(ENV_KEYS).map(([k, v]) => [k, Boolean(process.env[v])])),
        outputDir: OUT_DIR,
      });
    }

    // ---------- SuperGrok 구독 연결 (OAuth 기기 코드) ----------
    if (req.method === 'GET' && p === '/api/grok/status') {
      return sendJSON(res, 200, {
        ...grokAuth.getStatus(),
        approvalMode: APPROVAL_MODE,
        egoOpen: APPROVAL_MODE === 'ego' ? egoOpenState : null,
      });
    }
    if (req.method === 'POST' && p === '/api/grok/connect') {
      try {
        const info = await grokAuth.startConnect();
        if (APPROVAL_MODE === 'client') {
          egoOpenState = null;
          return sendJSON(res, 200, { ...info, browser: 'client' });
        }
        // 로컬 환경은 Chrome 대신 ego 브라우저에서 승인 페이지를 연다.
        egoOpenState = 'opening';
        openApprovalInEgo(info.verification_uri_complete || info.verification_uri)
          .then((r) => { egoOpenState = r; });
        return sendJSON(res, 200, { ...info, browser: 'ego' });
      } catch (e) {
        return sendJSON(res, 502, { error: e.message });
      }
    }
    if (req.method === 'POST' && p === '/api/grok/logout') {
      grokAuth.logout();
      return sendJSON(res, 200, { ok: true });
    }

    // ---------- 확장/북마클릿 '브리핑 내보내기' 수신 ----------
    if (req.method === 'OPTIONS' && p.startsWith('/api/import')) {
      res.writeHead(204, corsHeaders());
      return res.end();
    }
    if (req.method === 'POST' && p === '/api/import') {
      const body = JSON.parse((await readBody(req)).toString('utf-8') || '{}');
      const tweets = Array.isArray(body) ? body : body.tweets;
      if (!Array.isArray(tweets) || tweets.length === 0) {
        res.writeHead(400, { 'content-type': 'application/json; charset=utf-8', ...corsHeaders() });
        return res.end(JSON.stringify({ error: '트윗 배열이 비어 있습니다' }));
      }
      pruneImports();
      const id = randomUUID().slice(0, 8);
      imports.set(id, { fileName: String(body.fileName || 'tw_import.json'), tweets, at: Date.now() });
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8', ...corsHeaders() });
      return res.end(JSON.stringify({ id, url: `/builder?import=${id}` }));
    }
    if (req.method === 'GET' && p.startsWith('/api/import/')) {
      const item = imports.get(p.slice('/api/import/'.length));
      if (!item) return sendJSON(res, 404, { error: '가져올 데이터가 없거나 만료되었습니다 (30분 보관)' });
      return sendJSON(res, 200, { fileName: item.fileName, tweets: item.tweets });
    }

    if (req.method === 'GET' && p === '/api/list') {
      let items = [];
      try {
        const files = (await readdir(OUT_DIR)).filter((f) => /^\d{4}-\d{2}-\d{2}\.html$/.test(f));
        items = await Promise.all(files.map(async (f) => {
          const s = await stat(path.join(OUT_DIR, f));
          return { file: f, url: `/output/${f}`, bytes: s.size, mtime: s.mtimeMs };
        }));
        items.sort((a, b) => b.mtime - a.mtime);
      } catch {}
      return sendJSON(res, 200, { items });
    }

    if (req.method === 'GET' && p.startsWith('/api/job/')) {
      const job = jobs.get(p.slice('/api/job/'.length));
      if (!job) return sendJSON(res, 404, { error: '작업을 찾을 수 없습니다' });
      return sendJSON(res, 200, {
        status: job.status, step: job.step, detail: job.detail,
        elapsed: Math.round((Date.now() - job.startedAt) / 1000),
        result: job.result || null, error: job.error || null, meta: job.meta || null,
      });
    }

    if (req.method === 'POST' && p === '/api/models') {
      const body = JSON.parse((await readBody(req)).toString('utf-8') || '{}');
      if (body.provider === 'grok') {
        try {
          const token = await resolveGrokToken(body.apiKey);
          if (!token) return sendJSON(res, 200, { models: GROK_FALLBACK_MODELS, note: '계정 미연결 — 참고 목록' });
          const models = await listModels({ provider: 'grok', apiKey: token });
          return sendJSON(res, 200, { models });
        } catch {
          return sendJSON(res, 200, { models: GROK_FALLBACK_MODELS, note: '목록 조회 실패 — 참고 목록' });
        }
      }
      const apiKey = body.apiKey || process.env[ENV_KEYS[body.provider]] || '';
      if (!apiKey) return sendJSON(res, 400, { error: 'API 키가 필요합니다' });
      try {
        const models = await listModels({ provider: body.provider, apiKey });
        return sendJSON(res, 200, { models });
      } catch (e) {
        return sendJSON(res, 502, { error: e.message });
      }
    }

    if (req.method === 'POST' && p === '/api/generate') {
      const body = JSON.parse((await readBody(req)).toString('utf-8') || '{}');
      const payload = {
        tweets: body.tweets,
        date: body.date,
        mode: body.mode || 'ai',
        provider: body.provider || 'grok',
        model: body.model || '',
        apiKey: body.apiKey || '',
        inlineImages: body.inlineImages !== false,
        siteScripts: Boolean(body.siteScripts),
        baseUrl: typeof body.baseUrl === 'string' && body.baseUrl
          ? body.baseUrl
          : 'https://news.soverin.cloud/output/',
      };
      const bad = validatePayload(payload);
      if (bad) return sendJSON(res, 400, { error: bad });

      const id = randomUUID();
      const job = { status: 'running', step: 'queued', detail: '', startedAt: Date.now() };
      jobs.set(id, job);
      // 오래된 잡 정리 (최근 20개 유지)
      if (jobs.size > 20) {
        const oldest = [...jobs.keys()].slice(0, jobs.size - 20);
        for (const k of oldest) if (jobs.get(k)?.status !== 'running') jobs.delete(k);
      }
      setImmediate(() => runJob(job, payload));
      return sendJSON(res, 200, { jobId: id });
    }

    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
  } catch (e) {
    sendJSON(res, 500, { error: e.message || String(e) });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Xsearch 뉴스 빌더 실행 중 → http://${HOST}:${PORT}`);
  console.log(`출력 폴더: ${OUT_DIR}`);
  buildArchive(OUT_DIR)
    .then((r) => console.log(`아카이브 갱신: ${r.count}건 → /output/`))
    .catch((e) => console.error('아카이브 갱신 실패:', e.message));
});
