import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import prisma from '../config/db';
import dotenv from 'dotenv';

dotenv.config();

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'mock',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'mock',
    callbackURL: process.env.CALLBACK_URL || 'http://localhost:5000/auth/callback',
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      if (profile.id === 'mock') return done(null, { id: 'mock', name: 'Mock', email: 'mock@mock.com', googleId: 'mock' });
      
      const email = profile.emails?.[0].value;
      if (!email) {
        return done(new Error('No email found'));
      }

      let user = await prisma.user.findUnique({ where: { googleId: profile.id } });

      if (!user) {
        user = await prisma.user.create({
          data: {
            googleId: profile.id,
            name: profile.displayName,
            email: email,
            avatar: profile.photos?.[0].value || null,
          }
        });
      }
      return done(null, user);
    } catch (error) {
      return done(error as Error);
    }
  }
));

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
