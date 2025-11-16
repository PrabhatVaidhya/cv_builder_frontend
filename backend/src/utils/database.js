const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cv-generator';
    
    await mongoose.connect(mongoURI);
    
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('⚠️  Running without database - profiles will not persist');
  }
};

module.exports = connectDB;
