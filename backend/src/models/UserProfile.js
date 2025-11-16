const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
  personalInfo: {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    address: String,
    linkedin: String,
    website: String
  },
  summary: String,
  education: [{
    institution: String,
    degree: String,
    field: String,
    startDate: String,
    endDate: String,
    gpa: String
  }],
  experience: [{
    company: String,
    position: String,
    location: String,
    startDate: String,
    endDate: String,
    description: String,
    achievements: [String]
  }],
  skills: {
    technical: [String],
    soft: [String],
    languages: [String]
  },
  projects: [{
    name: String,
    description: String,
    technologies: [String],
    link: String
  }],
  certifications: [String],
  rawSummary: String, // Original text provided by user
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userProfileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('UserProfile', userProfileSchema);
