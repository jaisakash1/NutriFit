import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Heart, 
  Droplets, 
  Scale, 
  TrendingUp,
  Calendar,
  Plus,
  Edit,
  Save,
  BarChart3,
  Target,
  Moon,
  Zap,
  Smile,
  Battery,
  ThermometerSun,
  ArrowUp,
  ArrowDown,
  Info
} from 'lucide-react';
import { healthAPI } from '../../utils/api';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import StatCard from '../../components/UI/StatCard';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { format, subDays, isSameDay } from 'date-fns';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Area,
  AreaChart,
  ComposedChart,
  Legend
} from 'recharts';

// Custom components
const ProgressRing = ({ progress, size = 80, strokeWidth = 8, color = 'blue' }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        <circle
          className="text-gray-200"
          strokeWidth={strokeWidth}
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className={`text-${color}-500 transition-all duration-1000 ease-in-out`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold">{Math.round(progress)}%</span>
      </div>
    </div>
  );
};

const WaterBottleProgress = ({ progress, onClick }) => {
  const waveOffset = 100 - Math.min(progress, 100);
  
  return (
    <div 
      className="relative w-16 h-32 bg-blue-50 rounded-full mx-auto cursor-pointer transform hover:scale-105 transition-transform"
      onClick={onClick}
    >
      <div 
        className="absolute bottom-0 left-0 right-0 bg-blue-500 rounded-b-full transition-all duration-500 ease-in-out overflow-hidden"
        style={{ height: `${Math.min(progress, 100)}%` }}
      >
        <div className="absolute inset-0 opacity-30">
          <div className="relative h-full">
            <div className="absolute inset-0 animate-wave" 
              style={{
                backgroundImage: 'linear-gradient(to bottom, transparent 50%, rgba(255,255,255,0.5) 50%)',
                backgroundSize: '20px 20px',
                animation: 'wave 10s linear infinite',
                top: `${waveOffset}%`
              }}
            />
          </div>
        </div>
      </div>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
        {Math.round(progress)}%
      </div>
    </div>
  );
};

