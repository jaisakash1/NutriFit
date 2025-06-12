const express = require('express');
const { auth } = require('../middleware/auth');
const {
  generateExercisePlan,
  createPlan,
  getExercisePlans,
  getExercisePlan,
  updateExercisePlan,
  deleteExercisePlan,
  logProgress,
  getExerciseLibrary
} = require('../controllers/exerciseController');

const router = express.Router();

// Add logging middleware
const logRequest = (req, res, next) => {
  console.log(`[Exercise API] ${req.method} ${req.originalUrl}`);
  console.log('Request body:', req.body);
  console.log('Request params:', req.params);
  console.log('Request query:', req.query);
  next();
};

// All routes require authentication
router.use(auth);
router.use(logRequest);

router.post('/generate', generateExercisePlan);
router.post('/create', createPlan);
router.get('/', getExercisePlans);
router.get('/library', getExerciseLibrary);
router.get('/:id', getExercisePlan);
router.put('/:id', updateExercisePlan);
router.delete('/:id', deleteExercisePlan);
router.post('/:id/progress', logProgress);

module.exports = router;