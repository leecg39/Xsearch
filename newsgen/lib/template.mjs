// 오늘의 AI 브리핑 페이지 셸(CSS·다크모드·SEO 메타) 템플릿.
// CSS는 실제 배포본(2026-08-06.html)에서 추출한 것과 동일 계열을 유지한다.

const BASE_CSS = `:root{--bg:#fafaf7;--fg:#1a1a1a;--text:#1a1a1a;--muted:#555;--text-muted:#555;--accent:#c65545;--accent-soft:#f0e6e2;--border:#e8e6df;--code-bg:#f4f3ec;--quote-bg:#f6f3ec;--surface:#fff}
*{box-sizing:border-box}
body{font-family:'Pretendard',-apple-system,BlinkMacSystemFont,system-ui,sans-serif;background:var(--bg);color:var(--text);margin:0;padding:48px 24px 96px;line-height:1.75;font-size:17px;letter-spacing:-0.01em}
main{max-width:820px;margin:0 auto}
h1{font-size:2.2em;font-weight:800;line-height:1.3;margin:0 0 0.6em;letter-spacing:-0.025em}
h2{font-size:1.5em;font-weight:700;line-height:1.35;margin:1.6em 0 0.8em;letter-spacing:-0.02em}
h3{font-size:1.18em;font-weight:700;margin:1.8em 0 0.5em;color:var(--accent)}
p{margin:0.8em 0}strong{font-weight:700;color:var(--text)}em{font-style:italic;color:var(--text-muted)}
a{color:var(--accent);text-decoration:none;border-bottom:1px dashed var(--accent);transition:all .15s}
a:hover{background:var(--accent-soft);border-bottom-style:solid}
ul,ol{padding-left:1.4em;margin:1em 0}li{margin:.55em 0;line-height:1.7}li::marker{color:var(--accent);font-weight:600}
blockquote{background:var(--quote-bg);border-left:4px solid var(--accent);margin:1.5em 0;padding:1em 1.4em;border-radius:0 6px 6px 0;font-size:.97em}
blockquote p{margin:.4em 0}blockquote p:first-child{margin-top:0}blockquote p:last-child{margin-bottom:0}
blockquote.bq-take{background:transparent;border:1.5px dashed var(--accent);border-radius:6px}
hr{border:0;border-top:1px solid var(--border);margin:3em 0}
code{background:var(--code-bg);padding:.15em .45em;border-radius:4px;font-size:.88em;font-family:'JetBrains Mono',ui-monospace,Menlo,monospace;color:var(--accent)}
figure{margin:1.8em 0;text-align:center}figure img{max-width:100%;border-radius:8px;box-shadow:0 4px 16px rgba(0,0,0,.08)}
figcaption{margin:.7em auto 0;font-size:.87em;color:#555;line-height:1.6;text-align:left;max-width:92%}
figcaption .fnum{font-weight:700;color:#1a1a1a}
mark{color:inherit;background:linear-gradient(transparent 78%,#ffd866 78%);background-repeat:no-repeat;padding:0 3px;border-radius:4px;box-decoration-break:clone;-webkit-box-decoration-break:clone}
/* 감정/온도 게이지 */
.gauge-wrap{margin:1.5em 0}.gauge-bar{height:14px;border-radius:8px;background:linear-gradient(90deg,#4773c0 0%,#3a9d63 38%,#d99a2b 68%,#d3543f 100%);position:relative;margin:36px 0 8px}
.gpin{position:absolute;top:-27px;transform:translateX(-50%);font-size:.74em;font-weight:700;white-space:nowrap;color:#333}
.gpin::after{content:'';position:absolute;left:50%;top:21px;width:2px;height:10px;background:#888;transform:translateX(-50%)}
.gauge-ends{display:flex;justify-content:space-between;font-size:.74em;color:#999}
.gauge-rows{margin-top:20px;display:flex;flex-direction:column;gap:9px}
.grow{font-size:.93em;line-height:1.6}.grow .gdot{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:8px;vertical-align:middle}
[data-theme="dark"] .gpin{color:#c8c3b6}
/* 핵심 수치 스트립 */
.keynum{display:grid;grid-template-columns:repeat(4,1fr);gap:0;margin:1.8em 0 2em;border:1px solid var(--border);border-radius:10px;overflow:hidden;background:var(--surface)}
.kn-cell{padding:18px 16px 16px;border-right:1px solid var(--border);text-align:left}
.kn-cell:last-child{border-right:0}
.kn-val{font-size:1.62em;font-weight:800;letter-spacing:-0.03em;color:var(--accent);line-height:1.15}
.kn-lab{margin-top:6px;font-size:.86em;font-weight:700;color:var(--text)}
.kn-sub{margin-top:2px;font-size:.78em;color:var(--muted);line-height:1.5}
@media (max-width:640px){.keynum{grid-template-columns:repeat(2,1fr)}
  .kn-cell{border-bottom:1px solid var(--border)}
  .kn-cell:nth-child(2n){border-right:0}
  .kn-cell:nth-last-child(-n+2){border-bottom:0}
  .kn-val{font-size:1.35em}}
@media print{.keynum{background:white}}
/* 타임라인 */
.timeline{position:relative;margin:1.6em 0 1.8em;padding-left:30px}
.timeline::before{content:'';position:absolute;left:9px;top:6px;bottom:6px;width:2px;background:linear-gradient(180deg,var(--accent),#e3b5ac)}
.tl-item{position:relative;margin:0 0 1.1em}
.tl-item::before{content:'';position:absolute;left:-28px;top:4px;width:14px;height:14px;border-radius:50%;background:var(--bg);border:3px solid var(--accent);box-shadow:0 0 0 3px var(--bg)}
.tl-label{font-weight:700;color:var(--accent);font-size:.95em;margin-bottom:2px}
.tl-desc{font-size:.97em;line-height:1.65}
/* 출처 칩 줄 */
.src-row{margin:22px 0 0;padding-top:12px;border-top:1px dashed var(--border,#e8e6df);display:flex;flex-wrap:wrap;gap:6px;align-items:baseline;line-height:1.9}
.src-row .src-lab{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:10.5px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted,#777);margin-right:2px}
.src-row a{display:inline-block;font-size:12.5px;padding:1px 9px;border-radius:20px;border:1px solid var(--border,#e8e6df);color:var(--muted,#666);text-decoration:none;white-space:nowrap;transition:color .12s,border-color .12s}
.src-row a:hover{color:var(--accent,#c65545);border-color:var(--accent,#c65545)}
@media (max-width:640px){.src-row a{font-size:12px;padding:1px 8px}}
/* 다이제스트 카드 (규칙 기반 모드 전용) */
.tw-grid{display:grid;grid-template-columns:1fr;gap:14px;margin:1.4em 0}
.tw-card{border:1px solid var(--border);border-radius:10px;padding:14px 18px;background:var(--surface)}
.tw-head{display:flex;gap:8px;align-items:baseline;flex-wrap:wrap;font-size:.92em}
.tw-rank{font-weight:800;color:var(--accent);min-width:1.6em}
.tw-name{font-weight:700}
.tw-handle,.tw-time{color:var(--muted)}
.tw-text{margin:.5em 0;white-space:pre-wrap;word-break:keep-all;overflow-wrap:break-word;font-size:.97em}
.tw-metrics{font-size:.84em;color:var(--muted);display:flex;gap:14px;flex-wrap:wrap;margin-top:.4em}
.tw-quote{background:var(--quote-bg);border-left:3px solid var(--accent);padding:.5em .8em;border-radius:0 6px 6px 0;font-size:.9em;margin:.5em 0;color:var(--text-muted)}
.tw-thumb{max-width:100%;max-height:280px;object-fit:cover;border-radius:8px;margin:.5em 0;box-shadow:0 2px 10px rgba(0,0,0,.08)}
@media (max-width:640px){body{padding:24px 16px 64px;font-size:16px}h1{font-size:1.7em}h2{font-size:1.28em}h3{font-size:1.08em}}
@media print{body{background:white;padding:0}a{color:var(--text);border:0}blockquote{background:white;border-left-color:#999}}`;

