const cron = require('node-cron');
const email = require('./email');

function toCron(date) {
  return `${date.getMinutes()} ${date.getHours()} ${date.getDate()} ${date.getMonth() + 1} *`;
}

function scheduleBorrowReminder(borrow, daysBefore = 3) {
  const dueDate = new Date(borrow.dueDate);
  const reminderDate = new Date(dueDate);
  reminderDate.setDate(reminderDate.getDate() - daysBefore);

  const reminderCron = toCron(reminderDate);
  const reminderTask = cron.schedule(reminderCron, () => {
    email.sendReminder(borrow.userEmail, { title: borrow.title, dueDate }, borrow.locale);
    reminderTask.stop();
  });

  const overdueCron = toCron(dueDate);
  const overdueTask = cron.schedule(overdueCron, () => {
    email.sendOverdue(borrow.userEmail, { title: borrow.title, dueDate }, borrow.locale);
    overdueTask.stop();
  });

  return { reminderTask, overdueTask };
}

function scheduleFineNotice(borrow, amount) {
  return email.sendFine(borrow.userEmail, { title: borrow.title, amount }, borrow.locale);
}

module.exports = { scheduleBorrowReminder, scheduleFineNotice };
