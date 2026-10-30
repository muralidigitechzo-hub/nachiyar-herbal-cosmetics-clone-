import { getDb, saveDb } from '../../../../lib/db.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  try {
    const { id } = req.query;
    const { status } = req.body || {};

    const db = getDb();
    if (!Array.isArray(db.reviews)) db.reviews = [];

    const rev = db.reviews.find(r => r.id === id);
    if (rev) {
      rev.status = status;
      saveDb(db);
      return res.status(200).json({ success: true, message: 'Review status updated', data: rev });
    }

    return res.status(404).json({ success: false, message: 'Review not found' });
  } catch (error) {
    console.error('Error in /api/reviews/[id]/status:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
