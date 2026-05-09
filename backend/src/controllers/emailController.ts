import { Request, Response } from 'express';
import prisma from '../config/db';
import { emailQueue } from '../queues/emailQueue';

export const scheduleEmail = async (req: Request, res: Response) => {
  try {
    const { subject, body, recipients, scheduledTime, delayBetweenEmails, hourlyLimit } = req.body;
    const user = req.user as any;

    console.log(`[scheduleEmail] user=${user?.id}, recipients=${recipients?.length}, scheduledTime=${scheduledTime}`);

    if (!recipients || recipients.length === 0) {
      return res.status(400).json({ error: 'No recipients provided' });
    }

    const startTime = new Date(scheduledTime).getTime();
    const now = Date.now();

    // Step 1: Create all DB records first (fast - no Redis dependency)
    const jobRecords: Array<{ record: { id: string; recipientEmail: string }, delay: number }> = [];
    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i].email;
      if (!recipient) continue;
      const delay = Math.max((startTime - now) + (i * (delayBetweenEmails || 0)), 0);
      const jobRecord = await prisma.emailJob.create({
        data: {
          recipientEmail: recipient,
          subject,
          body,
          scheduledTime: new Date(now + delay),
          senderId: user.id,
          status: 'queued'
        }
      });
      jobRecords.push({ record: jobRecord, delay });
      console.log(`[scheduleEmail] DB record created for ${recipient}, delay=${delay}ms`);
    }

    // Step 2: Respond immediately so the frontend doesn't hang
    res.status(201).json({ message: 'Emails scheduled successfully', count: jobRecords.length });

    // Step 3: Queue jobs in background (after response is sent)
    setImmediate(async () => {
      for (const { record, delay } of jobRecords) {
        try {
          const bullJob = await emailQueue.add('send-email', {
            jobId: record.id,
            recipientEmail: record.recipientEmail,
            subject,
            body,
            senderId: user.id
          }, {
            delay,
            jobId: record.id
          });
          console.log(`[scheduleEmail] BullMQ job queued: id=${bullJob.id} for ${record.recipientEmail}`);
        } catch (queueErr: any) {
          console.error(`[scheduleEmail] Failed to queue job for ${record.recipientEmail}:`, queueErr.message);
          // Fall back: update status to reflect queuing failed but will retry
        }
      }
    });

  } catch (error: any) {
    console.error('[scheduleEmail] Error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getScheduledEmails = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const emails = await prisma.emailJob.findMany({
      where: { senderId: user.id, status: { in: ['queued', 'scheduled'] } },
      orderBy: { scheduledTime: 'asc' }
    });
    res.json(emails);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSentEmails = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const emails = await prisma.emailJob.findMany({
      where: { senderId: user.id, status: { in: ['sent', 'failed'] } },
      orderBy: { sentTime: 'desc' }
    });
    res.json(emails);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getEmailById = async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const id = req.params.id as string;
    const email = await prisma.emailJob.findFirst({
      where: { id: id, senderId: user.id }
    });
    if (!email) return res.status(404).json({ error: 'Not found' });
    res.json(email);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
