// 빌드: src/collector.js(+어댑터) → 북마클릿 문자열 → 설치 페이지 생성
// 결과물: dist/xsearch-v{버전}.html  (버전은 package.json에서 관리)
import fs from "node:fs";
import { pathToFileURL } from "node:url";
import { toBookmarklet, prepareCollectorSource } from "./tools/lib.mjs";
import { TOPICS } from "./src/topics.mjs";

const root = new URL("./", import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, root), "utf8");

export async function build() {
  const { version, src } = await prepareCollectorSource(root);

  const bm = await toBookmarklet(src);

  const literal = JSON.stringify(bm)
    .replace(/[\u007f-\uffff]/g, (ch) => "\\u" + ch.charCodeAt(0).toString(16).padStart(4, "0"))
    .replace(/</g, "\\u003c");

  const logoLockup =
    "data:image/png;base64," +
    fs.readFileSync(new URL("assets/xsearch-logo.png", root)).toString("base64");
  const html = read("src/installer.template.html")
    .replaceAll("{{VERSION}}", version)
    .replace("{{LOGO_B64}}", () => logoLockup)
    .replace("{{BM_CODE}}", () => literal);

  if (/\{\{[A-Z_]+\}\}/.test(html)) {
    throw new Error("치환되지 않은 플레이스홀더가 남아 있습니다");
  }

  const outName = `xsearch-v${version}.html`;
  fs.mkdirSync(new URL("dist/", root), { recursive: true });
  fs.writeFileSync(new URL(`dist/${outName}`, root), html);

  buildExtension(src, version);

  return { outName, size: bm.length };
}

function buildExtension(srcWithVersion, version) {
  const outDir = new URL("dist-extension/", root);
  fs.rmSync(outDir, { recursive: true, force: true });
  fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(new URL("injected.js", outDir), srcWithVersion);

  const ph = {
    "{{TOPICS_JSON}}": JSON.stringify(TOPICS),
  };
  for (const f of fs.readdirSync(new URL("ext/", root))) {
    const srcUrl = new URL("ext/" + f, root);
    if (!fs.statSync(srcUrl).isFile()) continue;
    if (/\.(png|jpg|jpeg|webp|ico)$/i.test(f)) {
      fs.copyFileSync(srcUrl, new URL(f, outDir));
      continue;
    }
    let content = read("ext/" + f);
    content = content.replaceAll("__TWC_VERSION__", version);
    for (const [k, val] of Object.entries(ph)) {
      content = content.replaceAll(k, val);
    }
    fs.writeFileSync(new URL(f, outDir), content);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const { outName, size } = await build();
  console.log(`빌드 완료: dist/${outName} (북마클릿 ${size.toLocaleString()}자) + dist-extension/`);
}
