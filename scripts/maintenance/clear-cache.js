const { Redis } = require('@upstash/redis');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function clearCache() {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.error('Error: UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN not set in .env.local');
    process.exit(1); 
  }

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  console.log('Clearing Redis cache...');
  try {
    await redis.flushall();
    console.log('Redis cache cleared successfully.');
  } catch (error) {
    console.error('Failed to clear Redis cache:', error);
  }
}

clearCache();
