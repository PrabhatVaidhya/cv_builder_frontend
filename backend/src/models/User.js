const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, default: '' },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  
  // CV Profile Data
  personalInfo: {
    fullName: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    address: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    website: { type: String, default: '' }
  },
  summary: { type: String, default: '' },
  education: [{
    institution: String,
    degree: String,
    field: String,
    startDate: String,
    endDate: String,
    gpa: String,
    description: [String]
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
    languages: [String],
    frameworks: [String],
    tools: [String]
  },
  projects: [{
    name: String,
    summary: String,
    description: [String],
    technologies: [String],
    startDate: String,
    endDate: String,
    link: String
  }],
  certifications: [String],
  competitions: [{
    name: String,
    description: [String],
    startDate: String,
    endDate: String
  }],
  entrepreneurialExperiences: [{
    name: String,
    role: String,
    startDate: String,
    endDate: String,
    description: [String]
  }],
  positions: [{
    title: String,
    organization: String,
    startDate: String,
    endDate: String,
    description: [String]
  }],
  awards: [String],
  extracurricular: [String],
  coursework: [String],
  
  profileCompleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
