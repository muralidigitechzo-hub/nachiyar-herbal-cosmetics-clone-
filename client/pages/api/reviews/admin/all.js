import { getDb } from '../../../../lib/db';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  try {
    const db = getDb();
    const reviews = Array.isArray(db.reviews) ? db.reviews : [];

    const total = reviews.length;
    const pending = reviews.filter(r => r.status === 'pending').length;
    const approved = reviews.filter(r => r.status === 'approved' || !r.status).length;
    const rejected = reviews.filter(r => r.status === 'rejected').length;

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
