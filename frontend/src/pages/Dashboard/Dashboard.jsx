import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Utensils, 
  Dumbbell, 
  Droplets, 
  Target,
  TrendingUp,
  Calendar,
  Bell,
  MessageSquare,
  Plus,
  Heart,
  Apple,
  Stethoscope,
  Pill,
  Carrot,
  Scale,
  Timer,
  Bed
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { healthAPI, dietAPI, exerciseAPI, reminderAPI } from '../../utils/api';
import StatCard from '../../components/UI/StatCard';
import Card from '../../components/UI/Card';
import Button from '../../components/UI/Button';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

// Background Icons Component
const BackgroundIcons = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-[0.07]">
    {/* Wellness Section */}
    <motion.div 
      className="absolute top-[15%] left-[8%] text-rose-400"
      animate={{ 
        y: [0, -10, 0],
        rotate: [0, 5, 0]
      }}
      transition={{ 
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <Heart size={40} />
    </motion.div>
    
    {/* Medical Section */}
    <motion.div 
      className="absolute top-[25%] right-[12%] text-blue-500"
      animate={{ 
        y: [0, 8, 0]
      }}
      transition={{ 
        duration: 7,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 1
      }}
    >
      <Stethoscope size={48} />
    </motion.div>
    
    {/* Nutrition Section */}
    <motion.div 
      className="absolute bottom-[30%] left-[15%] text-orange-400"
      animate={{ 
        y: [0, -8, 0]
      }}
      transition={{ 
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 2
      }}
    >
      <Carrot size={36} />
    </motion.div>
    
    {/* Medication Section */}
    <motion.div 
      className="absolute top-[45%] right-[18%] text-purple-400"
      animate={{ 
        y: [0, 6, 0]
      }}
      transition={{ 
        duration: 9,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 1.5
      }}
    >
      <Pill size={32} strokeWidth={1.5} />
    </motion.div>
    
    {/* Weight Management */}
    <motion.div 
      className="absolute bottom-[25%] right-[22%] text-emerald-500"
      animate={{ 
        y: [0, -6, 0]
      }}
      transition={{ 
        duration: 7,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 0.5
      }}
    >
      <Scale size={44} strokeWidth={1.5} />
    </motion.div>
    
    {/* Sleep Tracking */}
    <motion.div 
      className="absolute top-[35%] left-[20%] text-indigo-400"
      animate={{ 
        y: [0, 8, 0]
      }}
      transition={{ 
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 2.5
      }}
    >
      <Bed size={38} strokeWidth={1.5} />
    </motion.div>

    {/* Exercise Timer */}
    <motion.div 
      className="absolute bottom-[20%] left-[25%] text-cyan-500"
      animate={{ 
        y: [0, -8, 0]
      }}
      transition={{ 
        duration: 7,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 1.8
      }}
    >
      <Timer size={34} strokeWidth={1.5} />
    </motion.div>

    {/* Activity Tracking */}
    <motion.div 
      className="absolute top-[60%] right-[15%] text-teal-400"
      animate={{ 
        y: [0, 7, 0]
      }}
      transition={{ 
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 1.2
      }}
    >
      <Activity size={42} strokeWidth={1.5} />
    </motion.div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [todaysReminders, setTodaysReminders] = useState([]);
  const [recentPlans, setRecentPlans] = useState({ diet: [], exercise: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsRes, remindersRes, dietRes, exerciseRes] = await Promise.all([
        healthAPI.getDashboardStats(),
        reminderAPI.getTodaysReminders(),
        dietAPI.getPlans({ limit: 3 }),
        exerciseAPI.getPlans({ limit: 3 })
      ]);

      setStats(statsRes.data.stats);
      setTodaysReminders(remindersRes.data.reminders);
      setRecentPlans({
        diet: dietRes.data.dietPlans,
        exercise: exerciseRes.data.exercisePlans
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const quickUpdateWater = async (amount) => {
    try {
      const currentIntake = stats?.today?.waterIntake || 0;
      await healthAPI.updateTodaysRecord({
        waterIntake: currentIntake + amount
      });
      
      setStats(prev => ({
        ...prev,
        today: {
          ...prev.today,
          waterIntake: currentIntake + amount
        }
      }));
    } catch (error) {
      console.error('Error updating water intake:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <BackgroundIcons />
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    );
  }

  const waterProgress = stats?.today?.waterIntake ? (stats.today.waterIntake / 2000) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <BackgroundIcons />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            {format(new Date(), 'EEEE, MMMM do, yyyy')}
          </p>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatCard
            title="Today's Calories"
            value={stats?.today?.caloriesConsumed || 0}
            subtitle={`Target: ${stats?.profile?.dailyCalorieTarget || 0}`}
            icon={Utensils}
            color="green"
          />
          <StatCard
            title="Calories Burned"
            value={stats?.today?.caloriesBurned || 0}
            subtitle="Today's exercise"
            icon={Dumbbell}
            color="orange"
          />
          <StatCard
            title="Water Intake"
            value={`${stats?.today?.waterIntake || 0}ml`}
            subtitle="Target: 2000ml"
            icon={Droplets}
            color="blue"
          />
          <StatCard
            title="Current Weight"
            value={`${stats?.profile?.currentWeight || user?.healthProfile?.weight}kg`}
            subtitle={`Goal: ${stats?.profile?.targetWeight || 'Not set'}`}
            icon={Target}
            color="purple"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Water Intake Quick Action */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Water Intake</h3>
                  <Droplets className="w-6 h-6 text-blue-500" />
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>{stats?.today?.waterIntake || 0}ml</span>
                    <span>2000ml</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-400 to-blue-600 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(waterProgress, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button size="sm" onClick={() => quickUpdateWater(250)}>
                    +250ml
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => quickUpdateWater(500)}>
                    +500ml
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => quickUpdateWater(1000)}>
                    +1L
                  </Button>
                </div>
              </Card>
            </motion.div>

            {/* Recent Plans */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Your Plans</h3>
                  <div className="flex space-x-2">
                    <Link to="/diet">
                      <Button size="sm" variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Diet Plan
                      </Button>
                    </Link>
                    <Link to="/exercise">
                      <Button size="sm" variant="outline">
                        <Plus className="w-4 h-4 mr-2" />
                        Workout
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Diet Plans */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Utensils className="w-4 h-4 mr-2 text-green-500" />
                      Diet Plans
                    </h4>
                    {recentPlans.diet.length > 0 ? (
                      <div className="space-y-2">
                        {recentPlans.diet.map((plan) => (
                          <div key={plan._id} className="p-3 bg-gray-50 rounded-lg">
                            <p className="font-medium text-sm text-gray-900">{plan.planName}</p>
                            <p className="text-xs text-gray-600 mt-1">
                              {plan.targetCalories} calories/day
                            </p>
                            <div className="flex items-center mt-2">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-green-500 h-2 rounded-full"
                                  style={{ width: `${plan.adherenceScore || 0}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-600 ml-2">
                                {plan.adherenceScore || 0}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No diet plans yet</p>
                    )}
                  </div>

                  {/* Exercise Plans */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                      <Dumbbell className="w-4 h-4 mr-2 text-orange-500" />
                      Exercise Plans
                    </h4>
                    {recentPlans.exercise.length > 0 ? (
                      <div className="space-y-2">
                        {recentPlans.exercise.map((plan) => (
                          <div key={plan._id} className="p-3 bg-gray-50 rounded-lg">
                            <p className="font-medium text-sm text-gray-900">{plan.planName}</p>
                            <p className="text-xs text-gray-600 mt-1">
                              {plan.difficulty} • {plan.duration} weeks
                            </p>
                            <div className="flex items-center mt-2">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-orange-500 h-2 rounded-full"
                                  style={{ width: `${plan.adherenceScore || 0}%` }}
                                />
                              </div>
                              <span className="text-xs text-gray-600 ml-2">
                                {plan.adherenceScore || 0}%
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No exercise plans yet</p>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Today's Reminders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Today's Reminders</h3>
                  <Bell className="w-5 h-5 text-yellow-500" />
                </div>
                
                {todaysReminders.length > 0 ? (
                  <div className="space-y-3">
                    {todaysReminders.slice(0, 4).map((reminder) => (
                      <div key={reminder._id} className="flex items-center p-3 bg-yellow-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-sm text-gray-900">{reminder.title}</p>
                          <p className="text-xs text-gray-600">{reminder.time}</p>
                        </div>
                        <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      </div>
                    ))}
                    {todaysReminders.length > 4 && (
                      <Link to="/reminders">
                        <Button variant="ghost" size="sm" className="w-full">
                          View all reminders
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No reminders for today</p>
                )}
              </Card>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link to="/health">
                    <Button variant="outline" className="w-full justify-start">
                      <Activity className="w-4 h-4 mr-3" />
                      Log Health Data
                    </Button>
                  </Link>
                  <Link to="/chat">
                    <Button variant="outline" className="w-full justify-start">
                      <MessageSquare className="w-4 h-4 mr-3" />
                      Ask Health Assistant
                    </Button>
                  </Link>
                  <Link to="/reminders">
                    <Button variant="outline" className="w-full justify-start">
                      <Bell className="w-4 h-4 mr-3" />
                      Set Reminder
                    </Button>
                  </Link>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;