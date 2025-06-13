const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();
require('./reminderCron');
// Import routes
const authRoutes = require('./routes/authRoutes');
const dietRoutes = require('./routes/dietRoutes');
const exerciseRoutes = require('./routes/exerciseRoutes');
const chatRoutes = require('./routes/chatRoutes');
const reminderRoutes = require('./routes/reminderRoutes');
const healthRoutes = require('./routes/healthRoutes');
const adminRoutes = require('./routes/adminRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// app.use(cors({
//   origin: 'http://localhost:5173', // or your production URL
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
//   credentials: true,
//   optionsSuccessStatus: 204,
// }));
// app.use(cors({
//   // origin: 'https://nutri-fit-zxtv.vercel.app',
//   origin:'http://localhost:5173/',
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   credentials: true // if you're using cookies or sessions
// }));
 

const allowedOrigins = [
  'http://localhost:5173',
  'https://nutri-fit-zxtv.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));
app.options('*', cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

// Serve static files from the React app in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
}

// Rate limiting configuration
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 auth-related requests per window
  message: 'Too many login attempts, please try again after 15 minutes.'
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  message: 'Too many requests, please try again later.'
});

// Logging
app.use(morgan('combined'));

// Body parsing middleware
// app.use(express.json({ limit: '10mb' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// MongoDB connection with error handling
let isMongoConnected = false;

const connectToMongoDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/healthfitness';
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    console.log('MongoDB connected successfully');
    isMongoConnected = true;
  } catch (err) {
    console.warn('MongoDB connection failed:', err.message);
    console.warn('Running in development mode without database connection');
    console.warn('Please ensure MongoDB is running or provide a valid MONGODB_URI in your .env file');
    isMongoConnected = false;
  }
};

// Attempt to connect to MongoDB
connectToMongoDB();

// Middleware to check database connection for routes that require it
const requireDatabase = (req, res, next) => {
  if (!isMongoConnected) {
    return res.status(503).json({ 
      error: 'Database unavailable', 
      message: 'MongoDB connection is not established. Please check your database configuration.' 
    });
  }
  next();
};

// URL pattern validation middleware
const validateUrlPattern = (req, res, next) => {
  try {
    const url = req.originalUrl;
    if (url.includes('//') || /[<>]/.test(url)) {
      return res.status(400).json({ 
        error: 'Invalid URL pattern',
        message: 'The requested URL contains invalid characters.'
      });
    }
    next();
  } catch (error) {
    next(error);
  }
};

// Apply URL validation to all routes
app.use(validateUrlPattern);

// Routes with database requirement check
app.use('/api/auth', requireDatabase, authLimiter, authRoutes);
app.use('/api/diet', requireDatabase, apiLimiter, dietRoutes);
app.use('/api/exercise', requireDatabase, apiLimiter, exerciseRoutes);
app.use('/api/chat', requireDatabase, apiLimiter, chatRoutes);
app.use('/api/reminders', requireDatabase, apiLimiter, reminderRoutes);
app.use('/api/health', requireDatabase, apiLimiter, healthRoutes);
app.use('/api/admin', requireDatabase, apiLimiter, adminRoutes);

// Serve React app for any other routes in production
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/dist/index.html');

  app.get('/*', (req, res) => {
    res.sendFile(frontendPath);
  });
  
}

// Health check endpoint (works without database)
app.get('/api/health-check', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: isMongoConnected ? 'connected' : 'disconnected'
  });
});

// Database status endpoint
app.get('/api/database-status', (req, res) => {
  res.json({
    connected: isMongoConnected,
    message: isMongoConnected 
      ? 'Database connection is active' 
      : 'Database connection is not available. Please check MongoDB configuration.'
  });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  if (!isMongoConnected) {
    console.log('Note: Server started without database connection');
    console.log('To connect to MongoDB, ensure it\'s running or update MONGODB_URI in .env');
  }
});

module.exports = app;