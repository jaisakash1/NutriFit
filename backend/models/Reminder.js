const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['meal', 'exercise', 'water', 'medication', 'sleep', 'custom']
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  time: {
    type: String,
    required: true // Format: "HH:MM"
  },
  days: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'custom'],
    default: 'daily'
  },
  lastSent: Date,
  nextScheduled: Date,
  preferences: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// Index for user reminder queries
reminderSchema.index({ userId: 1, isActive: 1 });
// Critical: used by the cron job every minute — must be indexed
reminderSchema.index({ nextScheduled: 1, isActive: 1 });

module.exports = mongoose.model('Reminder', reminderSchema);