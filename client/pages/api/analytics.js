import { getDb } from '../../lib/db';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  try {
    const db = getDb();
    const orders = Array.isArray(db.orders) ? db.orders : [];
    const invoices = Array.isArray(db.invoices) ? db.invoices : [];
    const products = Array.isArray(db.products) ? db.products : [];
    const customers = Array.isArray(db.customers) ? db.customers : [];

    const onlineOrdersCount = orders.length;
    const offlineInvoicesCount = invoices.length;
    const totalOrdersCount = onlineOrdersCount + offlineInvoicesCount;

    const onlineRevenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const offlineRevenue = invoices.reduce((sum, i) => sum + Number(i.total || 0), 0);
    const totalRevenue = onlineRevenue + offlineRevenue;

    const totalStock = products.reduce((sum, p) => sum + Number(p.stock || 50), 0);
    const lowStockItems = products.filter(p => Number(p.stock || 50) <= 25).length;

    const paymentBreakdown = {
      UPI: { count: 0, revenue: 0 },
      Card: { count: 0, revenue: 0 },
      Cash: { count: 0, revenue: 0 },
      'Net Banking': { count: 0, revenue: 0 }
    };

    orders.forEach(o => {
      const m = String(o.paymentMethod || 'UPI').toLowerCase();
      let key = 'UPI';
      if (m.includes('card')) key = 'Card';
      else if (m.includes('cash') || m.includes('cod')) key = 'Cash';
      else if (m.includes('net') || m.includes('bank')) key = 'Net Banking';
      
      if (paymentBreakdown[key]) {
        paymentBreakdown[key].count += 1;
        paymentBreakdown[key].revenue += Number(o.total || 0);
      }
    });

    invoices.forEach(i => {
      const m = String(i.paymentMode || 'Cash').toLowerCase();
      let key = 'Cash';
      if (m.includes('upi') || m.includes('qr')) key = 'UPI';
      else if (m.includes('card') || m.includes('pos')) key = 'Card';
      else if (m.includes('net') || m.includes('bank')) key = 'Net Banking';

      if (paymentBreakdown[key]) {
        paymentBreakdown[key].count += 1;
        paymentBreakdown[key].revenue += Number(i.total || 0);
      }
    });

    const recentOrders = orders.slice(0, 5);
    const recentInvoices = invoices.slice(0, 5);

    return res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        onlineRevenue,
        offlineRevenue,
        totalStock,
        lowStockItems,
        onlineOrdersCount,
        offlineInvoicesCount,
        totalOrdersCount,
        totalCustomers: customers.length,
        paymentBreakdown,
        recentOrders,
        recentInvoices
      }
    });
  } catch (error) {
    console.error('Error in /api/analytics:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
