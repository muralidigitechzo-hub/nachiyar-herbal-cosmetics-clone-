const fs = require('fs');

// 1. Update HTML files
const htmlFiles = [
  'about.html',
  'contact.html',
  'index.html',
  'privacy.html',
  'shipping-policy.html',
  'sitemap.html',
  'terms.html',
  'shop.html',
  'product.html',
  'account.html',
  'checkout.html',
  'client/public/about.html',
  'client/public/contact.html',
  'client/public/index.html',
  'client/public/privacy.html',
  'client/public/shipping-policy.html',
  'client/public/sitemap.html',
  'client/public/terms.html',
  'client/public/shop.html',
  'client/public/product.html'
];

htmlFiles.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    if (content.includes('Shop Timepieces (View & Buy)')) {
      content = content.replace(/Shop Timepieces \(View & Buy\)/g, 'Shop Collections (View & Buy)');
      changed = true;
    }
    if (content.includes('>Shop Timepieces<')) {
      content = content.replace(/>Shop Timepieces</g, '>Shop Collections<');
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Updated HTML:', file);
    }
  }
});

// 2. Update JSON configs
const jsonFiles = [
  'data/site-config.json',
  'data/db.json',
  'client/public/data/site-config.json',
  'client/public/data/db.json'
];

jsonFiles.forEach(file => {
  if (fs.existsSync(file)) {
    let raw = fs.readFileSync(file, 'utf8');
    if (raw.includes('"Shop Timepieces"')) {
      raw = raw.replace(/"Shop Timepieces"/g, '"Shop Collections"');
      fs.writeFileSync(file, raw, 'utf8');
      console.log('Updated JSON:', file);
    }
  }
});
