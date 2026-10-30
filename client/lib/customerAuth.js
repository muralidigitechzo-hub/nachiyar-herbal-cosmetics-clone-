import crypto from 'crypto';
import { getSiteConfig, saveSiteConfig, getDb, saveDb } from './db.js';

const HMAC_SECRET = process.env.CUSTOMER_SECRET || 'nachiyar_customer_secure_salt_2026';

if (!global.__CUSTOMER_SESSIONS) {
  global.__CUSTOMER_SESSIONS = new Map();
}

if (!global.__CUSTOMER_OTPS) {
  global.__CUSTOMER_OTPS = new Map();
}

export function generateToken() {
  return 'cust_' + crypto.randomBytes(24).toString('hex');
}

export function createCustomerSession(customer) {
  const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000;
  const payload = {
    id: customer.id || ('cust_' + Date.now()),
    email: (customer.email || '').toLowerCase().trim(),
    name: customer.name || '',
    phone: customer.phone || '',
    expiresAt
  };

  const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', HMAC_SECRET).update(payloadStr).digest('base64url');
  const token = `ncst_${payloadStr}.${signature}`;

  global.__CUSTOMER_SESSIONS.set(token, { customer, expiresAt });
  return token;
}

export function getCustomerFromSession(token) {
  if (!token || typeof token !== 'string') return null;

  // 1. Fast in-memory check
  const memSession = global.__CUSTOMER_SESSIONS.get(token);
  if (memSession && Date.now() <= memSession.expiresAt) {
    return memSession.customer;
  }

  // 2. Stateless HMAC verification across all Vercel serverless containers
  if (token.startsWith('ncst_')) {
    const raw = token.slice(5);
    const dotIndex = raw.lastIndexOf('.');
    if (dotIndex > 0) {
      const payloadStr = raw.substring(0, dotIndex);
      const signature = raw.substring(dotIndex + 1);

      const expectedSig = crypto.createHmac('sha256', HMAC_SECRET).update(payloadStr).digest('base64url');
      if (signature.length === expectedSig.length && crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
        try {
          const payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString('utf8'));
          if (payload && payload.expiresAt && Date.now() <= payload.expiresAt) {
            const allCust = getAllCustomers();
            const found = allCust.find(c => 
              (c.id && c.id === payload.id) || 
              (c.email && c.email.toLowerCase() === payload.email)
            );

            const customerData = found ? {
              id: found.id || payload.id,
              name: found.name || payload.name,
              email: found.email || payload.email,
              phone: found.phone || payload.phone,
              address: found.address || '',
              city: found.city || '',
              state: found.state || '',
              pincode: found.pincode || '',
              avatar: found.avatar || '',
              authProvider: found.authProvider || 'local'
            } : {
              id: payload.id,
              name: payload.name,
              email: payload.email,
              phone: payload.phone
            };

            global.__CUSTOMER_SESSIONS.set(token, { customer: customerData, expiresAt: payload.expiresAt });
            return customerData;
          }
        } catch (e) {}
      }
    }
  }

  return null;
}

export function removeCustomerSession(token) {
  if (token) {
    global.__CUSTOMER_SESSIONS.delete(token);
  }
}

export function getAllCustomers() {
  const config = getSiteConfig();
  if (Array.isArray(config.customers) && config.customers.length > 0) {
    return config.customers;
  }
  const db = getDb();
  return Array.isArray(db.customers) ? db.customers : [];
}

export function saveCustomer(customer) {
  const config = getSiteConfig();
  if (!Array.isArray(config.customers)) config.customers = [];

  const existingIdx = config.customers.findIndex(c => 
    c.id === customer.id || (c.email && c.email.toLowerCase() === (customer.email || '').toLowerCase())
  );

  if (existingIdx >= 0) {
    config.customers[existingIdx] = { ...config.customers[existingIdx], ...customer };
  } else {
    config.customers.push(customer);
  }

  saveSiteConfig(config);

  const db = getDb();
  db.customers = config.customers;
  saveDb(db, false);
}

export function setCustomerAuthCookie(res, token) {
  const maxAge = 30 * 24 * 60 * 60; // 30 days in seconds
  res.setHeader('Set-Cookie', `nachiyar_customer_token=${token}; Path=/; Max-Age=${maxAge}; SameSite=Lax`);
}

export function clearCustomerAuthCookie(res) {
  res.setHeader('Set-Cookie', `nachiyar_customer_token=; Path=/; Max-Age=0; SameSite=Lax`);
}
