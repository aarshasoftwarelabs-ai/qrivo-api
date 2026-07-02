// services/virustotal.js
const axios = require('axios');

async function checkVirusTotal(url) {
  try {
    const urlId = Buffer.from(url).toString('base64url');

    // Submit URL for scanning first
    await axios.post(
      'https://www.virustotal.com/api/v3/urls',
      new URLSearchParams({ url }),
      { headers: { 'x-apikey': process.env.VIRUSTOTAL_API_KEY } }
    );

    // Fetch the analysis result
    const result = await axios.get(
      `https://www.virustotal.com/api/v3/urls/${urlId}`,
      { headers: { 'x-apikey': process.env.VIRUSTOTAL_API_KEY } }
    );

    const stats = result.data.data.attributes.last_analysis_stats;

    return {
      success: true,
      malicious: stats.malicious,
      suspicious: stats.suspicious,
      harmless: stats.harmless,
      totalEngines: stats.malicious + stats.suspicious + stats.harmless + stats.undetected,
    };
  } catch (error) {
    console.error('VirusTotal error:', error.message);
    return { success: false, malicious: 0, suspicious: 0, harmless: 0, totalEngines: 0 };
  }
}

module.exports = { checkVirusTotal };
