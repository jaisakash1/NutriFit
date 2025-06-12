const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  weight: Number,
  bodyFat: Number,
  muscleMass: Number,
  waterIntake: {
    type: Number,
    default: 0 // in ml
  },
  caloriesConsumed: {
    type: Number,
    default: 0
  },
  caloriesBurned: {
    type: Number,
    default: 0
  },
  sleepHours: Number,
  mood: {
    type: String,
    enum: ['excellent', 'good', 'average', 'poor', 'terrible']
  },
  energyLevel: {
    type: Number,
    min: 1,
    max: 10
  },
  stressLevel: {
    type: Number,
    min: 1,
    max: 10
  },
  meals: [{
    type: {
      type: String,
      enum: ['breakfast', 'lunch', 'dinner', 'snack']
    },
    name: String,
    calories: Number,
    time: String
  }],
  exercises: [{
    name: String,
    duration: Number, // in minutes
    caloriesBurned: Number,
    intensity: {
      type: String,
      enum: ['low', 'moderate', 'high']
    }
  }],
  vitals: {
    bloodPressure: {
      systolic: Number,
      diastolic: Number
    },
    heartRate: Number,
    bloodSugar: Number
  },
  notes: String
}, {
  timestamps: true
});

// Index for efficient querying
healthRecordSchema.index({ userId: 1, date: -1 });

module.exports = mongoose.model('HealthRecord', healthRecordSchema);