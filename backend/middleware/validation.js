const validator = require('validator');

const validateRegistration = (req, res, next) => {
  const { name, email, mobile, password, healthProfile } = req.body;
  const errors = [];

  // Basic validation
  if (!name || name.trim().length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (!email || !validator.isEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  if (!mobile || !/^\+?[\d\s\-\(\)]{10,}$/.test(mobile)) {
    errors.push('Please provide a valid mobile number');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  // Health profile validation
  if (!healthProfile) {
    errors.push('Health profile is required');
  } else {
    const { age, gender, weight, height, fitnessGoal, budget, lifestyle } = healthProfile;

    if (!age || age < 1 || age > 120) {
      errors.push('Age must be between 1 and 120');
    }

    if (!gender || !['male', 'female', 'other'].includes(gender)) {
      errors.push('Gender must be male, female, or other');
    }

    if (!weight || weight < 1) {
      errors.push('Weight must be a positive number');
    }

    if (!height || height < 1) {
      errors.push('Height must be a positive number');
    }

    if (!fitnessGoal || !['weight_loss', 'muscle_gain', 'maintenance', 'endurance', 'strength'].includes(fitnessGoal)) {
      errors.push('Please select a valid fitness goal');
    }

    if (!budget || !['low', 'medium', 'high'].includes(budget)) {
      errors.push('Please select a valid budget range');
    }

    if (!lifestyle || !['sedentary', 'lightly_active', 'moderately_active', 'very_active', 'extremely_active'].includes(lifestyle)) {
      errors.push('Please select a valid lifestyle');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !validator.isEmail(email)) {
    errors.push('Please provide a valid email address');
  }

  if (!password) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};

const validateHealthRecord = (req, res, next) => {
  const { date } = req.body;
  const errors = [];

  if (date && !validator.isISO8601(date)) {
    errors.push('Please provide a valid date');
  }

  if (errors.length > 0) {
    return res.status(400).json({ message: 'Validation failed', errors });
  }

  next();
};

module.exports = {
  validateRegistration,
  validateLogin,
  validateHealthRecord
};