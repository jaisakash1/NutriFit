import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Save, 
  Edit,
  Camera,
  Activity,
  Target,
  Calendar,
  Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../utils/api';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { toast } from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: '',
    mobile: '',
    healthProfile: {
      age: '',
      gender: '',
      weight: '',
      height: '',
      fitnessGoal: '',
      budget: '',
      lifestyle: '',
      healthConditions: [],
      dietaryRestrictions: [],
      targetWeight: ''
    },
    preferences: {
      notifications: {
        email: true,
        push: true
      },
      units: 'metric'
    }
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        mobile: user.mobile || '',
        healthProfile: {
          age: user.healthProfile?.age || '',
          gender: user.healthProfile?.gender || '',
          weight: user.healthProfile?.weight || '',
          height: user.healthProfile?.height || '',
          fitnessGoal: user.healthProfile?.fitnessGoal || '',
          budget: user.healthProfile?.budget || '',
          lifestyle: user.healthProfile?.lifestyle || '',
          healthConditions: user.healthProfile?.healthConditions || [],
          dietaryRestrictions: user.healthProfile?.dietaryRestrictions || [],
          targetWeight: user.healthProfile?.targetWeight || ''
        },
        preferences: {
          notifications: {
            email: user.preferences?.notifications?.email ?? true,
            push: user.preferences?.notifications?.push ?? true
          },
          units: user.preferences?.units || 'metric'
        }
      });
    }
  }, [user]);

  const updateProfile = async () => {
    setLoading(true);
    try {
      const response = await authAPI.updateProfile(profileData);
      updateUser(response.data.user);
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password changed successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast.error('Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleHealthConditionToggle = (condition) => {
    setProfileData(prev => ({
      ...prev,
      healthProfile: {
        ...prev.healthProfile,
        healthConditions: prev.healthProfile.healthConditions.includes(condition)
          ? prev.healthProfile.healthConditions.filter(c => c !== condition)
          : [...prev.healthProfile.healthConditions, condition]
      }
    }));
  };

  const handleDietaryRestrictionToggle = (restriction) => {
    setProfileData(prev => ({
      ...prev,
      healthProfile: {
        ...prev.healthProfile,
        dietaryRestrictions: prev.healthProfile.dietaryRestrictions.includes(restriction)
          ? prev.healthProfile.dietaryRestrictions.filter(r => r !== restriction)
          : [...prev.healthProfile.dietaryRestrictions, restriction]
      }
    }));
  };

  const healthConditions = [
    'diabetes', 'hypertension', 'heart_disease', 'thyroid', 'pcos', 'arthritis'
  ];

  const dietaryRestrictions = [
    'vegetarian', 'vegan', 'gluten_free', 'dairy_free', 'nut_free'
  ];

  const calculateBMI = () => {
    const weight = parseFloat(profileData.healthProfile.weight);
    const height = parseFloat(profileData.healthProfile.height);
    if (weight && height) {
      const heightInMeters = height / 100;
      return (weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-white">
                {user?.name?.charAt(0)?.toUpperCase()}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{user?.name}</h1>
              <p className="text-gray-600">{user?.email}</p>
              <p className="text-sm text-gray-500">
                Member since {new Date(user?.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('profile')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'profile'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Profile Information
              </button>
              <button
                onClick={() => setActiveTab('health')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'health'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Health Profile
              </button>
              <button
                onClick={() => setActiveTab('security')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'security'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Security
              </button>
              <button
                onClick={() => setActiveTab('preferences')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'preferences'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Preferences
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'profile' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
                  <User className="w-6 h-6 text-blue-500" />
                </div>

                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={profileData.name}
                        onChange={(e) => setProfileData({
                          ...profileData,
                          name: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        value={profileData.mobile}
                        onChange={(e) => setProfileData({
                          ...profileData,
                          mobile: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      value={user?.email}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <Button onClick={updateProfile} loading={loading}>
                    <Save className="w-5 h-5 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'health' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Basic Health Info */}
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Health Metrics</h3>
                  <Activity className="w-6 h-6 text-green-500" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Age
                    </label>
                    <input
                      type="number"
                      value={profileData.healthProfile.age}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        healthProfile: {
                          ...profileData.healthProfile,
                          age: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      value={profileData.healthProfile.gender}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        healthProfile: {
                          ...profileData.healthProfile,
                          gender: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={profileData.healthProfile.weight}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        healthProfile: {
                          ...profileData.healthProfile,
                          weight: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      value={profileData.healthProfile.height}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        healthProfile: {
                          ...profileData.healthProfile,
                          height: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {calculateBMI() && (
                  <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <p className="text-sm text-blue-800">
                      <strong>Current BMI:</strong> {calculateBMI()}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Weight (kg)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={profileData.healthProfile.targetWeight}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        healthProfile: {
                          ...profileData.healthProfile,
                          targetWeight: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fitness Goal
                    </label>
                    <select
                      value={profileData.healthProfile.fitnessGoal}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        healthProfile: {
                          ...profileData.healthProfile,
                          fitnessGoal: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select goal</option>
                      <option value="weight_loss">Weight Loss</option>
                      <option value="muscle_gain">Muscle Gain</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="endurance">Endurance</option>
                      <option value="strength">Strength</option>
                    </select>
                  </div>
                </div>
              </Card>

              {/* Lifestyle & Preferences */}
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Lifestyle & Preferences</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Activity Level
                    </label>
                    <select
                      value={profileData.healthProfile.lifestyle}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        healthProfile: {
                          ...profileData.healthProfile,
                          lifestyle: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select activity level</option>
                      <option value="sedentary">Sedentary</option>
                      <option value="lightly_active">Lightly Active</option>
                      <option value="moderately_active">Moderately Active</option>
                      <option value="very_active">Very Active</option>
                      <option value="extremely_active">Extremely Active</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Budget Range
                    </label>
                    <select
                      value={profileData.healthProfile.budget}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        healthProfile: {
                          ...profileData.healthProfile,
                          budget: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select budget</option>
                      <option value="low">Low ($0-50/month)</option>
                      <option value="medium">Medium ($50-100/month)</option>
                      <option value="high">High ($100+/month)</option>
                    </select>
                  </div>
                </div>

                {/* Health Conditions */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Health Conditions
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {healthConditions.map((condition) => (
                      <label key={condition} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={profileData.healthProfile.healthConditions.includes(condition)}
                          onChange={() => handleHealthConditionToggle(condition)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">
                          {condition.replace('_', ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Dietary Restrictions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Dietary Restrictions
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {dietaryRestrictions.map((restriction) => (
                      <label key={restriction} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={profileData.healthProfile.dietaryRestrictions.includes(restriction)}
                          onChange={() => handleDietaryRestrictionToggle(restriction)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700 capitalize">
                          {restriction.replace('_', ' ')}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </Card>

              <Button onClick={updateProfile} loading={loading}>
                <Save className="w-5 h-5 mr-2" />
                Save Health Profile
              </Button>
            </motion.div>
          )}

          {activeTab === 'security' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
                  <Lock className="w-6 h-6 text-red-500" />
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <Button onClick={changePassword} loading={loading}>
                    <Lock className="w-5 h-5 mr-2" />
                    Change Password
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}

          {activeTab === 'preferences' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <Card>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900">App Preferences</h3>
                  <Settings className="w-6 h-6 text-purple-500" />
                </div>

                <div className="space-y-6">
                  {/* Notification Preferences */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Notifications</h4>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={profileData.preferences.notifications.email}
                          onChange={(e) => setProfileData({
                            ...profileData,
                            preferences: {
                              ...profileData.preferences,
                              notifications: {
                                ...profileData.preferences.notifications,
                                email: e.target.checked
                              }
                            }
                          })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm text-gray-700">Email notifications</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={profileData.preferences.notifications.push}
                          onChange={(e) => setProfileData({
                            ...profileData,
                            preferences: {
                              ...profileData.preferences,
                              notifications: {
                                ...profileData.preferences.notifications,
                                push: e.target.checked
                              }
                            }
                          })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-3 text-sm text-gray-700">Push notifications</span>
                      </label>
                    </div>
                  </div>

                  {/* Units */}
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Units</h4>
                    <select
                      value={profileData.preferences.units}
                      onChange={(e) => setProfileData({
                        ...profileData,
                        preferences: {
                          ...profileData.preferences,
                          units: e.target.value
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="metric">Metric (kg, cm)</option>
                      <option value="imperial">Imperial (lbs, ft)</option>
                    </select>
                  </div>

                  <Button onClick={updateProfile} loading={loading}>
                    <Save className="w-5 h-5 mr-2" />
                    Save Preferences
                  </Button>
                </div>
              </Card>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;