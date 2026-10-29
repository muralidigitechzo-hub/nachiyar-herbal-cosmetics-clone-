/**
 * ==============================================================================
 * NACHIYAR HERBALS & COSMETICS - STANDALONE FILE-BASED JSON DATABASE ENGINE
 * ==============================================================================
 * 100% Isolated, Local, Zero-Database Dependency Architecture.
 * All data reads and writes are safely committed directly to 'data/db.json'.
 * Eliminates PostgreSQL dependency, ports, credentials, and .env files.
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');

// Resolve path to data/db.json
const dataDir = path.resolve(__dirname, '..', '..', '..', 'data');
const dbFilePath = path.join(dataDir, 'db.json');

// Ensure data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// In-memory cache of db.json
let dbCache = null;

// Helper to safely load data/db.json
let lastConfigMtime = 0;

function syncMasterConfig() {
  const siteConfigPath = path.join(dataDir, 'site-config.json');
  if (fs.existsSync(siteConfigPath) && dbCache) {
    try {
      const stat = fs.statSync(siteConfigPath);
      if (stat.mtimeMs !== lastConfigMtime) {
        lastConfigMtime = stat.mtimeMs;
        const cfg = JSON.parse(fs.readFileSync(siteConfigPath, 'utf8'));
        if (Array.isArray(cfg.products) && cfg.products.length > 0) {
          dbCache.products = cfg.products.map(p => ({
            ...p,
            themeColor: p.themeColor || p.theme_color || '#6B4E9B',
            theme_color: p.themeColor || p.theme_color || '#6B4E9B'
          }));
        }
        if (Array.isArray(cfg.categories) && cfg.categories.length > 0) dbCache.categories = cfg.categories;
        if (Array.isArray(cfg.reviews) && cfg.reviews.length > 0) {
          dbCache.reviews = cfg.reviews.map((r, i) => ({
            id: r.id || `rev_${i + 1}`,
            name: r.name || r.customerName || 'Verified Customer',
          product_name: r.product_name || r.productName || 'Verified Creation',
            rating: Number(r.rating) || 5,
            title: r.title || 'Verified Purchase',
            comment: r.comment || '',
            status: 'approved',
            created_at: r.created_at || new Date().toISOString()
          }));
        }
        if (cfg.brand || cfg.business || cfg.content) {
          dbCache.site_settings = {
            ...(dbCache.site_settings || {}),
            brandName: cfg.brand?.name || 'Nachiyar Herbals & Cosmetics',
            tagline: cfg.brand?.tagline || '',
            logoUrl: cfg.brand?.logo || 'assets/logo.png',
            faviconUrl: cfg.brand?.favicon || 'assets/logo.png',
            branding: cfg.brand || {},
            themeColors: cfg.brand?.colors || {},
            modules: cfg.modules || {},
            content: cfg.content || {},
            business: cfg.business || {},
            supportPhone: cfg.business?.phone || '+91 94440 88990',
            supportEmail: cfg.business?.email || 'care@nachiyarherbals.com',
            storeAddress: cfg.business?.address || '',
            gstin: cfg.business?.gstin || '',
            storeTimings: cfg.business?.timings || '',
            announcementText: cfg.content?.announcement || '',
            freeShippingThreshold: cfg.content?.freeShippingThreshold || 599,
            couponCode: cfg.content?.coupon?.code || 'ROYAL15',
            discountPercent: cfg.content?.coupon?.discountPercent || 15,
            couponActive: cfg.content?.coupon?.active !== false
          };
        }
      }
    } catch (e) {
      console.warn('Sync site-config.json note:', e.message);
    }
  }
}

function loadDatabase() {
  if (dbCache) {
    syncMasterConfig();
    return dbCache;
  }

  if (fs.existsSync(dbFilePath)) {
    try {
      const raw = fs.readFileSync(dbFilePath, 'utf8');
      dbCache = JSON.parse(raw);
    } catch (e) {
      console.warn('⚠️ [FileDB] Failed to parse data/db.json, initializing clean store:', e.message);
      dbCache = {};
    }
  } else {
    dbCache = {};
  }

  // Ensure all standard collections exist
  if (!Array.isArray(dbCache.products)) dbCache.products = [];
  if (!Array.isArray(dbCache.categories)) dbCache.categories = [];
  if (!Array.isArray(dbCache.orders)) dbCache.orders = [];
  if (!Array.isArray(dbCache.invoices)) dbCache.invoices = [];
  if (!Array.isArray(dbCache.inventory_logs)) dbCache.inventory_logs = [];
  if (!Array.isArray(dbCache.users)) dbCache.users = [];
  if (!Array.isArray(dbCache.reviews)) dbCache.reviews = [];
  if (!Array.isArray(dbCache.customers)) dbCache.customers = [];
  if (!Array.isArray(dbCache.contact_messages)) dbCache.contact_messages = [];
  if (!Array.isArray(dbCache.marketplace_channels)) dbCache.marketplace_channels = [];
  if (!Array.isArray(dbCache.marketplace_skus)) dbCache.marketplace_skus = [];
  if (!Array.isArray(dbCache.marketplace_orders)) dbCache.marketplace_orders = [];

  // Synchronize from Single Source of Truth Master Config (data/site-config.json)
  const siteConfigPath = path.join(dataDir, 'site-config.json');
  if (fs.existsSync(siteConfigPath)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(siteConfigPath, 'utf8'));
      if (Array.isArray(cfg.products) && cfg.products.length > 0) {
          dbCache.products = cfg.products.map(p => ({
            ...p,
            themeColor: p.themeColor || p.theme_color || '#6B4E9B',
            theme_color: p.themeColor || p.theme_color || '#6B4E9B'
          }));
        }
      if (Array.isArray(cfg.categories) && cfg.categories.length > 0) dbCache.categories = cfg.categories;
      if (Array.isArray(cfg.reviews) && cfg.reviews.length > 0) {
        dbCache.reviews = cfg.reviews.map((r, i) => ({
          id: r.id || `rev_${i + 1}`,
          name: r.name || r.customerName || 'Verified Customer',
          rating: Number(r.rating) || 5,
          title: r.title || 'Verified Purchase',
          comment: r.comment || '',
          status: 'approved',
          created_at: r.created_at || new Date().toISOString()
        }));
      }
      if (cfg.brand || cfg.business || cfg.content) {
        dbCache.site_settings = {
          ...(dbCache.site_settings || {}),
          brandName: cfg.brand?.name || 'Nachiyar Herbals & Cosmetics',
          tagline: cfg.brand?.tagline || '',
          logoUrl: cfg.brand?.logo || 'assets/logo.png',
          faviconUrl: cfg.brand?.favicon || 'assets/logo.png',
          branding: cfg.brand || {},
          themeColors: cfg.brand?.colors || {},
          modules: cfg.modules || {},
          content: cfg.content || {},
          business: cfg.business || {},
          supportPhone: cfg.business?.phone || '+91 94440 88990',
          supportEmail: cfg.business?.email || 'care@nachiyarherbals.com',
          storeAddress: cfg.business?.address || '',
          gstin: cfg.business?.gstin || '',
          storeTimings: cfg.business?.timings || '',
          announcementText: cfg.content?.announcement || '',
          freeShippingThreshold: cfg.content?.freeShippingThreshold || 599,
          couponCode: cfg.content?.coupon?.code || 'ROYAL15',
          discountPercent: cfg.content?.coupon?.discountPercent || 15,
          couponActive: cfg.content?.coupon?.active !== false
        };
      }
    } catch (e) {
      console.warn('Sync site-config.json note:', e.message);
    }
  }

  // Default site_settings
  if (!dbCache.site_settings || typeof dbCache.site_settings !== 'object') {
    dbCache.site_settings = {
      announcementText: 'ROYAL BOTANICAL CARE • FREE PAN-INDIA SHIPPING OVER ₹599',
      freeShippingThreshold: 599,
      brandName: 'Nachiyar Herbals & Cosmetics',
      tagline: 'Pure Botanical Elegance & Ayurvedic Care',
      logoUrl: 'assets/logo.png',
      faviconUrl: 'favicon.png',
      themeColors: {
        primary: '#7C5AAB',
        secondary: '#D4AF37',
        accent: '#583B82',
        bg: '#F9F8F5',
        text: '#191319'
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
        whatsapp: '+919444088990',
        instagram: 'https://instagram.com/nachiyarherbals',
        facebook: 'https://facebook.com/nachiyarherbals',
        youtube: ''
      },
      seo: {
        metaTitle: 'Nachiyar Herbals & Cosmetics | Pure Ayurvedic Hair & Skin Care',
        metaDescription: 'Authentic botanical and Ayurvedic personal care formulations handcrafted in Madurai.'
      },
      gstin: '33AAACH9876K1Z2',
      supportPhone: '+91 94440 88990',
      supportEmail: 'care@nachiyarherbals.com',
      storeTimings: 'Mon - Sat: 9:30 AM - 8:30 PM',
      storeAddress: 'Nachiyar Botanical Heritage, No. 18 Temple Ring Road, Madurai, Tamil Nadu - 625001'
    };
  }

  // Ensure default staff admin user exists
  if (dbCache.users.length === 0) {
    dbCache.users.push(
      { id: 'user_nimda', username: 'nimda', email: 'admin@nachiyarherbals.com', password: 'admin', name: 'Super Nimda', role: 'super_admin', permissions: ['all'] },
      { id: 'user_admin', username: 'admin', email: 'admin@nachiyarherbals.com', password: 'admin', name: 'Super Administrator', role: 'super_admin', permissions: ['all'] },
      { id: 'user_murali', username: 'murali', email: 'muraliii@gmail.com', password: '123', name: 'murali', role: 'super_admin', permissions: ['all'] }
    );
  }

  // Ensure default categories exist
  if (dbCache.categories.length === 0) {
    dbCache.categories.push(
      { id: 'cat_hair_care', name: 'Hair Care', slug: 'hair-care', count: 1 },
      { id: 'cat_scalp', name: 'Scalp & Cleansing', slug: 'scalp-cleansing', count: 1 },
      { id: 'cat_sets', name: 'Ritual Sets & Combos', slug: 'ritual-sets', count: 1 },
      { id: 'cat_gifting', name: 'Royal Gifting', slug: 'royal-gifting', count: 0 }
    );
  }

  return dbCache;
}

// Helper to write changes to data/db.json
function saveDatabase() {
  if (!dbCache) return;
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(dbCache, null, 2), 'utf8');
  } catch (err) {
    console.error('❌ [FileDB] Error persisting data to data/db.json:', err.message);
  }
}

// Initialize database in memory
loadDatabase();

// Automatic watch on site-config.json for instant disk-edit synchronization
let siteConfigWatchDebounce = null;
try {
  const cfgWatchPath = path.join(dataDir, 'site-config.json');
  if (fs.existsSync(cfgWatchPath)) {
    fs.watch(cfgWatchPath, (evt) => {
      if (siteConfigWatchDebounce) clearTimeout(siteConfigWatchDebounce);
      siteConfigWatchDebounce = setTimeout(() => {
        try {
          console.log('🔄 [FileDB] Detected disk change in data/site-config.json, re-synchronizing...');
          reloadDatabase();
          saveDatabase();
        } catch (err) {
          console.warn('Sync watch error:', err.message);
        }
      }, 250);
    });
  }
} catch (e) {}


/**
 * Universal SQL Query Emulator for File-based Storage
 */
