const nodemailer = require('nodemailer');

/**
 * EmailService
 * Single place for all transactional emails sent by NutriFit.
 * Uses Gmail SMTP via an app password configured in .env.
 */
class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  // ─── Welcome Email ────────────────────────────────────────────────────────

  async sendWelcomeEmail(user) {
    try {
      const mailOptions = {
        from: `"NutriFit" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Welcome to NutriFit! 🎉',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 24px; border-radius: 8px;">
            <h2 style="color: #6C47FF;">Welcome to NutriFit, ${user.name}! 🎉</h2>
            <p>Thank you for joining NutriFit. We're excited to help you achieve your health and fitness goals!</p>
            <p>Your personalized journey starts now. Here's what you can expect:</p>
            <ul>
              <li>🥗 Personalized diet plans based on your health profile</li>
              <li>💪 Custom exercise routines for your fitness goals</li>
              <li>🤖 AI-powered health assistant available 24/7</li>
              <li>⏰ Smart reminders to keep you on track</li>
              <li>📈 Progress tracking and insights</li>
            </ul>
            <p>Get started by exploring your dashboard and setting up your first meal and exercise plans.</p>
            <p>Stay healthy and strong!</p>
            <p style="margin-top: 24px;">Best regards,<br><strong>The NutriFit Team</strong></p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('✅ Welcome email sent to', user.email);
    } catch (error) {
      console.error('❌ Error sending welcome email:', error.message);
      throw error;
    }
  }

  // ─── Reminder Email ───────────────────────────────────────────────────────

  async sendReminderEmail(user, reminder) {
    try {
      const mailOptions = {
        from: `"NutriFit" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: `⏰ Reminder: ${reminder.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 24px; border-radius: 8px;">
            <h2 style="color: #FF9800;">⏰ Reminder: ${reminder.title}</h2>
            <p>Hello ${user.name},</p>
            <p>This is a friendly reminder about: <strong>${reminder.title}</strong></p>
            ${reminder.description ? `<p style="color:#555;">${reminder.description}</p>` : ''}
            <p>Scheduled time: <strong>${reminder.time}</strong></p>
            <p>Keep up the great work on your health journey!</p>
            <p style="margin-top: 24px;">Best regards,<br><strong>The NutriFit Team</strong></p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('✅ Reminder email sent to', user.email);
    } catch (error) {
      console.error('❌ Error sending reminder email:', error.message);
      throw error;
    }
  }

  // ─── Weekly Summary Email ─────────────────────────────────────────────────

  async sendWeeklySummary(user, summaryData) {
    try {
      const mailOptions = {
        from: `"NutriFit" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: '📊 Your Weekly NutriFit Summary',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 24px; border-radius: 8px;">
            <h2 style="color: #2196F3;">📊 Your Weekly NutriFit Summary</h2>
            <p>Hello ${user.name},</p>
            <p>Here's your weekly progress summary:</p>

            <div style="margin: 20px 0; background:#fff; padding:16px; border-radius:6px;">
              <h3>🥗 Diet Adherence</h3>
              <p>Meals logged: <strong>${summaryData.mealsLogged || 0}</strong></p>
              <p>Average calories: <strong>${summaryData.avgCalories || 0} kcal</strong></p>
            </div>

            <div style="margin: 20px 0; background:#fff; padding:16px; border-radius:6px;">
              <h3>💪 Exercise Progress</h3>
              <p>Workouts completed: <strong>${summaryData.workoutsCompleted || 0}</strong></p>
              <p>Total calories burned: <strong>${summaryData.caloriesBurned || 0} kcal</strong></p>
            </div>

            <div style="margin: 20px 0; background:#fff; padding:16px; border-radius:6px;">
              <h3>📈 Overall Progress</h3>
              <p>Weight trend: <strong>${summaryData.weightTrend || 'No data'}</strong></p>
              <p>Adherence score: <strong>${summaryData.adherenceScore || 0}%</strong></p>
            </div>

            <p>Keep up the excellent work! Remember, consistency is key to achieving your goals.</p>
            <p style="margin-top: 24px;">Best regards,<br><strong>The NutriFit Team</strong></p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('✅ Weekly summary email sent to', user.email);
    } catch (error) {
      console.error('❌ Error sending weekly summary email:', error.message);
      throw error;
    }
  }
}

module.exports = new EmailService();