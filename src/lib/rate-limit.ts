const stores = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const store = stores.get(key);

  if (!store || now > store.resetAt) {
    stores.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  if (store.count >= maxRequests) {
    return { allowed: false, remaining: 0, resetAt: store.resetAt };
  }

  store.count++;
  return { allowed: true, remaining: maxRequests - store.count, resetAt: store.resetAt };
}

const TIMEOUTS = new Map<string, number>();

export function debounceAction(key: string, minIntervalMs: number): boolean {
  const now = Date.now();
  const last = TIMEOUTS.get(key) || 0;
  if (now - last < minIntervalMs) return false;
  TIMEOUTS.set(key, now);
  return true;
}
