import crypto from 'crypto';
import { getSiteConfig, saveSiteConfig, getDb, saveDb } from './db';

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
  const token = generateToken();
  const session = {
    customer,
    expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000
  };
  global.__CUSTOMER_SESSIONS.set(token, session);
  return token;
}

export function getCustomerFromSession(token) {
  if (!token) return null;
  const session = global.__CUSTOMER_SESSIONS.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    global.__CUSTOMER_SESSIONS.delete(token);
    return null;
  }
  return session.customer;
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
