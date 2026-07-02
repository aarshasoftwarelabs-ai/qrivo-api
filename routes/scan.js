// routes/scan.js
const express = require('express');
const router = express.Router();
const { parseQrContent } = require('../utils/urlParser');
const { checkVirusTotal } = require('../services/virustotal');
const { checkSafeBrowsing } = require('../services/safebrowsing');
const { verifyUpiVpa } = require('../services/upiVerify');
const { calculateTrustScore } = require('../services/trustScore');
const { v4: uuidv4 } = require('uuid');

router.post('/api/v1/scan/qr', async (req, res) => {
  try {
    const { rawValue, userId } = req.body;

    if (!rawValue) {
      return res.status(400).json({ error: 'Missing rawValue (QR content)' });
    }

    const parsed = parseQrContent(rawValue);
    const urlToCheck = parsed.type === 'upi' ? `https://${parsed.vpa}` : parsed.rawUrl;

    // Run all checks in PARALLEL — this is the key performance decision
    const [vtResult, sbResult, upiResult] = await Promise.all([
      checkVirusTotal(parsed.rawUrl),
      checkSafeBrowsing(parsed.rawUrl),
      parsed.type === 'upi' ? verifyUpiVpa(parsed.vpa) : Promise.resolve({ success: true, valid: true }),
    ]);

    const { score, verdict, threats } = calculateTrustScore({
      vtResult, sbResult, upiResult, qrType: parsed.type,
    });

    const result = {
      scanId: uuidv4(),
      qrType: parsed.type,
      rawValue,
      vpa: parsed.vpa || null,
      merchantName: upiResult.merchantName || null,
      trustScore: score,
      verdict,            // "safe" | "warning" | "danger"
      threats,
      checks: {
        virusTotal: vtResult.success,
        safeBrowsing: sbResult.success,
        upiVerified: parsed.type === 'upi' ? upiResult.success : null,
      },
      scannedAt: new Date().toISOString(),
    };

    // Save to Firestore here for history if a userId was provided
    if (userId) {
      const { db } = require('../services/firebase');
      if (db) {
        db.collection('scan_history').add({
          userId,
          ...result
        }).catch(err => console.error("Failed to save history asynchronously:", err));
      }
    }

    return res.json(result);

  } catch (error) {
    console.error('Scan error:', error);
    return res.status(500).json({ error: 'Analysis failed. Please try again.' });
  }
});

module.exports = router;
