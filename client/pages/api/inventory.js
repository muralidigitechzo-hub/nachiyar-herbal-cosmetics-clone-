import { getDb, saveDb } from '../../lib/db';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  try {
    const db = getDb();
    const products = Array.isArray(db.products) ? db.products : [];
    const logs = Array.isArray(db.inventory_logs) ? db.inventory_logs : [];

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
      const prod = products.find(p => p.id === productId);
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
        db.inventory_logs = logs.slice(0, 50);
        saveDb(db);
      }
      return res.status(200).json({ success: true, message: 'Inventory updated' });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/inventory:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
