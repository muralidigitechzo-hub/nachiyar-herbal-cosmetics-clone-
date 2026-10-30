import fs from 'fs';
import path from 'path';

export function getDb() {
  const possiblePaths = [
    path.join(process.cwd(), 'public', 'data', 'db.json'),
    path.join(process.cwd(), 'data', 'db.json'),
    path.join(process.cwd(), '..', 'data', 'db.json'),
    path.join(__dirname, '..', '..', '..', 'public', 'data', 'db.json'),
    path.join(__dirname, '..', '..', '..', '..', 'data', 'db.json')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        return JSON.parse(fs.readFileSync(p, 'utf8'));
      } catch (e) {}
    }
  }
  return {
    products: [],
    categories: [],
    orders: [],
    invoices: [],
    inventory_logs: [],
    users: [
      { id: 'user_nimda', username: 'nimda', password: 'admin', role: 'super_admin', name: 'Super Nimda' },
      { id: 'user_admin', username: 'admin', password: 'admin', role: 'super_admin', name: 'Super Administrator' },
      { id: 'user_murali', username: 'murali', password: '123', role: 'super_admin', name: 'murali' }
    ],
    reviews: [],
    customers: [],
    contact_messages: [],
    site_settings: {}
  };
}

export function saveDb(data) {
  const possiblePaths = [
    path.join(process.cwd(), 'public', 'data', 'db.json'),
    path.join(process.cwd(), '..', 'data', 'db.json'),
    path.join(process.cwd(), 'data', 'db.json')
  ];

  for (const p of possiblePaths) {
    try {
      const dir = path.dirname(p);
      if (fs.existsSync(dir)) {
        fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
      }
    } catch (e) {}
  }
}

export function getSiteConfig() {
  const possiblePaths = [
    path.join(process.cwd(), 'public', 'data', 'site-config.json'),
    path.join(process.cwd(), 'data', 'site-config.json'),
    path.join(process.cwd(), '..', 'data', 'site-config.json'),
    path.join(__dirname, '..', '..', '..', 'public', 'data', 'site-config.json'),
    path.join(__dirname, '..', '..', '..', '..', 'data', 'site-config.json')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        return JSON.parse(fs.readFileSync(p, 'utf8'));
      } catch (e) {}
    }
  }
  return {};
}

export function saveSiteConfig(data) {
  const possiblePaths = [
    path.join(process.cwd(), 'public', 'data', 'site-config.json'),
    path.join(process.cwd(), '..', 'data', 'site-config.json'),
    path.join(process.cwd(), 'data', 'site-config.json')
  ];

  for (const p of possiblePaths) {
    try {
      const dir = path.dirname(p);
      if (fs.existsSync(dir)) {
        fs.writeFileSync(p, JSON.stringify(data, null, 2), 'utf8');
      }
    } catch (e) {}
  }
}
