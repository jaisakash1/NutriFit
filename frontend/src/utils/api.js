import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE_URL =  '';
// const API_BASE_URL =  'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,  
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An error occurred';
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.post('/auth/change-password', data),
};

// Diet API
export const dietAPI = {
  generatePlan: (data) => api.post('/diet/generate', data),
  getPlans: (params) => api.get('/diet', { params }),
  getPlan: (id) => api.get(`/diet/${id}`),
  updatePlan: (id, data) => api.put(`/diet/${id}`, data),
  deletePlan: (id) => api.delete(`/diet/${id}`),
  addFeedback: (id, data) => api.post(`/diet/${id}/feedback`, data),
};

// Exercise API
export const exerciseAPI = {
  generatePlan: (data) => api.post('/exercise/generate', data),
  createPlan: (data) => api.post('/exercise/create', data),
  getPlans: (params) => api.get('/exercise', { params }),
  getPlan: (id) => api.get(`/exercise/${id}`),
  updatePlan: (id, data) => api.put(`/exercise/${id}`, data),
  deletePlan: (id) => api.delete(`/exercise/${id}`),
  logProgress: (id, data) => api.post(`/exercise/${id}/progress`, data),
  getLibrary: (params) => api.get('/exercise/library', { params }),
};

// Health API
export const healthAPI = {
  createRecord: (data) => api.post('/health/records', data),
  getRecords: (params) => api.get('/health/records', { params }),
  getTodaysRecord: () => api.get('/health/today'),
  updateTodaysRecord: (data) => api.put('/health/today', data),
  getDashboardStats: () => api.get('/health/dashboard'),
  getProgressChart: (params) => api.get('/health/progress', { params }),
};

// Chat API
export const chatAPI = {
  sendMessage: (data) => api.post('/chat/message', data),
  getSuggestions: () => api.get('/chat/suggestions'),
  getHistory: (params) => api.get('/chat/history', { params }),
};

// Reminder API
export const reminderAPI = {
  create: (data) => api.post('/reminders', data),
  getAll: (params) => api.get('/reminders', { params }),
  getTodaysReminders: () => api.get('/reminders/today'),
  update: (id, data) => api.put(`/reminders/${id}`, data),
  delete: (id) => api.delete(`/reminders/${id}`),
  sendTest: (id) => api.post(`/reminders/${id}/test`),
};

// Admin API
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard'),
  getAllUsers: (params) => api.get('/admin/users', { params }),
  getUserDetails: (id) => api.get(`/admin/users/${id}`),
  updateUserStatus: (id, data) => api.put(`/admin/users/${id}/status`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getSystemHealth: () => api.get('/admin/system-health'),
  getAnalytics: (params) => api.get('/admin/analytics', { params }),
};
