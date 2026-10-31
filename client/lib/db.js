import fs from 'fs';
import path from 'path';

// In-memory cache for ultra-fast, zero-latency serverless responses & live synchronization
if (!global.__SITE_CONFIG_CACHE) {
  global.__SITE_CONFIG_CACHE = null;
}

const POSSIBLE_CONFIG_PATHS = [
  '/tmp/site-config.json',
  path.join(process.cwd(), 'public', 'data', 'site-config.json'),
  path.join(process.cwd(), 'data', 'site-config.json'),
  path.join(process.cwd(), '..', 'data', 'site-config.json'),
  path.join(process.cwd(), '..', 'client', 'public', 'data', 'site-config.json')
];

const POSSIBLE_DB_PATHS = [
  '/tmp/db.json',
  path.join(process.cwd(), 'public', 'data', 'db.json'),
  path.join(process.cwd(), 'data', 'db.json'),
  path.join(process.cwd(), '..', 'data', 'db.json'),
  path.join(process.cwd(), '..', 'client', 'public', 'data', 'db.json')
];

/**
 * Single Source of Truth: site-config.json
 */
export function getSiteConfig() {
  if (global.__SITE_CONFIG_CACHE && typeof global.__SITE_CONFIG_CACHE === 'object' && Object.keys(global.__SITE_CONFIG_CACHE).length > 0) {
    return JSON.parse(JSON.stringify(global.__SITE_CONFIG_CACHE));
  }

  for (const p of POSSIBLE_CONFIG_PATHS) {
    if (fs.existsSync(p)) {
      try {
        const raw = fs.readFileSync(p, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          global.__SITE_CONFIG_CACHE = parsed;
          return JSON.parse(JSON.stringify(parsed));
        }
      } catch (e) {}
    }
  }

  return {
    brand: { name: 'Aurelia Chronometry', tagline: 'Mastering The Art Of Timeless Precision', colors: { primary: '#064E3B' } },
    business: { phone: '+91 94455 66778', email: 'concierge@aureliatime.com' },
    content: { announcement: 'SPECIAL PRIVILEGE OFFER • FREE EXPRESS SHIPPING ON ALL ORDERS' },
    categories: [],
    products: [],
    reviews: [],
    users: [
      { id: 'user_nimda', username: 'nimda', password: 'admin', role: 'super_admin', name: 'Super Nimda' },
      { id: 'user_admin', username: 'admin', password: 'admin', role: 'super_admin', name: 'Super Administrator' },
      { id: 'user_murali', username: 'murali', password: '123', role: 'super_admin', name: 'murali' }
    ]
  };
}

/**
 * Save site-config.json to all possible locations including /tmp and in-memory cache
 */
export function saveSiteConfig(config) {
  if (!config || typeof config !== 'object') return;

  // Always update global in-memory cache
  global.__SITE_CONFIG_CACHE = JSON.parse(JSON.stringify(config));

  const jsonStr = JSON.stringify(config, null, 2);

  // 1. Always write to /tmp for Vercel Serverless environment persistence
  try {
    fs.writeFileSync('/tmp/site-config.json', jsonStr, 'utf8');
  } catch (e) {}

  // 2. Write to local project paths
  for (const p of POSSIBLE_CONFIG_PATHS) {
    if (p.startsWith('/tmp')) continue;
    try {
      const dir = path.dirname(p);
      if (fs.existsSync(dir)) {
        fs.writeFileSync(p, jsonStr, 'utf8');
      }
    } catch (e) {}
  }

  // 3. Mirror essential arrays to db.json to guarantee 100% backward compatibility
  try {
    const dbData = {
      products: config.products || [],
      categories: config.categories || [],
      orders: config.orders || [],
      invoices: config.invoices || [],
      inventory_logs: config.inventory_logs || [],
      users: config.users || [
        { id: 'user_nimda', username: 'nimda', password: 'admin', role: 'super_admin', name: 'Super Nimda' },
        { id: 'user_admin', username: 'admin', password: 'admin', role: 'super_admin', name: 'Super Administrator' },
        { id: 'user_murali', username: 'murali', password: '123', role: 'super_admin', name: 'murali' }
      ],
      reviews: config.reviews || [],
      customers: config.customers || [],
      contact_messages: config.contact_messages || [],
      site_settings: {
        brandName: config.brand?.name || '',
        tagline: config.brand?.tagline || '',
        logoUrl: config.brand?.logo || '',
        faviconUrl: config.brand?.favicon || '',
        supportPhone: config.business?.phone || '',
        supportEmail: config.business?.email || '',
        storeAddress: config.business?.address || '',
        gstin: config.business?.gstin || '',
        storeTimings: config.business?.timings || '',
        announcementText: config.content?.announcement || '',
        homeShowcase: config.content?.homeShowcase || config.homeShowcase || {},
        themeColors: config.brand?.colors || {}
      }
    };
    saveDb(dbData, false);
  } catch (e) {}
}

/**
 * getDb() is unified directly with site-config.json
 */
