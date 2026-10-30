import { getSiteConfig, saveSiteConfig } from '../../lib/db.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  try {
    const config = getSiteConfig();
    const products = Array.isArray(config.products) ? config.products : [];
    if (!Array.isArray(config.inventory_logs)) config.inventory_logs = [];
    const logs = config.inventory_logs;

    if (req.method === 'GET') {
      const matrix = products.map(p => {
        const stock = Number(p.stock || 50);
        return {
          id: p.id,
          name: p.name,
          sku: p.sku || `SKU-${p.id}`,
          initialStock: Number(p.initialStock || p.initial_stock || stock),
          onlineSold: Number(p.onlineSold || p.online_sold || 0),
          offlineSold: Number(p.offlineSold || p.offline_sold || 0),
          currentStock: stock,
          status: stock <= 0 ? 'Out of Stock' : (stock < 15 ? 'Low Stock' : 'Optimal'),
          variants: p.variants || []
        };
      });

      return res.status(200).json({
        success: true,
        data: {
          matrix,
          logs
        }
      });
    }

    if (req.method === 'POST') {
      const { productId, adjustment, reason } = req.body || {};
      const prod = products.find(p => p.id === productId || p.slug === productId);
      if (prod) {
        prod.stock = Math.max(0, Number(prod.stock || 0) + Number(adjustment || 0));
        logs.unshift({
          id: `log_${Date.now()}`,
          productId: prod.id,
          productName: prod.name,
          adjustment: Number(adjustment || 0),
          newStock: prod.stock,
          reason: reason || 'Manual Admin Adjustment',
          timestamp: new Date().toISOString()
        });
        config.inventory_logs = logs.slice(0, 50);
        saveSiteConfig(config);
      }
      return res.status(200).json({ success: true, message: 'Inventory updated in site-config.json' });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/inventory:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
