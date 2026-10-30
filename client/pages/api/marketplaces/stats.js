import { getDb } from '../../../lib/db';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  try {
    const db = getDb();
    const channels = Array.isArray(db.marketplace_channels) ? db.marketplace_channels : [];
    const orders = Array.isArray(db.marketplace_orders) ? db.marketplace_orders : [];
    const skus = Array.isArray(db.marketplace_skus) ? db.marketplace_skus : [];

    return res.status(200).json({
      success: true,
      data: {
        channels,
        orders,
        skus
      }
    });
  } catch (error) {
    console.error('Error in /api/marketplaces/stats:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
