import { getDb, saveDb, getSiteConfig, saveSiteConfig } from '../../../lib/db';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  try {
    const config = getSiteConfig();
    const db = getDb();

    const b = config.brand || {};
    const bus = config.business || {};
    const c = config.content || {};
    const colors = b.colors || {};

    const settingsObj = {
      announcementText: c.announcement || 'SPECIAL PRIVILEGE OFFER • FREE EXPRESS SHIPPING ON ALL ELIGIBLE ORDERS',
      freeShippingThreshold: c.freeShippingThreshold || 999,
      brandName: b.name || 'Aurelia Chronometry',
      tagline: b.tagline || 'Mastering The Art Of Timeless Precision',
      logoUrl: b.logo || 'assets/logo.png',
      faviconUrl: b.favicon || 'favicon.png',
      themeColors: {
        primary: colors.primary || '#064E3B',
        secondary: colors.secondary || '#E2B755',
        accent: colors.accent || '#047857',
        bg: colors.background || '#FDFBF7',
        text: colors.text || '#0F291E'
      },
      supportPhone: bus.phone || '+91 94455 66778',
      supportEmail: bus.email || 'concierge@aureliatime.com',
      storeAddress: bus.address || '',
      gstin: bus.gstin || '',
      storeTimings: bus.timings || 'Mon - Sat: 10:00 AM - 7:30 PM',
      couponCode: c.coupon?.code || 'AURELIA15',
      discountPercent: c.coupon?.discountPercent || 15,
      couponActive: c.coupon?.active !== false,
      socialLinks: bus.socialLinks || {},
      paymentMethods: db.site_settings?.paymentMethods || { cod: true, upi: true, card: true, netbanking: true },
      homeShowcase: db.site_settings?.homeShowcase || {}
    };

    if (req.method === 'GET') {
      return res.status(200).json({ success: true, data: settingsObj });
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      const updates = req.body || {};
      if (updates.brandName) b.name = updates.brandName;
      if (updates.tagline) b.tagline = updates.tagline;
      if (updates.supportPhone) bus.phone = updates.supportPhone;
      if (updates.supportEmail) bus.email = updates.supportEmail;
      if (updates.storeAddress) bus.address = updates.storeAddress;
      if (updates.announcementText) c.announcement = updates.announcementText;
      if (updates.couponCode) {
        if (!c.coupon) c.coupon = {};
        c.coupon.code = updates.couponCode;
      }

      config.brand = b;
      config.business = bus;
      config.content = c;
      saveSiteConfig(config);

      db.site_settings = { ...(db.site_settings || {}), ...updates };
      saveDb(db);

      return res.status(200).json({ success: true, message: 'Settings saved successfully', data: { ...settingsObj, ...updates } });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/settings:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
