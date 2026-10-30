import { getDb } from '../../../lib/db';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  try {
    const { email, phone } = req.query;
    const db = getDb();
    const orders = Array.isArray(db.orders) ? db.orders : [];

    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanPhone = (phone || '').replace(/\D/g, '');

    const customerOrders = orders.filter(o => {
      const oEmail = (o.customerEmail || o.email || o.shippingAddress?.email || '').toLowerCase().trim();
      const oPhone = (o.customerPhone || o.phone || o.shippingAddress?.phone || '').replace(/\D/g, '');
      return (cleanEmail && oEmail === cleanEmail) || (cleanPhone && oPhone.includes(cleanPhone));
    });

    return res.status(200).json({ success: true, data: customerOrders });
  } catch (error) {
    console.error('Customer orders error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
