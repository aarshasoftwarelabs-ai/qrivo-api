// services/safebrowsing.js
const axios = require('axios');

async function checkSafeBrowsing(url) {
  try {
    const response = await axios.post(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${process.env.GOOGLE_SAFE_BROWSING_KEY}`,
      {
        client: { clientId: 'qrshield', clientVersion: '2.4.1' },
        threatInfo: {
          threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE'],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url }],
        },
      }
    );

    const matches = response.data.matches || [];

    return {
      success: true,
      isThreat: matches.length > 0,
      threatTypes: matches.map(m => m.threatType),
    };
  } catch (error) {
    console.error('Safe Browsing error:', error.message);
    return { success: false, isThreat: false, threatTypes: [] };
  }
}

module.exports = { checkSafeBrowsing };
