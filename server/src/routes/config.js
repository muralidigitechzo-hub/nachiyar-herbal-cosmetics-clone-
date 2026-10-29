const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const configPath = path.resolve(__dirname, '..', '..', '..', 'data', 'site-config.json');
const dbPath = path.resolve(__dirname, '..', '..', '..', 'data', 'db.json');

// Helper to safely read site-config.json
function getConfig() {
  if (fs.existsSync(configPath)) {
    try {
      const raw = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(raw);
    } catch (e) {
      console.error('Error reading site-config.json:', e);
    }
  }
  return null;
}

// GET /api/config - Returns the complete single source of truth configuration
router.get('/', (req, res) => {
  const config = getConfig();
  if (!config) {
    return res.status(500).json({ success: false, message: 'Configuration file missing or invalid.' });
  }
  res.json({ success: true, data: config });
});

// PUT /api/config - Replaces or updates the entire project configuration
router.put('/', (req, res) => {
  try {
    const newConfig = req.body;
    if (!newConfig || typeof newConfig !== 'object') {
      return res.status(400).json({ success: false, message: 'Valid JSON configuration object required.' });
    }

    // Write to data/site-config.json
    fs.writeFileSync(configPath, JSON.stringify(newConfig, null, 2), 'utf8');

    // Also sync into data/db.json so existing endpoints remain in sync
    if (fs.existsSync(dbPath)) {
      try {
        let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
        if (Array.isArray(newConfig.products)) db.products = newConfig.products;
        if (Array.isArray(newConfig.categories)) db.categories = newConfig.categories;
        if (Array.isArray(newConfig.reviews)) {
          db.reviews = newConfig.reviews.map((r, i) => ({
            id: r.id || `rev_${i + 1}`,
            name: r.name || r.customerName || 'Verified Customer',
            rating: Number(r.rating) || 5,
            title: r.title || 'Verified Purchase',
            comment: r.comment || '',
            status: 'approved',
            created_at: r.created_at || new Date().toISOString()
          }));
        }
        if (newConfig.brand || newConfig.business || newConfig.content || newConfig.products) {
          const p0 = Array.isArray(newConfig.products) ? newConfig.products[0] : null;
          const p1 = Array.isArray(newConfig.products) ? newConfig.products[1] : null;
          const p2 = Array.isArray(newConfig.products) ? newConfig.products[2] : null;
          const showcase = newConfig.homeShowcase || {
            slot1: p0 ? { productId: p0.id, title: p0.name, subtitle: p0.subtitle, price: p0.price, mrp: p0.mrp, customImage: (p0.images && p0.images[0]) || '' } : null,
            slot2: p1 ? { productId: p1.id, title: p1.name, subtitle: p1.subtitle, price: p1.price, mrp: p1.mrp, customImage: (p1.images && p1.images[0]) || '' } : null,
            combo: p2 ? { productId: p2.id, title: p2.name, subtitle: p2.subtitle, price: p2.price, mrp: p2.mrp, customImage: (p2.images && p2.images[0]) || '', tag: 'BEST VALUE' } : null
          };

          db.site_settings = {
            brandName: newConfig.brand?.name || db.site_settings?.brandName,
            tagline: newConfig.brand?.tagline || db.site_settings?.tagline,
            logoUrl: (newConfig.brand?.logo && !newConfig.brand.logo.includes('unsplash.com')) ? newConfig.brand.logo : (db.site_settings?.logoUrl || '/assets/logo.png'),
            faviconUrl: (newConfig.brand?.favicon && !newConfig.brand.favicon.includes('unsplash.com')) ? newConfig.brand.favicon : (db.site_settings?.faviconUrl || '/favicon.png'),
            supportPhone: newConfig.business?.phone || db.site_settings?.supportPhone,
            supportEmail: newConfig.business?.email || db.site_settings?.supportEmail,
            storeAddress: newConfig.business?.address || db.site_settings?.storeAddress,
            gstin: newConfig.business?.gstin || db.site_settings?.gstin,
            storeTimings: newConfig.business?.timings || db.site_settings?.storeTimings,
            announcementText: newConfig.content?.announcement || db.site_settings?.announcementText,
            freeShippingThreshold: newConfig.content?.freeShippingThreshold || db.site_settings?.freeShippingThreshold,
            couponCode: newConfig.content?.coupon?.code || db.site_settings?.couponCode,
            discountPercent: newConfig.content?.coupon?.discountPercent || db.site_settings?.discountPercent,
            couponActive: newConfig.content?.coupon?.active !== false,
            branding: newConfig.brand || {},
            themeColors: newConfig.brand?.colors || {},
            modules: newConfig.modules || {},
            socialLinks: newConfig.business?.socialLinks || {},
            content: newConfig.content || {},
            homeShowcase: showcase
          };
        }
        fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
      } catch (dbErr) {
        console.warn('Sync db.json warning:', dbErr.message);
      }
    }

    // Refresh memory cache in server/src/config/db.js immediately
    try {
      const dbModule = require('../config/db');
      if (typeof dbModule.reloadDatabase === 'function') {
        dbModule.reloadDatabase();
      }
    } catch (e) {}

    res.json({
      success: true,
      message: 'Whole store configuration updated successfully!',
      data: newConfig
    });
  } catch (err) {
    console.error('Error saving config:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
