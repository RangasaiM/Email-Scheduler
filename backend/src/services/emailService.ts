import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

let transporter: nodemailer.Transporter;

if (process.env.SMTP_USER && process.env.SMTP_PASS) {
  // Real Gmail SMTP
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS, // Use Gmail App Password, NOT your regular password
    },
  });
  console.log('[emailService] Using Gmail SMTP for sending emails');
} else {
  // Fallback to Ethereal (test only - emails not delivered to real inbox)
  transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: process.env.ETHEREAL_USER,
      pass: process.env.ETHEREAL_PASS,
    },
  });
  console.log('[emailService] Using Ethereal SMTP (emails will NOT be delivered, check preview URL in logs)');
}

export { transporter };

export const sendEmail = async (to: string, subject: string, html: string) => {
  const fromAddress = process.env.SMTP_USER || process.env.ETHEREAL_USER;
  const info = await transporter.sendMail({
    from: `"ReachInbox" <${fromAddress}>`,
    to,
    subject,
    html,
  });

  // Log Ethereal preview URL if using test mode
  if (!process.env.SMTP_USER) {
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`\n📧 ETHEREAL PREVIEW URL: ${previewUrl}\n`);
    }
  } else {
    console.log(`[emailService] ✅ Real email sent to ${to}, messageId=${info.messageId}`);
  }

  return info;
};
