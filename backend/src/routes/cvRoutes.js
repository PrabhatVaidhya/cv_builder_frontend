const express = require('express');
const router = express.Router();
const cvService = require('../services/cvService');

// Generate PDF from CV data
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

// Save CV data (optional - for future database integration)
router.post('/save', async (req, res) => {
  try {
    const cvData = req.body;
    // TODO: Save to database
    res.json({ message: 'CV saved successfully', id: Date.now() });
  } catch (error) {
    console.error('Error saving CV:', error);
    res.status(500).json({ error: 'Failed to save CV' });
  }
});

module.exports = router;
