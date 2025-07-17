const DietPlan = require('../models/DietPlan');
const User = require('../models/User');
const GeminiAI = require('../utils/geminiAI');

const generateDietPlan = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;
    console.log(`Generating AI diet plan for user: ${userId}, role: ${userRole}`);

    let user;
    if (userRole === 'admin') {
      // For admins, create a mock user object with a default health profile
      console.log('Admin user detected. Using default health profile for generation.');
      user = {
        _id: userId,
        healthProfile: {
          weight: 75,
          height: 180,
          age: 30,
          gender: 'male',
          lifestyle: 'moderately_active',
          fitnessGoal: 'weight_loss',
          dietaryRestrictions: [],
        },
        // Mock method to return a default value
        getDailyCalorieNeeds: () => 2200
      };
    } else {
      // For regular users, fetch from the database
      user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      // Validate health profile
      if (!user.healthProfile) {
        return res.status(400).json({ 
          message: 'Health profile not found. Please complete your health profile first.' 
        });
      }

      const requiredFields = ['weight', 'height', 'age', 'gender', 'lifestyle', 'fitnessGoal'];
      const missingFields = requiredFields.filter(field => !user.healthProfile[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          message: `Missing required health profile fields: ${missingFields.join(', ')}`
        });
      }
    }

    // Calculate daily calorie needs
    // const dailyCalorieNeeds = user.getDailyCalorieNeeds();
    // if (!dailyCalorieNeeds) {
    //   return res.status(500).json({
    //     message: 'Failed to calculate daily calorie needs. Please check your health profile data.'
    //   });
    // }

    let dailyCalorieNeeds = user.getDailyCalorieNeeds();
  if (!dailyCalorieNeeds) {
      console.warn('Daily calorie needs not calculated properly. Falling back to default 2200 calories.');
  dailyCalorieNeeds = 2200; // fallback default
  }


    // Generate diet plan using GeminiAI
    const geminiAI = new GeminiAI();
    const aiResponse = await geminiAI.generateDietPlan(user);

    if (!aiResponse || !aiResponse.weeklyPlan || !Array.isArray(aiResponse.weeklyPlan)) {
      return res.status(500).json({ 
        message: 'Invalid diet plan format received from AI' 
      });
    }

    // Calculate target macros based on calorie needs
    const targetProtein = Math.round(user.healthProfile.weight * 2); // 2g per kg
    const targetFat = Math.round((dailyCalorieNeeds * 0.25) / 9); // 25% of calories from fat
    const targetCarbs = Math.round((dailyCalorieNeeds * 0.55) / 4); // 55% of calories from carbs

    // Create diet plan document
    const dietPlan = new DietPlan({
      userId,
      planName: `${user.healthProfile.fitnessGoal} Diet Plan - ${new Date().toLocaleDateString()}`,
      description: `AI-generated diet plan for ${user.healthProfile.fitnessGoal}`,
      duration: 7, // 7 days plan
      weeklyPlan: aiResponse.weeklyPlan.map((day, index) => ({
        day: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][index],
        breakfast: day.breakfast,
        midMorningSnack: day.midMorningSnack,
        lunch: day.lunch,
        eveningSnack: day.eveningSnack,
        dinner: day.dinner,
        totalCalories: calculateDayTotal(day, 'calories'),
        totalProtein: calculateDayTotal(day, 'protein'),
        totalCarbs: calculateDayTotal(day, 'carbs'),
        totalFat: calculateDayTotal(day, 'fat')
      })),
      targetCalories: dailyCalorieNeeds,
      targetProtein,
      targetCarbs,
      targetFat,
      generatedBy: 'AI',
      isActive: true,
      adherenceScore: 0,
      shoppingList: aiResponse.shoppingList || []
    });

    // Save the diet plan
    await dietPlan.save();
    console.log('Diet plan saved successfully');

    res.json({
      success: true,
      message: 'Diet plan generated successfully',
      dietPlan
    });
  } catch (error) {
    console.error('Generate diet plan error:', error);
    res.status(500).json({ 
      message: 'Failed to generate diet plan',
      error: error.message 
    });
  }
};

// Helper function to calculate daily totals
function calculateDayTotal(day, nutrient) {
  const meals = ['breakfast', 'midMorningSnack', 'lunch', 'eveningSnack', 'dinner'];
  return meals.reduce((total, meal) => {
    return total + (day[meal]?.[nutrient] || 0);
  }, 0);
}

const getDietPlans = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const dietPlans = await DietPlan.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await DietPlan.countDocuments({ userId });

    res.json({
      success: true,
      dietPlans,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get diet plans error:', error);
    res.status(500).json({ 
      message: 'Error fetching diet plans', 
      error: error.message 
    });
  }
};

const getDietPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const dietPlan = await DietPlan.findOne({ _id: id, userId });

    if (!dietPlan) {
      return res.status(404).json({ message: 'Diet plan not found' });
    }

    res.json({
      success: true,
      dietPlan
    });
  } catch (error) {
    console.error('Get diet plan error:', error);
    res.status(500).json({ 
      message: 'Error fetching diet plan', 
      error: error.message 
    });
  }
};

const updateDietPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    const dietPlan = await DietPlan.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!dietPlan) {
      return res.status(404).json({ message: 'Diet plan not found' });
    }

    res.json({
      success: true,
      message: 'Diet plan updated successfully',
      dietPlan
    });
  } catch (error) {
    console.error('Update diet plan error:', error);
    res.status(500).json({ 
      message: 'Error updating diet plan', 
      error: error.message 
    });
  }
};

const deleteDietPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const dietPlan = await DietPlan.findOneAndDelete({ _id: id, userId });

    if (!dietPlan) {
      return res.status(404).json({ message: 'Diet plan not found' });
    }

    res.json({
      success: true,
      message: 'Diet plan deleted successfully'
    });
  } catch (error) {
    console.error('Delete diet plan error:', error);
    res.status(500).json({ 
      message: 'Error deleting diet plan', 
      error: error.message 
    });
  }
};

const addFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { rating, comment } = req.body;

    const dietPlan = await DietPlan.findOne({ _id: id, userId });

    if (!dietPlan) {
      return res.status(404).json({ message: 'Diet plan not found' });
    }

    dietPlan.feedback.push({
      date: new Date(),
      rating,
      comment
    });

    // Update adherence score based on feedback
    const avgRating = dietPlan.feedback.reduce((sum, f) => sum + f.rating, 0) / dietPlan.feedback.length;
    dietPlan.adherenceScore = Math.round(avgRating * 20); // Convert 5-star to 100-point scale

    await dietPlan.save();

    res.json({
      success: true,
      message: 'Feedback added successfully',
      dietPlan
    });
  } catch (error) {
    console.error('Add feedback error:', error);
    res.status(500).json({ 
      message: 'Error adding feedback', 
      error: error.message 
    });
  }
};

module.exports = {
  generateDietPlan,
  getDietPlans,
  getDietPlan,
  updateDietPlan,
  deleteDietPlan,
  addFeedback
};
