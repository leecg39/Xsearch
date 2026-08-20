export function nextBackoffMs(prev, { base = 2000, cap = 30000 } = {}) {
  const p = Number(prev) || base;
  return Math.min(cap, Math.max(base, p * 2));
}

export function shouldRetryStatus(status) {
  return status === 429 || status === 503;
}

export async function fetchWithBackoff(url, opts) {
  const sleep = opts.sleep;
  const maxTries = opts.maxTries || 5;
  let wait = opts.delay || 2000;
  let lastErr;
  for (let i = 0; i < maxTries; i++) {
    const res = await fetch(url, opts.init || { credentials: "include" });
    if (shouldRetryStatus(res.status)) {
      lastErr = new Error("HTTP " + res.status);
      await sleep(wait);
      wait = nextBackoffMs(wait);
      continue;
    }
    if (!res.ok) {
      throw new Error("HTTP " + res.status);
    }
    return res.json();
  }
  throw lastErr || new Error("재시도 한도 초과");
}
