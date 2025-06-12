const GeminiAI = require('../utils/geminiAI');
const User = require('../models/User');
const Chat = require('../models/Chat');

let geminiAI;
try {
  geminiAI = new GeminiAI();
  console.log('GeminiAI initialized successfully in chat controller');
} catch (error) {
  console.error('Failed to initialize GeminiAI:', error);
}

const chatWithAI = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.id;

    if (!geminiAI) {
      throw new Error('GeminiAI is not properly initialized');
    }

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: 'Message is required' });
    }

    // Get user data for context
    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Save user message first
    const userChat = await Chat.create({
      userId,
      message,
      type: 'user',
    });

    try {
      // Generate AI response with user context
      const aiResponse = await geminiAI.generateChatResponse(message, user);

      // Save AI response
      const aiChat = await Chat.create({
        userId,
        message: aiResponse,
        type: 'ai',
      });

      // Return both messages
      res.json({
        success: true,
        response: {
          userMessage: {
            message: userChat.message,
            timestamp: userChat.timestamp,
            type: 'user'
          },
          aiMessage: {
            message: aiChat.message,
            timestamp: aiChat.timestamp,
            type: 'ai'
          }
        }
      });
    } catch (aiError) {
      console.error('AI Generation Error:', aiError);
      
      // Still return the user message even if AI fails
      res.status(500).json({ 
        success: false,
        response: {
          userMessage: {
            message: userChat.message,
            timestamp: userChat.timestamp,
            type: 'user'
          }
        },
        error: 'Failed to generate AI response. Please try again.'
      });
    }
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error processing chat message',
      error: error.message 
    });
  }
};
const getQuickSuggestions = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const suggestions = [
      {
        category: 'Diet',
        questions: [
          'What should I eat for breakfast today?',
          'Suggest a healthy lunch recipe',
          'What are good snack options for weight loss?',
          'How much protein should I consume daily?'
        ]
      },
      {
        category: 'Exercise',
        questions: [
          'What exercises can I do at home?',
          'Suggest a 30-minute workout routine',
          'How often should I do cardio?',
          'What are the best exercises for muscle gain?'
        ]
      },
      {
        category: 'Health',
        questions: [
          'How much water should I drink daily?',
          'What are signs of overtraining?',
          'How to improve sleep quality?',
          'What supplements should I consider?'
        ]
      },
      {
        category: 'Progress',
        questions: [
          'How to track my fitness progress?',
          'Why am I not losing weight?',
          'How to stay motivated?',
          'When will I see results?'
        ]
      }
    ];

    res.json({
      success: true,
      suggestions
    });
  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({ 
      message: 'Error fetching suggestions', 
      error: error.message 
    });
  }
};


const getChatHistory = async (req, res) => {
    try {
      const userId = req.user.id;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 50;
      const skip = (page - 1) * limit;

      console.log('Fetching chat history for userId:', userId, 'page:', page, 'limit:', limit);

      const [chatHistory, total] = await Promise.all([
        Chat.find({ userId })
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Chat.countDocuments({ userId })
      ]);

      console.log('Found chat history entries:', chatHistory.length, 'total:', total);
      
      // Log a sample of the first chat message if exists
      if (chatHistory.length > 0) {
        console.log('Sample first message:', {
          id: chatHistory[0]._id,
          type: chatHistory[0].type,
          timestamp: chatHistory[0].timestamp
        });
      } else {
        console.log('No chat history found');
      }

      res.json({
        success: true,
        chatHistory: chatHistory.reverse(), // Reverse to maintain chronological order
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error('Get chat history error:', error);
      res.status(500).json({ 
        success: false,
        message: 'Error fetching chat history', 
        error: error.message 
      });
    }
  };

module.exports = {
  chatWithAI,
  getQuickSuggestions,
  getChatHistory
};