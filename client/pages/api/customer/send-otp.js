export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { email } = req.body || {};
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    if (!global.__CUSTOMER_OTPS) global.__CUSTOMER_OTPS = new Map();
    global.__CUSTOMER_OTPS.set(cleanEmail, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 minutes
    });

    console.log(`[OTP] Generated verification OTP for ${cleanEmail}: ${otp}`);

    return res.status(200).json({
      success: true,
      message: `OTP sent successfully! (Demo verification code: ${otp})`,
      demoOtp: otp
    });
  } catch (error) {
    console.error('Send OTP error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
