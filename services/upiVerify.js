// services/upiVerify.js
const axios = require('axios');

async function verifyUpiVpa(vpa) {
  if (!vpa) return { success: false, valid: false };

  // Fast fail if keys are missing or still the default placeholder
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  
  if (!keyId || keyId === 'your_razorpay_id' || keyId.trim() === '') {
    console.warn('UPI Verification skipped: Real Razorpay keys not found in .env');
    return { success: false, valid: false, merchantName: null };
  }

  try {
    const response = await axios.post(
      'https://api.razorpay.com/v1/payments/validate/vpa',
      { vpa },
      {
        timeout: 2500, // Maximum 2.5 seconds wait time!
        auth: {
          username: keyId,
          password: keySecret,
        },
      }
    );

    return {
      success: true,
      valid: response.data.success,
      merchantName: response.data.customer_name || null,
    };
  } catch (error) {
    console.warn('UPI Verification failed or timed out:', error.message);
    return { success: false, valid: false, merchantName: null };
  }
}

module.exports = { verifyUpiVpa };
