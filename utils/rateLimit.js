import redis from '@/utils/redis';

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
  windowSeconds,
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
