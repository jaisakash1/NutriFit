// reminderCron.js
const cron = require('node-cron');
const Reminder = require('./models/Reminder');
const emailService = require('./utils/emailService');

function calculateNextScheduled(time, days, frequency) {
  const now = new Date();
  const [hours, minutes] = time.split(':').map(Number);

  if (frequency === 'daily') {
    const nextTime = new Date();
    nextTime.setHours(hours, minutes, 0, 0);
    if (nextTime <= now) {
      nextTime.setDate(nextTime.getDate() + 1);
    }
    return nextTime;
  } else if (frequency === 'weekly' && days && days.length > 0) {
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = now.getDay();
    for (let i = 0; i < 7; i++) {
      const checkDay = (currentDay + i) % 7;
      const dayName = weekdays[checkDay];
      if (days.includes(dayName)) {
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
  const now = new Date();
  console.log("⏰ Checking reminders at", now.toLocaleTimeString());

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
        console.log(`✅ Sent reminder for ${reminder._id}`);
      } catch (err) {
        console.error(`❌ Error sending reminder ${reminder._id}:`, err.message);
      }
    }
  }
}

// Run every minute
cron.schedule('* * * * *', checkAndSendReminders);
console.log("✅ Reminder cron initialized");