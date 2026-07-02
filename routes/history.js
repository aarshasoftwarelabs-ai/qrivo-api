// routes/history.js
const express = require('express');
const router = express.Router();
const { db } = require('../services/firebase');

// GET history for a user
router.get('/api/v1/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!db) return res.status(503).json({ error: 'Database not initialized. Please add firebase-credentials.json to the server.' });

    const snapshot = await db.collection('scan_history')
      .where('userId', '==', userId)
      .orderBy('scannedAt', 'desc')
      .limit(50)
      .get();
      
    const history = [];
    snapshot.forEach(doc => {
      history.push({ id: doc.id, ...doc.data() });
    });
    
    return res.json({ success: true, history });
  } catch (error) {
    console.error('History API GET error:', error);
    return res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// POST save history (useful if the app wants to manually push history)
router.post('/api/v1/history', async (req, res) => {
  try {
    const { userId, scanResult } = req.body;
    
    if (!userId || !scanResult) {
      return res.status(400).json({ error: 'Missing userId or scanResult' });
    }
    
    if (!db) return res.status(503).json({ error: 'Database not initialized.' });
    
    const docRef = await db.collection('scan_history').add({
      userId,
      ...scanResult,
      savedAt: new Date().toISOString()
    });
    
    return res.json({ success: true, id: docRef.id });
  } catch (error) {
    console.error('History API POST error:', error);
    return res.status(500).json({ error: 'Failed to save history' });
  }
});

module.exports = router;
