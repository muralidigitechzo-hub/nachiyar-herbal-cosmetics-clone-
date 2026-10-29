const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { query } = require('../config/db');

// Default Branding & System Configuration Fallbacks
// Dynamic site-config synchronization
function getMasterSiteConfig() {
  try {
    const cfgFile = path.resolve(__dirname, '..', '..', '..', 'data', 'site-config.json');
    if (fs.existsSync(cfgFile)) {
      return JSON.parse(fs.readFileSync(cfgFile, 'utf8'));
    }
  } catch (e) {}
  return {};
}

function getDefaultSettings() {
  const master = getMasterSiteConfig();
  const b = master.brand || {};
  const bus = master.business || {};
  const c = master.content || {};
  const colors = b.colors || {};
  const brandName = b.name || 'Store';
  const shortName = b.shortName || brandName.trim().split(' ')[0].toUpperCase();
  const handle = shortName.toLowerCase();

  return {
    announcementText: c.announcement || 'SPECIAL PRIVILEGE OFFER • FREE EXPRESS SHIPPING ON ALL ELIGIBLE ORDERS',
    freeShippingThreshold: c.freeShippingThreshold || 999,
    brandName: brandName,
    tagline: b.tagline || 'Excellence in Quality & Performance',
    logoUrl: b.logo || 'assets/logo.png',
    faviconUrl: b.favicon || b.logo || 'assets/logo.png',
    themeColors: {
      primary: colors.primary || '#0F172A',
      secondary: colors.secondary || '#2563EB',
      accent: colors.accent || '#F59E0B',
      bg: colors.background || '#fdfbf7',
      text: colors.text || '#111827'
    },
    modules: {
      reviews: true,
      marketplaces: true,
      billing: true,
      coupons: true,
      whatsapp_chat: true,
      announcements: true
    },
    socialLinks: {
      whatsapp: bus.phone || '',
      instagram: '',
      facebook: '',
      youtube: ''
    },
    seo: {
      metaTitle: brandName + ' | Official Store',
      metaDescription: b.tagline || brandName,
      ogImage: b.logo || ''
    },
    gstin: bus.gstin || '',
    supportPhone: bus.phone || '',
    supportEmail: bus.email || '',
    storeTimings: bus.timings || 'Mon - Sat: 9:00 AM - 8:00 PM',
    storeAddress: bus.address || '',
    couponCode: c.coupon?.code || (shortName + '15'),
    discountPercent: c.coupon?.discountPercent || 15,
    couponExpiryDate: '',
    couponActive: true,
    couponTagline: c.coupon?.tagline || (shortName + ' Privilege Voucher'),
    paymentMethods: {
      cod: { enabled: true, label: 'Cash on Delivery (COD)', description: 'Pay cash to courier executive upon delivery' },
      upi: { enabled: true, label: 'UPI (Google Pay, PhonePe, Paytm, BHIM)', description: 'Instant UPI payment with dynamic QR & VPA', upiId: handle + '@okhdfcbank', merchantName: brandName },
      card: { enabled: true, label: 'Credit / Debit Card', description: 'Visa, MasterCard, RuPay, Maestro' },
      netbanking: { enabled: true, label: 'Net Banking', description: 'All major Indian banks supported' }
    }
  };
}

