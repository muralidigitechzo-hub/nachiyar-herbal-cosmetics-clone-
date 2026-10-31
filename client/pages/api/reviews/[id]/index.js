import { getDb, saveDb } from '../../../../lib/db.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  try {
    const { id } = req.query;
    const db = getDb();
    if (!Array.isArray(db.reviews)) db.reviews = [];

    if (req.method === 'DELETE') {
      db.reviews = db.reviews.filter(r => String(r.id) !== String(id));
      saveDb(db);
      return res.status(200).json({ success: true, message: 'Review deleted', data: { id } });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/reviews/[id]:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
