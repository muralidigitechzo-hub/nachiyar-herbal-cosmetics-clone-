const fs = require('fs');

const files = [
  'about.html',
  'contact.html',
  'index.html',
  'privacy.html',
  'shipping-policy.html',
  'sitemap.html',
  'terms.html',
  'client/public/about.html',
  'client/public/contact.html',
  'client/public/index.html',
  'client/public/privacy.html',
  'client/public/shipping-policy.html',
  'client/public/sitemap.html',
  'client/public/terms.html'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    if (content.includes('Shop Devices (View & Buy)')) {
      content = content.replace(/Shop Devices \(View & Buy\)/g, 'Shop Timepieces (View & Buy)');
      changed = true;
    }
    if (content.includes('>Shop Devices<')) {
      content = content.replace(/>Shop Devices</g, '>Shop Timepieces<');
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(file, content, 'utf8');
      console.log('Fixed navigation in:', file);
    }
  }
});
