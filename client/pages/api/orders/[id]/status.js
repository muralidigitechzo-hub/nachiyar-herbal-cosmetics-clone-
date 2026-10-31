import { getDb, saveDb } from '../../../../lib/db.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  try {
    const { id } = req.query;
    const db = getDb();
    if (!Array.isArray(db.orders)) db.orders = [];

    if (req.method === 'PATCH' || req.method === 'PUT' || req.method === 'POST') {
      const { status, paymentStatus } = req.body || {};
      const order = db.orders.find(o => o && (
        String(o.id) === String(id) || 
        String(o.orderNumber) === String(id)
      ));

      if (order) {
        if (status) order.status = status;
        if (paymentStatus) order.paymentStatus = paymentStatus;
        saveDb(db);
        return res.status(200).json({ success: true, message: 'Order status updated', data: order });
      }

      // If not found yet, create or update a minimal entry
      const newOrder = {
        id: id,
        orderNumber: id,
        status: status || 'placed',
        updatedAt: new Date().toISOString()
      };
      db.orders.unshift(newOrder);
      saveDb(db);
      return res.status(200).json({ success: true, message: 'Order status recorded', data: newOrder });
    }

    if (req.method === 'GET') {
      const order = db.orders.find(o => o && (
        String(o.id) === String(id) || 
        String(o.orderNumber) === String(id)
      ));
      if (order) {
        return res.status(200).json({ success: true, data: order });
      }
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/orders/[id]/status:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
}
