// routes/notification.js
const express = require('express');
const router = express.Router();
const { admin } = require('../services/firebase');

// POST send a push notification
router.post('/api/v1/notify', async (req, res) => {
  try {
    const { token, topic, title, body, data } = req.body;
    
    if (!admin) {
      return res.status(503).json({ error: 'Firebase Admin not initialized. Check credentials.' });
    }

    if (!token && !topic) {
      return res.status(400).json({ error: 'Must provide either a device "token" or a "topic"' });
    }

    const message = {
      notification: {
        title: title || 'QR Shield Update',
        body: body || 'You have a new message'
      },
      data: data || {},
    };

    if (token) {
      message.token = token;
    } else if (topic) {
      message.topic = topic;
    }

    // Send a message to the device corresponding to the provided registration token/topic.
    const response = await admin.messaging().send(message);
    
    return res.json({ 
      success: true, 
      message: 'Successfully sent message',
      messageId: response
    });
  } catch (error) {
    console.error('Error sending push notification:', error);
    return res.status(500).json({ error: 'Failed to send notification', details: error.message });
  }
});

module.exports = router;
