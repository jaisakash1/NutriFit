import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useParams, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Plus, 
  Utensils, 
  Calendar, 
  ShoppingCart, 
  Star,
  Clock,
  Users,
  Trash2,
  Edit,
  Eye,
  ArrowLeft,
  Leaf,
  Package,
  Beef,
  Cookie,
  ShoppingBag,
  Apple,
  Carrot,
  Fish,
  Milk,
  Egg,
  Salad,
  Soup,
  Wheat
} from 'lucide-react';
import { dietAPI } from '../../utils/api';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

// Background Icons Component
const BackgroundIcons = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-[0.04]">
    {/* Fruits Section */}
    <motion.div 
      className="absolute top-[12%] left-[10%] text-red-500"
      animate={{ 
        y: [0, -12, 0]
      }}
      transition={{ 
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      <Apple size={48} strokeWidth={1.5} />
    </motion.div>
    
    {/* Vegetables Section */}
    <motion.div 
      className="absolute top-[28%] right-[15%] text-orange-500"
      animate={{ 
        y: [0, 10, 0]
      }}
      transition={{ 
        duration: 7,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 1
      }}
    >
      <Carrot size={52} strokeWidth={1.5} />
    </motion.div>
    
    {/* Protein Section */}
    <motion.div 
      className="absolute bottom-[35%] left-[18%] text-cyan-600"
      animate={{ 
        y: [0, -10, 0]
      }}
      transition={{ 
        duration: 9,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 2
      }}
    >
      <Fish size={46} strokeWidth={1.5} />
    </motion.div>
    
    {/* Dairy Section */}
    <motion.div 
      className="absolute top-[50%] right-[12%] text-blue-400"
      animate={{ 
        y: [0, 8, 0]
      }}
      transition={{ 
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 1.5
      }}
    >
      <Milk size={44} strokeWidth={1.5} />
    </motion.div>
    
    {/* Breakfast Section */}
    <motion.div 
      className="absolute bottom-[28%] right-[20%] text-yellow-500"
      animate={{ 
        y: [0, -8, 0]
      }}
      transition={{ 
        duration: 7,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 0.5
      }}
    >
      <Egg size={40} strokeWidth={1.5} />
    </motion.div>
    
    {/* Salad Section */}
    <motion.div 
      className="absolute top-[38%] left-[15%] text-green-500"
      animate={{ 
        y: [0, 12, 0]
      }}
      transition={{ 
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 2.5
      }}
    >
      <Salad size={50} strokeWidth={1.5} />
    </motion.div>

    {/* Soup Section */}
    <motion.div 
      className="absolute bottom-[20%] left-[25%] text-amber-500"
      animate={{ 
        y: [0, -10, 0]
      }}
      transition={{ 
        duration: 9,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 1.8
      }}
    >
      <Soup size={42} strokeWidth={1.5} />
    </motion.div>

    {/* Grains Section */}
    <motion.div 
      className="absolute top-[65%] right-[16%] text-yellow-600"
      animate={{ 
        y: [0, 10, 0]
      }}
      transition={{ 
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 1.2
      }}
    >
      <Wheat size={46} strokeWidth={1.5} />
    </motion.div>
  </div>
);

const DietList = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      const response = await dietAPI.getPlans();
      setPlans(response.data.dietPlans);
    } catch (error) {
      console.error('Error loading diet plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateNewPlan = async () => {
    setGenerating(true);
    try {
      console.log('Generating new diet plan...');
      const response = await dietAPI.generatePlan({
        duration: 7,
        preferences: {}
      });
      console.log('Diet plan response:', response);
      
      if (!response.data || !response.data.dietPlan) {
        throw new Error('Invalid response format from server');
      }
      
      toast.success('Diet plan generated successfully!');
      navigate(`/diet/${response.data.dietPlan._id}`);
    } catch (error) {
      console.error('Diet plan generation error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to generate diet plan';
      toast.error(errorMessage);
    } finally {
      setGenerating(false);
    }
  };

  const deletePlan = async (id) => {
    if (!confirm('Are you sure you want to delete this diet plan?')) return;
    
    try {
      await dietAPI.deletePlan(id);
      setPlans(plans.filter(plan => plan._id !== id));
      toast.success('Diet plan deleted successfully');
    } catch (error) {
      toast.error('Failed to delete diet plan');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <BackgroundIcons />
        <LoadingSpinner size="lg" text="Loading your diet plans..." />
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
              <Utensils className="w-8 h-8 mr-3 text-green-500" />
              Diet Plans
            </h1>
            <p className="text-gray-600 mt-2">
              AI-powered personalized nutrition plans for your health goals
            </p>
          </div>
          <Button
            onClick={generateNewPlan}
            loading={generating}
            className="flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Generate New Plan
          </Button>
        </motion.div>

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
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {plan.planName}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {plan.description}
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => navigate(`/diet/${plan._id}`)}
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
                      <span className="text-gray-600">Daily Calories:</span>
                      <span className="font-medium">{plan.targetCalories}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{plan.duration} days</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Adherence:</span>
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className="bg-green-500 h-2 rounded-full"
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
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      {plan.shoppingList?.length || 0} items
                    </span>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => navigate(`/diet/${plan._id}`)}
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
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Utensils className="w-12 h-12 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              No Diet Plans Yet
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Get started with AI-powered personalized nutrition plans tailored to your health goals and preferences.
            </p>
            <Button
              onClick={generateNewPlan}
              loading={generating}
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Generate Your First Plan
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

const DietPlanDetail = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('meals');

  useEffect(() => {
    loadPlan();
  }, [planId]);

  const loadPlan = async () => {
    try {
      setLoading(true);
      console.log('Loading diet plan:', planId);
      const response = await dietAPI.getPlan(planId);
      console.log('Diet plan load response:', response);

      if (!response.data || !response.data.success) {
        throw new Error(response.data?.message || 'Failed to load diet plan');
      }

      if (!response.data.dietPlan || !response.data.dietPlan.weeklyPlan) {
        throw new Error('Invalid diet plan data received');
      }

      setPlan(response.data.dietPlan);
    } catch (error) {
      console.error('Error loading diet plan:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load diet plan';
      toast.error(errorMessage);
      navigate('/diet');
    } finally {
      setLoading(false);
    }
  };

  const calculateDailyTotals = (day) => {
    const meals = [day.breakfast, day.midMorningSnack, day.lunch, day.eveningSnack, day.dinner].filter(Boolean);
    return meals.reduce((totals, meal) => ({
      calories: (totals.calories || 0) + (meal.calories || 0),
      protein: (totals.protein || 0) + (meal.protein || 0),
      carbs: (totals.carbs || 0) + (meal.carbs || 0),
      fat: (totals.fat || 0) + (meal.fat || 0)
    }), {});
  };

  const renderMeal = (type, meal, time) => {
    if (!meal) return null;
    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900">{type}</h4>
          <span className="text-sm text-gray-600">{time}</span>
        </div>
        <h5 className="font-semibold text-gray-800 mb-2">{meal.name}</h5>
        <p className="text-sm text-gray-600 mb-3">{meal.description}</p>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <span>Calories: {meal.calories}</span>
          <span>Protein: {meal.protein}g</span>
          <span>Carbs: {meal.carbs}g</span>
          <span>Fat: {meal.fat}g</span>
        </div>
        {meal.ingredients && meal.ingredients.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-medium text-gray-700 mb-1">Ingredients:</p>
            <ul className="text-xs text-gray-600 list-disc list-inside">
              {meal.ingredients.map((ingredient, i) => (
                <li key={i}>{ingredient}</li>
              ))}
            </ul>
          </div>
        )}
        {meal.instructions && meal.instructions.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-medium text-gray-700 mb-1">Instructions:</p>
            <ol className="text-xs text-gray-600 list-decimal list-inside">
              {meal.instructions.map((instruction, i) => (
                <li key={i}>{instruction}</li>
              ))}
            </ol>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading diet plan..." />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Plan Not Found</h3>
          <Button onClick={() => navigate('/diet')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Diet Plans
          </Button>
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
            <Link to="/diet" className="text-blue-600 hover:text-blue-700 font-medium">
              ← Back to Diet Plans
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{plan.planName}</h1>
          <p className="text-gray-600">{plan.description}</p>
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
              <p className="text-2xl font-bold text-green-600">{plan.targetCalories}</p>
              <p className="text-sm text-gray-600">Daily Calories</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{plan.targetProtein}g</p>
              <p className="text-sm text-gray-600">Protein</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{plan.targetCarbs}g</p>
              <p className="text-sm text-gray-600">Carbs</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{plan.targetFat}g</p>
              <p className="text-sm text-gray-600">Fat</p>
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
                onClick={() => setActiveTab('meals')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'meals'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Weekly Meals
              </button>
              <button
                onClick={() => setActiveTab('shopping')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'shopping'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Shopping List
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'meals' && (
            <div className="space-y-6">
              {plan.weeklyPlan?.map((day, index) => (
                <Card key={index}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Day {day.day}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {renderMeal('Breakfast', day.breakfast, 'Morning')}
                    {renderMeal('Mid-Morning Snack', day.midMorningSnack, '10:30 AM')}
                    {renderMeal('Lunch', day.lunch, '1:00 PM')}
                    {renderMeal('Evening Snack', day.eveningSnack, '4:00 PM')}
                    {renderMeal('Dinner', day.dinner, '8:00 PM')}
                    
                                    {/* Daily Totals */}
                <div className="p-4 bg-blue-50 rounded-lg col-span-full">
                  <h4 className="font-medium text-gray-900 mb-2">Daily Totals</h4>
                  {(() => {
                    const totals = calculateDailyTotals(day);
                    return (
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm font-medium text-gray-700">Calories</p>
                          <p className="text-lg font-semibold text-blue-600">{totals.calories || 0}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Protein</p>
                          <p className="text-lg font-semibold text-green-600">{Math.round(totals.protein || 0)}g</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Carbs</p>
                          <p className="text-lg font-semibold text-orange-600">{Math.round(totals.carbs || 0)}g</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-700">Fat</p>
                          <p className="text-lg font-semibold text-purple-600">{Math.round(totals.fat || 0)}g</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {activeTab === 'shopping' && (
            <div className="space-y-6">
              {plan.shoppingList && plan.shoppingList.length > 0 ? (
                <>
                  {/* Shopping List Summary */}
                  <Card>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <ShoppingBag className="w-6 h-6 text-green-500 mr-3" />
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">Shopping List</h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {plan.shoppingList.length} items total
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Estimated Total</p>
                        <p className="text-xl font-semibold text-green-600">
                          ${plan.shoppingList.reduce((total, item) => total + (item.estimatedPrice || 0), 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Card>

                  {/* Categories */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {Object.entries(plan.shoppingList.reduce((acc, item) => {
                      const category = item.category || 'Other';
                      if (!acc[category]) {
                        acc[category] = [];
                      }
                      acc[category].push(item);
                      return acc;
                    }, {})).map(([category, items]) => (
                      <Card key={category} className="h-full">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-900 capitalize flex items-center">
                            {category === 'Produce' && <Leaf className="w-5 h-5 text-green-500 mr-2" />}
                            {category === 'Proteins' && <Beef className="w-5 h-5 text-red-500 mr-2" />}
                            {category === 'Grains' && <Cookie className="w-5 h-5 text-yellow-500 mr-2" />}
                            {category === 'Pantry' && <Package className="w-5 h-5 text-orange-500 mr-2" />}
                            {category === 'Other' && <ShoppingCart className="w-5 h-5 text-gray-500 mr-2" />}
                            {category}
                          </h3>
                          <span className="text-sm text-gray-500">{items.length} items</span>
                        </div>
                        <div className="divide-y divide-gray-100">
                          {items.map((item, index) => (
                            <div
                              key={index}
                              className="py-3 flex items-center justify-between"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{item.item}</p>
                                <p className="text-sm text-gray-600">{item.quantity}</p>
                              </div>
                              {item.estimatedPrice && (
                                <span className="text-sm font-medium text-green-600 ml-4">
                                  ${item.estimatedPrice.toFixed(2)}
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </Card>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Shopping List Available</h3>
                  <p className="text-gray-600">Generate a new diet plan to get your shopping list</p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

const DietPage = () => {
  return (
    <Routes>
      <Route index element={<DietList />} />
      <Route path=":planId" element={<DietPlanDetail />} />
    </Routes>
  );
};

export default DietPage;