// 날짜별 브리핑 아카이브(index.html) 생성 — fiv.co.kr 홈의 신문형 레이아웃을 따른다.
// output/ 안의 YYYY-MM-DD.html(+.report.json)을 스캔해 정적 페이지 하나로 정리한다.
// 상대 링크만 쓰므로 output/ 폴더째 별도 경로에 배포해도 그대로 동작한다.
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';

const esc = (s) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];

function dateParts(d) {
  const [y, m, day] = d.split('-').map(Number);
  return { y, m, day, dow: WEEKDAY[new Date(Date.UTC(y, m - 1, day)).getUTCDay()] };
}

/** HTML에서 <title>·설명 메타를 추출 (report.json이 없는 다이제스트용) */
function parseHtmlMeta(html) {
  const title = (html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '').trim();
  const desc = html.match(/<meta name="description" content="([^"]*)"/i)?.[1] || '';
  return { title, desc };
}

function readMinutes(html) {
  const text = html
    .replace(/data:image\/[^"')]+/g, '')
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '');
  return Math.max(3, Math.round(text.length / 700));
}

async function collectEntries(outDir) {
  let files = [];
  try { files = await readdir(outDir); } catch { return []; }
  const dated = files.filter((f) => /^\d{4}-\d{2}-\d{2}\.html$/.test(f));
  const entries = [];
  for (const f of dated) {
    const date = f.slice(0, 10);
    const full = path.join(outDir, f);
    try {
      const [html, st] = await Promise.all([readFile(full, 'utf-8'), stat(full)]);
      let report = null;
      try { report = JSON.parse(await readFile(path.join(outDir, `${date}.report.json`), 'utf-8')); } catch {}
      const meta = parseHtmlMeta(html);
      const isDigest = !report && /다이제스트/.test(meta.title);
      entries.push({
        date, file: f,
        type: report ? 'ai' : isDigest ? 'digest' : 'html',
        title: report ? report.title_main : meta.title.replace(/ \| (?:오늘의 AI 브리핑|5분 AI 뉴스)$/, '').replace(/ — \d{4}-\d{2}-\d{2}.*$/, ''),
        sub: report?.title_sub || '',
        desc: report?.description || meta.desc,
        keywords: report?.keywords_top5 || [],
        sections: report?.sections?.length || 0,
        sources: report ? report.sections.reduce((n, s) => n + (s.source_ids?.length || 0), 0) : 0,
        minutes: readMinutes(html),
        bytes: st.size,
      });
    } catch {}
  }
  entries.sort((a, b) => b.date.localeCompare(a.date));
  return entries;
}

function calendarHtml(entries) {
  const byDate = new Map(entries.map((e) => [e.date, e]));
  const months = [...new Set(entries.map((e) => e.date.slice(0, 7)))].sort().reverse();
  return months.map((ym) => {
    const [y, m] = ym.split('-').map(Number);
    const first = new Date(Date.UTC(y, m - 1, 1));
    const startDow = first.getUTCDay();
    const daysIn = new Date(Date.UTC(y, m, 0)).getUTCDate();
    let cells = '';
    for (let i = 0; i < startDow; i++) cells += '<span class="cal-day other"></span>';
    for (let d = 1; d <= daysIn; d++) {
      const key = `${ym}-${String(d).padStart(2, '0')}`;
      const e = byDate.get(key);
      cells += e
        ? `<a class="cal-day has" href="${esc(e.file)}" title="${esc(e.title)}">${d}</a>`
        : `<span class="cal-day">${d}</span>`;
    }
    return `<div class="cal">
<div class="cal-head">${y}년 ${m}월</div>
<div class="cal-grid">${WEEKDAY.map((w) => `<span class="cal-dow">${w}</span>`).join('')}${cells}</div>
</div>`;
  }).join('\n');
}

function cardHtml(e, isNew) {
  const p = dateParts(e.date);
  const typeLabel = e.type === 'ai' ? 'AI 브리핑' : e.type === 'digest' ? '다이제스트' : 'HTML';
  return `<a class="card" href="${esc(e.file)}" data-search="${esc((e.title + ' ' + e.sub + ' ' + e.keywords.join(' ') + ' ' + e.date).toLowerCase())}">
<div class="card-thumb"><span class="ct-date">${e.date.replaceAll('-', '.')}</span><span class="ct-brand">오늘의 AI 브리핑.</span></div>
<div class="card-body">
<div class="card-meta">${isNew ? '<span class="badge-new">NEW</span>' : ''}<span>${String(p.m).padStart(2, '0')}-${String(p.day).padStart(2, '0')} (${p.dow})</span><span>·</span><span>${typeLabel}</span>${e.type === 'ai' ? `<span>·</span><span>${e.minutes}분</span>` : ''}</div>
<div class="card-title">${esc(e.title)}</div>
<div class="card-desc">${esc(e.desc).slice(0, 150)}</div>
<div class="card-read">리포트 읽기 →</div>
</div></a>`;
}

function pageHtml(entries) {
  const now = new Date(Date.now() + 9 * 3600 * 1000);
  const built = `${now.getUTCFullYear()}.${String(now.getUTCMonth() + 1).padStart(2, '0')}.${String(now.getUTCDate()).padStart(2, '0')} ${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')} KST`;
  const latest = entries[0];
  const rest = entries.slice(1);
  const lp = latest ? dateParts(latest.date) : null;

  const hero = latest ? `
<section class="hero">
<div class="hero-left">
<div class="section-label">최신 발행 · LATEST ISSUE</div>
<div class="hero-meta"><span class="badge-new">최신</span> ${latest.date.replaceAll('-', '.')} (${lp.dow}) · ${latest.type === 'ai' ? 'AI 브리핑' : '다이제스트'} · ${latest.minutes}분 읽기</div>
<h1 class="hero-title">${esc(latest.title)}</h1>
<p class="hero-desc">${esc(latest.desc)}</p>
${latest.keywords.length ? `<div class="kw-row">${latest.keywords.map((k) => `<span class="kw">#${esc(k)}</span>`).join('')}</div>` : ''}
<a class="hero-btn" href="${esc(latest.file)}">리포트 읽기 →</a>
<div class="hero-stats">
<div><b>${latest.sections || '—'}</b><s>섹션</s></div>
<div><b>${latest.sources || '—'}</b><s>출처 트윗</s></div>
<div><b>${latest.minutes}분</b><s>읽기</s></div>
</div>
</div>
<div class="hero-right"><div class="hr-top">TODAY'S BRIEF</div><div class="hr-date">${latest.date.replaceAll('-', '.')} (${lp.dow})</div><div class="hr-logo">오늘의<br>AI 브리핑<span class="dot-red">.</span></div><div class="hr-sub">매일 아침 · AI·테크 트렌드</div></div>
</section>` : '<section class="hero"><div class="hero-left"><h1 class="hero-title">아직 발행된 브리핑이 없습니다</h1><p class="hero-desc">빌더에서 수집 JSON을 업로드해 첫 브리핑을 생성하세요.</p></div></section>';

  return `<!DOCTYPE html>
<html lang="ko"><head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>오늘의 AI 브리핑 — 아카이브</title>
<meta name="description" content="날짜별 AI 데일리 브리핑 아카이브 — 총 ${entries.length}건">
<link rel="stylesheet" as="style" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<style>
:root{--bg:#faf9f6;--ink:#141414;--muted:#6d6a63;--red:#b3261e;--red-deep:#7a1512;--border:#e7e4dc;--surface:#fff;--thumb1:#2a0d0d;--thumb2:#511511}
[data-theme="dark"]{--bg:#16140f;--ink:#f0ece3;--muted:#928d81;--red:#e07663;--red-deep:#3a2620;--border:#2e2a22;--surface:#1e1c17;--thumb1:#241010;--thumb2:#3d130f;color-scheme:dark}
*{box-sizing:border-box}
body{font-family:'Pretendard',-apple-system,system-ui,sans-serif;background:var(--bg);color:var(--ink);margin:0;line-height:1.65;letter-spacing:-0.01em}
a{color:inherit;text-decoration:none}
.wrap{max-width:1080px;margin:0 auto;padding:0 24px}
/* 상단 바 */
.topbar{border-bottom:1px solid var(--border);font-size:.78em;color:var(--muted)}
.topbar .wrap{display:flex;gap:14px;padding:8px 24px;align-items:center}
.topbar b{color:var(--ink)}
.topbar .right{margin-left:auto}
/* 헤더 */
header.site .wrap{display:flex;align-items:baseline;gap:26px;padding:26px 24px 20px;border-bottom:2px solid var(--ink)}
.logo{font-size:1.7em;font-weight:900;letter-spacing:-0.04em}
.logo .dot-red,.dot-red{color:var(--red)}
.tagline{color:var(--muted);font-size:.85em}
.theme-btn{margin-left:auto;background:none;border:1px solid var(--border);border-radius:50%;width:36px;height:36px;cursor:pointer;color:var(--muted);font-size:15px}
.theme-btn:hover{color:var(--red);border-color:var(--red)}
/* 섹션 라벨 */
.section-label{font-family:ui-monospace,Menlo,monospace;font-size:.72em;letter-spacing:.18em;text-transform:uppercase;color:var(--red);font-weight:700;margin-bottom:14px}
/* 히어로 */
.hero{display:grid;grid-template-columns:1.5fr 1fr;gap:36px;padding:40px 0 34px;border-bottom:1px solid var(--border)}
.hero-meta{font-size:.82em;color:var(--muted);margin-bottom:10px;display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.hero-title{font-size:2.5em;font-weight:900;line-height:1.22;letter-spacing:-0.035em;margin:0 0 14px;word-break:keep-all}
.hero-desc{color:var(--muted);font-size:.98em;max-width:56ch;margin:0 0 14px;word-break:keep-all}
.kw-row{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:18px}
.kw{font-size:.78em;border:1px solid var(--border);border-radius:20px;padding:2px 10px;color:var(--muted)}
.hero-btn{display:inline-block;background:var(--ink);color:var(--bg);font-weight:800;padding:12px 22px;font-size:.9em;transition:background .15s}
.hero-btn:hover{background:var(--red)}
.hero-stats{display:flex;gap:38px;margin-top:26px;padding-top:18px;border-top:1px solid var(--border)}
.hero-stats b{display:block;font-size:1.6em;font-weight:900}
.hero-stats s{text-decoration:none;font-size:.78em;color:var(--muted)}
.hero-right{background:linear-gradient(135deg,var(--thumb1),var(--thumb2));border-radius:6px;color:#f3e9e2;padding:28px;display:flex;flex-direction:column;min-height:300px}
.hr-top{font-family:ui-monospace,Menlo,monospace;font-size:.7em;letter-spacing:.22em;opacity:.75}
.hr-date{margin-top:auto;font-size:.85em;opacity:.8}
.hr-logo{font-size:1.9em;font-weight:900;letter-spacing:-0.04em;line-height:1.15}
.hr-sub{font-size:.8em;opacity:.75;margin-top:6px}
/* 배지 */
.badge-new{background:var(--red);color:#fff;font-size:.7rem;font-weight:800;padding:1px 8px;border-radius:3px;letter-spacing:.05em}
/* 카드 그리드 */
.recent{padding:36px 0}
.month-group{margin-bottom:8px}
.month-head{font-size:1.05em;font-weight:800;margin:22px 0 14px;display:flex;align-items:center;gap:10px}
.month-head::after{content:'';flex:1;height:1px;background:var(--border)}
.grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.card{border:1px solid var(--border);background:var(--surface);display:flex;flex-direction:column;transition:transform .15s,box-shadow .15s}
.card:hover{transform:translateY(-3px);box-shadow:0 10px 24px rgba(0,0,0,.09)}
.card-thumb{background:linear-gradient(135deg,var(--thumb1),var(--thumb2));color:#f3e9e2;padding:18px;display:flex;flex-direction:column;gap:26px}
.ct-date{font-family:ui-monospace,Menlo,monospace;font-size:.78em;opacity:.8}
.ct-brand{font-weight:900;font-size:0.98em;letter-spacing:-0.03em}
.card-body{padding:16px 18px 18px;display:flex;flex-direction:column;gap:8px;flex:1}
.card-meta{font-size:.75em;color:var(--muted);display:flex;gap:6px;align-items:center;flex-wrap:wrap}
.card-title{font-weight:800;line-height:1.4;font-size:1.02em;letter-spacing:-0.02em;word-break:keep-all}
.card-desc{font-size:.83em;color:var(--muted);line-height:1.6;word-break:keep-all;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.card-read{margin-top:auto;font-size:.8em;font-weight:700;color:var(--red)}
/* 하단: 검색 + 달력 */
.bottom{display:grid;grid-template-columns:1fr 1.2fr;gap:26px;padding:14px 0 46px;align-items:start}
.panel{border:1px solid var(--border);background:var(--surface);padding:20px}
.search-input{width:100%;padding:11px 14px;border:1px solid var(--border);background:var(--bg);color:var(--ink);font-size:.92em;font-family:inherit}
.search-input:focus{outline:2px solid var(--red)}
.search-hint{font-size:.78em;color:var(--muted);margin-top:8px}
.cal{margin-bottom:18px}
.cal:last-child{margin-bottom:0}
.cal-head{font-weight:800;font-size:.92em;margin-bottom:8px}
.cal-grid{display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center}
.cal-dow{font-size:.7em;color:var(--muted);padding:3px 0}
.cal-day{font-size:.8em;padding:6px 0;border-radius:4px;color:var(--muted)}
.cal-day.has{background:var(--red);color:#fff;font-weight:800}
.cal-day.has:hover{background:var(--red-deep)}
footer{border-top:2px solid var(--ink);padding:26px 0 40px;color:var(--muted);font-size:.82em}
footer .logo{font-size:1.3em}
.empty-msg{padding:30px 0;color:var(--muted)}
@media(max-width:860px){.hero{grid-template-columns:1fr}.hero-right{min-height:180px}.grid{grid-template-columns:1fr 1fr}.bottom{grid-template-columns:1fr}}
@media(max-width:560px){.grid{grid-template-columns:1fr}.hero-title{font-size:1.7em}.wrap{padding:0 16px}}
</style>
<script>
(function(){try{var raw=localStorage.getItem('ai_news_prefs');var t='light';
if(raw){var p=JSON.parse(raw);if(p&&p.theme)t=p.theme}
else if(matchMedia('(prefers-color-scheme: dark)').matches)t='dark';
document.documentElement.dataset.theme=t}catch(e){}})();
</script>
</head><body>
<div class="topbar"><div class="wrap"><span>최신 호 · <b>${latest ? latest.date.replaceAll('-', '.') : '—'}</b></span><span>브리핑 ${entries.length}건 보관</span><span class="right">생성 ${built}</span></div></div>
<header class="site"><div class="wrap">
<div class="logo">오늘의 AI 브리핑<span class="dot-red">.</span></div>
<div class="tagline">매일 아침 AI·테크 브리핑 아카이브</div>
<button class="theme-btn" id="themeBtn" title="테마 전환">◐</button>
</div></header>
<main class="wrap">
${hero}
<section class="recent">
<div class="section-label">지난 발행 · ARCHIVE</div>
<div id="noResult" class="empty-msg" style="display:none">검색 결과가 없습니다.</div>
${(() => {
    const byMonth = new Map();
    for (const e of rest) {
      const ym = e.date.slice(0, 7);
      if (!byMonth.has(ym)) byMonth.set(ym, []);
      byMonth.get(ym).push(e);
    }
    if (!rest.length) return '<div class="empty-msg" id="restEmpty">이전 발행분이 쌓이면 여기에 월별로 정리됩니다.</div>';
    return [...byMonth.entries()].map(([ym, list]) => {
      const [y, m] = ym.split('-');
      return `<div class="month-group"><div class="month-head">${y}년 ${Number(m)}월 <span style="font-size:.75em;color:var(--muted);font-weight:400">${list.length}건</span></div><div class="grid">${list.map((e) => cardHtml(e, false)).join('\n')}</div></div>`;
    }).join('\n');
  })()}
</section>
<section class="bottom">
<div class="panel">
<div class="section-label">검색 · SEARCH</div>
<input class="search-input" id="q" type="search" placeholder="제목·키워드·날짜 검색 (예: 딥마인드, 2026-08)">
<div class="search-hint">전체 ${entries.length}건에서 즉시 필터링됩니다.</div>
</div>
<div class="panel">
<div class="section-label">발행 달력 · CALENDAR</div>
${calendarHtml(entries)}
</div>
</section>
</main>
<footer><div class="wrap">
<div class="logo">오늘의 AI 브리핑<span class="dot-red">.</span></div>
<div>매일 아침 AI·테크 타임라인에서 중요한 신호만 골라 전하는 데일리 브리핑 · 이 페이지는 Xsearch 뉴스 빌더가 자동 생성합니다</div>
</div></footer>
<script>
document.getElementById('themeBtn').addEventListener('click',function(){
  var cur=document.documentElement.dataset.theme==='dark'?'light':'dark';
  document.documentElement.dataset.theme=cur;
  try{var raw=localStorage.getItem('ai_news_prefs');var p=raw?JSON.parse(raw):{};p.theme=cur;
  localStorage.setItem('ai_news_prefs',JSON.stringify(p))}catch(e){}
});
var q=document.getElementById('q');
q.addEventListener('input',function(){
  var v=q.value.trim().toLowerCase();
  var cards=document.querySelectorAll('.card');
  var shown=0;
  cards.forEach(function(c){
    var hit=!v||(c.dataset.search||'').indexOf(v)>=0;
    c.style.display=hit?'':'none';
    if(hit)shown++;
  });
  document.querySelectorAll('.month-group').forEach(function(g){
    var any=[...g.querySelectorAll('.card')].some(function(c){return c.style.display!=='none'});
    g.style.display=any?'':'none';
  });
  var empty=document.getElementById('noResult');
  if(empty)empty.style.display=(v&&shown===0)?'':'none';
  var restEmpty=document.getElementById('restEmpty');
  if(restEmpty)restEmpty.style.display=v?'none':'';
});
</script>
</body></html>`;
}

/** output 폴더를 스캔해 index.html 아카이브를 생성한다. @returns {Promise<{count:number}>} */
export async function buildArchive(outDir) {
  const entries = await collectEntries(outDir);
  await writeFile(path.join(outDir, 'index.html'), pageHtml(entries), 'utf-8');
  return { count: entries.length };
}
