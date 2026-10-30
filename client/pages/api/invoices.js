import { getDb, saveDb } from '../../lib/db.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  try {
    const db = getDb();
    if (!Array.isArray(db.invoices)) db.invoices = [];
    if (!Array.isArray(db.products)) db.products = [];
    if (!Array.isArray(db.inventory_logs)) db.inventory_logs = [];

    if (req.method === 'GET') {
      return res.status(200).json({ success: true, data: db.invoices });
    }

    if (req.method === 'POST') {
      const invCount = db.invoices.length + 1;
      const invoiceNumber = req.body.invoiceNumber || `NH-INV-2026-${invCount.toString().padStart(3, '0')}`;
      const inv = {
        id: `inv_${Date.now()}`,
        invoiceNumber: invoiceNumber,
        channel: req.body.channel || 'pos_counter',
        customer: req.body.customer || {},
        items: req.body.items || [],
        subtotal: Number(req.body.subtotal || 0),
        discount: Number(req.body.discount || 0),
        tax: Number(req.body.tax || 0),
        total: Number(req.body.total || 0),
        paymentMode: req.body.paymentMode || req.body.payment_mode || 'Cash',
        paymentStatus: req.body.paymentStatus || 'Paid',
        notes: req.body.notes || '',
        createdBy: req.body.createdBy || 'Administrator',
        createdAt: new Date().toISOString()
      };

      // Real-time Stock Deduction & Audit Logging for Offline Counter Sale
      for (const item of (inv.items || [])) {
        const prodId = item.productId || item.id;
        const prod = db.products.find(p => 
          (prodId && (p.id === prodId || p.productId === prodId)) ||
          (item.slug && p.slug === item.slug) ||
          (item.name && p.name && p.name.toLowerCase() === item.name.toLowerCase())
        );

        if (prod) {
          const qty = Number(item.qty || 1);
          const prevStock = Number(prod.stock || 0);
          const newStock = Math.max(0, prevStock - qty);
          prod.stock = newStock;
          prod.offline_sold = Number(prod.offline_sold || 0) + qty;
          prod.offlineSold = prod.offline_sold;

          db.inventory_logs.unshift({
            id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            product_id: prod.id,
            product_name: prod.name,
            channel: 'offline',
            reference: invoiceNumber,
            change: -qty,
            prev_stock: prevStock,
            new_stock: newStock,
            timestamp: new Date().toISOString(),
            reason: `Offline POS Invoice #${invoiceNumber} to ${inv.customer.name || 'Walk-in'} (-${qty})`
          });
        }
      }

      db.invoices.unshift(inv);
      saveDb(db);
      return res.status(201).json({
        success: true,
        data: inv,
        updatedProducts: db.products,
        inventoryLogs: db.inventory_logs
      });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/invoices:', error);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
}
