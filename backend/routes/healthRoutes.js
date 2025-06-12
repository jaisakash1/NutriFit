const express = require('express');
const { auth } = require('../middleware/auth');
const { validateHealthRecord } = require('../middleware/validation');
const {
  createHealthRecord,
  getHealthRecords,
  getTodaysRecord,
  updateTodaysRecord,
  getDashboardStats,
  getProgressChart
} = require('../controllers/healthController');

const router = express.Router();

// All routes require authentication
router.use(auth);

router.post('/records', validateHealthRecord, createHealthRecord);
router.get('/records', getHealthRecords);
router.get('/today', getTodaysRecord);
router.put('/today', updateTodaysRecord);
router.get('/dashboard', getDashboardStats);
router.get('/progress', getProgressChart);
router.get('/progress/:metric', getProgressChart);

module.exports = router;