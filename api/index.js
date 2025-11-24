const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const morgan = require('morgan');
const { initializeDatabase } = require('../utils/database');

// Import routes
const authRoutes = require('./auth');
const animeRoutes = require('./anime');
const userRoutes = require('./user');
const downloadRoutes = require('./download');
const subscriptionRoutes = require('./subscription');

const app = express();

// Initialize database
initializeDatabase();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: false
}));
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:5173',
    'https://animenox.vercel.app',
    'https://animenox.netlify.app'
  ],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// Rate limiting
app.use(require('../middleware/rateLimit'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/anime', animeRoutes);
app.use('/api/user', userRoutes);
app.use('/api/download', downloadRoutes);
app.use('/api/subscription', subscriptionRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'AnimeNox Backend'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: '🎌 AnimeNox Backend API', 
    developer: 'Bayu Official',
    github: 'hanckdad',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      anime: '/api/anime',
      user: '/api/user',
      download: '/api/download',
      subscription: '/api/subscription'
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Endpoint not found',
    path: req.originalUrl 
  });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🎌 AnimeNox Backend running on port ${PORT}`);
  console.log(`🚀 Ready for deployment on Vercel, Railway, and Netlify`);
});

module.exports = app;