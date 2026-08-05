// dev watch: src/·tools/·build.mjs 변경 시 자동 재빌드.
// 재귀 fs.watch(FSEvents)로 감시해 파일 핸들을 거의 쓰지 않는다 (node --watch의 EMFILE 회피).
// 편집 중 문법/치환 오류가 나도 watcher는 죽지 않고 에러만 출력하고 계속 감시한다.
import fs from "node:fs";
import { build } from "../build.mjs";

const root = new URL("../", import.meta.url);
const now = () => new Date().toLocaleTimeString("ko-KR", { hour12: false });

let building = false;
let pending = null;
let timer = null;

async function run(reason) {
  if (building) {
    pending = reason; // 빌드 중 들어온 변경은 끝난 뒤 한 번 더 실행
    return;
  }
  building = true;
  do {
    const why = pending || reason;
    pending = null;
    try {
      const { outName, size } = await build();
      console.log(`[${now()}] 빌드 완료: dist/${outName} (${size.toLocaleString()}자) ${why}`);
    } catch (e) {
      console.error(`[${now()}] 빌드 실패: ${e.message}`);
    }
  } while (pending);
  building = false;
}

function schedule(reason) {
  clearTimeout(timer);
  timer = setTimeout(() => run(reason), 120); // 디바운스: macOS의 다중 이벤트 병합
}

await run("(초기 빌드)");
console.log(`[${now()}] watch 시작 — src/ 를 감시합니다. 종료: Ctrl+C`);

for (const dir of ["src", "tools", "ext"]) {
  fs.watch(new URL(dir + "/", root), { recursive: true }, (_evt, file) => {
    schedule(`(${dir}/${file ?? "?"} 변경)`);
  });
}
fs.watch(new URL("build.mjs", root), () => schedule("(build.mjs 변경)"));
