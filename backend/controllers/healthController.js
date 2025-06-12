const HealthRecord = require('../models/HealthRecord');
const User = require('../models/User');

const createHealthRecord = async (req, res) => {
  try {
    const userId = req.user.id;
    const recordData = { ...req.body, userId };

    // Check if record for today already exists
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existingRecord = await HealthRecord.findOne({
      userId,
      date: { $gte: today, $lt: tomorrow }
    });

    let healthRecord;

    if (existingRecord) {
      // Update existing record
      Object.assign(existingRecord, recordData);
      healthRecord = await existingRecord.save();
    } else {
      // Create new record
      healthRecord = new HealthRecord(recordData);
      await healthRecord.save();
    }

    res.status(201).json({
      success: true,
      message: 'Health record saved successfully',
      healthRecord
    });
  } catch (error) {
    console.error('Create health record error:', error);
    res.status(500).json({ 
      message: 'Error saving health record', 
      error: error.message 
    });
  }
};

const getHealthRecords = async (req, res) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, limit = 30 } = req.query;

    let query = { userId };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const healthRecords = await HealthRecord.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      healthRecords
    });
  } catch (error) {
    console.error('Get health records error:', error);
    res.status(500).json({ 
      message: 'Error fetching health records', 
      error: error.message 
    });
  }
};

const getTodaysRecord = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let healthRecord = await HealthRecord.findOne({
      userId,
      date: { $gte: today, $lt: tomorrow }
    });

    if (!healthRecord) {
      // Create a new record for today
      healthRecord = new HealthRecord({
        userId,
        date: new Date(),
        waterIntake: 0,
        caloriesConsumed: 0,
        caloriesBurned: 0,
        meals: [],
        exercises: []
      });
      await healthRecord.save();
    }

    res.json({
      success: true,
      healthRecord
    });
  } catch (error) {
    console.error('Get today\'s record error:', error);
    res.status(500).json({ 
      message: 'Error fetching today\'s record', 
      error: error.message 
    });
  }
};

const updateTodaysRecord = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let healthRecord = await HealthRecord.findOne({
      userId,
      date: { $gte: today, $lt: tomorrow }
    });

    if (!healthRecord) {
      healthRecord = new HealthRecord({
        userId,
        date: new Date(),
        ...updates
      });
    } else {
      Object.assign(healthRecord, updates);
    }

    await healthRecord.save();

    res.json({
      success: true,
      message: 'Today\'s record updated successfully',
      healthRecord
    });
  } catch (error) {
    console.error('Update today\'s record error:', error);
    res.status(500).json({ 
      message: 'Error updating today\'s record', 
      error: error.message 
    });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get recent records for calculations
    const recentRecords = await HealthRecord.find({ userId })
      .sort({ date: -1 })
      .limit(30);

    // Calculate stats
    const todayRecord = recentRecords.find(record => 
      record.date.toDateString() === new Date().toDateString()
    );

    const weekRecords = recentRecords.filter(record => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return record.date >= weekAgo;
    });

    const stats = {
      today: {
        waterIntake: todayRecord?.waterIntake || 0,
        caloriesConsumed: todayRecord?.caloriesConsumed || 0,
        caloriesBurned: todayRecord?.caloriesBurned || 0,
        mood: todayRecord?.mood || null,
        energyLevel: todayRecord?.energyLevel || null
      },
      weekly: {
        avgCaloriesConsumed: weekRecords.length > 0 
          ? Math.round(weekRecords.reduce((sum, r) => sum + (r.caloriesConsumed || 0), 0) / weekRecords.length)
          : 0,
        avgCaloriesBurned: weekRecords.length > 0
          ? Math.round(weekRecords.reduce((sum, r) => sum + (r.caloriesBurned || 0), 0) / weekRecords.length)
          : 0,
        totalWorkouts: weekRecords.reduce((sum, r) => sum + (r.exercises?.length || 0), 0)
      },
      profile: {
        currentWeight: recentRecords.find(r => r.weight)?.weight || user.healthProfile.weight,
        targetWeight: user.healthProfile.targetWeight || user.healthProfile.weight,
        bmi: user.healthProfile.bmi,
        dailyCalorieTarget: user.getDailyCalorieNeeds()
      }
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ 
      message: 'Error fetching dashboard stats', 
      error: error.message 
    });
  }
};

const getProgressChart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { metric = 'weight', days = 30 } = req.query;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const records = await HealthRecord.find({
      userId,
      date: { $gte: startDate },
      [metric]: { $exists: true, $ne: null }
    }).sort({ date: 1 });

    const chartData = records.map(record => ({
      date: record.date.toISOString().split('T')[0],
      value: record[metric]
    }));

    res.json({
      success: true,
      chartData,
      metric
    });
  } catch (error) {
    console.error('Get progress chart error:', error);
    res.status(500).json({ 
      message: 'Error fetching progress chart', 
      error: error.message 
    });
  }
};

module.exports = {
  createHealthRecord,
  getHealthRecords,
  getTodaysRecord,
  updateTodaysRecord,
  getDashboardStats,
  getProgressChart
};