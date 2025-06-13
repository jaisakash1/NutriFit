import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Phone, Activity } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const { register: registerUser, isAuthenticated } = useAuth();

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors }
  } = useForm();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data) => {
    setLoading(true);

    const formattedData = {
      name: data.name,
      email: data.email,
      mobile: data.mobile,
      password: data.password,
      healthProfile: {
        age: parseInt(data.age),
        gender: data.gender,
        weight: parseFloat(data.weight),
        height: parseFloat(data.height),
        fitnessGoal: data.fitnessGoal,
        budget: data.budget,
        lifestyle: data.lifestyle,
        healthConditions: data.healthConditions || [],
        dietaryRestrictions: data.dietaryRestrictions || []
      }
    };

    const success = await registerUser(formattedData);
    setLoading(false);
  };

  const nextStep = async () => {
    let fieldsToValidate = [];
    if (step === 1) fieldsToValidate = ['name', 'email', 'mobile', 'password'];
    if (step === 2) fieldsToValidate = ['age', 'gender', 'weight', 'height'];

    const valid = await trigger(fieldsToValidate);
    if (valid) setStep(step + 1);
  };

  const prevStep = () => setStep(step - 1);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Join NutriFit
          </h2>
          <p className="text-gray-600 text-sm mt-1">Start your personalized journey</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-5">
          <div className="flex items-center justify-center space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center">
                <div className={`w-6 h-6 text-xs rounded-full flex items-center justify-center font-medium ${
                  step >= i ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {i}
                </div>
                {i < 3 && (
                  <div className={`w-8 h-1 mx-1 rounded ${
                    step > i ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-2 text-sm text-gray-500">
            {step === 1 && 'Basic Info'}
            {step === 2 && 'Health Profile'}
            {step === 3 && 'Goals'}
          </div>
        </div>

        {/* Form Card */}
        <Card className="p-5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 text-sm">
            {/* Step 1 */}
            {step === 1 && (
              <>
                <h3 className="font-semibold text-gray-800">Basic Info</h3>

                <div>
                  <label className="block mb-1">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      {...register('name', { required: 'Required', minLength: { value: 2, message: 'Too short' } })}
                      className="w-full pl-9 pr-3 py-2 border rounded-md focus:ring-blue-500"
                      placeholder="Your name"
                    />
                  </div>
                  {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
                </div>

                <div>
                  <label className="block mb-1">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      {...register('email', {
                        required: 'Required',
                        pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' }
                      })}
                      className="w-full pl-9 pr-3 py-2 border rounded-md focus:ring-blue-500"
                      placeholder="you@example.com"
                    />
                  </div>
                  {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
                </div>

                <div>
                  <label className="block mb-1">Mobile</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      {...register('mobile', {
                        required: 'Required',
                        pattern: { value: /^\+?[\d\s\-\(\)]{10,}$/, message: 'Invalid mobile' }
                      })}
                      className="w-full pl-9 pr-3 py-2 border rounded-md focus:ring-blue-500"
                      placeholder="+91 1234567890"
                    />
                  </div>
                  {errors.mobile && <p className="text-red-500 text-xs">{errors.mobile.message}</p>}
                </div>

                <div>
                  <label className="block mb-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      {...register('password', {
                        required: 'Required',
                        minLength: { value: 6, message: 'Too short' }
                      })}
                      className="w-full pl-9 pr-9 py-2 border rounded-md focus:ring-blue-500"
                      placeholder="Password must be at least 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-red-500 text-xs">{errors.password.message}</p>}
                </div>

                <Button type="button" onClick={nextStep} className="w-full">
                  Continue
                </Button>
              </>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <>
                <h3 className="font-semibold text-gray-800">Health Profile</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1">Age</label>
                    <input
                      type="number"
                      {...register('age', { required: 'Required', min: 1 })}
                      className="w-full px-3 py-2 border rounded-md focus:ring-blue-500"
                      placeholder="Age"
                    />
                    {errors.age && <p className="text-red-500 text-xs">{errors.age.message}</p>}
                  </div>

                  <div>
                    <label className="block mb-1">Gender</label>
                    <select {...register('gender', { required: 'Required' })} className="w-full px-3 py-2 border rounded-md">
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    {errors.gender && <p className="text-red-500 text-xs">{errors.gender.message}</p>}
                  </div>

                  <div>
                    <label className="block mb-1">Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      {...register('weight', { required: 'Required', min: 1 })}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="70"
                    />
                    {errors.weight && <p className="text-red-500 text-xs">{errors.weight.message}</p>}
                  </div>

                  <div>
                    <label className="block mb-1">Height (cm)</label>
                    <input
                      type="number"
                      {...register('height', { required: 'Required', min: 1 })}
                      className="w-full px-3 py-2 border rounded-md"
                      placeholder="175"
                    />
                    {errors.height && <p className="text-red-500 text-xs">{errors.height.message}</p>}
                  </div>
                </div>

                <div className="flex space-x-3 pt-2">
                  <Button type="button" variant="secondary" onClick={prevStep} className="w-1/2">Back</Button>
                  <Button type="button" onClick={nextStep} className="w-1/2">Continue</Button>
                </div>
              </>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <>
                <h3 className="font-semibold text-gray-800">Goals & Preferences</h3>

                <div>
                  <label className="block mb-1">Fitness Goal</label>
                  <select {...register('fitnessGoal', { required: 'Required' })} className="w-full px-3 py-2 border rounded-md">
                    <option value="">Select</option>
                    <option value="weight_loss">Weight Loss</option>
                    <option value="muscle_gain">Muscle Gain</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="endurance">Endurance</option>
                    <option value="strength">Strength</option>
                  </select>
                  {errors.fitnessGoal && <p className="text-red-500 text-xs">{errors.fitnessGoal.message}</p>}
                </div>

                <div>
                  <label className="block mb-1">Activity Level</label>
                  <select {...register('lifestyle', { required: 'Required' })} className="w-full px-3 py-2 border rounded-md">
                    <option value="">Select</option>
                    <option value="sedentary">Sedentary</option>
                    <option value="lightly_active">Lightly Active</option>
                    <option value="moderately_active">Moderately Active</option>
                    <option value="very_active">Very Active</option>
                    <option value="extremely_active">Extremely Active</option>
                  </select>
                  {errors.lifestyle && <p className="text-red-500 text-xs">{errors.lifestyle.message}</p>}
                </div>

                <div>
                  <label className="block mb-1">Budget</label>
                  <select {...register('budget', { required: 'Required' })} className="w-full px-3 py-2 border rounded-md">
                    <option value="">Select</option>
                    <option value="low">Low ($0-50/month)</option>
                    <option value="medium">Medium ($50-100/month)</option>
                    <option value="high">High ($100+/month)</option>
                  </select>
                  {errors.budget && <p className="text-red-500 text-xs">{errors.budget.message}</p>}
                </div>

                <div className="flex space-x-3 pt-2">
                  <Button type="button" variant="secondary" onClick={prevStep} className="w-1/2">Back</Button>
                  <Button type="submit" loading={loading} className="w-1/2">Submit</Button>
                </div>
              </>
            )}
          </form>
        </Card>

        <div className="text-center mt-4 text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
