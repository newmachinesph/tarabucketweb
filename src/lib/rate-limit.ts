import "server-only";

// Lightweight in-memory fixed-window rate limiter. Good enough for a single
// instance / low-traffic deploy. For multi-instance (serverless) deployments,
// swap this for a shared store (e.g. @upstash/ratelimit + Redis) — the call
// sites only depend on the { ok, retryAfter } shape below.

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

// Opportunistic sweep so the map can't grow unbounded under random-key floods.
let lastSweep = 0;
function sweep(now: number) {
  if (now - lastSweep < 60_000) return;
  lastSweep = now;
  for (const [key, b] of buckets) if (b.resetAt <= now) buckets.delete(key);
}

export type RateLimitResult = { ok: true } | { ok: false; retryAfter: number };

/**
 * @param key    Unique caller key (e.g. `newsletter:<ip>`).
 * @param limit  Max requests allowed per window.
 * @param windowMs  Window length in milliseconds.
 */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  sweep(now);
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true };
  }
  if (existing.count >= limit) {
    return { ok: false, retryAfter: Math.ceil((existing.resetAt - now) / 1000) };
  }
  existing.count += 1;
  return { ok: true };
}

/** Best-effort client IP from proxy headers, falling back to a shared bucket. */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0]!.trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}