function mergeWithDefaults(current) {
  const DEFAULT_SETTINGS = getDefaultSettings();
  const settings = current || {};
  return {
    ...DEFAULT_SETTINGS,
    ...settings,
    branding: {
      brandName: settings.brandName || settings.branding?.brandName || DEFAULT_SETTINGS.brandName,
      tagline: settings.tagline || settings.branding?.tagline || DEFAULT_SETTINGS.tagline,
      logoUrl: settings.logoUrl || settings.branding?.logoUrl || DEFAULT_SETTINGS.logoUrl,
      faviconUrl: settings.faviconUrl || settings.branding?.faviconUrl || DEFAULT_SETTINGS.faviconUrl,
      themeColors: {
        ...DEFAULT_SETTINGS.themeColors,
        ...(settings.themeColors || {}),
        ...(settings.branding?.themeColors || {})
      }
    },
    modules: {
      ...DEFAULT_SETTINGS.modules,
      ...(settings.modules || {})
    },
    socialLinks: {
      ...DEFAULT_SETTINGS.socialLinks,
      ...(settings.socialLinks || {})
    },
    seo: {
      ...DEFAULT_SETTINGS.seo,
      ...(settings.seo || {})
    },
    paymentMethods: {
      ...DEFAULT_SETTINGS.paymentMethods,
      ...(settings.paymentMethods || {})
    }
  };
}

