const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { createUser, findUserByEmail, updateUserProfile, saveGeneratedCV, getGeneratedCVs, getGeneratedCVById, deleteGeneratedCV } = require('../services/userService');
const { tailorCVForJob } = require('../services/aiService');
const { generatePDF } = require('../services/cvService');

// Register
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

    const existing = await findUserByEmail(email);
    if (existing) return res.status(409).json({ success: false, message: 'User already exists' });

    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    const user = await createUser({ fullName: fullName || '', email, passwordHash: hash });

    return res.json({ success: true, message: 'User registered', data: { email: user.email, fullName: user.fullName } });
  } catch (err) {
    console.error('Auth register error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' });

    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    // Simple session response (no JWT) — frontend will store email
    return res.json({ 
      success: true, 
      message: 'Login successful', 
      data: { 
        email: user.email, 
        fullName: user.fullName,
        profileCompleted: user.profileCompleted || false
      } 
    });
  } catch (err) {
    console.error('Auth login error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Update user profile (CV details)
router.post('/profile', async (req, res) => {
  try {
    const { email, profileData } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email required' });

    const updated = await updateUserProfile(email, profileData);
    return res.json({ success: true, message: 'Profile updated', data: updated });
  } catch (err) {
    console.error('Profile update error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Get user profile
router.get('/profile/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    return res.json({ success: true, data: user });
  } catch (err) {
    console.error('Get profile error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Generate CV from job description
router.post('/generate-cv', async (req, res) => {
  try {
    const { email, jobDescription, companyName, positionTitle } = req.body;
    if (!email || !jobDescription) {
      return res.status(400).json({ success: false, message: 'Email and job description required' });
    }

    // Get user profile
    const user = await findUserByEmail(email);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (!user.profileCompleted) {
      return res.status(400).json({ success: false, message: 'Please complete your profile first' });
    }

    // Ensure personalInfo has fullName and email for PDF generation
    if (!user.personalInfo) user.personalInfo = {};
    if (!user.personalInfo.fullName) user.personalInfo.fullName = user.fullName || '';
    if (!user.personalInfo.email) user.personalInfo.email = user.email || email;

    // Tailor CV using AI
    const tailoredData = await tailorCVForJob(user, jobDescription);

    if (!tailoredData.success) {
      return res.status(500).json({ success: false, message: 'Failed to tailor CV' });
    }

    // Save generated CV
    const savedCV = await saveGeneratedCV(email, {
      jobDescription,
      companyName: companyName || '',
      positionTitle: positionTitle || '',
      tailoredContent: tailoredData.data,
      similarityScore: parseFloat(tailoredData.similarity.percentage) || 0
    });

    return res.json({ 
      success: true, 
      message: 'CV generated successfully',
      data: {
        cvId: savedCV._id || savedCV.id,
        tailoredCV: tailoredData.data,
        similarityScore: parseFloat(tailoredData.similarity.percentage) || 0
      }
    });
  } catch (err) {
    console.error('Generate CV error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Get all generated CVs for user
router.get('/cvs/:email', async (req, res) => {
  try {
    const { email } = req.params;
    const cvs = await getGeneratedCVs(email);
    return res.json({ success: true, data: cvs });
  } catch (err) {
    console.error('Get CVs error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Get specific generated CV
router.get('/cv/:cvId', async (req, res) => {
  try {
    const { cvId } = req.params;
    console.log('Fetching CV with ID:', cvId);
    
    // Validate ObjectId format
    if (!cvId || cvId.length !== 24) {
      console.error('Invalid CV ID format:', cvId);
      return res.status(400).json({ success: false, message: 'Invalid CV ID format' });
    }
    
    const cv = await getGeneratedCVById(cvId);
    console.log('CV found:', cv ? 'Yes' : 'No');
    
    if (!cv) return res.status(404).json({ success: false, message: 'CV not found' });
    return res.json({ success: true, data: cv });
  } catch (err) {
    console.error('Get CV error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Download CV as PDF
router.post('/download-cv', async (req, res) => {
  try {
    const { cvId } = req.body;
    if (!cvId) return res.status(400).json({ success: false, message: 'CV ID required' });

    const cv = await getGeneratedCVById(cvId);
    if (!cv) return res.status(404).json({ success: false, message: 'CV not found' });

    // Get the CV data from tailoredContent
    const cvData = cv.tailoredContent;
    if (!cvData || !cvData.personalInfo) {
      return res.status(400).json({ success: false, message: 'Invalid CV data structure' });
    }

    const pdfBuffer = await generatePDF(cvData);
    
    const fileName = cv.positionTitle 
      ? `CV_${cv.positionTitle.replace(/\s+/g, '_')}.pdf`
      : `CV_${cvData.personalInfo.fullName?.replace(/\s+/g, '_') || 'Generated'}.pdf`;
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    res.send(pdfBuffer);
  } catch (err) {
    console.error('Download CV error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// Delete generated CV
router.delete('/cv/:cvId', async (req, res) => {
  try {
    const { cvId } = req.params;
    const deleted = await deleteGeneratedCV(cvId);
    
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'CV not found' });
    }
    
    return res.json({ success: true, message: 'CV deleted successfully' });
  } catch (err) {
    console.error('Delete CV error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
