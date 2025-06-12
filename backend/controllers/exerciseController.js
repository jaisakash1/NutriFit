const ExercisePlan = require('../models/ExercisePlan');
const User = require('../models/User');
const GeminiAI = require('../utils/geminiAI');

const generateExercisePlan = async (req, res) => {
  try {
    // Validate user authentication
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const userId = req.user.id;
    const { planType = 'home', duration = 4 } = req.body; // Default to 4 weeks to match frontend

    // Validate input parameters
    if (!['home', 'gym', 'hybrid'].includes(planType)) {
      return res.status(400).json({ message: 'Invalid plan type. Must be home, gym, or hybrid' });
    }

    if (duration < 1 || duration > 12) {
      return res.status(400).json({ message: 'Duration must be between 1 and 12 weeks' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Validate user has required health profile
    if (!user.healthProfile) {
      return res.status(400).json({ message: 'User health profile not found. Please complete your profile first.' });
    }

    try {
      // Initialize GeminiAI and generate exercise plan
      const geminiAI = new GeminiAI();
      const aiPlan = await geminiAI.generateExercisePlan(user, planType);
      
      if (!aiPlan || !aiPlan.weeklySchedule) {
        throw new Error('Invalid AI response format');
      }
      console.log('AI Generated Plan:', JSON.stringify(aiPlan, null, 2));
      
      // Determine difficulty based on user's lifestyle and fitness goal
      let difficulty = 'beginner';
      if (user.healthProfile.lifestyle === 'very_active' || user.healthProfile.lifestyle === 'extremely_active') {
        difficulty = 'advanced';
      } else if (user.healthProfile.lifestyle === 'moderately_active') {
        difficulty = 'intermediate';
      }

      // Format the weekly schedule according to the schema
      const weeklySchedule = aiPlan.weeklySchedule.map(day => {
        // Format exercises according to exerciseSchema
        const formatExercise = (exercise, type = 'strength') => ({
          name: typeof exercise === 'string' ? exercise : exercise.name,
          description: typeof exercise === 'string' 
            ? `Perform ${exercise} with proper form` 
            : exercise.description || `Perform ${exercise.name} with proper form`,
          category: type,
          muscleGroups: day.focus ? [day.focus.toLowerCase()] : [],
          equipment: typeof exercise === 'string' ? ['bodyweight'] : (exercise.equipment || ['bodyweight']),
          difficulty: difficulty,
          duration: typeof exercise === 'string' ? 5 : (exercise.duration || 10),
          sets: typeof exercise === 'string' ? 3 : (parseInt(exercise.sets) || 3),
          reps: typeof exercise === 'string' ? '10-12' : (exercise.reps || '10-12'),
          restTime: typeof exercise === 'string' ? 60 : (parseInt(exercise.rest) || 60),
          caloriesBurn: 50,
          instructions: typeof exercise === 'string' 
            ? [`Perform ${exercise} with proper form`]
            : [
                `Perform ${exercise.sets || 3} sets of ${exercise.reps || '10-12'}`,
                `Rest ${exercise.rest || '60 seconds'} between sets`,
                'Maintain proper form throughout'
              ]
        });

        // Create workout session according to workoutSessionSchema
        const session = {
          day: day.day,
          sessionName: `${day.focus || 'Workout'} Session`,
          description: `Complete ${day.focus || 'workout'} session focusing on ${day.focus || 'full body'} exercises`,
          exercises: [],
          warmup: [],
          cooldown: [],
          totalDuration: 0,
          totalCaloriesBurn: 0
        };

        // Format main exercises
        if (day.workout && Array.isArray(day.workout.exercises)) {
          session.exercises = day.workout.exercises.map(ex => formatExercise(ex, 'strength'));
        }

        // Format warmup exercises
        if (day.warm_up && Array.isArray(day.warm_up.exercises)) {
          session.warmup = day.warm_up.exercises.map(ex => formatExercise(ex, 'cardio'));
        }

        // Format cooldown exercises
        if (day.cool_down && Array.isArray(day.cool_down.exercises)) {
          session.cooldown = day.cool_down.exercises.map(ex => formatExercise(ex, 'flexibility'));
        }

        // Calculate totals
        session.totalDuration = 
          (session.exercises.reduce((sum, ex) => sum + (ex.duration || 0), 0)) +
          (session.warmup.reduce((sum, ex) => sum + (ex.duration || 0), 0)) +
          (session.cooldown.reduce((sum, ex) => sum + (ex.duration || 0), 0));

        session.totalCaloriesBurn = 
          (session.exercises.reduce((sum, ex) => sum + (ex.caloriesBurn || 0), 0)) +
          (session.warmup.reduce((sum, ex) => sum + (ex.caloriesBurn || 0), 0)) +
          (session.cooldown.reduce((sum, ex) => sum + (ex.caloriesBurn || 0), 0));

        return session;
      });

      console.log('Formatted Weekly Schedule:', JSON.stringify(weeklySchedule, null, 2));

      // Create exercise plan document
      const exercisePlan = new ExercisePlan({
        userId,
        planName: `${planType.charAt(0).toUpperCase() + planType.slice(1)} Workout Plan - ${new Date().toLocaleDateString()}`,
        description: `AI-generated ${planType} exercise plan for ${user.healthProfile.fitnessGoal}`,
        planType,
        duration,
        targetGoal: mapFitnessGoalToTargetGoal(user.healthProfile.fitnessGoal),
        difficulty,
        weeklySchedule,
        generatedBy: 'AI',
        isActive: true,
        adherenceScore: 0
      });

      await exercisePlan.save();
      console.log('Saved Exercise Plan:', JSON.stringify(exercisePlan, null, 2));

      res.json({
        success: true,
        message: 'Exercise plan generated successfully',
        exercisePlan
      });
    } catch (aiError) {
      console.error('AI Generation error:', aiError);
      return res.status(500).json({ 
        message: 'Error generating exercise plan with AI',
        error: aiError.message
      });
    }
  } catch (error) {
    console.error('Generate exercise plan error:', error);
    res.status(500).json({ 
      message: 'Error in exercise plan generation process',
      error: error.message 
    });
  }
};

// Helper function to map fitness goals to valid target goals
function mapFitnessGoalToTargetGoal(fitnessGoal) {
  const goalMap = {
    'weight_loss': 'weight_loss',
    'muscle_gain': 'muscle_gain',
    'maintenance': 'endurance', // Map maintenance to endurance
    'endurance': 'endurance',
    'strength': 'strength',
    'flexibility': 'flexibility'
  };
  return goalMap[fitnessGoal.toLowerCase()] || 'endurance'; // Default to endurance if no match
}

const createPlan = async (req, res) => {
  try {
    const userId = req.user.id;
    const planData = req.body;

    // Create exercise plan document
    const exercisePlan = new ExercisePlan({
      userId,
      planName: planData.planName,
      description: planData.description,
      planType: planData.planType,
      duration: planData.duration,
      difficulty: planData.difficulty,
      weeklySchedule: planData.weeklySchedule.map(session => ({
        ...session,
        exercises: session.exercises.map(exercise => ({
          ...exercise,
          category: exercise.category || 'strength',
          difficulty: planData.difficulty
        }))
      })),
      generatedBy: 'user'
    });

    await exercisePlan.save();

    res.json({
      success: true,
      message: 'Custom exercise plan created successfully',
      exercisePlan
    });
  } catch (error) {
    console.error('Create exercise plan error:', error);
    res.status(500).json({ 
      message: 'Error creating exercise plan', 
      error: error.message 
    });
  }
};

const getExercisePlans = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const exercisePlans = await ExercisePlan.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await ExercisePlan.countDocuments({ userId });

    res.json({
      success: true,
      exercisePlans,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get exercise plans error:', error);
    res.status(500).json({ 
      message: 'Error fetching exercise plans', 
      error: error.message 
    });
  }
};

const getExercisePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    console.log('Fetching exercise plan with ID:', id);
    const exercisePlan = await ExercisePlan.findOne({ _id: id, userId });
    console.log('Retrieved exercise plan:', JSON.stringify(exercisePlan, null, 2));

    if (!exercisePlan) {
      console.log('Exercise plan not found');
      return res.status(404).json({ message: 'Exercise plan not found' });
    }

    res.json({
      success: true,
      exercisePlan
    });
  } catch (error) {
    console.error('Get exercise plan error:', error);
    res.status(500).json({ 
      message: 'Error fetching exercise plan', 
      error: error.message 
    });
  }
};

const updateExercisePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const updates = req.body;

    const exercisePlan = await ExercisePlan.findOneAndUpdate(
      { _id: id, userId },
      updates,
      { new: true, runValidators: true }
    );

    if (!exercisePlan) {
      return res.status(404).json({ message: 'Exercise plan not found' });
    }

    res.json({
      success: true,
      message: 'Exercise plan updated successfully',
      exercisePlan
    });
  } catch (error) {
    console.error('Update exercise plan error:', error);
    res.status(500).json({ 
      message: 'Error updating exercise plan', 
      error: error.message 
    });
  }
};

