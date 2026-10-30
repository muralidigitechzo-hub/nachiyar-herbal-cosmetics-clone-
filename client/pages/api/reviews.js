import { getDb, saveDb } from '../../lib/db.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  try {
    const db = getDb();
    if (!Array.isArray(db.reviews)) db.reviews = [];

    if (req.method === 'POST') {
      const newReview = {
        id: `rev_${Date.now()}`,
        author_name: req.body.authorName || req.body.name || 'Customer',
        author_email: req.body.authorEmail || req.body.email || '',
        product_name: req.body.productName || 'Herbal Product',
        rating: Number(req.body.rating || 5),
        title: req.body.title || 'Exceptional Formulation',
        comment: req.body.comment || '',
        status: 'pending',
        created_at: new Date().toISOString()
      };
      db.reviews.unshift(newReview);
      saveDb(db);
      return res.status(201).json({ success: true, data: newReview });
    }

    const reviews = db.reviews;
    const totalCount = reviews.length;
    const avgRating = totalCount > 0 
      ? (reviews.reduce((sum, r) => sum + Number(r.rating || 5), 0) / totalCount).toFixed(1) 
      : '4.9';

    return res.status(200).json({
      success: true,
      data: {
        reviews: reviews.filter(r => r.status === 'approved' || !r.status),
        all: reviews,
        stats: {
          total: totalCount,
          average: avgRating
        }
      }
    });
  } catch (error) {
    console.error('Error in /api/reviews:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