const DARK_CSS = `[data-theme="dark"] {
  --bg: #16140f; --surface: #1e1c17; --text: #f0ece3; --muted: #928d81;
  --text-muted: #c8c3b6; --border: #2e2a22; --accent: #e07663; --accent-soft: #3a2620;
  --quote-bg: #26231d; --code-bg: #26231d; --link: #e8937f; --link-hover: #f2b09d;
  color-scheme: dark;
}
[data-theme="dark"] blockquote { color: #c8c3b6; }
[data-theme="dark"] code { color: #e8c4a8; }
[data-theme="dark"] strong { color: #ffffff; }
[data-theme="dark"] img { box-shadow: 0 4px 16px rgba(0,0,0,0.35); }
[data-theme="dark"] mark { background: #4a3a0c; color: #ffe580; }
[data-theme="dark"] mark code { color: #ffe580; }
.theme-toggle {
  position: fixed; right: 24px; bottom: 24px; width: 44px; height: 44px; padding: 0;
  display: inline-flex; align-items: center; justify-content: center;
  background: var(--surface); border: 1px solid var(--border); border-radius: 50%;
  cursor: pointer; color: var(--muted); box-shadow: 0 4px 16px rgba(0,0,0,0.08);
  transition: color .2s, background .2s, border-color .2s, transform .2s; z-index: 100;
}
[data-theme="dark"] .theme-toggle { box-shadow: 0 4px 16px rgba(0,0,0,0.4); }
.theme-toggle:hover { color: var(--accent); border-color: var(--accent); transform: translateY(-2px); }
.theme-toggle:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
.theme-toggle svg { width: 20px; height: 20px; display: block; }
.theme-toggle .ico-sun { display: none; }
[data-theme="dark"] .theme-toggle .ico-sun { display: block; }
[data-theme="dark"] .theme-toggle .ico-moon { display: none; }
@media (max-width: 640px) { .theme-toggle { right: 16px; bottom: 16px; width: 40px; height: 40px; } }
@media print { .theme-toggle { display: none !important; } }`;

