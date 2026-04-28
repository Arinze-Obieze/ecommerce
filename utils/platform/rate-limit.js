import redis from '@/utils/platform/redis';

// In-process fallback used when Redis is unavailable.
// Entries: key → { count, resetAt }
const _fallbackCounters = new Map();

function _fallbackCheck(key, limit, windowMs) {
  const now = Date.now();
  let entry = _fallbackCounters.get(key);
  if (!entry || now > entry.resetAt) {
    entry = { count: 0, resetAt: now + windowMs };
  }
  entry.count += 1;
  _fallbackCounters.set(key, entry);
  // Use 10 % of normal limit so the fallback is conservative.
  const fallbackLimit = Math.max(1, Math.floor(limit * 0.1));
  return entry.count <= fallbackLimit;
}

// F005: prefer cf-connecting-ip (set by Cloudflare, cannot be spoofed by clients).
// Only fall back to x-forwarded-for when Cloudflare is not in the path.
export function getRequestIp(request) {
  const cfIp = request.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp;

  return (
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function enforceRateLimit({
  request,
  scope,
  identifier = 'anon',
  limit,
  windowSeconds = 60,
}) {
  const safeScope = String(scope || 'api');
  const safeIdentifier = String(identifier || 'anon');
  const ip = getRequestIp(request);
  const key = `ratelimit:${safeScope}:${safeIdentifier}:${ip}`;

  // F002: when Redis is not configured, fall back to conservative in-process counters.
  if (!redis) {
    console.warn('[rate-limit] Redis unavailable — using in-process fallback for key:', key);
    const allowed = _fallbackCheck(key, limit, windowSeconds * 1000);
    return { allowed, remaining: null, retryAfter: allowed ? null : windowSeconds };
  }

  try {
    const count = await redis.incr(key);
    if (count === 1) {
      await redis.expire(key, windowSeconds);
    } else {
      // Safety latch: if a previous expire failed or was interrupted, the key is eternal.
      // A TTL of -1 means it exists but has no expiration time.
      const ttl = await redis.ttl(key);
      if (ttl === -1) {
        await redis.expire(key, windowSeconds);
      }
    }

    const remaining = Math.max(0, limit - count);
    const allowed = count <= limit;

    return {
      allowed,
      remaining,
      retryAfter: allowed ? null : windowSeconds,
    };
  } catch (error) {
    // F002: Redis connection error — fall back to conservative in-process counters.
    console.error('[rate-limit] Redis error, switching to fallback:', error);
    const allowed = _fallbackCheck(key, limit, windowSeconds * 1000);
    return { allowed, remaining: null, retryAfter: allowed ? null : windowSeconds };
  }
}

export function rateLimitHeaders(rateLimit) {
  const headers = {};
  if (rateLimit?.retryAfter) headers['Retry-After'] = String(rateLimit.retryAfter);
  if (rateLimit?.remaining !== null && rateLimit?.remaining !== undefined) {
    headers['X-RateLimit-Remaining'] = String(rateLimit.remaining);
  }
  return headers;
}

export function rateLimitPayload(message, rateLimit) {
  return {
    error: message || 'Too many requests. Please wait a moment and try again.',
    retry_after_seconds: rateLimit?.retryAfter || null,
  };
}
