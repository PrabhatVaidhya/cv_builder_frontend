require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./utils/database');
const cvRoutes = require('./routes/cvRoutes');
const profileRoutes = require('./routes/profileRoutes');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for large profiles

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: '✅ CV Generator API is running',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      ping: '/api/ping',
      profile: '/api/profile',
      cv: '/api/cv'
    },
    frontend: 'http://localhost:3000'
  });
});

// Routes
app.get('/api/ping', (req, res) => {
  res.json({ message: 'CV Generator API is running', timestamp: new Date().toISOString() });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', service: 'cv-generator-backend' });
});

// CV Routes
app.use('/api/cv', cvRoutes);

// Profile Routes
app.use('/api/profile', profileRoutes);

// Auth Routes
app.use('/api/auth', authRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    success: false, 
    message: 'Internal server error', 
    error: err.message 
  });
});

// 404 handler
app.use((req, res) => {
  console.log('404 - Route not found:', req.method, req.url);
  res.status(404).json({ 
    success: false, 
    message: 'Route not found',
    path: req.url
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Profile API: http://localhost:${PORT}/api/profile`);
  console.log(`🎯 CV Tailoring: http://localhost:${PORT}/api/profile/tailor`);
});
