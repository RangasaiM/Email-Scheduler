import { Queue } from 'bullmq';
import { createRedisConnection } from '../config/redis';

export const emailQueue = new Queue('email-queue', {
  connection: createRedisConnection(),
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: false,
    removeOnFail: false,
  },
});

emailQueue.on('error', (err) => {
  console.error('Queue error:', err.message);
});
