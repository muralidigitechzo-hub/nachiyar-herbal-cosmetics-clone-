import { getSiteConfig } from '../../../lib/db';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  try {
    const config = getSiteConfig();
    const brand = config.brand || {};
    const business = config.business || {};
    const content = config.content || {};
    const colors = brand.colors || {};

    const publicSettings = {
      brandName: brand.name || 'Aurelia Chronometry',
      tagline: brand.tagline || 'Mastering The Art Of Timeless Precision',
      logoUrl: brand.logo || 'assets/logo.png',
      faviconUrl: brand.favicon || 'favicon.png',
      brand: {
        name: brand.name || 'Aurelia Chronometry',
        shortName: brand.shortName || (brand.name || 'Aurelia').split(' ')[0].toUpperCase(),
        tagline: brand.tagline || 'Mastering The Art Of Timeless Precision',
        logo: brand.logo || 'assets/logo.png',
        favicon: brand.favicon || 'favicon.png',
        colors: {
          primary: colors.primary || '#064E3B',
          secondary: colors.secondary || '#D4AF37',
          accent: colors.accent || '#10B981',
          background: colors.background || '#F9F8F5',
          text: colors.text || '#0F172A',
          cardBg1: colors.cardBg1 || colors.primary || '#064E3B',
          cardBg2: colors.cardBg2 || colors.secondary || '#822234',
          bundleBg: colors.bundleBg || '#271434'
        }
      },
      themeColors: {
        primary: colors.primary || '#064E3B',
        secondary: colors.secondary || '#D4AF37',
        accent: colors.accent || '#10B981',
        bg: colors.background || '#F9F8F5',
        text: colors.text || '#0F172A',
        cardBg1: colors.cardBg1 || colors.primary || '#064E3B',
        cardBg2: colors.cardBg2 || colors.secondary || '#822234',
        bundleBg: colors.bundleBg || '#271434'
      },
      customCSS: config.customCSS || '',
      announcementText: content.announcement || 'SPECIAL PRIVILEGE OFFER • FREE EXPRESS SHIPPING ON ALL ORDERS',
      freeShippingThreshold: content.freeShippingThreshold || 999,
      couponCode: content.coupon?.code || 'AURELIA15',
      discountPercent: content.coupon?.discountPercent || 15,
      couponActive: content.coupon?.active !== false,
      couponExpiryDate: content.coupon?.expiryDate || '',
      supportPhone: business.phone || '+91 94455 66778',
      supportEmail: business.email || 'concierge@aureliatime.com',
      storeAddress: business.address || '',
      gstin: business.gstin || '',
      storeTimings: business.timings || 'Mon - Sat: 10:00 AM - 7:30 PM',
      socialLinks: business.socialLinks || {},
      homeShowcase: content.homeShowcase || config.homeShowcase || {},
      content: content,
      business: business,
      orbit: config.orbit || content.orbit || [],
      categories: config.categories || [
        { id: 'cat_chrono', name: 'Automatic Chronometers' },
        { id: 'cat_diver', name: 'Ceramic Divers' },
        { id: 'cat_duo', name: 'Collector Duos' },
        { id: 'cat_straps', name: 'Horological Straps' }
      ],
      modules: {
        reviews: true,
        whatsapp_chat: true,
        announcements: true
      }
    };

    return res.status(200).json({ success: true, data: publicSettings });
  } catch (error) {
    console.error('Error in /api/settings/public:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
