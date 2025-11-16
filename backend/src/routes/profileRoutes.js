const express = require('express');
const router = express.Router();
const UserProfile = require('../models/UserProfile');
const { parseProfileWithAI, tailorCVForJob } = require('../services/aiService');
const cvService = require('../services/cvService');
const mongoose = require('mongoose');

// In-memory storage when MongoDB is unavailable
const inMemoryProfiles = new Map();

// Parse endpoint (simpler name for frontend)
router.post('/parse', async (req, res) => {
  try {
    const { summary } = req.body;
    
    if (!summary) {
      return res.status(400).json({ success: false, message: 'Summary is required' });
    }

    console.log('📝 Parsing professional summary with AI...');
    const aiResult = await parseProfileWithAI(summary);
    
    if (!aiResult.success) {
      console.warn('⚠️  AI parsing failed, using fallback');
      return res.json({
        success: false,
        message: 'AI parsing failed, please review the extracted data',
        data: aiResult.fallback
      });
    }

    res.json({
      success: true,
      message: 'Profile parsed successfully',
      data: aiResult.data
    });
  } catch (error) {
    console.error('Error parsing summary:', error);
    res.status(500).json({ success: false, message: 'Failed to parse professional summary' });
  }
});

// Step 1: Parse professional summary with AI (legacy endpoint)
router.post('/parse-summary', async (req, res) => {
  try {
    const { professionalSummary } = req.body;
    
    if (!professionalSummary) {
      return res.status(400).json({ error: 'Professional summary is required' });
    }

    console.log('📝 Parsing professional summary with AI...');
    const aiResult = await parseProfileWithAI(professionalSummary);
    
    if (!aiResult.success) {
      console.warn('⚠️  AI parsing failed, using fallback');
      return res.json({
        success: false,
        message: 'AI parsing failed, please review the extracted data',
        data: aiResult.fallback,
        rawSummary: professionalSummary
      });
    }

    res.json({
      success: true,
      message: 'Profile parsed successfully',
      data: aiResult.data,
      rawSummary: professionalSummary
    });
  } catch (error) {
    console.error('Error parsing summary:', error);
    res.status(500).json({ error: 'Failed to parse professional summary' });
  }
});

// Step 2: Save parsed profile to MongoDB
router.post('/save-profile', async (req, res) => {
  try {
    const profileData = req.body;
    
    if (!profileData.personalInfo || !profileData.personalInfo.email) {
      return res.status(400).json({ error: 'Email is required in personal info' });
    }

    const email = profileData.personalInfo.email;

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // Use in-memory storage
      inMemoryProfiles.set(email, profileData);
      console.log('💾 Profile saved in memory for:', email);
      return res.json({
        success: true,
        message: 'Profile saved in memory (database unavailable)',
        profileId: email
      });
    }

    // Check if profile exists for this email
    let profile = await UserProfile.findOne({ 'personalInfo.email': email });
    
    if (profile) {
      // Update existing profile
      Object.assign(profile, profileData);
      await profile.save();
      console.log('✅ Profile updated for:', email);
    } else {
      // Create new profile
      profile = new UserProfile(profileData);
      await profile.save();
      console.log('✅ New profile created for:', email);
    }

    res.json({
      success: true,
      message: 'Profile saved successfully',
      profileId: profile._id
    });
  } catch (error) {
    console.error('Error saving profile:', error);
    res.status(500).json({ error: 'Failed to save profile to database' });
  }
});

// Step 3: Get profile by email
router.get('/profile/:email', async (req, res) => {
  try {
    const profile = await UserProfile.findOne({ 'personalInfo.email': req.params.email });
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Step 4: Generate tailored CV based on job description
router.post('/generate-tailored-cv', async (req, res) => {
  try {
    const { email, jobDescription } = req.body;
    
    if (!email || !jobDescription) {
      return res.status(400).json({ error: 'Email and job description are required' });
    }

    let profile;

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      // Use in-memory storage
      profile = inMemoryProfiles.get(email);
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found. Please save your profile first.' });
      }
      console.log('📂 Retrieved profile from memory for:', email);
    } else {
      // Fetch user profile from MongoDB
      const dbProfile = await UserProfile.findOne({ 'personalInfo.email': email });
      
      if (!dbProfile) {
        return res.status(404).json({ error: 'Profile not found. Please save your profile first.' });
      }
      profile = dbProfile.toObject();
    }

    console.log('🤖 Tailoring CV with AI for job description...');
    const aiResult = await tailorCVForJob(profile, jobDescription);
    
    if (!aiResult.success) {
      console.warn('⚠️  AI tailoring failed, using original profile');
      return res.json({
        success: false,
        message: 'AI tailoring failed, returning original profile',
        data: profile
      });
    }

    res.json({
      success: true,
      message: 'CV tailored successfully for the job',
      data: aiResult.data,
      similarity: aiResult.similarity
    });
  } catch (error) {
    console.error('Error generating tailored CV:', error);
    res.status(500).json({ error: 'Failed to generate tailored CV' });
  }
});

// Step 5: Generate PDF from CV data
router.post('/generate-pdf', async (req, res) => {
  try {
    const cvData = req.body;
    
    if (!cvData || !cvData.personalInfo || !cvData.personalInfo.fullName) {
      return res.status(400).json({ error: 'Invalid CV data' });
    }

    const pdfBuffer = await cvService.generatePDF(cvData);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${cvData.personalInfo.fullName.replace(/\s+/g, '_')}_CV.pdf"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Get all profiles (for admin/testing)
router.get('/profiles', async (req, res) => {
  try {
    const profiles = await UserProfile.find().select('personalInfo.fullName personalInfo.email createdAt');
    res.json({ success: true, data: profiles });
  } catch (error) {
    console.error('Error fetching profiles:', error);
    res.status(500).json({ error: 'Failed to fetch profiles' });
  }
});

module.exports = router;
