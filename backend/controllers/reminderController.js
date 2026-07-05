const Reminder = require('../models/Reminder');
const User = require('../models/User');
const emailService = require('../utils/emailService');
const { calculateNextScheduled } = require('../cron/reminderCron');

const createReminder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, title, description, time, days, frequency, preferences } = req.body;

    const reminder = new Reminder({
      userId,
      type,
      title,
      description,
      time,
      days: days || [],
      frequency: frequency || 'daily',
      preferences: preferences || { email: true, push: true }
    });

    // Calculate next scheduled time
    reminder.nextScheduled = calculateNextScheduled(time, days, frequency);

    await reminder.save();

    res.status(201).json({
      success: true,
      message: 'Reminder created successfully',
      reminder
    });
  } catch (error) {
    console.error('Create reminder error:', error);
    res.status(500).json({ 
      message: 'Error creating reminder', 
      error: error.message 
    });
  }
};

const getReminders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { type, isActive } = req.query;

    let query = { userId };
    if (type) query.type = type;
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const reminders = await Reminder.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      reminders
    });
  } catch (error) {
    console.error('Get reminders error:', error);
    res.status(500).json({ 
      message: 'Error fetching reminders', 
      error: error.message 
    });
  }
};

const updateReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    // Recalculate next scheduled time if time or days are updated
    if (updates.time || updates.days || updates.frequency) {
      updates.nextScheduled = calculateNextScheduled(
        updates.time || req.body.time,
        updates.days || req.body.days,
        updates.frequency || req.body.frequency
      
      );
    }

    const reminder = await Reminder.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json({
      success: true,
      message: 'Reminder updated successfully',
      reminder
    });
  } catch (error) {
    console.error('Update reminder error:', error);
    res.status(500).json({ 
      message: 'Error updating reminder', 
      error: error.message 
    });
  }
};

const deleteReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const reminder = await Reminder.findOneAndDelete({ _id: id, userId });

    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    res.json({
      success: true,
      message: 'Reminder deleted successfully'
    });
  } catch (error) {
    console.error('Delete reminder error:', error);
    res.status(500).json({ 
      message: 'Error deleting reminder', 
      error: error.message 
    });
  }
};

const getTodaysReminders = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date().toLocaleDateString('en', { weekday: 'long' }).toLowerCase();

    const reminders = await Reminder.find({
      userId,
      isActive: true,
      $or: [
        { frequency: 'daily' },
        { days: today }
      ]
    }).sort({ time: 1 });

    res.json({
      success: true,
      reminders
    });
  } catch (error) {
    console.error('Get today\'s reminders error:', error);
    res.status(500).json({ 
      message: 'Error fetching today\'s reminders', 
      error: error.message 
    });
  }
};

const sendTestReminder = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const reminder = await Reminder.findOne({ _id: id, userId });
    if (!reminder) {
      return res.status(404).json({ message: 'Reminder not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Send test email
    if (reminder.preferences.email) {
      await emailService.sendReminderEmail(user, reminder);
    }

    res.json({
      success: true,
      message: 'Test reminder sent successfully'
    });
  } catch (error) {
    console.error('Send test reminder error:', error);
    res.status(500).json({ 
      message: 'Error sending test reminder', 
      error: error.message 
    });
  }
};


module.exports = {
  createReminder,
  getReminders,
  updateReminder,
  deleteReminder,
  getTodaysReminders,
  sendTestReminder
};