const deleteExercisePlan = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const exercisePlan = await ExercisePlan.findOneAndDelete({ _id: id, userId });

    if (!exercisePlan) {
      return res.status(404).json({ message: 'Exercise plan not found' });
    }

    res.json({
      success: true,
      message: 'Exercise plan deleted successfully'
    });
  } catch (error) {
    console.error('Delete exercise plan error:', error);
    res.status(500).json({ 
      message: 'Error deleting exercise plan', 
      error: error.message 
    });
  }
};

const logProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { completedExercises, totalExercises, feedback, rating } = req.body;

    const exercisePlan = await ExercisePlan.findOne({ _id: id, userId });

    if (!exercisePlan) {
      return res.status(404).json({ message: 'Exercise plan not found' });
    }

    exercisePlan.progress.push({
      date: new Date(),
      completedExercises: completedExercises || 0,
      totalExercises: totalExercises || 0,
      feedback,
      rating
    });

    // Calculate adherence score
    const completionRate = completedExercises / totalExercises;
    const avgRating = exercisePlan.progress.reduce((sum, p) => sum + (p.rating || 0), 0) / exercisePlan.progress.length;
    exercisePlan.adherenceScore = Math.round((completionRate * 0.7 + (avgRating / 5) * 0.3) * 100);

    await exercisePlan.save();

    res.json({
      success: true,
      message: 'Progress logged successfully',
      exercisePlan
    });
  } catch (error) {
    console.error('Log progress error:', error);
    res.status(500).json({ 
      message: 'Error logging progress', 
      error: error.message 
    });
  }
};

