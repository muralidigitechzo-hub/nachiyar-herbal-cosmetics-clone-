import { getAllCustomers, saveCustomer, createCustomerSession, setCustomerAuthCookie } from '../../../lib/customerAuth';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { name, email, phone, password, address, city, state, pincode } = req.body || {};

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Full Name, Email, and Password are required.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone ? phone.replace(/\D/g, '').slice(0, 10) : '';

    const customers = getAllCustomers();
    const existing = customers.find(c => c.email && c.email.toLowerCase() === cleanEmail);
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists. Please sign in.' });
    }

    const customerId = 'cust_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    const newCustomer = {
      id: customerId,
      name: name.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      password: password,
      address: address ? address.trim() : '',
      city: city ? city.trim() : '',
      state: state ? state.trim() : 'Tamil Nadu',
      pincode: pincode ? pincode.trim() : '',
      createdAt: new Date().toISOString()
    };

    saveCustomer(newCustomer);

    const safeCustomer = {
      id: newCustomer.id,
      name: newCustomer.name,
      email: newCustomer.email,
      phone: newCustomer.phone,
      address: newCustomer.address,
      city: newCustomer.city,
      state: newCustomer.state,
      pincode: newCustomer.pincode
    };

    const token = createCustomerSession(safeCustomer);
    setCustomerAuthCookie(res, token);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      customer: safeCustomer,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'Could not create account: ' + error.message });
  }
}
