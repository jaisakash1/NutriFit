const express = require('express');
const { auth } = require('../middleware/auth');
const {
  generateDietPlan,
  getDietPlans,
  getDietPlan,
  updateDietPlan,
  deleteDietPlan,
  addFeedback
} = require('../controllers/dietController');

const router = express.Router();

// Error handling middleware
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch((error) => {
    console.error('Route error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  });
};

// Validation middleware
const validateDietPlanRequest = (req, res, next) => {
  const { preferences, duration } = req.body;
  
  if (duration && (isNaN(duration) || duration < 1 || duration > 30)) {
    return res.status(400).json({
      success: false,
      message: 'Duration must be between 1 and 30 days'
    });
  }

  next();
};

// All routes require authentication
router.use(auth);

// Apply validation and error handling to routes
router.post('/generate', validateDietPlanRequest, asyncHandler(generateDietPlan));
router.get('/', asyncHandler(getDietPlans));
router.get('/:id', asyncHandler(getDietPlan));
router.put('/:id', asyncHandler(updateDietPlan));
router.delete('/:id', asyncHandler(deleteDietPlan));
router.post('/:id/feedback', asyncHandler(addFeedback));

module.exports = router;