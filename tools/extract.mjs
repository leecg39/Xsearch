// 1회용: 원본 설치 페이지 HTML에서 북마클릿 코드를 디코드해 src/collector.js로 복원한다.
import fs from "node:fs";
import { decodeBmCode, stripPrefix } from "./lib.mjs";

const root = new URL("../", import.meta.url);
const html = fs.readFileSync(new URL("tweet-collector-v4.6.3.html", root), "utf8");

const bm = decodeBmCode(html);
const code = stripPrefix(bm);
if (!code.startsWith("(async function")) {
  throw new Error("예상과 다른 코드 시작부: " + code.slice(0, 60));
}

fs.mkdirSync(new URL("src/", root), { recursive: true });
fs.writeFileSync(new URL("src/collector.js", root), code + "\n");
console.log(`복원 완료: src/collector.js (${code.length.toLocaleString()}자)`);
