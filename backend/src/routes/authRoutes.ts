import { Router } from 'express';
import passport from '../config/passport';
import dotenv from 'dotenv';

dotenv.config();

const router = Router();

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect to frontend dashboard.
    res.redirect(`${process.env.FRONTEND_URL}/dashboard`);
  }
);

router.post('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) { return next(err); }
    res.json({ message: 'Logged out successfully' });
  });
});

router.get('/me', (req, res) => {
  console.log(`[auth/me] isAuthenticated=${req.isAuthenticated()}, sessionID=${req.sessionID}, user=${req.user ? (req.user as any).id : 'none'}`);
  if (req.isAuthenticated()) {
    res.json(req.user);
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
});

export default router;
