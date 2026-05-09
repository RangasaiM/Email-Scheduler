import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URL;

export const createRedisConnection = () => {
  const client = redisUrl
    ? new Redis(redisUrl, {
        maxRetriesPerRequest: null,
        family: 0,
        tls: redisUrl.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
      })
    : new Redis({
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
        maxRetriesPerRequest: null,
      });

  client.on('error', (err) => {
    console.error('Redis Error:', err.message);
  });

  return client;
};

export const redisConnection = createRedisConnection();