const getExerciseLibrary = async (req, res) => {
  try {
    const { category, equipment, difficulty, muscleGroup } = req.query;
    
    // This would typically fetch from a database of exercises
    // For now, return sample exercises
    const sampleExercises = [
      {
        name: 'Push-ups',
        category: 'strength',
        muscleGroups: ['chest', 'shoulders', 'triceps'],
        equipment: ['none'],
        difficulty: 'beginner',
        duration: 0,
        sets: 3,
        reps: '10-15',
        caloriesBurn: 50,
        instructions: [
          'Start in a plank position with hands slightly wider than shoulders',
          'Lower your body until chest nearly touches the floor',
          'Push back up to starting position',
          'Keep your body in a straight line throughout'
        ]
      },
      {
        name: 'Squats',
        category: 'strength',
        muscleGroups: ['quadriceps', 'glutes', 'hamstrings'],
        equipment: ['none'],
        difficulty: 'beginner',
        duration: 0,
        sets: 3,
        reps: '15-20',
        caloriesBurn: 60,
        instructions: [
          'Stand with feet shoulder-width apart',
          'Lower your body as if sitting back into a chair',
          'Keep chest up and knees behind toes',
          'Return to standing position'
        ]
      }
    ];

    let filteredExercises = sampleExercises;

    if (category) {
      filteredExercises = filteredExercises.filter(ex => ex.category === category);
    }
    if (difficulty) {
      filteredExercises = filteredExercises.filter(ex => ex.difficulty === difficulty);
    }
    if (equipment) {
      filteredExercises = filteredExercises.filter(ex => ex.equipment.includes(equipment));
    }
    if (muscleGroup) {
      filteredExercises = filteredExercises.filter(ex => ex.muscleGroups.includes(muscleGroup));
    }

    res.json({
      success: true,
      exercises: filteredExercises
    });
  } catch (error) {
    console.error('Get exercise library error:', error);
    res.status(500).json({ 
      message: 'Error fetching exercise library', 
      error: error.message 
    });
  }
};

module.exports = {
  generateExercisePlan,
  createPlan,
  getExercisePlans,
  getExercisePlan,
  updateExercisePlan,
  deleteExercisePlan,
  logProgress,
  getExerciseLibrary
};