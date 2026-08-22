// X(트위터) 소스 어댑터. DOM 파서·GraphQL harvest는 collector.js에 잔류
// (패널 상태·필터·체크포인트와 강하게 결합). 여기서는 식별·매칭만 담당.
import { matchX } from './match.mjs';

export const id = 'x';

export function match(host) {
  return matchX(host);
}

export function init() {
  return { mode: 'dom+net' };
}
