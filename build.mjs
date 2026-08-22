// 빌드: src/collector.js → 북마클릿 문자열 → 설치 페이지 생성
// 결과물: dist/xsearch-v{버전}.html  (버전은 package.json에서 관리)
// `node build.mjs`로 직접 실행하거나, dev watcher(tools/dev.mjs)에서 build()를 재사용한다.
import fs from "node:fs";
import { pathToFileURL } from "node:url";
import { toBookmarklet, prepareCollectorSource, topicsJsonLiteral } from "./tools/lib.mjs";

const root = new URL("./", import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root), "utf8");

export async function build() {
  // 1) 소스에 버전·로고 주입 (verify.mjs와 동일한 치환)
  const { version, src } = await prepareCollectorSource(root);

  // 2) 공백 압축 + ASCII 이스케이프 → javascript: 북마클릿
  const bm = await toBookmarklet(src);

  // 3) HTML <script>에 안전하게 삽입할 JS 문자열 리터럴 생성
  //    - JSON.stringify: 따옴표·백슬래시·제어문자 이스케이프
  //    - 비ASCII → \uXXXX (원본과 동일한 ASCII-safe 스타일)
  //    - '<' → \u003c ("</script>" 등으로 HTML 파싱이 깨지는 것 방지)
  const literal = JSON.stringify(bm)
    .replace(/[\u007f-\uffff]/g, (ch) => "\\u" + ch.charCodeAt(0).toString(16).padStart(4, "0"))
    .replace(/</g, "\\u003c");

  // 4) 템플릿 주입
  const logoLockup =
    "data:image/png;base64," +
    fs.readFileSync(new URL("assets/xsearch-logo.png", root)).toString("base64");
  const html = read("src/installer.template.html")
    .replaceAll("{{VERSION}}", version)
    .replace("{{LOGO_B64}}", () => logoLockup)
    .replace("{{BM_CODE}}", () => literal); // 함수 치환: 리터럴 안의 '$' 패턴 오해석 방지

  if (/\{\{[A-Z_]+\}\}/.test(html)) {
    throw new Error("치환되지 않은 플레이스홀더가 남아 있습니다");
  }

  const outName = `xsearch-v${version}.html`;
  fs.mkdirSync(new URL("dist/", root), { recursive: true });
  fs.writeFileSync(new URL(`dist/${outName}`, root), html);

  // 5) 확장 프로그램 빌드: dist-extension/ (Load Unpacked 대상)
  buildExtension(src, version);

  return { outName, size: bm.length };
}

function buildExtension(srcWithVersion, version) {
  const outDir = new URL("dist-extension/", root);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  // injected.js: 수집 코어 그대로 (확장은 파일 로드라 압축 불필요)
  fs.writeFileSync(new URL("injected.js", outDir), srcWithVersion);

  // ext/* 복사 + 플레이스홀더 치환
  const topicsLiteral = topicsJsonLiteral();
  for (const f of fs.readdirSync(new URL("ext/", root))) {
    const srcUrl = new URL("ext/" + f, root);
    if (!fs.statSync(srcUrl).isFile()) continue;
    // 아이콘 등 바이너리는 그대로 복사 (utf8 재저장 시 깨짐)
    if (/\.(png|jpg|jpeg|webp|ico)$/i.test(f)) {
      fs.copyFileSync(srcUrl, new URL(f, outDir));
      continue;
    }
    let content = read("ext/" + f);
    content = content.replaceAll("__TWC_VERSION__", version);
    content = content.replaceAll("{{TOPICS_JSON}}", () => topicsLiteral);
    fs.writeFileSync(new URL(f, outDir), content);
  }
}

// `node build.mjs`로 직접 실행했을 때만 1회 빌드
if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { outName, size } = await build();
  console.log(`빌드 완료: dist/${outName} (북마클릿 ${size.toLocaleString()}자) + dist-extension/`);
}
