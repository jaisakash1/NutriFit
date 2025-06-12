const express = require('express');
const { auth } = require('../middleware/auth');
const {
  chatWithAI,
  getQuickSuggestions,
  getChatHistory
} = require('../controllers/chatController');

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
  console.log('Chat Route Request:', {
    method: req.method,
    path: req.path,
    headers: {
      authorization: req.headers.authorization ? 'Present' : 'Missing'
    }
  });
  next();
});

// All routes require authentication
router.use(auth);

// Debug middleware after auth
router.use((req, res, next) => {
  console.log('Authenticated User:', {
    userId: req.user.id,
    path: req.path
  });
  next();
});

router.post('/message', chatWithAI);
router.get('/suggestions', getQuickSuggestions);
router.get('/history', getChatHistory);

module.exports = router;