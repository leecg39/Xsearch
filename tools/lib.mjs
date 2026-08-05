import { transform } from "esbuild";

/**
 * 수집기 소스(JS)를 북마클릿 한 줄 문자열로 변환한다.
 * - 공백만 압축 (mangle/compress 없음 → 원본과 로직 동일 보장)
 * - charset ascii → 문자열 내 한글·이모지를 \uXXXX로 이스케이프
 */
export async function toBookmarklet(code) {
  const out = await transform(code, {
    loader: "js",
    minifyWhitespace: true,
    charset: "ascii",
    legalComments: "none",
  });
  let js = out.code.trim();
  if (js.endsWith(";")) js = js.slice(0, -1);
  if (js.includes("\n")) throw new Error("북마클릿은 한 줄이어야 합니다");
  // 소스가 void(...) 형태면 접두사를 붙이지 않는다 (북마크 실행 시 반환값이 페이지를 덮어쓰는 것 방지)
  return /^void[\s(]/.test(js) ? "javascript:" + js : "javascript:void " + js;
}

/** 설치 페이지 HTML에서 bmCode 문자열 리터럴을 찾아 디코드한다. */
export function decodeBmCode(html) {
  const m = html.match(/^var bmCode = ("javascript:[^\n]*");$/m);
  if (!m) throw new Error("bmCode 리터럴을 찾지 못했습니다");
  return (0, eval)(m[1]);
}

/** 북마클릿의 javascript:void 접두사를 벗겨 일반 JS 문장으로 만든다. */
export function stripPrefix(bm) {
  const code = bm.replace(/^javascript:\s*void\s*/, "");
  if (code === bm) throw new Error("javascript:void 접두사가 없습니다");
  return code + ";";
}
