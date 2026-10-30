import { getDb, saveDb } from '../../../lib/db';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  try {
    const db = getDb();
    if (!Array.isArray(db.products)) db.products = [];

    if (req.method === 'GET') {
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
    }

    if (req.method === 'POST') {
      const newProd = {
        id: req.body.id || `prod_${Date.now()}`,
        name: req.body.name || 'New Timepiece',
        slug: req.body.slug || (req.body.name || 'new-product').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        price: Number(req.body.price || 0),
        compareAtPrice: Number(req.body.compareAtPrice || req.body.mrp || 0),
        category: req.body.category || 'Collection',
        stock: Number(req.body.stock || 50),
        images: Array.isArray(req.body.images) ? req.body.images : (req.body.image ? [req.body.image] : []),
        themeColor: req.body.themeColor || '#064E3B',
        shortDescription: req.body.shortDescription || '',
        description: req.body.description || '',
        createdAt: new Date().toISOString(),
        ...req.body
      };
      db.products.push(newProd);
      saveDb(db);
      return res.status(201).json({ success: true, data: newProd });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/products:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
