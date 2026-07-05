const express = require('express');
const { auth } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const {
  generateDietPlan,
  getDietPlans,
  getDietPlan,
  updateDietPlan,
  deleteDietPlan,
  addFeedback
} = require('../controllers/dietController');

const router = express.Router();

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

router.post('/generate', asyncHandler(generateDietPlan));
router.get('/', asyncHandler(getDietPlans));
router.get('/:id', asyncHandler(getDietPlan));
router.put('/:id', asyncHandler(updateDietPlan));
router.delete('/:id', asyncHandler(deleteDietPlan));
router.post('/:id/feedback', asyncHandler(addFeedback));

module.exports = router;