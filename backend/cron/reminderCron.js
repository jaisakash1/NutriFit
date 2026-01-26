const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const emailService = require('../utils/emailService');

function calculateNextScheduled(time, days, frequency) {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const [hours, minutes] = time.split(':').map(Number);

  if (frequency === 'daily') {
    const nextTime = new Date();
    nextTime.setHours(hours, minutes, 0, 0);

    if (nextTime <= now) {
      nextTime.setDate(nextTime.getDate() + 1);
    }
    return nextTime;
  }

  if (frequency === 'weekly' && Array.isArray(days)) {
    const weekdays = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
    const currentDay = now.getDay();

    for (let i = 0; i < 7; i++) {
      const checkDay = (currentDay + i) % 7;
      if (days.includes(weekdays[checkDay])) {
        const nextTime = new Date();
        nextTime.setDate(now.getDate() + i);
        nextTime.setHours(hours, minutes, 0, 0);

        if (i === 0 && nextTime <= now) continue;
        return nextTime;
      }
    }
  }

  return new Date();
}

async function checkAndSendReminders() {
  const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));

  const reminders = await Reminder.find({
    nextScheduled: { $lte: now },
    isActive: true
  }).populate('userId');

  for (const reminder of reminders) {
    if (reminder.preferences.email) {
      try {
        await emailService.sendReminderEmail(reminder.userId, reminder);
        reminder.nextScheduled = calculateNextScheduled(reminder.time, reminder.days, reminder.frequency);
        await reminder.save();
      } catch (err) {
        console.error('Cron email error:', err);
      }
    }
  }
}

// 🔹 Run every minute
cron.schedule('* * * * *', checkAndSendReminders, {
  timezone: 'Asia/Kolkata'
});

console.log('Reminder cron initialized');
