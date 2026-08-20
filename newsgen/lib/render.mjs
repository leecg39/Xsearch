// 보고서 JSON → fiv.co.kr 스타일 HTML 본문 렌더링. 다이제스트(규칙 기반) 렌더러 포함.
import { pageShell } from './template.mjs';

export function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#x27;');
}

/** 이스케이프 후 **강조**를 <mark>로 변환 */
export function md(s) {
  return esc(s).replace(/\*\*([^*]+)\*\*/g, '<mark>$1</mark>');
}

function fmtNum(n) {
  if (!Number.isFinite(n)) return '0';
  if (n >= 10000) return `${(n / 10000).toFixed(n >= 100000 ? 0 : 1)}만`;
  return n.toLocaleString('ko-KR');
}

function secId(title) {
  let h = 0;
  for (const ch of String(title)) h = (h * 31 + ch.codePointAt(0)) >>> 0;
  return `sec-${h.toString(16).padStart(8, '0')}`;
}

function firstImageUrl(t) {
  const urls = Array.isArray(t?.mediaUrls) ? t.mediaUrls : [];
  return urls.find((u) => typeof u === 'string' && /^https?:\/\//.test(u)) || null;
}

/**
 * AI 편집 브리핑 렌더링.
 * @returns {{html:string, imageUrls:string[]}} imageUrls는 base64 인라인 대상
 */
export function renderReport({ report, cands, baseUrl, siteScripts, topicName = 'AI' }) {
  const byI = new Map(cands.map((c) => [c.i, c]));
  const images = [];
  let figNo = 0;

  const figureHtml = (fig) => {
    const c = fig ? byI.get(fig.i) : null;
    const url = c ? firstImageUrl(c.t) : null;
    if (!url) return '';
    figNo += 1;
    images.push(url);
    const alt = esc(fig.caption.split(/[.。]/)[0].slice(0, 60));
    return `<figure><img src="${esc(url)}" alt="${alt}"/><figcaption><span class="fnum">그림 ${figNo}.</span> ${md(fig.caption)}</figcaption></figure>`;
  };

  const dotDate = report.date.replace(/-/g, '.');
  const parts = [];

  parts.push(`<h1>🔥 ${esc(topicName)} 트렌드 핵심 요약 (${dotDate})</h1>`);
  parts.push(`<blockquote>
<p><strong>주요 키워드 TOP 5:</strong> ${report.keywords_top5.map(esc).join(' · ')} | <strong>메인 이벤트:</strong> ${md(report.main_event)}</p>
</blockquote>`);

  parts.push(`<div class="keynum">${report.stats.map((s) =>
    `<div class="kn-cell"><div class="kn-val">${esc(s.value)}</div><div class="kn-lab">${esc(s.label)}</div><div class="kn-sub">${esc(s.sub)}</div></div>`
  ).join('')}</div>`);

  parts.push(`<p>\n${md(report.intro)}\n</p>`);
  if (report.hero_figure) parts.push(figureHtml(report.hero_figure));

  if (report.timeline.length) {
    parts.push(`<div class="timeline">${report.timeline.map((t) =>
      `<div class="tl-item"><div class="tl-label">${esc(t.time)}</div><div class="tl-desc">${esc(t.text)}</div></div>`
    ).join('')}</div>`);
  }

  report.sections.forEach((s, idx) => {
    parts.push('<hr/>');
    parts.push(`<h2 id="${secId(s.title)}">${idx + 1}. ${md(s.title)}</h2>`);
    parts.push(`<ul>\n${s.bullets.map((b) => `<li>${md(b)}</li>`).join('\n')}\n</ul>`);
    for (const f of s.figures) parts.push(figureHtml(f));
    if (s.analysis) parts.push(`<p>\n${md(s.analysis)}\n</p>`);
    if (s.extra) parts.push(`<p>\n그 밖에: ${md(s.extra)}\n</p>`);
    if (s.tip || s.tags.length) {
      parts.push(`<blockquote class="bq-take">
<p><strong>시사점:</strong> ${md(s.tip)}</p>
<p>${s.tags.map((t) => `<code>${esc(t)}</code>`).join(' ')}</p>
</blockquote>`);
    }
    const srcs = s.source_ids.map((i) => byI.get(i)).filter(Boolean);
    if (srcs.length) {
      parts.push(`<p class="src-row"><span class="src-lab">출처 ${srcs.length}</span>${srcs.map((c) =>
        `<a href="${esc(c.t.url)}" target="_blank" rel="noopener">${c.label} @${esc(String(c.t.handle || '').replace(/^@/, ''))}</a>`
      ).join('')}</p>`);
    }
  });

  // 감정/온도 분석
  const PIN_META = { 전환: ['🔵', '#4773c0'], 성장: ['🟢', '#3a9d63'], 주의: ['🟡', '#d99a2b'], 과열: ['🔴', '#d3543f'] };
  const pins = report.sentiment.pins;
  parts.push('<hr/>');
  parts.push(`<h2 id="${secId('감정온도' + report.date)}">📊 오늘의 감정/온도 분석</h2>`);
  parts.push(`<div class="gauge-wrap"><div class="gauge-bar">${pins.map((p) =>
    `<span class="gpin" style="left:${p.pos}%">${PIN_META[p.name][0]} ${esc(p.name)}</span>`
  ).join('')}</div><div class="gauge-ends"><span>차분 ←</span><span>→ 과열</span></div><div class="gauge-rows">${pins.map((p) =>
    `<div class="grow"><span class="gdot" style="background:${PIN_META[p.name][1]}"></span><b>${esc(p.name)}</b> — ${md(p.text)}</div>`
  ).join('')}</div></div>`);
  if (report.sentiment.summary) parts.push(`<p>${md(report.sentiment.summary)}</p>`);

  // 실무 팁
  if (report.tips.length) {
    parts.push('<hr/>');
    parts.push(`<h2 id="${secId('실무팁' + report.date)}">💼 오늘의 실무 팁 — 쉽게 풀어 쓴 사용법 ${report.tips.length}가지</h2>`);
    report.tips.forEach((tip, i) => {
      const c = byI.get(tip.i);
      const srcLink = c ? ` — <a href="${esc(c.t.url)}" target="_blank" rel="noopener">@${esc(String(c.t.handle || '').replace(/^@/, ''))}</a>` : '';
      parts.push(`<p>\n<strong>${i + 1}. ${esc(tip.title)}</strong>\n</p>`);
      parts.push(`<p>\n${md(tip.body)}${srcLink}\n</p>`);
    });
  }

  parts.push('<hr/>');
  parts.push(`<blockquote>
<p><strong>📦 확인 방식</strong> — ${md(report.verification)}</p>
<p><strong>🏷 라벨 가이드</strong> — 🔥 인기(좋아요 중심) · 🔁 공유(리트윗 비율 높음) · 💬 논쟁(댓글 비율 높음) · 🔖 저장(북마크 많음) · 🚀 떠오름(작은 계정인데 확산 시작)</p>
</blockquote>`);

  const title = `${report.title_main}${report.title_sub ? ' · ' + report.title_sub : ''} — ${report.date} ${topicName} 뉴스 | 오늘의 ${topicName} 브리핑`;
  const html = pageShell({
    title,
    description: report.description,
    date: report.date,
    bodyHtml: parts.join('\n'),
    baseUrl,
    siteScripts,
  });
  return { html, imageUrls: images };
}

function linkify(escapedText) {
  return escapedText.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
}

/** 규칙 기반 다이제스트 렌더링 (LLM 불필요, 파이프라인 점검용) */
export function renderDigest({ date, cands, stats, baseUrl, siteScripts, topN = 40, topicName = 'AI' }) {
  const dotDate = date.replace(/-/g, '.');
  const top = cands.slice(0, topN);

  // 타임라인: 상위 후보 중 보고서 날짜 기준 최근 36시간 내 트윗을 시간순 8개
  const cutoff = new Date(`${date}T00:00:00+09:00`).getTime() - 36 * 3600 * 1000;
  const tl = cands
    .filter((c) => c.kst && new Date(c.t.time).getTime() >= cutoff)
    .slice(0, 30)
    .sort((a, b) => new Date(a.t.time) - new Date(b.t.time))
    .slice(-8);

  const handleSet = new Set(top.map((c) => c.t.handle));
  const parts = [];
  parts.push(`<h1>📋 X 트렌드 다이제스트 (${dotDate})</h1>`);
  parts.push(`<blockquote><p><strong>규칙 기반 자동 다이제스트</strong> — AI 편집을 거치지 않은 미리보기입니다. 참여도 점수(좋아요·리트윗·북마크·댓글·조회수 log 가중 합)에 AI 관련도 가중치를 곱해 상위 ${top.length}건을 뽑았습니다.</p></blockquote>`);
  parts.push(`<div class="keynum">
<div class="kn-cell"><div class="kn-val">${fmtNum(stats.total)}</div><div class="kn-lab">수집 트윗</div><div class="kn-sub">중복 제거 전 기준</div></div>
<div class="kn-cell"><div class="kn-val">${fmtNum(stats.aiCount)}</div><div class="kn-lab">${esc(topicName)} 관련 추정</div><div class="kn-sub">키워드 매칭 기준</div></div>
<div class="kn-cell"><div class="kn-val">${fmtNum(stats.likesSum)}</div><div class="kn-lab">좋아요 합계</div><div class="kn-sub">전체 수집분</div></div>
<div class="kn-cell"><div class="kn-val">${handleSet.size}</div><div class="kn-lab">상위 계정 수</div><div class="kn-sub">Top ${top.length} 기준</div></div>
</div>`);

  if (tl.length) {
    parts.push(`<div class="timeline">${tl.map((c) =>
      `<div class="tl-item"><div class="tl-label">${esc(c.kst.label)}</div><div class="tl-desc">@${esc(String(c.t.handle || '').replace(/^@/, ''))} — ${esc(String(c.t.text || '').replace(/\s+/g, ' ').slice(0, 80))}${(c.t.text || '').length > 80 ? '…' : ''}</div></div>`
    ).join('')}</div>`);
  }

  parts.push('<hr/>');
  parts.push(`<h2>🔥 참여도 상위 ${top.length}</h2>`);
  parts.push(`<div class="tw-grid">${top.map((c, idx) => {
    const t = c.t;
    const img = firstImageUrl(t);
    const quoted = t.quoted?.text
      ? `<div class="tw-quote">${esc(String(t.quoted.user || '').slice(0, 40))} — ${esc(String(t.quoted.text).replace(/\s+/g, ' ').slice(0, 200))}</div>` : '';
    return `<div class="tw-card">
<div class="tw-head"><span class="tw-rank">${idx + 1}</span><span>${c.label}</span><span class="tw-name">${esc(t.name || '')}</span><span class="tw-handle">@${esc(String(t.handle || '').replace(/^@/, ''))}${t.verified ? ' ✓' : ''}</span><span class="tw-time">${esc(c.kst?.label || '')} KST</span></div>
<div class="tw-text">${linkify(esc(t.text || ''))}</div>
${img ? `<img class="tw-thumb" loading="lazy" src="${esc(img)}" alt="">` : ''}${quoted}
<div class="tw-metrics"><span>❤ ${fmtNum(t.likes ?? 0)}</span><span>🔁 ${fmtNum(t.retweets ?? 0)}</span><span>💬 ${fmtNum(t.replies ?? 0)}</span><span>🔖 ${fmtNum(t.bookmarks ?? 0)}</span><span>👁 ${fmtNum(t.views ?? 0)}</span><a href="${esc(t.url)}" target="_blank" rel="noopener">원문 ↗</a></div>
</div>`;
  }).join('\n')}</div>`);

  parts.push(`<blockquote><p><strong>🏷 라벨 가이드</strong> — 🔥 인기(좋아요 중심) · 🔁 공유(리트윗 비율 높음) · 💬 논쟁(댓글 비율 높음) · 🔖 저장(북마크 많음) · 🚀 떠오름(작은 계정인데 확산 시작)</p></blockquote>`);

  const html = pageShell({
    title: `트렌드 다이제스트 — ${date} | 오늘의 ${topicName} 브리핑`,
    description: `${date} X(트위터) 수집 트윗 ${stats.total}건 중 참여도 상위 ${top.length}건 규칙 기반 다이제스트`,
    date,
    bodyHtml: parts.join('\n'),
    baseUrl,
    siteScripts,
  });
  return { html, imageUrls: [] };
}

/** 이미지 URL을 base64 data URI로 다운로드해 HTML에 인라인 (실패 시 원본 URL 유지) */
export async function inlineImages(html, urls, onStatus) {
  const unique = [...new Set(urls)].slice(0, 14);
  let done = 0;
  for (const url of unique) {
    done += 1;
    onStatus?.(`이미지 다운로드 ${done}/${unique.length}`);
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
      if (!res.ok) continue;
      const type = res.headers.get('content-type') || 'image/jpeg';
      if (!type.startsWith('image/')) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > 4 * 1024 * 1024) continue; // 장당 4MB 상한
      const dataUri = `data:${type};base64,${buf.toString('base64')}`;
      html = html.split(`src="${esc(url)}"`).join(`src="${dataUri}"`);
    } catch {
      // 원본 URL 그대로 두면 브라우저가 직접 로드한다
    }
  }
  return html;
}
