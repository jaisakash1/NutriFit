const User = require('../models/User');
const DietPlan = require('../models/DietPlan');
const ExercisePlan = require('../models/ExercisePlan');
const HealthRecord = require('../models/HealthRecord');
const Reminder = require('../models/Reminder');

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalDietPlans = await DietPlan.countDocuments();
    const totalExercisePlans = await ExercisePlan.countDocuments();
    const totalHealthRecords = await HealthRecord.countDocuments();

    // Get recent registrations (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const recentRegistrations = await User.countDocuments({
      createdAt: { $gte: weekAgo }
    });

    // Get user activity stats
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const activeInLast30Days = await User.countDocuments({
      lastLogin: { $gte: thirtyDaysAgo }
    });

    const stats = {
      users: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        recentRegistrations,
        activeInLast30Days
      },
      content: {
        dietPlans: totalDietPlans,
        exercisePlans: totalExercisePlans,
        healthRecords: totalHealthRecords
      },
      engagement: {
        avgDietPlansPerUser: totalUsers > 0 ? (totalDietPlans / totalUsers).toFixed(2) : 0,
        avgExercisePlansPerUser: totalUsers > 0 ? (totalExercisePlans / totalUsers).toFixed(2) : 0
      }
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Admin dashboard stats error:', error);
    res.status(500).json({ 
      message: 'Error fetching dashboard stats', 
      error: error.message 
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { search, isActive, role } = req.query;

    console.log('Fetching users with params:', { page, limit, search, isActive, role }); // Debug log

    let query = {};
    
    // Build search query
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Add filters
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    if (role) {
      query.role = role;
    }

    console.log('MongoDB query:', query); // Debug log

    // Fetch users with pagination
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await User.countDocuments(query);

    console.log(`Found ${users.length} users out of ${total} total`); // Debug log

    res.json({
      success: true,
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({ 
      message: 'Error fetching users', 
      error: error.message 
    });
  }
};

const getUserDetails = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching user details for ID:', id); // Debug log
    
    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get user's plans and records
    const [dietPlans, exercisePlans, healthRecords] = await Promise.all([
      DietPlan.find({ userId: id }).sort({ createdAt: -1 }).limit(5),
      ExercisePlan.find({ userId: id }).sort({ createdAt: -1 }).limit(5),
      HealthRecord.find({ userId: id }).sort({ date: -1 }).limit(10)
    ]);

    console.log(`Found ${dietPlans.length} diet plans, ${exercisePlans.length} exercise plans, ${healthRecords.length} health records`); // Debug log

    res.json({
      success: true,
      user,
      dietPlans,
      exercisePlans,
      healthRecords
    });
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ 
      message: 'Error fetching user details', 
      error: error.message 
    });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ 
      message: 'Error updating user status', 
      error: error.message 
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Delete user and all related data
    await User.findByIdAndDelete(id);
    await DietPlan.deleteMany({ userId: id });
    await ExercisePlan.deleteMany({ userId: id });
    await HealthRecord.deleteMany({ userId: id });
    await Reminder.deleteMany({ userId: id });

    res.json({
      success: true,
      message: 'User and all related data deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      message: 'Error deleting user', 
      error: error.message 
    });
  }
};

const getSystemHealth = async (req, res) => {
  try {
    const systemHealth = {
      database: {
        status: 'connected',
        collections: {
          users: await User.countDocuments(),
          dietPlans: await DietPlan.countDocuments(),
          exercisePlans: await ExercisePlan.countDocuments(),
          healthRecords: await HealthRecord.countDocuments(),
          reminders: await Reminder.countDocuments()
        }
      },
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version,
        environment: process.env.NODE_ENV
      },
      timestamp: new Date()
    };

    res.json({
      success: true,
      systemHealth
    });
  } catch (error) {
    console.error('System health check error:', error);
    res.status(500).json({ 
      message: 'Error checking system health', 
      error: error.message 
    });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 7);
    }

    // User growth
    const userGrowth = await User.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Popular fitness goals
    const fitnessGoals = await User.aggregate([
      {
        $group: {
          _id: "$healthProfile.fitnessGoal",
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Diet plan generation trends
    const dietPlanTrends = await DietPlan.aggregate([
      {
        $match: { createdAt: { $gte: startDate } }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const analytics = {
      userGrowth,
      fitnessGoals,
      dietPlanTrends,
      period
    };

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ 
      message: 'Error fetching analytics', 
      error: error.message 
    });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  updateUserStatus,
  deleteUser,
  getSystemHealth,
  getAnalytics
};