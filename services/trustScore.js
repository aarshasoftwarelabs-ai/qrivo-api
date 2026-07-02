// services/trustScore.js

function calculateTrustScore({ vtResult, sbResult, upiResult, qrType }) {
  let score = 100;
  const threats = [];

  // VirusTotal penalty
  if (vtResult.success) {
    if (vtResult.malicious > 0) {
      score -= Math.min(vtResult.malicious * 15, 60);
      threats.push({
        name: 'Malware/Phishing Detected',
        detail: `${vtResult.malicious} of ${vtResult.totalEngines} engines flagged this`,
        severity: 'HIGH',
      });
    }
    if (vtResult.suspicious > 0) {
      score -= Math.min(vtResult.suspicious * 5, 20);
      threats.push({
        name: 'Suspicious Activity',
        detail: `${vtResult.suspicious} engines flagged as suspicious`,
        severity: 'MEDIUM',
      });
    }
  }

  // Google Safe Browsing penalty — strongest signal, big penalty
  if (sbResult.success && sbResult.isThreat) {
    score -= 50;
    threats.push({
      name: 'Google Safe Browsing Alert',
      detail: sbResult.threatTypes.join(', '),
      severity: 'HIGH',
    });
  }

  // UPI-specific penalty
  if (qrType === 'upi') {
    if (!upiResult.success || !upiResult.valid) {
      score -= 40;
      threats.push({
        name: 'Fake UPI Link',
        detail: 'This UPI ID could not be verified — it may not exist',
        severity: 'HIGH',
      });
    }
  }

  score = Math.max(0, Math.min(100, Math.round(score)));

  let verdict;
  if (score >= 80) verdict = 'safe';
  else if (score >= 50) verdict = 'warning';
  else verdict = 'danger';

  return { score, verdict, threats };
}

module.exports = { calculateTrustScore };
