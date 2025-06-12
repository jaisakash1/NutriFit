const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }

  async sendWelcomeEmail(user) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Welcome to Health & Fitness App!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #4CAF50;">Welcome to Health & Fitness App!</h2>
            <p>Hello ${user.name},</p>
            <p>Thank you for joining our health and fitness community. We're excited to help you achieve your fitness goals!</p>
            <p>Your personalized health journey starts now. Here's what you can expect:</p>
            <ul>
              <li>Personalized diet plans based on your health profile</li>
              <li>Custom exercise routines for your fitness goals</li>
              <li>AI-powered health assistant available 24/7</li>
              <li>Smart reminders to keep you on track</li>
              <li>Progress tracking and insights</li>
            </ul>
            <p>Get started by exploring your dashboard and setting up your first meal and exercise plans.</p>
            <p>Stay healthy and strong!</p>
            <p>Best regards,<br>Health & Fitness Team</p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Welcome email sent successfully');
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }
  }

  async sendReminderEmail(user, reminder) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: `Reminder: ${reminder.title}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #FF9800;">Reminder: ${reminder.title}</h2>
            <p>Hello ${user.name},</p>
            <p>This is a friendly reminder about: <strong>${reminder.title}</strong></p>
            ${reminder.description ? `<p>${reminder.description}</p>` : ''}
            <p>Scheduled time: <strong>${reminder.time}</strong></p>
            <p>Keep up the great work on your health journey!</p>
            <p>Best regards,<br>Health & Fitness Team</p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Reminder email sent successfully');
    } catch (error) {
      console.error('Error sending reminder email:', error);
    }
  }

  async sendWeeklySummary(user, summaryData) {
    try {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'Your Weekly Health Summary',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2196F3;">Your Weekly Health Summary</h2>
            <p>Hello ${user.name},</p>
            <p>Here's your weekly progress summary:</p>
            
            <div style="margin: 20px 0;">
              <h3>Diet Adherence</h3>
              <p>Meals logged: ${summaryData.mealsLogged || 0}</p>
              <p>Average calories: ${summaryData.avgCalories || 0}</p>
            </div>
            
            <div style="margin: 20px 0;">
              <h3>Exercise Progress</h3>
              <p>Workouts completed: ${summaryData.workoutsCompleted || 0}</p>
              <p>Total calories burned: ${summaryData.caloriesBurned || 0}</p>
            </div>
            
            <div style="margin: 20px 0;">
              <h3>Overall Progress</h3>
              <p>Weight trend: ${summaryData.weightTrend || 'No data'}</p>
              <p>Adherence score: ${summaryData.adherenceScore || 0}%</p>
            </div>
            
            <p>Keep up the excellent work! Remember, consistency is key to achieving your goals.</p>
            <p>Best regards,<br>Health & Fitness Team</p>
          </div>
        `
      };

      await this.transporter.sendMail(mailOptions);
      console.log('Weekly summary email sent successfully');
    } catch (error) {
      console.error('Error sending weekly summary email:', error);
    }
  }
}

module.exports = new EmailService();