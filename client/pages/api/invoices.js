import { getDb, saveDb } from '../../lib/db';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  try {
    const db = getDb();
    if (!Array.isArray(db.invoices)) db.invoices = [];

    if (req.method === 'GET') {
      return res.status(200).json({ success: true, data: db.invoices });
    }

    if (req.method === 'POST') {
      const inv = {
        id: `inv_${Date.now()}`,
        invoiceNumber: req.body.invoiceNumber || `INV-${Date.now().toString().slice(-6)}`,
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
      db.invoices.unshift(inv);
      saveDb(db);
      return res.status(201).json({ success: true, data: inv });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/invoices:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
