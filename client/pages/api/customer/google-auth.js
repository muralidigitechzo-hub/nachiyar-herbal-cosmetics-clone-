import { getAllCustomers, saveCustomer, createCustomerSession, setCustomerAuthCookie } from '../../../lib/customerAuth';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { credential, email, name } = req.body || {};
    const userEmail = (email || '').trim().toLowerCase();
    const userName = (name || '').trim() || 'Google User';

    if (!userEmail) {
      return res.status(400).json({ success: false, message: 'Invalid Google authentication response' });
    }

    const customers = getAllCustomers();
    let customer = customers.find(c => c.email && c.email.toLowerCase() === userEmail);

    if (!customer) {
      customer = {
        id: 'cust_' + Date.now() + '_' + Math.floor(Math.random() * 1000),
        name: userName,
        email: userEmail,
        phone: '',
        authProvider: 'google',
        createdAt: new Date().toISOString()
      };
      saveCustomer(customer);
    }

    const safeCustomer = {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone || ''
    };

    const token = createCustomerSession(safeCustomer);
    setCustomerAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      message: 'Signed in successfully via Google',
      customer: safeCustomer,
      token
    });
  } catch (error) {
    console.error('Google auth error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
