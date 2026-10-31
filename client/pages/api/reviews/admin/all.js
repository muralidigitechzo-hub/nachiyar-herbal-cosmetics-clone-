import { getDb } from '../../../../lib/db.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  try {
    const db = getDb();
    const reviews = Array.isArray(db.reviews) ? db.reviews : [];

    const total = reviews.length;
    const pending = reviews.filter(r => String(r.status || '').toLowerCase() === 'pending').length;
    const approved = reviews.filter(r => String(r.status || '').toLowerCase() === 'approved').length;
    const rejected = reviews.filter(r => String(r.status || '').toLowerCase() === 'rejected').length;

    return res.status(200).json({
      success: true,
      data: {
        reviews,
        counts: {
          total,
          pending,
          approved,
          rejected
        }
      }
    });
  } catch (error) {
    console.error('Error in /api/reviews/admin/all:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
