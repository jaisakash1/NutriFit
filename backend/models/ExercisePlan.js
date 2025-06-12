const mongoose = require('mongoose');

const exerciseSchema = new mongoose.Schema({
  name: String,
  description: String,
  category: {
    type: String,
    enum: ['cardio', 'strength', 'flexibility', 'balance', 'sports']
  },
  muscleGroups: [String],
  equipment: [String],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  duration: Number, // in minutes
  sets: Number,
  reps: String, // could be "12-15" or "30 seconds"
  restTime: Number, // in seconds
  caloriesBurn: Number,
  instructions: [String],
  tips: [String],
  videoUrl: String,
  imageUrl: String
});

const workoutSessionSchema = new mongoose.Schema({
  day: String,
  sessionName: String,
  description: String,
  totalDuration: Number,
  totalCaloriesBurn: Number,
  exercises: [exerciseSchema],
  warmup: [exerciseSchema],
  cooldown: [exerciseSchema]
});

const exercisePlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planName: String,
  description: String,
  planType: {
    type: String,
    enum: ['gym', 'home', 'outdoor', 'hybrid']
  },
  duration: Number, // in weeks
  weeklySchedule: [workoutSessionSchema],
  targetGoal: {
    type: String,
    enum: ['weight_loss', 'muscle_gain', 'endurance', 'strength', 'flexibility']
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  generatedBy: {
    type: String,
    default: 'AI'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  adherenceScore: {
    type: Number,
    default: 0
  },
  progress: [{
    date: Date,
    completedExercises: Number,
    totalExercises: Number,
    feedback: String,
    rating: Number
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('ExercisePlan', exercisePlanSchema);