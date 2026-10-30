import { getAllCustomers, saveCustomer } from '../../../lib/customerAuth';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { email, otp, newPassword } = req.body || {};
    if (!email || !otp || !newPassword) {
      return res.status(400).json({ success: false, message: 'Email, OTP, and new password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const stored = global.__CUSTOMER_OTPS?.get(cleanEmail);

    if (!stored || Date.now() > stored.expiresAt) {
      return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
    }

    if (stored.otp !== otp.toString().trim()) {
      return res.status(400).json({ success: false, message: 'Invalid OTP code' });
    }

    const customers = getAllCustomers();
    const customer = customers.find(c => c.email && c.email.toLowerCase() === cleanEmail);

    if (customer) {
      customer.password = newPassword;
      saveCustomer(customer);
    }

    global.__CUSTOMER_OTPS.delete(cleanEmail);

    return res.status(200).json({ success: true, message: 'Password updated successfully! You can now sign in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
