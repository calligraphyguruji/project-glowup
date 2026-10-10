interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
}

const windowMs = 60 * 1000; // 1 minute
const maxTokens = parseInt(process.env.REQUESTS_PER_MINUTE_LIMIT || "15", 10);
const ipStorage = new Map<string, RateLimitEntry>();

// Housekeeping every 5 minutes to prevent memory leak
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    ipStorage.forEach((entry, ip) => {
      if (now - entry.lastRefill > windowMs * 2) {
        ipStorage.delete(ip);
      }
    });
  }, 5 * 60 * 1000);
}

const MAX_TRACKED_IPS = 5000;

export function checkRateLimit(ip: string): {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
} {
  const now = Date.now();
  let entry = ipStorage.get(ip);

  if (!entry) {
    if (ipStorage.size >= MAX_TRACKED_IPS) {
      const keysToDelete = Array.from(ipStorage.keys()).slice(0, 1000);
      keysToDelete.forEach((k) => ipStorage.delete(k));
    }
    entry = { tokens: maxTokens, lastRefill: now };
    ipStorage.set(ip, entry);
  }

  // Refill tokens based on elapsed time
  const timePassed = now - entry.lastRefill;
  if (timePassed > windowMs) {
    entry.tokens = maxTokens;
    entry.lastRefill = now;
  }

  if (entry.tokens > 0) {
    entry.tokens -= 1;
    return {
      allowed: true,
      remaining: entry.tokens,
      resetSeconds: Math.ceil((windowMs - timePassed) / 1000),
    };
  }

  return {
    allowed: false,
    remaining: 0,
    resetSeconds: Math.ceil((windowMs - timePassed) / 1000),
  };
}
