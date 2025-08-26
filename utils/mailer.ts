import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export async function sendReminder(email: string, subject: string, html: string) {
  await transporter.sendMail({from: process.env.SMTP_USER, to: email, subject, html});
}