const READABILITY_CSS = `main p, main ul, main ol { max-width: 700px; margin-left: auto; margin-right: auto; }
main p { margin-bottom: 1.25em; }
main h1, main h2, main h3, main h4, main p, main li, main blockquote,
main figcaption { word-break: keep-all; overflow-wrap: break-word; }
main em { color: var(--text-muted, #555); opacity: 0.9; }
[data-theme="dark"] main em { color: #c8c3b6; opacity: 0.95; }
[data-theme="dark"] figcaption { color: var(--text-muted, #c8c3b6); }
[data-theme="dark"] figcaption .fnum { color: var(--text, #f0ece3); }
.tw-meta { font-size: 0.86em; color: var(--muted, #999); }
.tw-meta a { color: inherit; text-decoration: none; }
.tw-meta a:hover { color: var(--accent); text-decoration: underline; }`;

// 첫 페인트 전에 저장된 테마를 적용 (원본과 동일한 localStorage 키 사용)
const THEME_BOOT_JS = `(function () {
  try {
    var raw = localStorage.getItem('ai_news_prefs');
    var theme = 'light';
    if (raw) { var p = JSON.parse(raw); if (p && p.theme) theme = p.theme; }
    else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) { theme = 'dark'; }
    document.documentElement.dataset.theme = theme;
  } catch (e) {}
})();`;

// 단독 파일 모드에서 쓰는 토글 스크립트 (사이트 스크립트 포함 시에는 ../data/theme-toggle.js가 대신함)
const THEME_TOGGLE_JS = `(function () {
  var btn = document.getElementById('theme-toggle');
  if (!btn) return;
  btn.addEventListener('click', function () {
    var cur = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = cur;
    try {
      var raw = localStorage.getItem('ai_news_prefs');
      var p = raw ? JSON.parse(raw) : {};
      p.theme = cur;
      localStorage.setItem('ai_news_prefs', JSON.stringify(p));
    } catch (e) {}
  });
})();`;

