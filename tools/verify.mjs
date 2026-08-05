// 검증: 빌드 결과물의 무결성을 확인한다.
// 1) 북마클릿: dist HTML의 bmCode를 디코드·정규화해 src/collector.js(버전 주입)와 비교
// 2) 확장: dist-extension/의 manifest·injected.js·options.js 치환 상태 확인
import fs from "node:fs";
import { execFileSync } from "node:child_process";
import { toBookmarklet, decodeBmCode, stripPrefix } from "./lib.mjs";

const root = new URL("../", import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root), "utf8");
let failed = 0;
const ok = (msg) => console.log("  ✓ " + msg);
const ng = (msg) => {
  console.error("  ✗ " + msg);
  failed = 1;
};

const version = JSON.parse(read("package.json")).version;
const src = read("src/collector.js").replaceAll("__TWC_VERSION__", version);

// 1) 북마클릿: 빌드 산출물이 소스와 일치하는지
console.log("[북마클릿]");
const bmBuilt = decodeBmCode(read(`dist/tweet-collector-v${version}.html`));
// 접두사(javascript:void)는 포맷이 다를 수 있으므로 벗긴 뒤 코드 본문만 비교
const normSrc = stripPrefix(await toBookmarklet(src));
const normBuilt = stripPrefix(await toBookmarklet(stripPrefix(bmBuilt)));
if (normSrc === normBuilt) {
  ok(`북마클릿이 소스와 일치 (정규화 ${normSrc.length.toLocaleString()}자)`);
} else {
  ng("북마클릿이 소스와 다릅니다 — npm run build 다시 실행");
}

// 2) 확장 프로그램
console.log("[확장]");
try {
  const manifest = JSON.parse(read("dist-extension/manifest.json"));
  if (manifest.version === version) {
    ok(`manifest 버전 일치 (${version})`);
  } else {
    ng(`manifest 버전 불일치: ${manifest.version} != ${version}`);
  }
  for (const f of ["background.js", "bridge.js", "options.html", "options.js", "injected.js"]) {
    if (!fs.existsSync(new URL("dist-extension/" + f, root))) ng(`누락: dist-extension/${f}`);
  }
  const injected = read("dist-extension/injected.js");
  if (injected === src) {
    ok("injected.js가 collector.js와 일치");
  } else {
    ng("injected.js가 collector.js와 다릅니다");
  }
  const optJs = read("dist-extension/options.js");
  if (!/\{\{[A-Z_]+\}\}/.test(optJs)) {
    ok("options.js 플레이스홀더 치환 완료");
  } else {
    ng("options.js에 미치환 플레이스홀더 남음");
  }
  // 치환된 기본 정규식이 실제로 유효한지
  const m = optJs.match(/reKeep: ("(?:[^"\\]|\\.)*")/);
  if (m && new RegExp(JSON.parse(m[1]), "i")) {
    ok("기본 정규식 유효");
  }
  // 구문 검사 (node --check)
  for (const f of ["background.js", "bridge.js", "options.js", "injected.js"]) {
    try {
      execFileSync(process.execPath, ["--check", `dist-extension/${f}`], { cwd: new URL(".", root) });
      ok(`${f} 구문 정상`);
    } catch (e) {
      ng(`${f} 구문 오류: ${e.stderr || e.message}`);
    }
  }
} catch (e) {
  ng("확장 검증 중 예외: " + e.message);
}

if (failed) {
  console.error("검증 실패");
  process.exit(1);
}
console.log("검증 통과");
