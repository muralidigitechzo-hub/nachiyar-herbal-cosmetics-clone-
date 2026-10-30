import { getDb, getSiteConfig } from '../../../lib/db';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  try {
    const { email, phone } = req.query;
    const db = getDb();
    const config = getSiteConfig();

    const orders = Array.isArray(config.orders) && config.orders.length > 0
      ? config.orders
      : (Array.isArray(db.orders) ? db.orders : []);

    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanPhone = (phone || '').replace(/\D/g, '').slice(-10);

    const customerOrders = orders.filter(o => {
      if (!o) return false;
      const oEmail = (o.customer?.email || o.customerEmail || o.email || o.shippingAddress?.email || '').toLowerCase().trim();
      const oPhone = (o.customer?.phone || o.customerPhone || o.phone || o.shippingAddress?.phone || '').replace(/\D/g, '').slice(-10);

      const emailMatches = Boolean(cleanEmail && oEmail && oEmail === cleanEmail);
      const phoneMatches = Boolean(cleanPhone && cleanPhone.length === 10 && oPhone && oPhone === cleanPhone);

      return emailMatches || phoneMatches;
    });

    return res.status(200).json({ success: true, data: customerOrders });
  } catch (error) {
    console.error('Customer orders error:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
