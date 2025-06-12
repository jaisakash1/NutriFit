// models/Chat.js
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['user', 'ai'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
chatSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('Chat', chatSchema);
