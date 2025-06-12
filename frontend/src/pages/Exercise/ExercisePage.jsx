import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Dumbbell, 
  Calendar, 
  Clock, 
  Target,
  Star,
  Users,
  Trash2,
  Edit,
  Eye,
  Play,
  CheckCircle,
  TrendingUp,
  X,
  Save,
  Weight,
  Timer,
  Footprints,
  Bike,
  Medal,
  HeartPulse,
  Gauge,
  Shirt
} from 'lucide-react';
import { exerciseAPI } from '../../utils/api';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

// Background Icons Component
const BackgroundIcons = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-[0.04]">
    {/* Strength Training */}
    <motion.div 
      className="absolute top-[12%] left-[8%] text-orange-600"
      animate={{ 
        y: [0, -15, 0]
      }}
      transition={{ 
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <Dumbbell size={52} strokeWidth={1.5} />
    </motion.div>
    
    {/* Weight Training */}
    <motion.div 
      className="absolute top-[30%] right-[12%] text-blue-600"
      animate={{ 
        y: [0, 12, 0]
      }}
      transition={{ 
        duration: 7,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 1
      }}
    >
      <Weight size={48} strokeWidth={1.5} />
    </motion.div>
    
    {/* Timer */}
    <motion.div 
      className="absolute bottom-[35%] left-[15%] text-purple-500"
      animate={{ 
        y: [0, -12, 0]
      }}
      transition={{ 
        duration: 9,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 2
      }}
    >
      <Timer size={44} strokeWidth={1.5} />
    </motion.div>
    
    {/* Running */}
    <motion.div 
      className="absolute top-[45%] right-[18%] text-green-500"
      animate={{ 
        y: [0, 10, 0]
      }}
      transition={{ 
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 1.5
      }}
    >
      <Footprints size={46} strokeWidth={1.5} />
    </motion.div>
    
    {/* Cycling */}
    <motion.div 
      className="absolute bottom-[25%] right-[22%] text-cyan-600"
      animate={{ 
        y: [0, -10, 0]
      }}
      transition={{ 
        duration: 7,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 0.5
      }}
    >
      <Bike size={50} strokeWidth={1.5} />
    </motion.div>
    
    {/* Achievement */}
    <motion.div 
      className="absolute top-[35%] left-[20%] text-yellow-500"
      animate={{ 
        y: [0, 15, 0]
      }}
      transition={{ 
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 2.5
      }}
    >
      <Medal size={42} strokeWidth={1.5} />
    </motion.div>

    {/* Heart Rate */}
    <motion.div 
      className="absolute bottom-[20%] left-[25%] text-red-500"
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
      <HeartPulse size={44} strokeWidth={1.5} />
    </motion.div>

    {/* Performance */}
    <motion.div 
      className="absolute top-[60%] right-[15%] text-emerald-500"
      animate={{ 
        y: [0, 12, 0]
      }}
      transition={{ 
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 1.2
      }}
    >
      <Gauge size={46} strokeWidth={1.5} />
    </motion.div>

    {/* Sportswear */}
    <motion.div 
      className="absolute top-[20%] left-[30%] text-indigo-500"
      animate={{ 
        y: [0, -10, 0]
      }}
      transition={{ 
        duration: 9,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 0.8
      }}
    >
      <Shirt size={40} strokeWidth={1.5} />
    </motion.div>
  </div>
);

const CreateCustomPlanModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    planName: '',
    description: '',
    planType: 'home',
    duration: 4,
    difficulty: 'beginner',
    weeklySchedule: []
  });

  const [currentSession, setCurrentSession] = useState({
    day: '',
    sessionName: '',
    description: '',
    exercises: []
  });

  const [currentExercise, setCurrentExercise] = useState({
    name: '',
    description: '',
    sets: 3,
    reps: '12',
    duration: 0,
    equipment: []
  });

  const addExercise = () => {
    setCurrentSession(prev => ({
      ...prev,
      exercises: [...prev.exercises, { ...currentExercise }]
    }));
    setCurrentExercise({
      name: '',
      description: '',
      sets: 3,
      reps: '12',
      duration: 0,
      equipment: []
    });
  };

  const addSession = () => {
    setFormData(prev => ({
      ...prev,
      weeklySchedule: [...prev.weeklySchedule, { ...currentSession }]
    }));
    setCurrentSession({
      day: '',
      sessionName: '',
      description: '',
      exercises: []
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Create Custom Exercise Plan</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Plan Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan Name
              </label>
              <input
                type="text"
                value={formData.planName}
                onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan Type
              </label>
              <select
                value={formData.planType}
                onChange={(e) => setFormData({ ...formData, planType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="home">Home</option>
                <option value="gym">Gym</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (weeks)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                min="1"
                max="12"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              rows="3"
              required
            />
          </div>

          {/* Weekly Schedule */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Schedule</h3>
            
            {/* Existing Sessions */}
            {formData.weeklySchedule.length > 0 && (
              <div className="mb-6 space-y-4">
                {formData.weeklySchedule.map((session, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{session.sessionName}</h4>
                        <p className="text-sm text-gray-600">Day {session.day}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({
                          ...prev,
                          weeklySchedule: prev.weeklySchedule.filter((_, i) => i !== index)
                        }))}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">{session.exercises.length} exercises</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add New Session */}
            <div className="p-4 border border-dashed border-gray-300 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-4">Add New Session</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  value={currentSession.day}
                  onChange={(e) => setCurrentSession({ ...currentSession, day: e.target.value })}
                  placeholder="Day (e.g., Monday)"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  value={currentSession.sessionName}
                  onChange={(e) => setCurrentSession({ ...currentSession, sessionName: e.target.value })}
                  placeholder="Session Name"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              {/* Current Session Exercises */}
              {currentSession.exercises.length > 0 && (
                <div className="mb-4 space-y-2">
                  {currentSession.exercises.map((exercise, index) => (
                    <div key={index} className="p-2 bg-gray-50 rounded flex justify-between items-center">
                      <span>{exercise.name}</span>
                      <button
                        type="button"
                        onClick={() => setCurrentSession(prev => ({
                          ...prev,
                          exercises: prev.exercises.filter((_, i) => i !== index)
                        }))}
                        className="text-red-600 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Exercise Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={currentExercise.name}
                    onChange={(e) => setCurrentExercise({ ...currentExercise, name: e.target.value })}
                    placeholder="Exercise Name"
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={currentExercise.equipment}
                    onChange={(e) => setCurrentExercise({ ...currentExercise, equipment: e.target.value.split(',') })}
                    placeholder="Equipment (comma-separated)"
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <input
                    type="number"
                    value={currentExercise.sets}
                    onChange={(e) => setCurrentExercise({ ...currentExercise, sets: parseInt(e.target.value) })}
                    placeholder="Sets"
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="text"
                    value={currentExercise.reps}
                    onChange={(e) => setCurrentExercise({ ...currentExercise, reps: e.target.value })}
                    placeholder="Reps"
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                  <input
                    type="number"
                    value={currentExercise.duration}
                    onChange={(e) => setCurrentExercise({ ...currentExercise, duration: parseInt(e.target.value) })}
                    placeholder="Duration (min)"
                    className="px-3 py-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <textarea
                  value={currentExercise.description}
                  onChange={(e) => setCurrentExercise({ ...currentExercise, description: e.target.value })}
                  placeholder="Exercise Description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  rows="2"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addExercise}
                  className="w-full"
                >
                  Add Exercise
                </Button>
              </div>

              <Button
                type="button"
                onClick={addSession}
                className="w-full mt-4"
                disabled={!currentSession.day || !currentSession.sessionName || currentSession.exercises.length === 0}
              >
                Add Session to Plan
              </Button>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={formData.weeklySchedule.length === 0}
            >
              <Save className="w-5 h-5 mr-2" />
              Create Plan
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ExerciseList = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await exerciseAPI.getPlans();
      setPlans(response.data.exercisePlans);
    } catch (error) {
      console.error('Error loading exercise plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewPlan = async (planType = 'home') => {
    setGenerating(true);
    try {
      const response = await exerciseAPI.generatePlan({
        planType,
        duration: 4
      });
      toast.success('Exercise plan generated successfully!');
      navigate(`/exercise/${response.data.exercisePlan._id}`);
    } catch (error) {
      console.error('Generate plan error:', error);
      
      // Handle specific error cases
      if (error.response) {
        const { status, data } = error.response;
        
        if (status === 401) {
          toast.error('Please log in to generate a plan');
          navigate('/login');
          return;
        }
        
        if (status === 400 && data.code === 'HEALTH_PROFILE_REQUIRED') {
          toast.error('Please complete your health profile first');
          navigate('/profile');
          return;
        }
        
        toast.error(data.message || 'Failed to generate exercise plan');
      } else if (error.request) {
        toast.error('Network error. Please check your connection.');
      } else {
        toast.error('An unexpected error occurred');
      }
    } finally {
      setGenerating(false);
    }
  };

  const deletePlan = async (id) => {
    if (!confirm('Are you sure you want to delete this exercise plan?')) return;
    
    try {
      await exerciseAPI.deletePlan(id);
      setPlans(plans.filter(plan => plan._id !== id));
      toast.success('Exercise plan deleted successfully');
    } catch (error) {
      toast.error('Failed to delete exercise plan');
    }
  };

  const createCustomPlan = async (planData) => {
    try {
      const response = await exerciseAPI.createPlan(planData);
      toast.success('Custom exercise plan created successfully!');
      navigate(`/exercise/${response.data.exercisePlan._id}`);
    } catch (error) {
      toast.error('Failed to create custom exercise plan');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <BackgroundIcons />
        <LoadingSpinner size="lg" text="Loading your exercise plans..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <BackgroundIcons />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Dumbbell className="w-8 h-8 mr-3 text-orange-500" />
              Exercise Plans
            </h1>
            <p className="text-gray-600 mt-2">
              AI-powered and custom workout plans for your fitness goals
            </p>
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={() => setIsCreateModalOpen(true)}
              variant="outline"
            >
              <Plus className="w-5 h-5 mr-2" />
              Custom Plan
            </Button>
            <Button
              onClick={() => generateNewPlan('home')}
              loading={generating}
              variant="outline"
            >
              <Plus className="w-5 h-5 mr-2" />
              AI Home Plan
            </Button>
            <Button
              onClick={() => generateNewPlan('gym')}
              loading={generating}
            >
              <Plus className="w-5 h-5 mr-2" />
              AI Gym Plan
            </Button>
          </div>
        </motion.div>

        {/* Create Custom Plan Modal */}
        <CreateCustomPlanModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={(data) => {
            createCustomPlan(data);
            setIsCreateModalOpen(false);
          }}
        />

        {/* Plans Grid */}
        {plans.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {plans.map((plan, index) => (
              <motion.div
                key={plan._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card hover className="h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          plan.planType === 'gym' 
                            ? 'bg-orange-100 text-orange-800'
                            : plan.planType === 'home'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {plan.planType.toUpperCase()}
                        </span>
                        <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${
                          plan.difficulty === 'beginner'
                            ? 'bg-green-100 text-green-800'
                            : plan.difficulty === 'intermediate'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {plan.difficulty}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {plan.planName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {plan.description}
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => navigate(`/exercise/${plan._id}`)}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deletePlan(plan._id)}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{plan.duration} weeks</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Target Goal:</span>
                      <span className="font-medium capitalize">{plan.targetGoal?.replace('_', ' ')}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Adherence:</span>
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-orange-500 h-2 rounded-full"
                            style={{ width: `${plan.adherenceScore || 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium">{plan.adherenceScore || 0}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span className="flex items-center">
                      <Calendar className="w-3 h-3 mr-1" />
                      {format(new Date(plan.createdAt), 'MMM dd, yyyy')}
                    </span>
                    <span className="flex items-center">
                      <Target className="w-3 h-3 mr-1" />
                      {plan.weeklySchedule?.length || 0} sessions/week
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate(`/exercise/${plan._id}`)}
                  >
                    View Details
                  </Button>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Dumbbell className="w-12 h-12 text-orange-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              No Exercise Plans Yet
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Get started with AI-powered personalized workout plans tailored to your fitness goals and available equipment.
            </p>
            <div className="flex justify-center space-x-4">
              <Button
                onClick={() => generateNewPlan('home')}
                loading={generating}
                variant="outline"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Home Workout
              </Button>
              <Button
                onClick={() => generateNewPlan('gym')}
                loading={generating}
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Gym Workout
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const ExercisePlanDetail = ({ planId }) => {
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('schedule');
  const [progressData, setProgressData] = useState({
    completedExercises: 0,
    totalExercises: 0,
    feedback: '',
    rating: 5
  });

  useEffect(() => {
    loadPlan();
  }, [planId]);

  const loadPlan = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching plan with ID:', planId);
      const response = await exerciseAPI.getPlan(planId);
      console.log('API Response:', response);

      if (response.data && response.data.exercisePlan) {
        console.log('Exercise Plan Data:', response.data.exercisePlan);
        const exercisePlan = {
          ...response.data.exercisePlan,
          weeklySchedule: response.data.exercisePlan.weeklySchedule || []
        };
        setPlan(exercisePlan);
        
        // Set initial total exercises count
        const totalExercises = exercisePlan.weeklySchedule.reduce((total, session) => {
          return total + (session.exercises ? session.exercises.length : 0);
        }, 0);
        setProgressData(prev => ({
          ...prev,
          totalExercises
        }));
      } else {
        setError('Invalid plan data received');
      }
    } catch (error) {
      console.error('Error loading exercise plan:', error);
      setError(error.message || 'Failed to load exercise plan');
      toast.error('Failed to load exercise plan');
    } finally {
      setLoading(false);
    }
  };

  const logProgress = async () => {
    try {
      await exerciseAPI.logProgress(planId, progressData);
      toast.success('Progress logged successfully!');
      loadPlan(); // Reload to get updated adherence score
    } catch (error) {
      toast.error('Failed to log progress');
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-red-600 mb-4">Error: {error}</h3>
          <div className="space-x-4">
            <Button onClick={loadPlan}>Retry</Button>
            <Link to="/exercise">
              <Button variant="outline">Back to Exercise Plans</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading exercise plan..." />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Plan Not Found</h3>
          <Link to="/exercise">
            <Button>Back to Exercise Plans</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <Link to="/exercise" className="text-blue-600 hover:text-blue-700 font-medium">
              ← Back to Exercise Plans
            </Link>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{plan.planName}</h1>
              <p className="text-gray-600">{plan.description}</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                plan.planType === 'gym' 
                  ? 'bg-orange-100 text-orange-800'
                  : plan.planType === 'home'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {plan.planType.toUpperCase()}
              </span>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                plan.difficulty === 'beginner'
                  ? 'bg-green-100 text-green-800'
                  : plan.difficulty === 'intermediate'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {plan.difficulty}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Plan Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8"
        >
          <Card>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{plan.duration}</p>
              <p className="text-sm text-gray-600">Weeks</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{plan.weeklySchedule?.length || 0}</p>
              <p className="text-sm text-gray-600">Sessions/Week</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{plan.adherenceScore || 0}%</p>
              <p className="text-sm text-gray-600">Adherence</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600 capitalize">{plan.targetGoal?.replace('_', ' ')}</p>
              <p className="text-sm text-gray-600">Goal</p>
            </div>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('schedule')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'schedule'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Weekly Schedule
              </button>
              <button
                onClick={() => setActiveTab('progress')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'progress'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Log Progress
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              {plan.weeklySchedule && plan.weeklySchedule.length > 0 ? (
                plan.weeklySchedule.map((session, index) => (
                  <Card key={index}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {session.sessionName || `Day ${session.day}`}
                      </h3>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {session.totalDuration || 0} min
                        </span>
                        <span className="flex items-center">
                          <TrendingUp className="w-4 h-4 mr-1" />
                          {session.totalCaloriesBurn || 0} cal
                        </span>
                      </div>
                    </div>
                    
                    {session.description && (
                      <p className="text-gray-600 mb-4">{session.description}</p>
                    )}

                    {/* Warm-up Section */}
                    {session.warmup && session.warmup.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-medium text-gray-900 mb-3">Warm-up</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {session.warmup.map((exercise, exIndex) => (
                            <div key={exIndex} className="p-3 bg-yellow-50 rounded-lg">
                              <h5 className="font-medium text-gray-800">{exercise.name}</h5>
                              <p className="text-sm text-gray-600 mt-1">{exercise.description}</p>
                              <p className="text-sm text-gray-600">{exercise.duration} min</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Main Exercises Section */}
                    {session.exercises && session.exercises.length > 0 && (
                      <div className="mb-6">
                        <h4 className="font-medium text-gray-900 mb-3">Main Workout</h4>
                        <div className="space-y-3">
                          {session.exercises.map((exercise, exIndex) => (
                            <div key={exIndex} className="p-4 bg-gray-50 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-gray-800">{exercise.name}</h5>
                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                  exercise.difficulty === 'beginner'
                                    ? 'bg-green-100 text-green-800'
                                    : exercise.difficulty === 'intermediate'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {exercise.difficulty}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-3">{exercise.description}</p>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                                {exercise.sets && (
                                  <div>
                                    <span className="text-gray-500">Sets:</span>
                                    <span className="ml-1 font-medium">{exercise.sets}</span>
                                  </div>
                                )}
                                {exercise.reps && (
                                  <div>
                                    <span className="text-gray-500">Reps:</span>
                                    <span className="ml-1 font-medium">{exercise.reps}</span>
                                  </div>
                                )}
                                {exercise.duration && (
                                  <div>
                                    <span className="text-gray-500">Duration:</span>
                                    <span className="ml-1 font-medium">{exercise.duration} min</span>
                                  </div>
                                )}
                                {exercise.restTime && (
                                  <div>
                                    <span className="text-gray-500">Rest:</span>
                                    <span className="ml-1 font-medium">{exercise.restTime}s</span>
                                  </div>
                                )}
                              </div>
                              {exercise.equipment && exercise.equipment.length > 0 && (
                                <div className="mt-3">
                                  <span className="text-sm text-gray-500">Equipment: </span>
                                  <span className="text-sm font-medium">{exercise.equipment.join(', ')}</span>
                                </div>
                              )}
                              {exercise.instructions && exercise.instructions.length > 0 && (
                                <div className="mt-3">
                                  <span className="text-sm text-gray-500">Instructions:</span>
                                  <ul className="list-disc list-inside mt-1 text-sm text-gray-600">
                                    {exercise.instructions.map((instruction, idx) => (
                                      <li key={idx}>{instruction}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Cool-down Section */}
                    {session.cooldown && session.cooldown.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Cool-down</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {session.cooldown.map((exercise, exIndex) => (
                            <div key={exIndex} className="p-3 bg-blue-50 rounded-lg">
                              <h5 className="font-medium text-gray-800">{exercise.name}</h5>
                              <p className="text-sm text-gray-600 mt-1">{exercise.description}</p>
                              <p className="text-sm text-gray-600">{exercise.duration} min</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-600">No workout sessions found in this plan.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'progress' && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Log Today's Progress</h3>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Completed Exercises
                    </label>
                    <input
                      type="number"
                      value={progressData.completedExercises}
                      onChange={(e) => setProgressData({
                        ...progressData,
                        completedExercises: parseInt(e.target.value) || 0
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Exercises
                    </label>
                    <input
                      type="number"
                      value={progressData.totalExercises}
                      onChange={(e) => setProgressData({
                        ...progressData,
                        totalExercises: parseInt(e.target.value) || 0
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rating (1-5)
                  </label>
                  <div className="flex space-x-2">
                    {[1, 2, 3, 4, 5].map((rating) => (
                      <button
                        key={rating}
                        onClick={() => setProgressData({
                          ...progressData,
                          rating
                        })}
                        className={`p-2 rounded-lg transition-colors ${
                          progressData.rating >= rating
                            ? 'text-yellow-500'
                            : 'text-gray-300 hover:text-yellow-400'
                        }`}
                      >
                        <Star className="w-6 h-6 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback (Optional)
                  </label>
                  <textarea
                    value={progressData.feedback}
                    onChange={(e) => setProgressData({
                      ...progressData,
                      feedback: e.target.value
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    rows="3"
                    placeholder="How did the workout feel? Any notes or observations..."
                  />
                </div>

                <Button onClick={logProgress} className="w-full">
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Log Progress
                </Button>
              </div>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};

const ExercisePlanDetailWrapper = () => {
  const { planId } = useParams();
  return <ExercisePlanDetail planId={planId} />;
};

const ExercisePage = () => {
  return (
    <Routes>
      <Route index element={<ExerciseList />} />
      <Route path=":planId" element={<ExercisePlanDetailWrapper />} />
    </Routes>
  );
};

export default ExercisePage;