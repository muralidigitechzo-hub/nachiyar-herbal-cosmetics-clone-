import { getCustomerFromSession } from '../../../lib/customerAuth';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  try {
    const cookieHeader = req.headers.cookie || '';
    let token = '';
    const match = cookieHeader.match(/nachiyar_customer_token=([^;]+)/);
    if (match) token = match[1];

    if (!token && req.headers['authorization']) {
      token = req.headers['authorization'].replace('Bearer ', '').trim();
    }
    if (!token && req.headers['x-customer-token']) {
      token = req.headers['x-customer-token'];
    }
    if (!token && req.query.token) {
      token = req.query.token;
    }

    const customer = getCustomerFromSession(token);
    if (!customer) {
      return res.status(401).json({ success: false, authenticated: false, message: 'No active session' });
    }

    return res.status(200).json({ success: true, authenticated: true, customer });
  } catch (error) {
    console.error('Session check error:', error);
    return res.status(500).json({ success: false, authenticated: false, message: error.message });
  }
}
