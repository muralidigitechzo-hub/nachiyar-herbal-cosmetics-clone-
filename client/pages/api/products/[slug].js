import { getSiteConfig, saveSiteConfig } from '../../../lib/db.js';

export default function handler(req, res) {
  try {
    const { slug } = req.query;
    const config = getSiteConfig();
    if (!Array.isArray(config.products)) config.products = [];

    const cleanSlug = (slug || '').toString().toLowerCase();
    const idx = config.products.findIndex(p => 
      (p.slug && p.slug.toLowerCase() === cleanSlug) ||
      (p.id && p.id.toLowerCase() === cleanSlug)
    );

    if (req.method === 'GET') {
      res.setHeader('Cache-Control', 'public, max-age=30, s-maxage=60, stale-while-revalidate=120');
      if (idx === -1) {
        return res.status(404).json({ success: false, error: 'Product not found' });
      }
      const product = config.products[idx];
      const mapped = {
        ...product,
        price: Number(product.price || 0),
        mrp: Number(product.mrp || product.compareAtPrice || product.price || 0),
        compareAtPrice: Number(product.compareAtPrice || product.mrp || product.price || 0),
        category: product.category || 'Collection',
        categoryId: product.categoryId || product.category_id || '',
        themeColor: product.themeColor || product.theme_color || '#064E3B',
        theme_color: product.themeColor || product.theme_color || '#064E3B',
        images: Array.isArray(product.images) ? product.images : (product.images ? [product.images] : (product.image ? [product.image] : [])),
        metricBadge: product.metricBadge || (typeof product.badge === 'string' ? product.badge : (product.badge?.number ? `${product.badge.number} ${product.badge.unit || ''}`.trim() : 'PREMIUM'))
      };
      return res.status(200).json({ success: true, data: mapped });
    }

    if (req.method === 'DELETE') {
      if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      config.products.splice(idx, 1);
      saveSiteConfig(config);
      return res.status(200).json({ success: true, message: 'Product deleted from site-config.json' });
    }

    if (req.method === 'PUT' || req.method === 'PATCH') {
      if (idx === -1) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }
      config.products[idx] = { ...config.products[idx], ...req.body };
      saveSiteConfig(config);
      return res.status(200).json({
        success: true,
        message: 'Product updated in site-config.json',
        data: config.products[idx]
      });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/products/[slug]:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
