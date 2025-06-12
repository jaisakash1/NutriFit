const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const healthProfileSchema = new mongoose.Schema({
  age: {
    type: Number,
    required: true,
    min: 1,
    max: 120
  },
  gender: {
    type: String,
    required: true,
    enum: ['male', 'female', 'other']
  },
  weight: {
    type: Number,
    required: true,
    min: 1
  },
  height: {
    type: Number,
    required: true,
    min: 1
  },
  healthConditions: [{
    type: String,
    enum: ['diabetes', 'hypertension', 'heart_disease', 'thyroid', 'pcos', 'arthritis', 'none']
  }],
  fitnessGoal: {
    type: String,
    required: true,
    enum: ['weight_loss', 'muscle_gain', 'maintenance', 'endurance', 'strength']
  },
  budget: {
    type: String,
    required: true,
    enum: ['low', 'medium', 'high']
  },
  lifestyle: {
    type: String,
    required: true,
    enum: ['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active']
  },
  dietaryRestrictions: [{
    type: String,
    enum: ['vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'nut_free', 'none']
  }],
  targetWeight: Number,
  bmr: Number,
  bmi: Number
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  mobile: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^\+?[\d\s\-\(\)]{10,}$/.test(v);
      },
      message: 'Please provide a valid mobile number'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  healthProfile: {
    type: healthProfileSchema,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: Date,
  profilePicture: String,
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true }
    },
    units: {
      type: String,
      enum: ['metric', 'imperial'],
      default: 'metric'
    }
  }
}, {
  timestamps: true
});

// Calculate BMI and BMR before saving
userSchema.pre('save', function(next) {
  try {
    if (this.isModified('healthProfile')) {
      const { weight, height, age, gender } = this.healthProfile;
      
      // Validate required fields
      if (!weight || !height || !age || !gender) {
        console.error('Missing required fields for BMI/BMR calculation:', { weight, height, age, gender });
        next();
        return;
      }

      // Calculate BMI
      const heightInMeters = height / 100;
      this.healthProfile.bmi = Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
      
      // Calculate BMR using Mifflin-St Jeor Equation
      // Men: BMR = 10W + 6.25H - 5A + 5
      // Women: BMR = 10W + 6.25H - 5A - 161
      const bmr = (10 * weight) + (6.25 * height) - (5 * age);
      this.healthProfile.bmr = Math.round(
        gender.toLowerCase() === 'male' ? bmr + 5 : bmr - 161
      );

      console.log('Calculated BMI and BMR:', {
        weight,
        height,
        age,
        gender,
        bmi: this.healthProfile.bmi,
        bmr: this.healthProfile.bmr
      });
    }
    next();
  } catch (error) {
    console.error('Error calculating BMI/BMR:', error);
    next(error);
  }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Get user's daily calorie needs
userSchema.methods.getDailyCalorieNeeds = function() {
  try {
    if (!this.healthProfile) {
      console.error('No health profile found');
      return null;
    }

    const { bmr, lifestyle } = this.healthProfile;
    if (!bmr || !lifestyle) {
      console.error('Missing BMR or lifestyle in health profile');
      return null;
    }

    const activityMultipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9
    };

    const multiplier = activityMultipliers[lifestyle] || activityMultipliers.sedentary;
    const dailyCalories = Math.round(bmr * multiplier);

    // Add adjustment based on fitness goal
    const goalAdjustments = {
      weight_loss: -500,    // Caloric deficit for weight loss
      muscle_gain: 300,     // Caloric surplus for muscle gain
      maintenance: 0,       // No adjustment for maintenance
      endurance: 0,        // No adjustment for endurance
      strength: 200        // Slight surplus for strength
    };

    const goalAdjustment = goalAdjustments[this.healthProfile.fitnessGoal] || 0;
    const adjustedCalories = Math.max(1200, dailyCalories + goalAdjustment); // Never go below 1200 calories

    console.log('Calculated daily calories:', {
      bmr,
      lifestyle,
      multiplier,
      baseCalories: dailyCalories,
      goalAdjustment,
      finalCalories: adjustedCalories
    });

    return adjustedCalories;
  } catch (error) {
    console.error('Error calculating daily calorie needs:', error);
    return null;
  }
};

module.exports = mongoose.model('User', userSchema);