const HealthInsight = ({ title, value, target, icon: Icon, color, trend }) => {
  const percentage = (value / target) * 100;
  const isGood = percentage >= 80;
  
  return (
    <div className="p-3 bg-white rounded-lg shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center">
          <Icon className={`w-4 h-4 mr-2 text-${color}-500`} />
          <span className="text-sm font-medium text-gray-600">{title}</span>
        </div>
        {trend && (
          <span className={`flex items-center text-xs font-medium ${
            trend > 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {trend > 0 ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <div className="text-lg font-bold">{value}</div>
          <div className="text-xs text-gray-500">Target: {target}</div>
        </div>
        <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          isGood ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {isGood ? 'On Track' : 'Need Focus'}
        </div>
      </div>
    </div>
  );
};

const HealthDashboard = () => {
  const [todaysRecord, setTodaysRecord] = useState(null);
  const [recentRecords, setRecentRecords] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    weight: '',
    waterIntake: '',
    caloriesConsumed: '',
    caloriesBurned: '',
    sleepHours: '',
    mood: '',
    energyLevel: '',
    stressLevel: '',
    notes: ''
  });

  const [selectedMetric, setSelectedMetric] = useState('weight');
  const [comparisonData, setComparisonData] = useState(null);
  const [insights, setInsights] = useState(null);

  useEffect(() => {
    loadHealthData();
    loadComparisonData();
    loadInsights();
  }, []);

  const loadHealthData = async () => {
    try {
      const [todayRes, recordsRes, chartRes] = await Promise.all([
        healthAPI.getTodaysRecord(),
        healthAPI.getRecords({ limit: 7 }),
        healthAPI.getProgressChart({ metric: 'weight', days: 30 })
      ]);

      setTodaysRecord(todayRes.data.healthRecord);
      setRecentRecords(recordsRes.data.healthRecords);
      setChartData(chartRes.data.chartData);

      // Set form data from today's record
      const record = todayRes.data.healthRecord;
      setFormData({
        weight: record.weight || '',
        waterIntake: record.waterIntake || '',
        caloriesConsumed: record.caloriesConsumed || '',
        caloriesBurned: record.caloriesBurned || '',
        sleepHours: record.sleepHours || '',
        mood: record.mood || '',
        energyLevel: record.energyLevel || '',
        stressLevel: record.stressLevel || '',
        notes: record.notes || ''
      });
    } catch (error) {
      console.error('Error loading health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadComparisonData = async () => {
    try {
      const response = await healthAPI.getComparison();
      setComparisonData(response.data);
    } catch (error) {
      console.error('Error loading comparison data:', error);
    }
  };

  const loadInsights = async () => {
    try {
      const response = await healthAPI.getInsights();
      setInsights(response.data);
    } catch (error) {
      console.error('Error loading insights:', error);
    }
  };

  const saveRecord = async () => {
    try {
      const dataToSave = {};
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '') {
          if (['weight', 'waterIntake', 'caloriesConsumed', 'caloriesBurned', 'sleepHours', 'energyLevel', 'stressLevel'].includes(key)) {
            dataToSave[key] = parseFloat(formData[key]) || 0;
          } else {
            dataToSave[key] = formData[key];
          }
        }
      });

      await healthAPI.updateTodaysRecord(dataToSave);
      toast.success('Health record updated successfully!');
      setEditing(false);
      loadHealthData();
    } catch (error) {
      toast.error('Failed to update health record');
    }
  };

  const quickUpdateWater = async (amount) => {
    try {
      const currentIntake = todaysRecord?.waterIntake || 0;
      const newIntake = currentIntake + amount;
      
      await healthAPI.updateTodaysRecord({ waterIntake: newIntake });
      setTodaysRecord(prev => ({ ...prev, waterIntake: newIntake }));
      setFormData(prev => ({ ...prev, waterIntake: newIntake }));
      toast.success(`Added ${amount}ml water!`);
    } catch (error) {
      toast.error('Failed to update water intake');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your health data..." />
      </div>
    );
  }

  const waterProgress = todaysRecord?.waterIntake ? (todaysRecord.waterIntake / 2000) * 100 : 0;
  const calorieProgress = todaysRecord?.caloriesConsumed && todaysRecord?.caloriesBurned 
    ? ((todaysRecord.caloriesBurned / todaysRecord.caloriesConsumed) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50 py-4">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Header with Health Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-start mb-4"
        >
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <Activity className="w-6 h-6 mr-2 text-blue-500" />
              Health Dashboard
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Your personal health metrics and insights
            </p>
          </div>
          <div className="text-center">
            <div className="bg-white p-3 rounded-lg shadow-sm">
              <div className="text-xs font-medium text-gray-600 mb-1">Health Score</div>
              <ProgressRing progress={85} color="green" />
            </div>
          </div>
        </motion.div>

        {/* Quick Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4"
        >
          <StatCard
            title="Weight Trend"
            value={todaysRecord?.weight ? `${todaysRecord.weight}kg` : 'Not logged'}
            trend={-0.5}
            icon={Scale}
            color="purple"
          />
          <StatCard
            title="Hydration"
            value={`${todaysRecord?.waterIntake || 0}ml`}
            progress={waterProgress}
            icon={Droplets}
            color="blue"
          />
          <StatCard
            title="Energy Balance"
            value={`${todaysRecord?.caloriesConsumed || 0} cal`}
            subtitle={`Burned: ${todaysRecord?.caloriesBurned || 0} cal`}
            icon={Zap}
            color="orange"
          />
          <StatCard
            title="Sleep Quality"
            value={todaysRecord?.sleepHours ? `${todaysRecord.sleepHours}h` : 'Not logged'}
            rating={4.5}
            icon={Moon}
            color="indigo"
          />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-4">
            {/* Interactive Water Tracking */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="text-base font-semibold text-gray-900">Hydration Tracking</h3>
                    <p className="text-xs text-gray-600">Daily goal: 2000ml</p>
                  </div>
                  <Droplets className="w-5 h-5 text-blue-500" />
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <WaterBottleProgress 
                    progress={waterProgress} 
                    onClick={() => quickUpdateWater(250)}
                  />
                  <div className="flex flex-col space-y-2">
                    <Button size="xs" onClick={() => quickUpdateWater(250)}>
                      <Plus className="w-3 h-3 mr-1" /> 250ml
                    </Button>
                    <Button size="xs" variant="secondary" onClick={() => quickUpdateWater(500)}>
                      <Plus className="w-3 h-3 mr-1" /> 500ml
                    </Button>
                    <Button size="xs" variant="outline" onClick={() => quickUpdateWater(1000)}>
                      <Plus className="w-3 h-3 mr-1" /> 1000ml
                    </Button>
                  </div>
                </div>

                {/* Hourly Water Intake Chart */}
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { hour: '6AM', amount: 250 },
                      { hour: '8AM', amount: 500 },
                      { hour: '10AM', amount: 250 },
                      { hour: '12PM', amount: 500 },
                      { hour: '2PM', amount: 250 },
                      { hour: '4PM', amount: 0 },
                      { hour: '6PM', amount: 0 },
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="amount" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>

            {/* Health Metrics Dashboard */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-semibold text-gray-900">Health Metrics</h3>
                  <div className="flex space-x-1">
                    <Button 
                      size="xs" 
                      variant={selectedMetric === 'weight' ? 'default' : 'outline'}
                      onClick={() => setSelectedMetric('weight')}
                    >
                      Weight
                    </Button>
                    <Button 
                      size="xs" 
                      variant={selectedMetric === 'calories' ? 'default' : 'outline'}
                      onClick={() => setSelectedMetric('calories')}
                    >
                      Calories
                    </Button>
                    <Button 
                      size="xs" 
                      variant={selectedMetric === 'sleep' ? 'default' : 'outline'}
                      onClick={() => setSelectedMetric('sleep')}
                    >
                      Sleep
                    </Button>
                  </div>
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => format(new Date(value), 'MMM dd')}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => format(new Date(value), 'MMM dd, yyyy')}
                      />
                      <Legend />
                      {selectedMetric === 'weight' && (
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          name="Weight (kg)"
                          stroke="#8B5CF6" 
                          strokeWidth={2}
                          dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                        />
                      )}
                      {selectedMetric === 'calories' && (
                        <>
                          <Bar dataKey="caloriesConsumed" name="Calories In" fill="#10B981" />
                          <Bar dataKey="caloriesBurned" name="Calories Out" fill="#EF4444" />
                        </>
                      )}
                      {selectedMetric === 'sleep' && (
                        <Area
                          type="monotone"
                          dataKey="sleepHours"
                          name="Sleep (hours)"
                          fill="#6366F1"
                          stroke="#4F46E5"
                          fillOpacity={0.3}
                        />
                      )}
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>

            {/* Wellness Radar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-900">Wellness Overview</h3>
                  <Info className="w-4 h-4 text-gray-400" />
                </div>

                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={[
                      {
                        metric: 'Energy',
                        value: todaysRecord?.energyLevel || 0,
                        fullMark: 10
                      },
                      {
                        metric: 'Sleep',
                        value: todaysRecord?.sleepHours || 0,
                        fullMark: 10
                      },
                      {
                        metric: 'Mood',
                        value: todaysRecord?.mood === 'excellent' ? 10 : 
                               todaysRecord?.mood === 'good' ? 8 :
                               todaysRecord?.mood === 'average' ? 6 :
                               todaysRecord?.mood === 'poor' ? 4 : 2,
                        fullMark: 10
                      },
                      {
                        metric: 'Stress',
                        value: 10 - (todaysRecord?.stressLevel || 0),
                        fullMark: 10
                      },
                      {
                        metric: 'Hydration',
                        value: waterProgress / 10,
                        fullMark: 10
                      }
                    ]}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <PolarRadiusAxis angle={30} domain={[0, 10]} />
                      <Radar
                        name="Today"
                        dataKey="value"
                        stroke="#8B5CF6"
                        fill="#8B5CF6"
                        fillOpacity={0.6}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Today's Insights */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-900">Today's Insights</h3>
                  <TrendingUp className="w-4 h-4 text-green-500" />
                </div>

                <div className="space-y-3">
                  <HealthInsight
                    title="Daily Steps"
                    value="8,432"
                    target="10,000"
                    icon={Activity}
                    color="green"
                    trend={5}
                  />
                  <HealthInsight
                    title="Active Minutes"
                    value="45"
                    target="60"
                    icon={Zap}
                    color="orange"
                    trend={-10}
                  />
                  <HealthInsight
                    title="Heart Rate"
                    value="68"
                    target="70"
                    icon={Heart}
                    color="red"
                    trend={-2}
                  />
                </div>
              </Card>
            </motion.div>

            {/* Quick Add Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-900">Quick Add</h3>
                  <Plus className="w-4 h-4 text-gray-400" />
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                      placeholder="70.5"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Calories Consumed
                    </label>
                    <input
                      type="number"
                      value={formData.caloriesConsumed}
                      onChange={(e) => setFormData({ ...formData, caloriesConsumed: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                      placeholder="2000"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Calories Burned
                    </label>
                    <input
                      type="number"
                      value={formData.caloriesBurned}
                      onChange={(e) => setFormData({ ...formData, caloriesBurned: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                      placeholder="500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Sleep Hours
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.sleepHours}
                      onChange={(e) => setFormData({ ...formData, sleepHours: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                      placeholder="8"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Mood
                    </label>
                    <select
                      value={formData.mood}
                      onChange={(e) => setFormData({ ...formData, mood: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                    >
                      <option value="">Select mood</option>
                      <option value="excellent">Excellent</option>
                      <option value="good">Good</option>
                      <option value="average">Average</option>
                      <option value="poor">Poor</option>
                      <option value="terrible">Terrible</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Energy Level (1-10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.energyLevel}
                      onChange={(e) => setFormData({ ...formData, energyLevel: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                      placeholder="7"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Stress Level (1-10)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.stressLevel}
                      onChange={(e) => setFormData({ ...formData, stressLevel: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                      placeholder="3"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                      rows="3"
                      placeholder="How are you feeling today?"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mt-3">
                  <Button onClick={saveRecord} className="w-full">
                    <Save className="w-5 h-5 mr-2" />
                    Save Today's Data
                  </Button>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

const HealthPage = () => {
  return (
    <Routes>
      <Route index element={<HealthDashboard />} />
    </Routes>
  );
};

export default HealthPage;