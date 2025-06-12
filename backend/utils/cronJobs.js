const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const User = require('../models/User');
const emailService = require('./emailService');

class CronJobs {
  static init() {
    console.log('Initializing cron jobs...');

    // Check for reminders every minute
    cron.schedule('* * * * *', async () => {
      await this.checkReminders();
    });

    // Send weekly summaries every Sunday at 9 AM
    cron.schedule('0 9 * * 0', async () => {
      await this.sendWeeklySummaries();
    });

    // Cleanup old data monthly
    cron.schedule('0 0 1 * *', async () => {
      await this.cleanupOldData();
    });

    console.log('Cron jobs initialized successfully');
  }

  static async checkReminders() {
    try {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
      const currentDay = now.toLocaleDateString('en', { weekday: 'long' }).toLowerCase();

      const reminders = await Reminder.find({
        isActive: true,
        time: currentTime,
        $or: [
          { frequency: 'daily' },
          { days: currentDay }
        ]
      }).populate('userId');

      for (const reminder of reminders) {
        if (!reminder.userId) continue;

        const user = reminder.userId;
        
        // Check if reminder was already sent today
        const today = new Date().toDateString();
        const lastSent = reminder.lastSent ? reminder.lastSent.toDateString() : null;
        
        if (lastSent === today) continue;

        // Send reminder
        try {
          if (reminder.preferences.email && user.preferences.notifications.email) {
            await emailService.sendReminderEmail(user, reminder);
          }

          // Update last sent timestamp
          reminder.lastSent = now;
          await reminder.save();

          console.log(`Reminder sent to ${user.email}: ${reminder.title}`);
        } catch (error) {
          console.error(`Failed to send reminder to ${user.email}:`, error);
        }
      }
    } catch (error) {
      console.error('Error checking reminders:', error);
    }
  }

  static async sendWeeklySummaries() {
    try {
      const users = await User.find({ 
        isActive: true,
        'preferences.notifications.email': true 
      });

      for (const user of users) {
        try {
          // Calculate weekly summary data
          const summaryData = {
            mealsLogged: 0,
            avgCalories: 0,
            workoutsCompleted: 0,
            caloriesBurned: 0,
            weightTrend: 'No data',
            adherenceScore: 0
          };

          await emailService.sendWeeklySummary(user, summaryData);
          console.log(`Weekly summary sent to ${user.email}`);
        } catch (error) {
          console.error(`Failed to send weekly summary to ${user.email}:`, error);
        }
      }
    } catch (error) {
      console.error('Error sending weekly summaries:', error);
    }
  }

  static async cleanupOldData() {
    try {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      // Clean up old reminders that are inactive
      const oldReminders = await Reminder.deleteMany({
        isActive: false,
        createdAt: { $lt: sixMonthsAgo }
      });

      console.log(`Cleaned up ${oldReminders.deletedCount} old reminders`);
    } catch (error) {
      console.error('Error cleaning up old data:', error);
    }
  }
}

module.exports = CronJobs;