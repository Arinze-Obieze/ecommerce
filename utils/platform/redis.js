import { Redis } from '@upstash/redis';

let redis;
const redisConfigured = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

if (redisConfigured) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
} else {
  console.warn('UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set. Redis caching will be disabled.');
  redis = null;
}

export async function getRedisHealth() {
  if (!redis) {
    return {
      configured: false,
      connected: false,
      mode: 'fallback',
      reason: 'missing_credentials',
    };
  }

  try {
    const result = await redis.ping();
    return {
      configured: true,
      connected: String(result || '').toUpperCase() === 'PONG',
      mode: 'upstash',
      reason: null,
    };
  } catch (error) {
    return {
      configured: true,
      connected: false,
      mode: 'fallback',
      reason: error?.message || 'ping_failed',
    };
  }
}

export { redisConfigured };
export default redis;
