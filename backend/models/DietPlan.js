const mongoose = require('mongoose');

const mealSchema = new mongoose.Schema({
  name: String,
  description: String,
  calories: Number,
  protein: Number,
  carbs: Number,
  fat: Number,
  fiber: Number,
  ingredients: [String],
  instructions: [String],
  estimatedTime: Number, // in minutes
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard']
  },
  tags: [String]
});

const dayPlanSchema = new mongoose.Schema({
  day: {
    type: String,
    required: true
  },
  breakfast: mealSchema,
  midMorningSnack: mealSchema,
  lunch: mealSchema,
  eveningSnack: mealSchema,
  dinner: mealSchema,
  totalCalories: Number,
  totalProtein: Number,
  totalCarbs: Number,
  totalFat: Number
});

const dietPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planName: String,
  description: String,
  duration: Number, // in days
  weeklyPlan: [dayPlanSchema],
  targetCalories: Number,
  targetProtein: Number,
  targetCarbs: Number,
  targetFat: Number,
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
  feedback: [{
    date: Date,
    rating: Number,
    comment: String
  }],
  shoppingList: [{
    item: String,
    quantity: String,
    category: String,
    estimatedPrice: Number,
    affiliateLinks: [{
      store: String,
      url: String,
      price: Number
    }]
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('DietPlan', dietPlanSchema);