// routes/report.js
const express = require('express');
const router = express.Router();
const { db } = require('../services/firebase');

// POST report a false positive/negative
router.post('/api/v1/report', async (req, res) => {
  try {
    const { url, expectedVerdict, actualVerdict, reason, userId } = req.body;
    
    if (!url || !expectedVerdict) {
      return res.status(400).json({ error: 'Missing required fields (url, expectedVerdict)' });
    }
    
    if (!db) return res.status(503).json({ error: 'Database not initialized. Please add firebase-credentials.json to the server.' });
    
    const reportRef = await db.collection('user_reports').add({
      url,
      expectedVerdict, // e.g., 'safe', 'danger'
      actualVerdict: actualVerdict || 'unknown',
      reason: reason || '',
      userId: userId || 'anonymous',
      status: 'pending', // pending, reviewed, resolved
      reportedAt: new Date().toISOString()
    });
    
    return res.json({ 
      success: true, 
      message: 'Report submitted successfully. Thank you for helping keep QR Shield safe!',
      reportId: reportRef.id 
    });
  } catch (error) {
    console.error('Report API error:', error);
    return res.status(500).json({ error: 'Failed to submit report' });
  }
});

module.exports = router;