const TOGGLE_BUTTON_HTML = `<button class="theme-toggle" id="theme-toggle" type="button" aria-label="다크 모드로 전환" title="테마 전환">
  <svg class="ico-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
  <svg class="ico-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
</button>`;

function escAttr(s) {
  return String(s ?? '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/**
 * 완성된 뉴스 HTML 문서를 만든다.
 * @param {object} o
 * @param {string} o.title       <title> 전체 문자열
 * @param {string} o.description SEO/OG 요약
 * @param {string} o.date        YYYY-MM-DD
 * @param {string} o.bodyHtml    <main> 내부 HTML
 * @param {string} o.baseUrl     canonical 베이스 (예: https://news.soverin.cloud/output/)
 * @param {boolean} o.siteScripts fiv.co.kr 배포용 외부 스크립트 포함 여부
 */
export function pageShell({ title, description, date, bodyHtml, baseUrl = 'https://news.soverin.cloud/output/', siteScripts = false }) {
  const canonical = `${baseUrl.replace(/\/?$/, '/')}${date}.html`;
  const T = escAttr(title);
  const D = escAttr(description);
  const adsense = siteScripts
    ? `<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8353948522080567" crossorigin="anonymous"></script>`
    : '';
  const tailScripts = siteScripts
    ? `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
<script src="../data/visitor-tracker.js"></script>
${TOGGLE_BUTTON_HTML}
<script src="../data/theme-toggle.js"></script>
<script src="../data/subscribe-cta.js"></script>`
    : `${TOGGLE_BUTTON_HTML}
<script>${THEME_TOGGLE_JS}</script>`;

  const ld = JSON.stringify({
    '@context': 'https://schema.org', '@type': 'NewsArticle',
    headline: title.replace(/ \| (?:오늘의 AI 브리핑|5분 AI 뉴스)$/, ''), description,
    datePublished: date, dateModified: date, inLanguage: 'ko', url: canonical,
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical }, isAccessibleForFree: true,
    author: { '@type': 'Organization', name: '오늘의 AI 브리핑', url: 'https://news.soverin.cloud/' },
    publisher: { '@type': 'Organization', name: '오늘의 AI 브리핑', logo: { '@type': 'ImageObject', url: 'https://news.soverin.cloud/icon128.png' } },
    image: ['https://news.soverin.cloud/og-image.jpg'],
  });

  return `<!DOCTYPE html>
<html lang="ko"><head>
${adsense}<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${T}</title>
<link rel="stylesheet" as="style" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css">
<style>${BASE_CSS}</style>
<style>${DARK_CSS}</style>
<script>${THEME_BOOT_JS}</script>
<style>${READABILITY_CSS}</style>
<meta name="description" content="${D}">
<link rel="canonical" href="${canonical}">
<meta name="author" content="오늘의 AI 브리핑">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta property="og:type" content="article">
<meta property="og:site_name" content="오늘의 AI 브리핑">
<meta property="og:locale" content="ko_KR">
<meta property="og:url" content="${canonical}">
<meta property="og:title" content="${T}">
<meta property="og:description" content="${D}">
<meta property="og:image" content="https://news.soverin.cloud/og-image.jpg">
<meta property="og:image:secure_url" content="https://news.soverin.cloud/og-image.jpg">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="오늘의 AI 브리핑">
<meta property="article:published_time" content="${date}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${T}">
<meta name="twitter:description" content="${D}">
<meta name="twitter:image" content="https://news.soverin.cloud/og-image.jpg">
<meta name="twitter:image:alt" content="오늘의 AI 브리핑">
<script type="application/ld+json">${ld}</script>
</head><body>
<div class="back-home-bar" style="max-width:820px;margin:0 auto 1.5em;padding:0 24px;">
<a class='back-home' href='/' style='display:inline-flex;align-items:center;gap:0.4em;text-decoration:none;color:var(--accent,#c65545);font-size:0.92em;font-weight:600;border-bottom:1px dashed var(--accent,#c65545);padding-bottom:2px;'>← 오늘의 AI 브리핑</a>
</div>
<main>
${bodyHtml}
<p>
<!-- REPORT-END-${date} -->
</p>
</main>${tailScripts}
</body></html>`;
}
