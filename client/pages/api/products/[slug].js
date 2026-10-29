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
    const { slug } = req.query;
    const db = getDbData();
    if (!db || !Array.isArray(db.products)) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const cleanSlug = (slug || '').toString().toLowerCase();
    const product = db.products.find(p => 
      (p.slug && p.slug.toLowerCase() === cleanSlug) ||
      (p.id && p.id.toLowerCase() === cleanSlug)
    );

    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    const mapped = {
      ...product,
      price: Number(product.price || 0),
      mrp: Number(product.mrp || product.compareAtPrice || product.price || 0),
      category: product.category || 'General',
      categoryId: product.categoryId || product.category_id || '',
      themeColor: product.themeColor || product.theme_color || '#064E3B',
      theme_color: product.themeColor || product.theme_color || '#064E3B',
      images: Array.isArray(product.images) ? product.images : (product.images ? [product.images] : []),
      metricBadge: product.metricBadge || (typeof product.badge === 'string' ? product.badge : (product.badge?.number ? `${product.badge.number} ${product.badge.unit || ''}`.trim() : 'PREMIUM'))
    };

    return res.status(200).json({ success: true, data: mapped });
  } catch (error) {
    console.error('Error in /api/products/[slug]:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