async function query(sql, params = []) {
  const db = loadDatabase();
  const trimmed = (sql || '').trim();
  const upper = trimmed.toUpperCase();

  // 1. DDL Statements (CREATE, ALTER, DROP, INDEX, GRANT, DO, PRAGMA) -> Silent No-op
  if (
    upper.startsWith('CREATE ') ||
    upper.startsWith('ALTER ') ||
    upper.startsWith('DROP ') ||
    upper.startsWith('GRANT ') ||
    upper.startsWith('DO ') ||
    upper.startsWith('BEGIN') ||
    upper.startsWith('COMMIT') ||
    upper.startsWith('ROLLBACK')
  ) {
    return { rows: [], rowCount: 0 };
  }

  // 2. Utility queries
  if (upper.startsWith('SELECT NOW()')) {
    return { rows: [{ now: new Date().toISOString() }], rowCount: 1 };
  }
  if (upper === 'SELECT 1') {
    return { rows: [{ '?column?': 1 }], rowCount: 1 };
  }
  if (upper.includes('FROM INFORMATION_SCHEMA.TABLES')) {
    const tableNames = Object.keys(db);
    return { rows: tableNames.map(t => ({ table_name: t })), rowCount: tableNames.length };
  }

  // 3. SITE SETTINGS QUERY
  if (upper.includes('SITE_SETTINGS')) {
    if (upper.startsWith('SELECT')) {
      return {
        rows: [{ id: 1, data: JSON.stringify(db.site_settings) }],
        rowCount: 1
      };
    }
    if (upper.startsWith('INSERT') || upper.startsWith('UPDATE')) {
      let updatedData = {};
      if (params.length > 0) {
        updatedData = typeof params[0] === 'string' ? JSON.parse(params[0]) : params[0];
      }
      db.site_settings = { ...db.site_settings, ...updatedData };
      saveDatabase();
      return {
        rows: [{ id: 1, data: JSON.stringify(db.site_settings) }],
        rowCount: 1
      };
    }
  }

  // Detect table name from query
  const fromMatch = trimmed.match(/(?:FROM|INTO|UPDATE)\s+([a-zA-Z0-9_]+)/i);
  const tableName = fromMatch ? fromMatch[1].toLowerCase() : null;

  if (!tableName || !db[tableName]) {
    // If unknown table, return empty result gracefully
    return { rows: [], rowCount: 0 };
  }

  const collection = db[tableName];

  // 4. COUNT(*) QUERY
  if (upper.includes('COUNT(')) {
    return { rows: [{ count: collection.length.toString() }], rowCount: 1 };
  }

  // 5. SELECT QUERY
  if (upper.startsWith('SELECT')) {
    let results = [...collection];

    // Filter by category
    if (upper.includes('CATEGORY') && params.length > 0) {
      const catParam = params[0]?.toLowerCase();
      if (catParam) {
        results = results.filter(item => 
          (item.category && item.category.toLowerCase() === catParam) ||
          (item.category_id && item.category_id.toLowerCase() === catParam)
        );
      }
    }

    // Filter by ID or Slug
    if (upper.includes('WHERE') && (upper.includes('ID =') || upper.includes('SLUG =') || upper.includes('ORDER_NUMBER =') || upper.includes('INVOICE_NUMBER =') || upper.includes('EMAIL =') || upper.includes('USERNAME ='))) {
      if (params.length > 0) {
        const pVal = String(params[0] || '').toLowerCase().trim();
        results = results.filter(item => {
          const itemId = String(item.id || '').toLowerCase();
          const itemSlug = String(item.slug || '').toLowerCase();
          const itemOrderNo = String(item.order_number || '').toLowerCase();
          const itemInvoiceNo = String(item.invoice_number || '').toLowerCase();
          const itemEmail = String(item.email || '').toLowerCase();
          const itemUser = String(item.username || '').toLowerCase();
          const p2 = params[1] ? String(params[1]).toLowerCase().trim() : null;

          return itemId === pVal ||
                 itemSlug === pVal ||
                 (p2 && itemSlug === p2) ||
                 itemOrderNo === pVal ||
                 itemInvoiceNo === pVal ||
                 itemEmail === pVal ||
                 itemUser === pVal;
        });
      }
    }

    // Filter by status (e.g. status = 'approved' for reviews or status = 'active' for products)
    if (upper.includes("STATUS = 'APPROVED'")) {
      results = results.filter(item => item.status === 'approved');
    } else if (upper.includes("STATUS = 'ACTIVE'")) {
      results = results.filter(item => item.status === 'active');
    }

    // Sorting
    if (upper.includes('ORDER BY CREATED_AT DESC') || upper.includes('ORDER BY TIMESTAMP DESC')) {
      results.sort((a, b) => new Date(b.created_at || b.timestamp || 0) - new Date(a.created_at || a.timestamp || 0));
    } else if (upper.includes('ORDER BY CREATED_AT ASC')) {
      results.sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
    }

    // Limit
    if (upper.includes('LIMIT 1')) {
      results = results.slice(0, 1);
    }

    return { rows: results, rowCount: results.length };
  }

  // 6. INSERT QUERY
  if (upper.startsWith('INSERT')) {
    const colMatch = trimmed.match(/\(([^)]+)\)\s+VALUES/i);
    const cols = colMatch ? colMatch[1].split(',').map(c => c.trim().toLowerCase()) : [];

    const newRecord = {};
    cols.forEach((col, idx) => {
      let val = params[idx];
      // Auto parse JSON strings if needed
      if (typeof val === 'string' && (val.startsWith('{') || val.startsWith('['))) {
        try { val = JSON.parse(val); } catch (e) {}
      }
      newRecord[col] = val;
    });

    if (!newRecord.id) {
      newRecord.id = `${tableName.slice(0, 3)}_${Date.now()}`;
    }
    if (!newRecord.created_at) {
      newRecord.created_at = new Date().toISOString();
    }

    // Upsert check for users, products, categories
    const existingIdx = collection.findIndex(item => 
      (newRecord.id && item.id === newRecord.id) ||
      (newRecord.username && item.username && item.username.toLowerCase() === newRecord.username.toLowerCase()) ||
      (newRecord.slug && item.slug && item.slug.toLowerCase() === newRecord.slug.toLowerCase())
    );

    if (existingIdx !== -1) {
      collection[existingIdx] = { ...collection[existingIdx], ...newRecord };
    } else {
      collection.unshift(newRecord);
    }

    saveDatabase();
    return { rows: [newRecord], rowCount: 1 };
  }

  // 7. UPDATE QUERY
  if (upper.startsWith('UPDATE')) {
    let affected = [];
    const idParam = params[params.length - 1]; // Often the last param is the ID

    collection.forEach(item => {
      const isTarget = idParam && (
        item.id === idParam ||
        item.order_number === idParam ||
        item.invoice_number === idParam ||
        item.slug === idParam
      );

      if (isTarget || !idParam) {
        // Full product update support
        if (tableName === 'products' && params.length >= 10) {
          if (params[0] !== undefined && params[0] !== null) item.name = params[0];
          if (params[1] !== undefined && params[1] !== null) item.subtitle = params[1];
          if (params[2] !== undefined && params[2] !== null) item.category = params[2];
          if (params[3] !== undefined && params[3] !== null) item.category_id = params[3];
          if (params[4] !== undefined && params[4] !== null) item.price = Number(params[4]);
          if (params[5] !== undefined && params[5] !== null) {
            item.mrp = Number(params[5]);
            item.compareAtPrice = Number(params[5]);
          }
          if (params[6] !== undefined && params[6] !== null) item.stock = Number(params[6]);
          if (params[7] !== undefined && params[7] !== null) item.sku = params[7];
          if (params[8] !== undefined && params[8] !== null) {
            try { item.images = typeof params[8] === 'string' ? JSON.parse(params[8]) : params[8]; } catch (e) { item.images = [params[8]]; }
          }
          if (params[9] !== undefined && params[9] !== null) {
            item.themeColor = params[9];
            item.theme_color = params[9];
          }
          if (params[10] !== undefined && params[10] !== null) item.tagline = params[10];
          if (params[11] !== undefined && params[11] !== null) {
            try { item.badge = typeof params[11] === 'string' ? JSON.parse(params[11]) : params[11]; } catch (e) { item.badge = params[11]; }
          }
          if (params[12] !== undefined && params[12] !== null) item.shortDescription = params[12];
          if (params[13] !== undefined && params[13] !== null) item.description = params[13];
          if (params[15] !== undefined && params[15] !== null) item.ingredients = params[15];
          if (params[17] !== undefined && params[17] !== null) {
            try { item.variants = typeof params[17] === 'string' ? JSON.parse(params[17]) : params[17]; } catch (e) {}
          }
          if (params[18] !== undefined && params[18] !== null) item.status = params[18];
          if (params[19] !== undefined && params[19] !== null) item.slug = params[19];
        }
        // Apply updates
        if (upper.includes('STOCK =') && params.length >= 2) {
          item.stock = Number(params[0]);
          if (params.length >= 3) item.online_sold = Number(params[1]);
        }
        
        // Robust Order Cancellation & Status Update Handler
        if (upper.includes("STATUS = 'CANCEL_REQUESTED'") || upper.includes('STATUS = "CANCEL_REQUESTED"')) {
          item.status = 'cancel_requested';
          if (params[0]) {
            try { item.cancellation_details = typeof params[0] === 'string' ? JSON.parse(params[0]) : params[0]; }
            catch (e) { item.cancellation_details = params[0]; }
          }
        } else if (upper.includes("STATUS = 'CANCELLED'") || upper.includes('STATUS = "CANCELLED"')) {
          item.status = 'cancelled';
          if (params[0]) {
            try { item.cancellation_details = typeof params[0] === 'string' ? JSON.parse(params[0]) : params[0]; }
            catch (e) { item.cancellation_details = params[0]; }
          }
        } else if (upper.includes('STATUS =') && params.length >= 1) {
          const val = params[0];
          if (typeof val === 'string' && val.trim().startsWith('{')) {
            try {
              item.cancellation_details = JSON.parse(val);
              item.status = 'cancel_requested';
            } catch (e) {
              item.status = val;
            }
          } else {
            item.status = val;
          }
        }
        item.updated_at = new Date().toISOString();
        affected.push(item);
      }
    });

    saveDatabase();
    return { rows: affected, rowCount: affected.length };
  }

  // 8. DELETE QUERY
  if (upper.startsWith('DELETE')) {
    const idParam = params[0];
    if (idParam) {
      db[tableName] = collection.filter(item => item.id !== idParam && item.slug !== idParam);
      saveDatabase();
    }
    return { rows: [], rowCount: 1 };
  }

  return { rows: [], rowCount: 0 };
}

// Client object for transactions
const clientInstance = {
  query: query,
  release: () => {}
};

// PostgreSQL-compatible Pool Object Mock
const pool = {
  connect: async () => clientInstance,
  query: query,
  end: async () => {},
  on: (event, handler) => {
    if (event === 'connect') handler();
  }
};

function reloadDatabase() {
  dbCache = null;
  return loadDatabase();
}

module.exports = {
  pool,
  query,
  isConnected: () => true,
  getConnectionError: () => null,
  reloadDatabase,
  autoBootstrapSchema: async () => {
    reloadDatabase();
    return Promise.resolve();
  }
};
