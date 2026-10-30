import { getAllCustomers, createCustomerSession, setCustomerAuthCookie } from '../../../lib/customerAuth';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email/Username and Password are required.' });
    }

    const cleanIdentifier = email.trim().toLowerCase();
    const cleanPhone = cleanIdentifier.replace(/\D/g, '');

    const customers = getAllCustomers();
    const customer = customers.find(c => 
      (c.email && c.email.toLowerCase() === cleanIdentifier) ||
      (cleanPhone && c.phone && c.phone.replace(/\D/g, '') === cleanPhone)
    );

    if (!customer) {
      return res.status(401).json({ success: false, message: 'Account not found. Please check your credentials or create an account.' });
    }

    if (customer.password !== password) {
      return res.status(401).json({ success: false, message: 'Incorrect password. Please try again.' });
    }

    const safeCustomer = {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || 'Tamil Nadu',
      pincode: customer.pincode || ''
    };

    const token = createCustomerSession(safeCustomer);
    setCustomerAuthCookie(res, token);

    return res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      customer: safeCustomer,
      token
    });
  } catch (error) {
    console.error('Customer login error:', error);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
}
