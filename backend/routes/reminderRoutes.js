const express = require('express');
const { auth } = require('../middleware/auth');
const {
  createReminder,
  getReminders,
  updateReminder,
  deleteReminder,
  getTodaysReminders,
  sendTestReminder
} = require('../controllers/reminderController');

const router = express.Router();

// All routes require authentication
router.use(auth);

router.post('/', createReminder);
router.get('/', getReminders);
router.get('/today', getTodaysReminders);
router.put('/:id', updateReminder);
router.delete('/:id', deleteReminder);
router.post('/:id/test', sendTestReminder);

module.exports = router;