export function getDb() {
  const config = getSiteConfig();

  // Try reading orders, invoices, contact_messages from db.json if not present in config
  let extraDb = {};
  for (const p of POSSIBLE_DB_PATHS) {
    if (fs.existsSync(p)) {
      try {
        extraDb = JSON.parse(fs.readFileSync(p, 'utf8'));
        if (extraDb) break;
      } catch (e) {}
    }
  }

  // Robust unique merging of orders across site-config and db.json
  const allOrders = [
    ...(Array.isArray(config.orders) ? config.orders : []),
    ...(Array.isArray(extraDb.orders) ? extraDb.orders : [])
  ];
  const mergedOrders = [];
  const orderKeys = new Set();
  allOrders.forEach(o => {
    if (!o) return;
    const idKey = o.id ? String(o.id) : null;
    const numKey = o.orderNumber ? String(o.orderNumber) : null;
    if ((idKey && orderKeys.has(idKey)) || (numKey && orderKeys.has(numKey))) return;
    mergedOrders.push(o);
    if (idKey) orderKeys.add(idKey);
    if (numKey) orderKeys.add(numKey);
  });

  return {
    products: Array.isArray(config.products) && config.products.length > 0 ? config.products : (extraDb.products || []),
    categories: Array.isArray(config.categories) && config.categories.length > 0 ? config.categories : (extraDb.categories || []),
    orders: mergedOrders,
    invoices: config.invoices || extraDb.invoices || [],
    inventory_logs: config.inventory_logs || extraDb.inventory_logs || [],
    users: config.users || extraDb.users || [
      { id: 'user_nimda', username: 'nimda', password: 'admin', role: 'super_admin', name: 'Super Nimda' },
      { id: 'user_admin', username: 'admin', password: 'admin', role: 'super_admin', name: 'Super Administrator' },
      { id: 'user_murali', username: 'murali', password: '123', role: 'super_admin', name: 'murali' }
    ],
    reviews: Array.isArray(config.reviews) && config.reviews.length > 0 ? config.reviews : (extraDb.reviews || []),
    customers: config.customers || extraDb.customers || [],
    contact_messages: config.contact_messages || extraDb.contact_messages || [],
    site_settings: {
      brandName: config.brand?.name || 'Aurelia Chronometry',
      tagline: config.brand?.tagline || 'Mastering The Art Of Timeless Precision',
      logoUrl: config.brand?.logo || 'assets/logo.png',
      faviconUrl: config.brand?.favicon || 'favicon.png',
      supportPhone: config.business?.phone || '+91 94455 66778',
      supportEmail: config.business?.email || 'concierge@aureliatime.com',
      storeAddress: config.business?.address || '',
      gstin: config.business?.gstin || '',
      storeTimings: config.business?.timings || 'Mon - Sat: 10:00 AM - 7:30 PM',
      announcementText: config.content?.announcement || '',
      homeShowcase: config.content?.homeShowcase || config.homeShowcase || extraDb.site_settings?.homeShowcase || {},
      themeColors: config.brand?.colors || {},
      paymentMethods: config.paymentMethods || extraDb.paymentMethods || extraDb.site_settings?.paymentMethods || {},
      ...(extraDb.site_settings || {})
    },
    paymentMethods: config.paymentMethods || extraDb.paymentMethods || {
      cod: { enabled: true, label: 'Cash on Delivery (COD)', description: 'Pay cash to courier executive upon delivery' },
      upi: { enabled: true, label: 'UPI / QR (GPay, PhonePe, Paytm, BHIM)', upiId: 'nachiyarherbals18@okaxis', merchantName: 'Aurelia Chronometry' },
      card: { enabled: true, label: 'Credit or Debit Card' },
      netbanking: { enabled: true, label: 'Net Banking' }
    }
  };
}

/**
 * saveDb() writes changes back to site-config.json and db.json
 */
export function saveDb(data, syncToConfig = true) {
  if (!data || typeof data !== 'object') return;

  const jsonStr = JSON.stringify(data, null, 2);

  // 1. Write to /tmp for Vercel
  try {
    fs.writeFileSync('/tmp/db.json', jsonStr, 'utf8');
  } catch (e) {}

  // 2. Write to local paths
  for (const p of POSSIBLE_DB_PATHS) {
    if (p.startsWith('/tmp')) continue;
    try {
      const dir = path.dirname(p);
      if (fs.existsSync(dir)) {
        fs.writeFileSync(p, jsonStr, 'utf8');
      }
    } catch (e) {}
  }

  // 3. Keep site-config.json in sync
  if (syncToConfig) {
    try {
      const config = getSiteConfig();
      if (Array.isArray(data.products)) config.products = data.products;
      if (Array.isArray(data.categories)) config.categories = data.categories;
      if (Array.isArray(data.reviews)) config.reviews = data.reviews;
      if (Array.isArray(data.orders)) config.orders = data.orders;
      if (Array.isArray(data.invoices)) config.invoices = data.invoices;
      if (Array.isArray(data.inventory_logs)) config.inventory_logs = data.inventory_logs;
      if (Array.isArray(data.users)) config.users = data.users;
      if (Array.isArray(data.customers)) config.customers = data.customers;
      if (Array.isArray(data.contact_messages)) config.contact_messages = data.contact_messages;

      if (data.site_settings) {
        if (!config.brand) config.brand = {};
        if (!config.business) config.business = {};
        if (!config.content) config.content = {};

        if (data.site_settings.brandName) config.brand.name = data.site_settings.brandName;
        if (data.site_settings.tagline) config.brand.tagline = data.site_settings.tagline;
        if (data.site_settings.supportPhone) config.business.phone = data.site_settings.supportPhone;
        if (data.site_settings.supportEmail) config.business.email = data.site_settings.supportEmail;
        if (data.site_settings.storeAddress) config.business.address = data.site_settings.storeAddress;
        if (data.site_settings.announcementText) config.content.announcement = data.site_settings.announcementText;
        if (data.site_settings.homeShowcase) {
          config.content.homeShowcase = data.site_settings.homeShowcase;
          config.homeShowcase = data.site_settings.homeShowcase;
        }
        if (data.site_settings.themeColors) {
          config.brand.colors = { ...(config.brand.colors || {}), ...data.site_settings.themeColors };
        }
      }

      saveSiteConfig(config);
    } catch (e) {}
  }
}
