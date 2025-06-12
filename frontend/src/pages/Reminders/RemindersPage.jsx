import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Plus, 
  Clock, 
  Calendar,
  Edit,
  Trash2,
  Send,
  Check,
  X,
  Utensils,
  Dumbbell,
  Droplets,
  Pill,
  Moon,
  User
} from 'lucide-react';
import { reminderAPI } from '../../utils/api';
import Button from '../../components/UI/Button';
import Card from '../../components/UI/Card';
import LoadingSpinner from '../../components/UI/LoadingSpinner';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

const RemindersPage = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReminder, setEditingReminder] = useState(null);
  const [formData, setFormData] = useState({
    type: 'meal',
    title: '',
    description: '',
    time: '',
    frequency: 'daily',
    days: [],
    preferences: {
      email: true,
      push: true
    }
  });

  const reminderTypes = [
    { value: 'meal', label: 'Meal', icon: Utensils, color: 'green' },
    { value: 'exercise', label: 'Exercise', icon: Dumbbell, color: 'orange' },
    { value: 'water', label: 'Water', icon: Droplets, color: 'blue' },
    { value: 'medication', label: 'Medication', icon: Pill, color: 'red' },
    { value: 'sleep', label: 'Sleep', icon: Moon, color: 'purple' },
    { value: 'custom', label: 'Custom', icon: User, color: 'gray' }
  ];

  const weekDays = [
    'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
  ];

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    try {
      const response = await reminderAPI.getAll();
      setReminders(response.data.reminders);
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingReminder) {
        await reminderAPI.update(editingReminder._id, formData);
        toast.success('Reminder updated successfully!');
      } else {
        await reminderAPI.create(formData);
        toast.success('Reminder created successfully!');
      }
      
      setShowForm(false);
      setEditingReminder(null);
      resetForm();
      loadReminders();
    } catch (error) {
      toast.error('Failed to save reminder');
    }
  };

  const deleteReminder = async (id) => {
    if (!confirm('Are you sure you want to delete this reminder?')) return;
    
    try {
      await reminderAPI.delete(id);
      setReminders(reminders.filter(r => r._id !== id));
      toast.success('Reminder deleted successfully');
    } catch (error) {
      toast.error('Failed to delete reminder');
    }
  };

  const toggleReminder = async (id, isActive) => {
    try {
      await reminderAPI.update(id, { isActive: !isActive });
      setReminders(reminders.map(r => 
        r._id === id ? { ...r, isActive: !isActive } : r
      ));
      toast.success(`Reminder ${!isActive ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to update reminder');
    }
  };

  const sendTestReminder = async (id) => {
    try {
      await reminderAPI.sendTest(id);
      toast.success('Test reminder sent!');
    } catch (error) {
      toast.error('Failed to send test reminder');
    }
  };

  const editReminder = (reminder) => {
    setEditingReminder(reminder);
    setFormData({
      type: reminder.type,
      title: reminder.title,
      description: reminder.description || '',
      time: reminder.time,
      frequency: reminder.frequency,
      days: reminder.days || [],
      preferences: reminder.preferences || { email: true, push: true }
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      type: 'meal',
      title: '',
      description: '',
      time: '',
      frequency: 'daily',
      days: [],
      preferences: {
        email: true,
        push: true
      }
    });
  };

  const handleDayToggle = (day) => {
    setFormData(prev => ({
      ...prev,
      days: prev.days.includes(day)
        ? prev.days.filter(d => d !== day)
        : [...prev.days, day]
    }));
  };

  const getReminderIcon = (type) => {
    const reminderType = reminderTypes.find(t => t.value === type);
    return reminderType ? reminderType.icon : User;
  };

  const getReminderColor = (type) => {
    const reminderType = reminderTypes.find(t => t.value === type);
    return reminderType ? reminderType.color : 'gray';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your reminders..." />
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
          className="flex justify-between items-center mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Bell className="w-8 h-8 mr-3 text-yellow-500" />
              Reminders
            </h1>
            <p className="text-gray-600 mt-2">
              Set up smart reminders to stay on track with your health goals
            </p>
          </div>
          <Button
            onClick={() => {
              setShowForm(true);
              setEditingReminder(null);
              resetForm();
            }}
          >
            <Plus className="w-5 h-5 mr-2" />
            Add Reminder
          </Button>
        </motion.div>

        {/* Reminder Form Modal */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {editingReminder ? 'Edit Reminder' : 'Create New Reminder'}
                  </h2>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Reminder Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Reminder Type
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {reminderTypes.map((type) => {
                        const Icon = type.icon;
                        return (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, type: type.value })}
                            className={`p-3 rounded-lg border-2 transition-all ${
                              formData.type === type.value
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Icon className={`w-6 h-6 mx-auto mb-2 text-${type.color}-500`} />
                            <span className="text-sm font-medium">{type.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Take morning vitamins"
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows="3"
                      placeholder="Additional details about this reminder..."
                    />
                  </div>

                  {/* Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time
                    </label>
                    <input
                      type="time"
                      required
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Frequency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequency
                    </label>
                    <select
                      value={formData.frequency}
                      onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>

                  {/* Days (for weekly frequency) */}
                  {formData.frequency === 'weekly' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select Days
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {weekDays.map((day) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => handleDayToggle(day)}
                            className={`p-2 rounded-lg border transition-all ${
                              formData.days.includes(day)
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            {day.charAt(0).toUpperCase() + day.slice(1, 3)}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notification Preferences */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Notification Preferences
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.preferences.email}
                          onChange={(e) => setFormData({
                            ...formData,
                            preferences: {
                              ...formData.preferences,
                              email: e.target.checked
                            }
                          })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Email notifications</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.preferences.push}
                          onChange={(e) => setFormData({
                            ...formData,
                            preferences: {
                              ...formData.preferences,
                              push: e.target.checked
                            }
                          })}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">Push notifications</span>
                      </label>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex space-x-3 pt-6">
                    <Button type="submit" className="flex-1">
                      {editingReminder ? 'Update Reminder' : 'Create Reminder'}
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowForm(false)}
                      className="flex-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Reminders List */}
        {reminders.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {reminders.map((reminder, index) => {
              const Icon = getReminderIcon(reminder.type);
              const color = getReminderColor(reminder.type);
              
              return (
                <motion.div
                  key={reminder._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`${!reminder.isActive ? 'opacity-60' : ''}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 bg-${color}-100 rounded-lg flex items-center justify-center mr-3`}>
                          <Icon className={`w-5 h-5 text-${color}-600`} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{reminder.title}</h3>
                          <p className="text-sm text-gray-600 capitalize">{reminder.type}</p>
                        </div>
                      </div>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => editReminder(reminder)}
                          className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteReminder(reminder._id)}
                          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {reminder.description && (
                      <p className="text-sm text-gray-600 mb-4">{reminder.description}</p>
                    )}

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-2" />
                        <span>{reminder.time}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span className="capitalize">
                          {reminder.frequency === 'daily' 
                            ? 'Daily' 
                            : `Weekly (${reminder.days?.join(', ') || 'No days selected'})`
                          }
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant={reminder.isActive ? 'danger' : 'success'}
                        onClick={() => toggleReminder(reminder._id, reminder.isActive)}
                        className="flex-1"
                      >
                        {reminder.isActive ? (
                          <>
                            <X className="w-4 h-4 mr-1" />
                            Disable
                          </>
                        ) : (
                          <>
                            <Check className="w-4 h-4 mr-1" />
                            Enable
                          </>
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendTestReminder(reminder._id)}
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="w-24 h-24 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Bell className="w-12 h-12 text-yellow-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              No Reminders Set
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Create smart reminders to help you stay consistent with your health and fitness routine.
            </p>
            <Button
              onClick={() => {
                setShowForm(true);
                setEditingReminder(null);
                resetForm();
              }}
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Reminder
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default RemindersPage;