// services/upiVerify.js
const axios = require('axios');

async function verifyUpiVpa(vpa) {
  if (!vpa) return { success: false, valid: false };

  try {
    const response = await axios.post(
      'https://api.razorpay.com/v1/payments/validate/vpa',
      { vpa },
      {
        auth: {
          username: process.env.RAZORPAY_KEY_ID,
          password: process.env.RAZORPAY_KEY_SECRET,
        },
      }
    );

    return {
      success: true,
      valid: response.data.success,
      merchantName: response.data.customer_name || null,
    };
  } catch (error) {
    return { success: false, valid: false, merchantName: null };
  }
}

module.exports = { verifyUpiVpa };
