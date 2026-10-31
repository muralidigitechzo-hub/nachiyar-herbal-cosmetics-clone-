import { getDb, saveDb } from '../../../../lib/db.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  try {
    const { id } = req.query;
    const { status, review } = req.body || {};

    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const db = getDb();
    if (!Array.isArray(db.reviews)) db.reviews = [];

    let rev = db.reviews.find(r => String(r.id) === String(id));
    if (rev) {
      rev.status = status;
      rev.updated_at = new Date().toISOString();
      saveDb(db);
      return res.status(200).json({ success: true, message: `Review status updated to ${status}`, data: rev });
    }

    // If review was in client memory/localStorage but not yet in server db.json, upsert it!
    if (review && typeof review === 'object') {
      const upserted = {
        id: String(id || review.id || `rev_${Date.now()}`),
        name: review.name || review.author_name || 'Customer',
        author_name: review.author_name || review.name || 'Customer',
        email: review.email || review.author_email || '',
        author_email: review.author_email || review.email || '',
        product_name: review.product_name || review.productName || 'Digitechzo Timepiece',
        rating: Number(review.rating || 5),
        title: review.title || '',
        comment: review.comment || '',
        status: status,
        created_at: review.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      db.reviews.unshift(upserted);
      saveDb(db);
      return res.status(200).json({ success: true, message: `Review added and marked as ${status}`, data: upserted });
    }

    return res.status(404).json({ success: false, message: 'Review not found' });
  } catch (error) {
    console.error('Error in /api/reviews/[id]/status:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
