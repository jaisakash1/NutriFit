const express = require('express');
const { adminAuth } = require('../middleware/auth');
const {
  getDashboardStats,
  getAllUsers,
  getUserDetails,
  updateUserStatus,
  deleteUser,
  getSystemHealth,
  getAnalytics
} = require('../controllers/adminController');

const router = express.Router();

// All routes require admin authentication
router.use(adminAuth);

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetails);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);
router.get('/system-health', getSystemHealth);
router.get('/analytics', getAnalytics);

module.exports = router;