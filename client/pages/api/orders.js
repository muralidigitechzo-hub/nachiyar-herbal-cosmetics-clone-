import { getDb, saveDb } from '../../lib/db';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  try {
    const db = getDb();
    if (!Array.isArray(db.orders)) db.orders = [];

    if (req.method === 'GET') {
      return res.status(200).json({ success: true, data: db.orders });
    }

    if (req.method === 'POST') {
      const order = {
        id: `ord_${Date.now()}`,
        orderNumber: req.body.orderNumber || `AUR-${Date.now().toString().slice(-6)}`,
        channel: req.body.channel || 'online',
        customer: req.body.customer || {},
        items: req.body.items || [],
        subtotal: Number(req.body.subtotal || 0),
        discount: Number(req.body.discount || 0),
        shipping: Number(req.body.shipping || 0),
        total: Number(req.body.total || 0),
        paymentMethod: req.body.paymentMethod || 'Online',
        paymentStatus: req.body.paymentStatus || 'Completed',
        status: req.body.status || 'Processing',
        createdAt: new Date().toISOString()
      };
      db.orders.unshift(order);
      saveDb(db);
      return res.status(201).json({ success: true, data: order });
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      const { id, status, paymentStatus } = req.body || {};
      const order = db.orders.find(o => o.id === id);
      if (order) {
        if (status) order.status = status;
        if (paymentStatus) order.paymentStatus = paymentStatus;
        saveDb(db);
        return res.status(200).json({ success: true, data: order });
      }
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/orders:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
