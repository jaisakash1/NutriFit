const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiAI {
  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }
    try {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      console.log('GeminiAI initialized successfully');
    } catch (error) {
      console.error('Error initializing GeminiAI:', error);
      throw new Error('Failed to initialize GeminiAI');
    }
  }

  parseAIResponse(rawText) {
    try {
      if (!rawText) {
        throw new Error('Empty response from AI');
      }

      // Remove any markdown formatting or extra text
      const jsonStart = rawText.indexOf('{');
      const jsonEnd = rawText.lastIndexOf('}');
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error('No valid JSON found in response');
      }

      const jsonStr = rawText.substring(jsonStart, jsonEnd + 1);
      const parsed = JSON.parse(jsonStr);

      // Validate diet plan structure
      if (!parsed.weeklyPlan || !Array.isArray(parsed.weeklyPlan)) {
        throw new Error('Invalid diet plan format: missing or invalid weeklyPlan array');
      }

      // Validate shopping list
      if (!parsed.shoppingList || !Array.isArray(parsed.shoppingList)) {
        throw new Error('Invalid diet plan format: missing or invalid shoppingList array');
      }

      // Validate each day in the weekly plan has required meal types
      const requiredMealTypes = ['breakfast', 'lunch', 'dinner'];
      parsed.weeklyPlan.forEach((day, index) => {
        if (!day || typeof day !== 'object') {
          throw new Error(`Invalid day format at index ${index}`);
        }
        requiredMealTypes.forEach(mealType => {
          if (!day[mealType] || typeof day[mealType] !== 'object') {
            throw new Error(`Missing or invalid ${mealType} for day ${index + 1}`);
          }
        });
      });

      return parsed;
    } catch (error) {
      console.error('Error parsing AI response:', error);
      console.error('Raw text:', rawText);
      throw new Error(`Failed to parse AI response: ${error.message}`);
    }
  }

  parseExercisePlanResponse(rawText) {
    try {
      if (!rawText) {
        throw new Error('Empty response from AI');
      }

      // Remove any markdown formatting or extra text
      const jsonStart = rawText.indexOf('{');
      const jsonEnd = rawText.lastIndexOf('}');
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error('No valid JSON found in response');
      }

      const jsonStr = rawText.substring(jsonStart, jsonEnd + 1);
      const parsed = JSON.parse(jsonStr);

      // Validate exercise plan structure
      if (!parsed.weeklySchedule || !Array.isArray(parsed.weeklySchedule)) {
        throw new Error('Invalid exercise plan format: missing or invalid weeklySchedule array');
      }

      // Ensure we have 7 days
      if (parsed.weeklySchedule.length !== 7) {
        throw new Error('Exercise plan must contain exactly 7 days');
      }

      // Validate and sanitize each day in the schedule
      parsed.weeklySchedule = parsed.weeklySchedule.map((day, index) => {
        if (!day || typeof day !== 'object') {
          throw new Error(`Invalid day format at index ${index}`);
        }

        // Ensure day has required sections
        const sections = ['warm_up', 'workout', 'cool_down'];
        sections.forEach(section => {
          if (!day[section]) {
            day[section] = { exercises: [] };
          }
          if (!day[section].exercises || !Array.isArray(day[section].exercises)) {
            day[section].exercises = [];
          }
        });

        // Sanitize warm-up exercises
        day.warm_up.exercises = day.warm_up.exercises.map(exercise => ({
          name: exercise.name || 'Warm-up Exercise',
          duration: exercise.duration || 5,
          description: exercise.description || 'Perform this warm-up exercise carefully',
        }));

        // Sanitize workout exercises
        day.workout.exercises = day.workout.exercises.map(exercise => ({
          name: exercise.name || 'Workout Exercise',
          sets: exercise.sets || 3,
          reps: exercise.reps || '12-15',
          rest: exercise.rest || 60,
          equipment: Array.isArray(exercise.equipment) ? exercise.equipment : [],
          description: exercise.description || 'Perform this exercise with proper form',
        }));

        // Sanitize cool-down exercises
        day.cool_down.exercises = day.cool_down.exercises.map(exercise => ({
          name: exercise.name || 'Cool-down Exercise',
          duration: exercise.duration || 5,
          description: exercise.description || 'Perform this cool-down exercise gently',
        }));

        // Ensure day has a focus
        if (!day.focus) {
          day.focus = `Day ${index + 1} Workout`;
        }

        return day;
      });

      return parsed;
    } catch (error) {
      console.error('Error parsing exercise plan response:', error);
      console.error('Raw text:', rawText);
      throw new Error(`Failed to parse exercise plan response: ${error.message}`);
    }
  }

  async generateDietPlan(userProfile, preferences = {}) {
    try {
      if (!userProfile || !userProfile.healthProfile) {
        throw new Error('Invalid user profile data');
      }

      const { healthProfile } = userProfile;

      // Validate required health profile fields
      const requiredFields = ['age', 'gender', 'weight', 'height', 'fitnessGoal', 'lifestyle'];
      for (const field of requiredFields) {
        if (!healthProfile[field]) {
          throw new Error(`Missing required health profile field: ${field}`);
        }
      }

      const dailyCalories = userProfile.getDailyCalorieNeeds();
      if (!dailyCalories) {
        throw new Error('Failed to calculate daily calorie needs');
      }

      const prompt = `
Generate a 7-day diet plan as a JSON object with this exact structure. DO NOT include any markdown formatting or additional text, ONLY the JSON object:
{
  "weeklyPlan": [
    {
      "day": 1,
      "breakfast": {
        "name": "string",
        "description": "string",
        "calories": number,
        "protein": number,
        "carbs": number,
        "fat": number,
        "ingredients": ["string"],
        "instructions": ["string"]
      },
      "midMorningSnack": { same structure as breakfast },
      "lunch": { same structure as breakfast },
      "eveningSnack": { same structure as breakfast },
      "dinner": { same structure as breakfast }
    }
  ],
  "shoppingList": [
    {
      "item": "string",
      "quantity": "string",
      "category": "string",
      "estimatedPrice": number
    }
  ]
}

User Profile:
- Age: ${healthProfile.age}
- Gender: ${healthProfile.gender}
- Weight: ${healthProfile.weight}kg
- Height: ${healthProfile.height}cm
- BMI: ${(healthProfile.bmi || 0).toFixed(1)}
- Fitness Goal: ${healthProfile.fitnessGoal}
- Lifestyle: ${healthProfile.lifestyle}
- Health Conditions: ${healthProfile.healthConditions?.join(', ') || 'None'}
- Dietary Restrictions: ${healthProfile.dietaryRestrictions?.join(', ') || 'None'}
- Budget: ${healthProfile.budget}
- Daily Calorie Target: ${dailyCalories}

Requirements:
1. Each meal must include exact macronutrient values
2. Daily total should be close to ${dailyCalories} calories
3. Protein should be around ${Math.round(healthProfile.weight * 1.6)}g per day
4. Include healthy recipes suitable for ${healthProfile.budget} budget
5. Consider all dietary restrictions and health conditions
6. Include both Indian and international cuisine options
7. Shopping list should be categorized (Produce, Proteins, Dairy, etc.)
8. Include realistic estimated prices in shopping list
9. RESPOND ONLY WITH THE JSON OBJECT, NO ADDITIONAL TEXT OR FORMATTING`;

      console.log('Sending diet plan generation prompt to Gemini...');
      const result = await this.model.generateContent(prompt);
      if (!result || !result.response) {
        throw new Error('No response received from Gemini AI');
      }

      const response = await result.response;
      const rawText = await response.text();

      console.log('Raw Gemini Response (diet):', rawText.substring(0, 500) + '...');

      const parsedPlan = this.parseAIResponse(rawText);

      // Add metadata to the plan
      return {
        ...parsedPlan,
        planName: `${healthProfile.fitnessGoal} Diet Plan`,
        description: `Personalized ${dailyCalories} calorie diet plan for ${healthProfile.fitnessGoal}`,
        targetCalories: dailyCalories,
        targetProtein: Math.round(healthProfile.weight * 1.6),
        targetCarbs: Math.round((dailyCalories * 0.5) / 4), // 50% of calories from carbs
        targetFat: Math.round((dailyCalories * 0.25) / 9), // 25% of calories from fat
        duration: 7,
        createdAt: new Date(),
        adherenceScore: 0
      };
    } catch (error) {
      console.error('Error generating diet plan:', error);
      throw new Error('Failed to generate diet plan');
    }
  }

  async generateExercisePlan(userProfile, planType = 'home') {
    try {
      if (!userProfile || !userProfile.healthProfile) {
        throw new Error('Invalid user profile data');
      }

      const { healthProfile } = userProfile;

      // Validate required health profile fields
      const requiredFields = ['age', 'gender', 'weight', 'height', 'fitnessGoal', 'lifestyle'];
      for (const field of requiredFields) {
        if (!healthProfile[field]) {
          throw new Error(`Missing required health profile field: ${field}`);
        }
      }

      const prompt = `
Generate a detailed 7-day exercise plan as a JSON object. The plan should be appropriate for a ${healthProfile.age}-year-old ${healthProfile.gender.toLowerCase()} with a ${healthProfile.lifestyle.toLowerCase()} lifestyle, focusing on ${healthProfile.fitnessGoal.toLowerCase()}.

Required JSON structure:
{
  "weeklySchedule": [
    {
      "day": "Monday",
      "focus": "Upper Body",
      "warm_up": {
        "exercises": [
          {
            "name": "Arm Circles",
            "duration": 5,
            "description": "Make circular motions with arms, both forward and backward"
          }
        ]
      },
      "workout": {
        "exercises": [
          {
            "name": "Push-ups",
            "sets": 3,
            "reps": "10-12",
            "rest": 60,
            "equipment": ["none"],
            "description": "Keep body straight, lower chest to ground, push back up"
          }
        ]
      },
      "cool_down": {
        "exercises": [
          {
            "name": "Upper Body Stretch",
            "duration": 5,
            "description": "Gentle stretching for arms and shoulders"
          }
        ]
      }
    }
  ]
}

Requirements:
1. Create exactly 7 days of workouts
2. Each day MUST have warm_up, workout, and cool_down sections
3. Each exercise MUST include all fields shown in the example
4. For ${planType} workouts, only include equipment that would be available
5. Consider the user's health conditions: ${healthProfile.healthConditions?.join(', ') || 'None'}
6. Include proper rest periods between exercises
7. Provide clear, detailed descriptions for proper form
8. Adjust intensity based on fitness goal: ${healthProfile.fitnessGoal}
9. RESPOND ONLY WITH THE JSON OBJECT, NO ADDITIONAL TEXT

Important:
- Warm-up exercises should be 5-10 minutes each
- Rest periods should be 45-90 seconds
- Cool-down exercises should be 5-10 minutes each
- Include a mix of exercises targeting different muscle groups
- Keep exercises appropriate for ${healthProfile.lifestyle} lifestyle`;

      console.log('Sending exercise plan generation prompt to Gemini...');
      const result = await this.model.generateContent(prompt);
      if (!result || !result.response) {
        throw new Error('No response received from Gemini AI');
      }

      const response = await result.response;
      const rawText = await response.text();

      console.log('Raw Gemini Response (exercise):', rawText.substring(0, 500) + '...');

      const parsedPlan = this.parseExercisePlanResponse(rawText);

      // Add metadata to the plan
      return {
        ...parsedPlan,
        planName: `${healthProfile.fitnessGoal} Exercise Plan`,
        description: `Personalized ${planType} workout plan for ${healthProfile.fitnessGoal}`,
        planType,
        duration: 7,
        createdAt: new Date(),
        completionRate: 0,
        difficulty: this.calculateDifficulty(healthProfile),
        estimatedTimePerDay: this.calculateWorkoutTime(parsedPlan)
      };
    } catch (error) {
      console.error('Error generating exercise plan:', error);
      throw new Error(`Failed to generate exercise plan: ${error.message}`);
    }
  }

  calculateDifficulty(healthProfile) {
    // Calculate difficulty based on fitness goal and lifestyle
    const difficultyMap = {
      'Weight Loss': 'Moderate',
      'Muscle Gain': 'Challenging',
      'General Fitness': 'Moderate',
      'Endurance': 'Moderate',
      'Strength': 'Challenging'
    };
    return difficultyMap[healthProfile.fitnessGoal] || 'Moderate';
  }

  calculateWorkoutTime(plan) {
    // Calculate estimated workout time in minutes
    if (!plan.weeklySchedule?.[0]) return 45; // Default 45 minutes

    const day = plan.weeklySchedule[0];
    let totalTime = 0;

    // Add warm-up time
    totalTime += day.warm_up.exercises.reduce((sum, ex) => sum + (ex.duration || 5), 0);

    // Add workout time (assuming 1 minute per set plus rest time)
    totalTime += day.workout.exercises.reduce((sum, ex) => {
      return sum + ((ex.sets || 3) * 1) + ((ex.sets - 1) * (ex.rest / 60));
    }, 0);

    // Add cool-down time
    totalTime += day.cool_down.exercises.reduce((sum, ex) => sum + (ex.duration || 5), 0);

    return Math.round(totalTime);
  }

  async generateChatResponse(query, userContext) {
    try {
      const { healthProfile } = userContext;

      const prompt = `
You are a professional health and fitness AI assistant. Provide helpful, concise advice.

Context about the user:
Age: ${healthProfile?.age || 'N/A'}
Gender: ${healthProfile?.gender || 'N/A'}
Weight: ${healthProfile?.weight ? healthProfile.weight + 'kg' : 'N/A'}
Height: ${healthProfile?.height ? healthProfile.height + 'cm' : 'N/A'}
Goals: ${healthProfile?.fitnessGoal || 'N/A'}
Health Conditions: ${healthProfile?.healthConditions?.join(', ') || 'None'}
Diet: ${healthProfile?.dietaryRestrictions?.join(', ') || 'None'}

User Query: ${query}

Response Requirements:
1. Be concise and direct
2. Focus on actionable advice
3. Consider user's health profile
4. Keep response under 150 words
5. Use bullet points for lists
6. Include specific numbers when relevant
7. Maintain a friendly, professional tone

Respond in a natural, conversational way while keeping the response focused and practical.`;

      console.log('Sending prompt to Gemini:', prompt);
      
      const result = await this.model.generateContent(prompt);
      if (!result || !result.response) {
        throw new Error('No response received from Gemini AI');
      }
      
      const response = await result.response;
      const text = await response.text();
      
      console.log('Received response from Gemini:', text.substring(0, 100) + '...');
      
      return text;
    } catch (error) {
      console.error('Error in generateChatResponse:', error);
      throw new Error(`Failed to generate response: ${error.message}`);
    }
  }
}

// Export the class instead of an instance
module.exports = GeminiAI;
