import fs from 'fs';
import path from 'path';

function getDbData() {
  const possiblePaths = [
    path.join(process.cwd(), 'public', 'data', 'db.json'),
    path.join(process.cwd(), 'data', 'db.json'),
    path.join(__dirname, '..', '..', '..', 'public', 'data', 'db.json'),
    path.join(__dirname, '..', '..', '..', '..', 'data', 'db.json')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        return JSON.parse(fs.readFileSync(p, 'utf8'));
      } catch (e) {}
    }
  }
  return null;
}

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  try {
    const db = getDbData();
    const reviews = (db && Array.isArray(db.reviews)) ? db.reviews : [];

    if (req.method === 'POST') {
      const newReview = {
        id: `rev_${Date.now()}`,
        author_name: req.body.authorName || req.body.name || 'Collector',
        author_email: req.body.authorEmail || req.body.email || '',
        product_name: req.body.productName || 'Aurelia Timepiece',
        rating: Number(req.body.rating || 5),
        title: req.body.title || 'Exceptional craftsmanship',
        comment: req.body.comment || '',
        status: 'approved',
        created_at: new Date().toISOString()
      };
      return res.status(201).json({ success: true, data: newReview });
    }

    const totalCount = reviews.length;
    const avgRating = totalCount > 0 
      ? (reviews.reduce((sum, r) => sum + Number(r.rating || 5), 0) / totalCount).toFixed(1) 
      : '4.9';

    return res.status(200).json({
      success: true,
      data: {
        reviews,
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
