const nodemailer = require('nodemailer');

// create transporter using SMTP values from environment
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  }
});

const templates = {
  en: {
    reminder: ({ title, dueDate }) => `Reminder: Return "${title}" by ${dueDate.toDateString()}`,
    overdue: ({ title, dueDate }) => `Overdue: "${title}" was due on ${dueDate.toDateString()}`,
    fine: ({ title, amount }) => `Fine imposed on "${title}". Amount due: $${amount}`
  }
};

function render(template, locale, data) {
  const strings = templates[locale] || templates.en;
  return strings[template](data);
}

function sendMail(to, subject, html) {
  return transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to,
    subject,
    html
  });
}

function sendReminder(to, data, locale = 'en') {
  return sendMail(to, 'Library Reminder', render('reminder', locale, data));
}

function sendOverdue(to, data, locale = 'en') {
  return sendMail(to, 'Book Overdue', render('overdue', locale, data));
}

function sendFine(to, data, locale = 'en') {
  return sendMail(to, 'Fine Notice', render('fine', locale, data));
}

module.exports = { sendReminder, sendOverdue, sendFine };
