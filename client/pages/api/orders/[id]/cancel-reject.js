import { getDb, saveDb } from '../../../../lib/db.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  try {
    const { id } = req.query;
    const db = getDb();
    if (!Array.isArray(db.orders)) db.orders = [];

    const order = db.orders.find(o => o && (
      String(o.id) === String(id) || 
      String(o.orderNumber) === String(id)
    ));

    if (order) {
      order.status = 'processing';
      order.cancellationDetails = {
        status: 'rejected',
        reason: req.body?.reason || 'Rejection reason provided',
        rejectedAt: new Date().toISOString()
      };
      saveDb(db);
      return res.status(200).json({ success: true, message: 'Cancellation rejected', data: order });
    }

    return res.status(200).json({ success: true, message: 'Cancellation rejected' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
}
