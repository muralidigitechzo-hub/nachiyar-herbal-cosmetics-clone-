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
    if (!db || !Array.isArray(db.products)) {
      return res.status(200).json({ success: true, data: [] });
    }

    const { category, q } = req.query;
    let products = db.products.map(p => ({
      ...p,
      price: Number(p.price || 0),
      mrp: Number(p.mrp || p.compareAtPrice || p.price || 0),
      category: p.category || 'General',
      categoryId: p.categoryId || p.category_id || '',
      themeColor: p.themeColor || p.theme_color || '#064E3B',
      theme_color: p.themeColor || p.theme_color || '#064E3B',
      images: Array.isArray(p.images) ? p.images : (p.images ? [p.images] : []),
      metricBadge: p.metricBadge || (typeof p.badge === 'string' ? p.badge : (p.badge?.number ? `${p.badge.number} ${p.badge.unit || ''}`.trim() : 'PREMIUM'))
    }));

    if (category && category !== 'all') {
      const catLower = category.toLowerCase();
      products = products.filter(p => 
        (p.category && p.category.toLowerCase() === catLower) ||
        (p.categoryId && p.categoryId.toLowerCase() === catLower) ||
        (p.category_id && p.category_id.toLowerCase() === catLower)
      );
    }

    if (q) {
      const qLower = q.toLowerCase();
      products = products.filter(p =>
        (p.name && p.name.toLowerCase().includes(qLower)) ||
        (p.shortDescription && p.shortDescription.toLowerCase().includes(qLower))
      );
    }

    return res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error('Error in /api/products:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
