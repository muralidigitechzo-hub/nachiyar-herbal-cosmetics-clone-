import { getSiteConfig, saveSiteConfig } from '../../../lib/db.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  try {
    const config = getSiteConfig();

    const b = config.brand || {};
    const bus = config.business || {};
    const c = config.content || {};
    const colors = b.colors || {};

    const settingsObj = {
      announcementText: c.announcement || 'SPECIAL PRIVILEGE OFFER • FREE EXPRESS SHIPPING ON ALL ORDERS',
      freeShippingThreshold: c.freeShippingThreshold || 999,
      brandName: b.name || 'Digitechzo DigiWatches',
      tagline: b.tagline !== undefined ? b.tagline : '',
      logoUrl: b.logo || 'assets/logo.png',
      faviconUrl: b.favicon || 'favicon.png',
      themeColors: {
        primary: colors.primary || '#064E3B',
        secondary: colors.secondary || '#E2B755',
        accent: colors.accent || '#047857',
        bg: colors.background || '#FDFBF7',
        text: colors.text || '#0F291E',
        cardBg1: colors.cardBg1 || colors.primary || '#064E3B',
        cardBg2: colors.cardBg2 || colors.secondary || '#822234',
        bundleBg: colors.bundleBg || '#271434'
      },
      supportPhone: bus.phone || '+91 94455 66778',
      supportEmail: bus.email || 'concierge@aureliatime.com',
      storeAddress: bus.address || '',
      gstin: bus.gstin || '',
      storeTimings: bus.timings || 'Mon - Sat: 10:00 AM - 7:30 PM',
      couponCode: c.coupon?.code || 'AURELIA15',
      discountPercent: c.coupon?.discountPercent || 15,
      couponActive: c.coupon?.active !== false,
      couponExpiryDate: c.coupon?.expiryDate || '',
      socialLinks: bus.socialLinks || {},
      paymentMethods: config.paymentMethods || { cod: true, upi: true, card: true, netbanking: true },
      homeShowcase: c.homeShowcase || config.homeShowcase || {}
    };

    if (req.method === 'GET') {
      return res.status(200).json({ success: true, data: settingsObj });
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      const updates = req.body || {};

      if (updates.brandName) b.name = updates.brandName;
      if (updates.tagline) b.tagline = updates.tagline;
      if (updates.logoUrl) b.logo = updates.logoUrl;
      if (updates.faviconUrl) b.favicon = updates.faviconUrl;

      if (updates.themeColors) {
        b.colors = { ...(b.colors || {}), ...updates.themeColors };
      }

      if (updates.supportPhone) bus.phone = updates.supportPhone;
      if (updates.supportEmail) bus.email = updates.supportEmail;
      if (updates.storeAddress) bus.address = updates.storeAddress;
      if (updates.gstin) bus.gstin = updates.gstin;
      if (updates.storeTimings) bus.timings = updates.storeTimings;

      if (updates.announcementText) c.announcement = updates.announcementText;
      if (updates.freeShippingThreshold) c.freeShippingThreshold = Number(updates.freeShippingThreshold);

      if (updates.couponCode || updates.discountPercent !== undefined || updates.couponActive !== undefined) {
        if (!c.coupon) c.coupon = {};
        if (updates.couponCode) c.coupon.code = updates.couponCode;
        if (updates.discountPercent !== undefined) c.coupon.discountPercent = Number(updates.discountPercent);
        if (updates.couponActive !== undefined) c.coupon.active = updates.couponActive === true;
        if (updates.couponExpiryDate !== undefined) c.coupon.expiryDate = updates.couponExpiryDate;
      }

      if (updates.homeShowcase) {
        c.homeShowcase = { ...(c.homeShowcase || {}), ...updates.homeShowcase };
        config.homeShowcase = c.homeShowcase;
      }

      if (updates.paymentMethods) {
        config.paymentMethods = updates.paymentMethods;
      }

      config.brand = b;
      config.business = bus;
      config.content = c;

      // Save directly to site-config.json (Single source of truth)
      saveSiteConfig(config);

      return res.status(200).json({
        success: true,
        message: 'Settings saved successfully to site-config.json',
        data: { ...settingsObj, ...updates }
      });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/settings:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
