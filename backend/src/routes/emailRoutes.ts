import { Router } from 'express';
import { scheduleEmail, getScheduledEmails, getSentEmails, getEmailById } from '../controllers/emailController';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

router.use(requireAuth);

router.post('/schedule', scheduleEmail);
router.get('/scheduled', getScheduledEmails);
router.get('/sent', getSentEmails);
router.get('/:id', getEmailById);

export default router;
