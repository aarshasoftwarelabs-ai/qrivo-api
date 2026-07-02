// utils/urlParser.js

function parseQrContent(rawValue) {
  if (rawValue.startsWith('upi://')) {
    const params = new URLSearchParams(rawValue.split('?')[1] || '');
    return {
      type: 'upi',
      vpa: params.get('pa'),
      amount: params.get('am'),
      payeeName: params.get('pn'),
      rawUrl: rawValue,
    };
  }

  if (rawValue.startsWith('http://') || rawValue.startsWith('https://')) {
    return { type: 'url', rawUrl: rawValue };
  }

  return { type: 'unknown', rawUrl: rawValue };
}

module.exports = { parseQrContent };
