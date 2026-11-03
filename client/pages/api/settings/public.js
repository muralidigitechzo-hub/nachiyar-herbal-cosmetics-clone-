import { getSiteConfig } from '../../../lib/db.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'public, max-age=60, s-maxage=120, stale-while-revalidate=300');

  try {
    const config = getSiteConfig();
    const brand = config.brand || {};
    const business = config.business || {};
    const content = config.content || {};
    const colors = brand.colors || {};

    const publicSettings = {
      brandName: brand.name || 'Nachiyar Herbals & Cosmetics',
      tagline: brand.tagline !== undefined ? brand.tagline : 'Pure Botanical Elegance & Ayurvedic Care',
      logoUrl: brand.logo || '/assets/digitechzo-logo.png',
      faviconUrl: brand.favicon || '/assets/digitechzo-logo.png',
      brand: {
        name: brand.name || 'Nachiyar Herbals & Cosmetics',
        shortName: brand.shortName || 'NACHIYAR',
        tagline: brand.tagline !== undefined ? brand.tagline : 'Pure Botanical Elegance & Ayurvedic Care',
        logo: brand.logo || '/assets/digitechzo-logo.png',
        favicon: brand.favicon || '/assets/digitechzo-logo.png',
        colors: {
          primary: colors.primary || '#7C5AAB',
          secondary: colors.secondary || '#D4AF37',
          accent: colors.accent || '#583B82',
          background: colors.background || '#F9F8F5',
          text: colors.text || '#191319',
          cardBg1: colors.cardBg1 || colors.primary || '#6b4e9b',
          cardBg2: colors.cardBg2 || colors.secondary || '#822234',
          bundleBg: colors.bundleBg || '#4a2870'
        }
      },
      themeColors: {
        primary: colors.primary || '#7C5AAB',
        secondary: colors.secondary || '#D4AF37',
        accent: colors.accent || '#583B82',
        bg: colors.background || '#F9F8F5',
        text: colors.text || '#191319',
        cardBg1: colors.cardBg1 || colors.primary || '#6b4e9b',
        cardBg2: colors.cardBg2 || colors.secondary || '#822234',
        bundleBg: colors.bundleBg || '#4a2870'
      },
      customCSS: config.customCSS || '',
      announcementText: content.announcement || 'ROYAL BOTANICAL CARE ✦ FREE PAN-INDIA SHIPPING OVER ₹599 ✦ COLD-PRESSED IN SMALL BATCHES',
      freeShippingThreshold: content.freeShippingThreshold || 599,
      couponCode: content.coupon?.code || 'ROYAL15',
      discountPercent: content.coupon?.discountPercent || 15,
      couponActive: content.coupon?.active !== false,
      couponExpiryDate: content.coupon?.expiryDate || '',
      supportPhone: business.phone || '+91 94440 88990',
      supportEmail: business.email || 'care@nachiyarherbals.com',
      storeAddress: business.address || 'Nachiyar Botanical Heritage, No. 18 Temple Ring Road, Madurai, Tamil Nadu - 625001',
      gstin: business.gstin || '33AAACH9876K1Z2',
      storeTimings: business.timings || 'Mon - Sat: 9:30 AM - 8:30 PM',
      socialLinks: business.socialLinks || {},
      homeShowcase: content.homeShowcase || config.homeShowcase || {},
      content: content,
      business: business,
      orbit: config.orbit || content.orbit || [],
      categories: config.categories || [
        { id: 'cat_hair_care', name: 'Hair Care' },
        { id: 'cat_scalp', name: 'Scalp & Cleansing' },
        { id: 'cat_sets', name: 'Ritual Sets & Combos' },
        { id: 'cat_gifting', name: 'Royal Gifting' }
      ],
      modules: {
        reviews: true,
        whatsapp_chat: true,
        announcements: true
      },
      paymentMethods: config.paymentMethods || {
        cod: { enabled: true, label: 'Cash on Delivery (COD)', description: 'Pay cash to courier executive upon delivery' },
        upi: { enabled: true, label: 'UPI / QR (GPay, PhonePe, Paytm, BHIM)', upiId: 'nachiyarherbals18@okaxis', merchantName: brand.name || 'Nachiyar Herbals & Cosmetics' },
        card: { enabled: true, label: 'Credit or Debit Card' },
        netbanking: { enabled: true, label: 'Net Banking' }
      }
    };

    return res.status(200).json({ success: true, data: publicSettings });
  } catch (error) {
    console.error('Error in /api/settings/public:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
