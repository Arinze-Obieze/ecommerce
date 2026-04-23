import redis from '@/utils/platform/redis';

export function getRequestIp(request) {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }

  return (
    request.headers.get('cf-connecting-ip') ||
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
  if (!redis) {
    return { allowed: true, remaining: null, retryAfter: null };
  }

  const safeScope = String(scope || 'api');
  const safeIdentifier = String(identifier || 'anon');
  const ip = getRequestIp(request);
  const key = `ratelimit:${safeScope}:${safeIdentifier}:${ip}`;

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
    console.error('Rate limit error:', error);
    // Fail-open if redis is unavailable to avoid full checkout outage.
    return { allowed: true, remaining: null, retryAfter: null };
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
