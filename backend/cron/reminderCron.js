/**
 * reminderCron.js
 * Runs every minute and sends email reminders to users whose nextScheduled time has passed.
 * This is the single source of truth for reminder scheduling logic.
 */

const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const emailService = require('../utils/emailService');

/**
 * Calculates the next scheduled datetime for a reminder.
 * @param {string} time   - "HH:MM" format
 * @param {string[]} days - Array of weekday names (e.g. ['monday', 'wednesday'])
 * @param {string} frequency - 'daily' | 'weekly'
 * @returns {Date}
 */
function calculateNextScheduled(time, days, frequency) {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  const [hours, minutes] = time.split(':').map(Number);

  if (frequency === 'daily') {
    const nextTime = new Date();
    nextTime.setHours(hours, minutes, 0, 0);
    // If the time has already passed today, push to tomorrow
    if (nextTime <= now) {
      nextTime.setDate(nextTime.getDate() + 1);
    }
    return nextTime;
  }

  if (frequency === 'weekly' && Array.isArray(days) && days.length > 0) {
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = now.getDay();

    for (let i = 0; i < 7; i++) {
      const checkDay = (currentDay + i) % 7;
      if (days.includes(weekdays[checkDay])) {
        const nextTime = new Date();
        nextTime.setDate(now.getDate() + i);
        nextTime.setHours(hours, minutes, 0, 0);
        // Skip today if the time has already passed
        if (i === 0 && nextTime <= now) continue;
        return nextTime;
      }
    }
  }

  // Fallback: return now (will be rescheduled on next check)
  return new Date();
}

/**
 * Checks all due reminders and sends emails.
 * Called every minute by the cron schedule.
 */
async function checkAndSendReminders() {
  const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  console.log(`⏰ Checking reminders at ${now.toLocaleTimeString()}`);

  let reminders;
  try {
    reminders = await Reminder.find({
      nextScheduled: { $lte: now },
      isActive: true
    }).populate('userId');
  } catch (err) {
    console.error('❌ Failed to fetch reminders:', err.message);
    return;
  }

  for (const reminder of reminders) {
    if (!reminder.preferences?.email) continue;
    if (!reminder.userId) {
      console.warn(`⚠️  Reminder ${reminder._id} has no associated user — skipping.`);
      continue;
    }

    try {
      await emailService.sendReminderEmail(reminder.userId, reminder);
      reminder.lastSent = now;
      reminder.nextScheduled = calculateNextScheduled(reminder.time, reminder.days, reminder.frequency);
      await reminder.save();
      console.log(`✅ Reminder sent for "${reminder.title}" (${reminder._id})`);
    } catch (err) {
      console.error(`❌ Error sending reminder ${reminder._id}:`, err.message);
    }
  }
}

// Run every minute (IST timezone)
cron.schedule('* * * * *', checkAndSendReminders, {
  timezone: 'Asia/Kolkata'
});

console.log('✅ Reminder cron initialized');

module.exports = { calculateNextScheduled };
