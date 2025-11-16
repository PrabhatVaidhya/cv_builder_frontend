const mongoose = require('mongoose');

const generatedCVSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userEmail: { type: String, required: true }, // For in-memory fallback
  jobDescription: { type: String, required: true },
  companyName: { type: String, default: '' },
  positionTitle: { type: String, default: '' },
  
  // Tailored CV content
  tailoredContent: {
    personalInfo: Object,
    summary: String,
    education: Array,
    experience: Array,
    skills: Object,
    projects: Array,
    certifications: Array,
    competitions: Array,
    entrepreneurialExperiences: Array,
    positions: Array,
    awards: Array,
    extracurricular: Array,
    coursework: Array
  },
  
  similarityScore: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('GeneratedCV', generatedCVSchema);
