import { Request, Response, NextFunction } from 'express';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  console.log(`[requireAuth] path=${req.path}, isAuthenticated=${req.isAuthenticated()}, sessionID=${req.sessionID}, user=${req.user ? (req.user as any).id : 'none'}`);
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Unauthorized' });
};
