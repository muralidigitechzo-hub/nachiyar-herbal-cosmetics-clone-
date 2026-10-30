import { removeCustomerSession, clearCustomerAuthCookie } from '../../../lib/customerAuth';

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
    if (!token && req.body?.token) {
      token = req.body.token;
    }

    removeCustomerSession(token);
    clearCustomerAuthCookie(res);

    return res.status(200).json({ success: true, message: 'Signed out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
