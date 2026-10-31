import { getDb, saveDb } from '../../lib/db.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  try {
    const db = getDb();
    if (!Array.isArray(db.reviews)) db.reviews = [];

    if (req.method === 'POST') {
      const reviewName = (req.body.name || req.body.authorName || req.body.author_name || 'Customer').trim();
      const reviewEmail = (req.body.email || req.body.authorEmail || req.body.author_email || '').trim();
      const reviewProduct = (req.body.productName || req.body.product_name || 'Digitechzo Timepiece').trim();
      const reviewTitle = (req.body.title || 'Verified Patron Experience').trim();
      const reviewComment = (req.body.comment || '').trim();
      const reviewRating = Math.max(1, Math.min(5, parseInt(req.body.rating, 10) || 5));

      const newReview = {
        id: `rev_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        name: reviewName,
        author_name: reviewName,
        email: reviewEmail,
        author_email: reviewEmail,
        product_name: reviewProduct,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
        status: 'pending',
        created_at: new Date().toISOString()
      };

      db.reviews.unshift(newReview);
      saveDb(db);
      return res.status(201).json({ success: true, message: 'Review submitted for verification', data: newReview });
    }

    // ONLY approved reviews! (Strict check: status must equal 'approved')
    const reviews = db.reviews;
    const approvedReviews = reviews.filter(r => String(r.status || '').toLowerCase() === 'approved');
    const totalCount = approvedReviews.length;
    const avgRating = totalCount > 0 
      ? (approvedReviews.reduce((sum, r) => sum + Number(r.rating || 5), 0) / totalCount).toFixed(1) 
      : '5.0';

    return res.status(200).json({
      success: true,
      data: {
        reviews: approvedReviews,
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
