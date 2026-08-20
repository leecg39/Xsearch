import { xSource } from "./x.mjs";
import { redditSource } from "./reddit.mjs";
import { threadsSource } from "./threads.mjs";
import { linkedinSource } from "./linkedin.mjs";

export const SOURCES = [xSource, redditSource, threadsSource, linkedinSource];

export function pickSource(hostname, cfg) {
  const host = String(hostname || "")
    .replace(/^www\./i, "")
    .toLowerCase();
  const raw = String(hostname || "").toLowerCase();
  for (let i = 0; i < SOURCES.length; i++) {
    const s = SOURCES[i];
    if (s.match(raw) || s.match(host) || s.match("www." + host)) {
      if (s.id === "linkedin" && !(cfg && cfg.linkedinEnabled)) {
        return { error: "linkedin-off", source: s };
      }
      return { source: s };
    }
  }
  return { error: "no-match" };
}
