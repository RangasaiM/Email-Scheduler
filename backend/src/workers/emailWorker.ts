import { Worker, Job } from 'bullmq';
import { redisConnection, createRedisConnection } from '../config/redis';
import prisma from '../config/db';
import { sendEmail } from '../services/emailService';
import dotenv from 'dotenv';

dotenv.config();

const CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || '5', 10);
const MAX_EMAILS_PER_HOUR = parseInt(process.env.MAX_EMAILS_PER_HOUR || '200', 10);
const MIN_DELAY = parseInt(process.env.MIN_DELAY_BETWEEN_EMAILS || '2000', 10);

export const emailWorker = new Worker('email-queue', async (job: Job) => {
  const { jobId, recipientEmail, subject, body, senderId } = job.data;
  console.log(`[worker] Processing job id=${job.id}, dbJobId=${jobId}, to=${recipientEmail}`);

  const currentHour = new Date().toISOString().slice(0, 13);
  const rateLimitKey = `rate_limit_global:${currentHour}`;
  
  const count = await redisConnection.incr(rateLimitKey);
  if (count === 1) {
    await redisConnection.expire(rateLimitKey, 3600);
  }

  console.log(`[worker] Rate limit count for hour ${currentHour}: ${count}/${MAX_EMAILS_PER_HOUR}`);

  if (count > MAX_EMAILS_PER_HOUR) {
    const now = new Date();
    const nextHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0);
    const delay = nextHour.getTime() - now.getTime();
    await redisConnection.decr(rateLimitKey);
    console.log(`[worker] Rate limit exceeded, rescheduling in ${delay}ms`);
    await job.moveToDelayed(Date.now() + delay, job.token!);
    throw new Error('RateLimitExceeded: Moving to delayed');
  }

  if (MIN_DELAY > 0) {
    console.log(`[worker] Waiting ${MIN_DELAY}ms between sends...`);
    await new Promise(resolve => setTimeout(resolve, MIN_DELAY));
  }

  try {
    console.log(`[worker] Sending email to ${recipientEmail}...`);
    const info = await sendEmail(recipientEmail, subject, body);
    console.log(`[worker] Email sent! Preview URL: ${require('nodemailer').getTestMessageUrl(info)}`);
    
    await prisma.emailJob.update({
      where: { id: jobId },
      data: { status: 'sent', sentTime: new Date() }
    });
    console.log(`[worker] DB updated: job ${jobId} marked as sent`);

  } catch (error: any) {
    console.error(`[worker] Failed to send email to ${recipientEmail}:`, error.message);
    await prisma.emailJob.update({
      where: { id: jobId },
      data: { status: 'failed' }
    });
    throw error;
  }

}, {
  connection: createRedisConnection(),
  concurrency: CONCURRENCY,
});

emailWorker.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed with error ${err.message}`);
});

emailWorker.on('error', err => {
  console.error('Worker error:', err.message);
});
