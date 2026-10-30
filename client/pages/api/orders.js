import { getDb, saveDb } from '../../lib/db.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  try {
    const db = getDb();
    if (!Array.isArray(db.orders)) db.orders = [];
    if (!Array.isArray(db.products)) db.products = [];
    if (!Array.isArray(db.inventory_logs)) db.inventory_logs = [];

    if (req.method === 'GET') {
      return res.status(200).json({ success: true, data: db.orders });
    }

    if (req.method === 'POST') {
      const order = {
        id: `ord_${Date.now()}`,
        orderNumber: req.body.orderNumber || `ORD-${Math.floor(100000 + Math.random() * 900000)}`,
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

      // Real-time Stock Deduction & Inventory Logging
      for (const item of (order.items || [])) {
        const prodId = item.productId || item.id;
        const prodSlug = item.slug;
        const prod = db.products.find(p => 
          (prodId && (p.id === prodId || p.productId === prodId)) || 
          (prodSlug && p.slug === prodSlug) || 
          (item.name && p.name && p.name.toLowerCase() === item.name.toLowerCase())
        );

        if (prod) {
          const qty = Number(item.qty || 1);
          const prevStock = Number(prod.stock || 0);
          const newStock = Math.max(0, prevStock - qty);
          prod.stock = newStock;
          prod.online_sold = Number(prod.online_sold || 0) + qty;

          db.inventory_logs.unshift({
            id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            product_id: prod.id,
            product_name: prod.name,
            channel: 'online',
            reference: order.orderNumber,
            change: -qty,
            prev_stock: prevStock,
            new_stock: newStock,
            timestamp: new Date().toISOString(),
            reason: `Online Order #${order.orderNumber} placed (-${qty})`
          });
        }
      }

      db.orders.unshift(order);
      saveDb(db);
      return res.status(201).json({ success: true, data: order, updatedProducts: db.products });
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
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
}