// GET /api/settings/public (Public for storefront announcements & enabled checkout payment methods)
router.get('/public', async (req, res) => {
  try {
    const result = await query('SELECT data FROM site_settings WHERE id = 1');
    const raw = result.rows.length > 0 ? (typeof result.rows[0].data === 'string' ? JSON.parse(result.rows[0].data) : result.rows[0].data) : {};
    const settings = mergeWithDefaults(raw);

    const master = getMasterSiteConfig();
    const masterProds = master.products || [];
    let homeShowcase = null;
    if (masterProds.length > 0) {
      const p0 = masterProds[0] || {};
      const p1 = masterProds[1] || p0;
      const p2 = masterProds[2] || p0;
      homeShowcase = {
        slot1: { productId: p0.id, title: p0.name, subtitle: p0.tagline || p0.shortDescription || '', price: p0.price, mrp: p0.compareAtPrice, customImage: p0.images?.[0] || '' },
        slot2: { productId: p1.id, title: p1.name, subtitle: p1.tagline || p1.shortDescription || '', price: p1.price, mrp: p1.compareAtPrice, customImage: p1.images?.[0] || '' },
        combo: { productId: p2.id, title: p2.name, subtitle: p2.tagline || p2.shortDescription || '', price: p2.price, mrp: p2.compareAtPrice, customImage: p2.images?.[0] || '', tag: 'BEST VALUE' }
      };
    }

    res.json({
      success: true,
      data: {
        announcementText: settings.announcementText,
        freeShippingThreshold: settings.freeShippingThreshold,
        paymentMethods: settings.paymentMethods,
        brandName: settings.branding.brandName,
        tagline: settings.branding.tagline,
        logoUrl: settings.branding.logoUrl,
        faviconUrl: settings.branding.faviconUrl,
        themeColors: settings.branding.themeColors,
        branding: settings.branding,
        modules: settings.modules,
        socialLinks: settings.socialLinks,
        content: raw.content || null,
        hero: raw.content?.hero || null,
        story: raw.content?.story || null,
        seo: settings.seo,
        gstin: settings.gstin,
        supportPhone: settings.supportPhone,
        supportEmail: settings.supportEmail,
        storeTimings: settings.storeTimings,
        storeAddress: settings.storeAddress,
        couponCode: settings.couponCode,
        discountPercent: Number(settings.discountPercent) || 15,
        couponExpiryDate: settings.couponExpiryDate || '',
        couponActive: settings.couponActive !== false && settings.couponActive !== 'false',
        couponTagline: settings.couponTagline || 'Surprise Royal Privilege Voucher',
        googleClientId: process.env.GOOGLE_CLIENT_ID || raw.googleClientId || '',
        firebaseConfig: (process.env.FIREBASE_API_KEY && !process.env.FIREBASE_API_KEY.includes('YOUR_FIREBASE_API_KEY')) ? {
          apiKey: process.env.FIREBASE_API_KEY,
          authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
          projectId: process.env.FIREBASE_PROJECT_ID || '',
          storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
          messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
          appId: process.env.FIREBASE_APP_ID || '',
          measurementId: process.env.FIREBASE_MEASUREMENT_ID || ''
        } : null,
        homeShowcase: homeShowcase
      }
    });
  } catch (err) {
    console.error('Error fetching public settings:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/settings (Full settings for admin console)
router.get('/', async (req, res) => {
  try {
    const result = await query('SELECT data FROM site_settings WHERE id = 1');
    const raw = result.rows.length > 0 ? (typeof result.rows[0].data === 'string' ? JSON.parse(result.rows[0].data) : result.rows[0].data) : {};
    const settings = mergeWithDefaults(raw);
    res.json({ success: true, data: settings });
  } catch (err) {
    console.error('Error fetching settings:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/settings
router.put('/', async (req, res) => {
  try {
    const body = req.body || {};
    const existing = await query('SELECT data FROM site_settings WHERE id = 1');
    let current = {};
    if (existing.rows.length > 0) {
      current = typeof existing.rows[0].data === 'string' ? JSON.parse(existing.rows[0].data) : existing.rows[0].data;
    }

    // Deep merge for nested objects like branding, themeColors, modules, socialLinks, seo, paymentMethods
    const updated = {
      ...current,
      ...body,
      branding: {
        ...(current.branding || {}),
        ...(body.branding || {})
      },
      themeColors: {
        ...(current.themeColors || {}),
        ...(current.branding?.themeColors || {}),
        ...(body.themeColors || {}),
        ...(body.branding?.themeColors || {})
      },
      modules: {
        ...(current.modules || {}),
        ...(body.modules || {})
      },
      socialLinks: {
        ...(current.socialLinks || {}),
        ...(body.socialLinks || {})
      },
      seo: {
        ...(current.seo || {}),
        ...(body.seo || {})
      },
      paymentMethods: {
        ...(current.paymentMethods || {}),
        ...(body.paymentMethods || {})
      }
    };

    // Keep top-level branding mirrors updated for backward compatibility
    if (body.branding?.brandName || body.brandName) {
      updated.brandName = body.branding?.brandName || body.brandName;
    }
    if (body.branding?.logoUrl || body.logoUrl) {
      updated.logoUrl = body.branding?.logoUrl || body.logoUrl;
    }
    if (body.branding?.faviconUrl || body.faviconUrl) {
      updated.faviconUrl = body.branding?.faviconUrl || body.faviconUrl;
    }

    await query(`
      INSERT INTO site_settings (id, data) VALUES (1, $1)
      ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data
    `, [JSON.stringify(updated)]);

    
    // Synchronize saved settings directly into data/site-config.json
    try {
      const cfgFile = path.resolve(__dirname, '..', '..', '..', 'data', 'site-config.json');
      if (fs.existsSync(cfgFile)) {
        let masterCfg = JSON.parse(fs.readFileSync(cfgFile, 'utf8'));
        if (body.brandName || body.tagline || body.logoUrl || body.faviconUrl) {
          if (!masterCfg.brand) masterCfg.brand = {};
          if (body.brandName) {
            masterCfg.brand.name = body.brandName;
            masterCfg.brand.shortName = body.brandName.trim().split(' ')[0].toUpperCase();
          }
          if (body.tagline) masterCfg.brand.tagline = body.tagline;
          if (body.logoUrl) masterCfg.brand.logo = body.logoUrl;
          if (body.faviconUrl) masterCfg.brand.favicon = body.faviconUrl;
        }
        const incomingColors = body.branding?.themeColors || body.themeColors;
        if (incomingColors) {
          if (!masterCfg.brand) masterCfg.brand = {};
          if (!masterCfg.brand.colors) masterCfg.brand.colors = {};
          if (incomingColors.primary) masterCfg.brand.colors.primary = incomingColors.primary;
          if (incomingColors.secondary) masterCfg.brand.colors.secondary = incomingColors.secondary;
          if (incomingColors.accent) masterCfg.brand.colors.accent = incomingColors.accent;
          if (incomingColors.bg) masterCfg.brand.colors.background = incomingColors.bg;
          if (incomingColors.background) masterCfg.brand.colors.background = incomingColors.background;
          if (incomingColors.text) masterCfg.brand.colors.text = incomingColors.text;
          if (incomingColors.muted) masterCfg.brand.colors.muted = incomingColors.muted;
        }
        if (body.storeAddress || body.supportPhone || body.supportEmail || body.gstin || body.storeTimings) {
          if (!masterCfg.business) masterCfg.business = {};
          if (body.storeAddress) masterCfg.business.address = body.storeAddress;
          if (body.supportPhone) masterCfg.business.phone = body.supportPhone;
          if (body.supportEmail) masterCfg.business.email = body.supportEmail;
          if (body.gstin) masterCfg.business.gstin = body.gstin;
          if (body.storeTimings) masterCfg.business.timings = body.storeTimings;
        }
        if (body.announcementText || body.freeShippingThreshold || body.couponCode) {
          if (!masterCfg.content) masterCfg.content = {};
          if (body.announcementText) masterCfg.content.announcement = body.announcementText;
          if (body.freeShippingThreshold) masterCfg.content.freeShippingThreshold = Number(body.freeShippingThreshold);
          if (body.couponCode) {
            if (!masterCfg.content.coupon) masterCfg.content.coupon = {};
            masterCfg.content.coupon.code = body.couponCode;
            masterCfg.content.coupon.discountPercent = Number(body.discountPercent) || 15;
            masterCfg.content.coupon.active = body.couponActive !== false;
          }
        }
        fs.writeFileSync(cfgFile, JSON.stringify(masterCfg, null, 2), 'utf8');
        try {
          const { syncAll } = require('../utils/sync-site-config');
          syncAll();
        } catch (sErr) {}
      }
    } catch (cfgErr) {
      console.warn('Sync site-config.json on settings save note:', cfgErr.message);
    }
  
    const fullResponse = mergeWithDefaults(updated);
    res.json({ success: true, data: fullResponse });
  } catch (err) {
    console.error('Error updating settings:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/settings/home-showcase
router.post('/home-showcase', async (req, res) => {
  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const { slot, productId, selectedProductIds, customImage, price, mrp, title, subtitle, description, tag, features, remove, swap } = payload;

    const existing = await query('SELECT data FROM site_settings WHERE id = 1');
    let current = {};
    if (existing.rows.length > 0) {
      current = typeof existing.rows[0].data === 'string' ? JSON.parse(existing.rows[0].data) : existing.rows[0].data;
    }

    if (!current.homeShowcase) {
      current.homeShowcase = {
        slot1: { productId: 'prod_oil_01', title: 'Herbal Hair Oil', price: 299, mrp: 599, customImage: 'assets/new-oil-bottle-card.jpg' },
        slot2: { productId: 'prod_shampoo_02', title: 'Hibiscus Flower Shampoo', price: 249, mrp: 549, customImage: 'assets/new-shampoo-bottle-card.jpg' },
        combo: { productId: 'prod_duo_03', title: 'The Royal Hair Ritual (Duo Set)', price: 499, mrp: 1148, customImage: 'assets/duo-ritual-new.jpg', tag: 'BEST VALUE: SAVE ₹149' }
      };
    }

    // 1. SWAP SLOTS (1 ⇄ 2)
    if (swap) {
      const slot1 = current.homeShowcase.slot1 || { productId: 'prod_oil_01', title: 'Herbal Hair Oil', price: 299, mrp: 599, customImage: 'assets/new-oil-bottle-card.jpg' };
      const slot2 = current.homeShowcase.slot2 || { productId: 'prod_shampoo_02', title: 'Hibiscus Flower Shampoo', price: 249, mrp: 549, customImage: 'assets/new-shampoo-bottle-card.jpg' };
      
      current.homeShowcase.slot1 = slot2;
      current.homeShowcase.slot2 = slot1;
      current.homeShowcase.updatedAt = new Date().toISOString();

      await query(`
        INSERT INTO site_settings (id, data) VALUES (1, $1)
        ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data
      `, [JSON.stringify(current)]);

      return res.json({
        success: true,
        message: 'Flagship 1 and Flagship 2 positions swapped successfully!',
        homeShowcase: current.homeShowcase
      });
    }

    // Validate slot for assignment or removal
    if (!slot || !['slot1', 'slot2', 'combo'].includes(slot)) {
      return res.status(400).json({ success: false, message: 'Valid slot (slot1, slot2, or combo) is required.' });
    }

    // 2. TRUE REMOVAL (Mark as removed and disabled so fallback doesn't resurrect it)
    if (remove) {
      current.homeShowcase[slot] = {
        removed: true,
        disabled: true,
        productId: null,
        title: '',
        customImage: '',
        price: 0,
        mrp: 0,
        updatedAt: new Date().toISOString()
      };
    } else {
      let prodObj = null;
      if (productId) {
        const prodRes = await query('SELECT * FROM products WHERE id = $1', [productId]);
        if (prodRes.rows.length > 0) prodObj = prodRes.rows[0];
      }

      current.homeShowcase[slot] = {
        removed: false,
        disabled: false,
        productId: productId || current.homeShowcase[slot]?.productId || 'prod_duo_03',
        customImage: customImage || (prodObj && prodObj.images ? (typeof prodObj.images === 'string' ? JSON.parse(prodObj.images)[0] : prodObj.images[0]) : (current.homeShowcase[slot]?.customImage || '')),
        price: (price !== undefined && price !== '') ? Number(price) : (prodObj ? Number(prodObj.price) : current.homeShowcase[slot]?.price || 0),
        mrp: (mrp !== undefined && mrp !== '') ? Number(mrp) : (prodObj ? Number(prodObj.mrp) : current.homeShowcase[slot]?.mrp || 0),
        title: title || (prodObj ? prodObj.name : current.homeShowcase[slot]?.title || ''),
        subtitle: subtitle || (prodObj ? prodObj.subtitle : current.homeShowcase[slot]?.subtitle || ''),
        description: description !== undefined ? description : (prodObj ? prodObj.description : current.homeShowcase[slot]?.description || ''),
        tag: tag !== undefined ? tag : (current.homeShowcase[slot]?.tag || ''),
        features: features || current.homeShowcase[slot]?.features || [],
        selectedProductIds: (slot === 'combo' && Array.isArray(selectedProductIds)) ? selectedProductIds : (current.homeShowcase[slot]?.selectedProductIds || ['prod_oil_01', 'prod_shampoo_02']),
        updatedAt: new Date().toISOString()
      };

      // If updating combo and we have an associated product, sync prices and images in products table
      if (slot === 'combo' && productId) {
        try {
          const comboImg = customImage ? JSON.stringify([customImage]) : undefined;
          await query(`
            UPDATE products 
            SET price = COALESCE($1, price),
                mrp = COALESCE($2, mrp),
                name = COALESCE($3, name),
                images = COALESCE($4, images),
                description = COALESCE($5, description),
                updated_at = NOW()
            WHERE id = $6
          `, [
            (price !== undefined && price !== '') ? Number(price) : null,
            (mrp !== undefined && mrp !== '') ? Number(mrp) : null,
            title || null,
            comboImg || null,
            description || null,
            productId
          ]);
        } catch (e) {
          console.warn('Sync combo product warning:', e.message);
        }
      }
    }

    current.homeShowcase.updatedAt = new Date().toISOString();

    await query(`
      INSERT INTO site_settings (id, data) VALUES (1, $1)
      ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data
    `, [JSON.stringify(current)]);

    res.json({
      success: true,
      message: remove ? `Removed ${slot} from Home Page showcase.` : `Home showcase ${slot} updated successfully.`,
      homeShowcase: current.homeShowcase
    });
  } catch (err) {
    console.error('Error updating home showcase:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
