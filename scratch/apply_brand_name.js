const fs = require('fs');

const BRAND_NAME = 'Digitechzo DigiWatches';
const SHORT_NAME = 'DIGITECHZO DIGIWATCHES';
const TAGLINE = '';

// 1. Update site-config.json
['data/site-config.json', 'client/public/data/site-config.json'].forEach(filePath => {
  if (fs.existsSync(filePath)) {
    const cfg = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!cfg.brand) cfg.brand = {};
    cfg.brand.name = BRAND_NAME;
    cfg.brand.shortName = SHORT_NAME;
    cfg.brand.tagline = TAGLINE;
    fs.writeFileSync(filePath, JSON.stringify(cfg, null, 2), 'utf8');
    console.log('Updated brand in:', filePath);
  }
});

// 2. Update db.json
['data/db.json', 'client/public/data/db.json'].forEach(filePath => {
  if (fs.existsSync(filePath)) {
    const db = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (db.site_settings) {
      db.site_settings.brandName = BRAND_NAME;
      db.site_settings.tagline = TAGLINE;
      if (!db.site_settings.branding) db.site_settings.branding = {};
      db.site_settings.branding.name = BRAND_NAME;
      db.site_settings.branding.shortName = SHORT_NAME;
      db.site_settings.branding.tagline = TAGLINE;
    }
    fs.writeFileSync(filePath, JSON.stringify(db, null, 2), 'utf8');
    console.log('Updated brand in:', filePath);
  }
});

// 3. Update client/pages/api/settings/public.js
const pubApi = 'client/pages/api/settings/public.js';
if (fs.existsSync(pubApi)) {
  let code = fs.readFileSync(pubApi, 'utf8');
  code = code.replace(/brand\.name\s*\|\|\s*'Aurelia Chronometry'/g, "brand.name || 'Digitechzo DigiWatches'");
  code = code.replace(/brand\.tagline\s*\|\|\s*'Mastering The Art Of Timeless Precision'/g, "brand.tagline !== undefined ? brand.tagline : ''");
  code = code.replace(/\(brand\.name\s*\|\|\s*'Aurelia'\)\.split\(' '\)\[0\]\.toUpperCase\(\)/g, "brand.shortName || brand.name || 'DIGITECHZO DIGIWATCHES'");
  fs.writeFileSync(pubApi, code, 'utf8');
  console.log('Updated:', pubApi);
}

// 4. Update theme-engine.js and client/public/theme-engine.js
['theme-engine.js', 'client/public/theme-engine.js'].forEach(f => {
  if (fs.existsSync(f)) {
    let code = fs.readFileSync(f, 'utf8');
    if (!code.includes('DIGITECHZO_BRAND_SYNC')) {
      const injection = `
    /* DIGITECHZO_BRAND_SYNC */
    const bName = settings.brand?.name || settings.brandName || 'Digitechzo DigiWatches';
    const shortBName = settings.brand?.shortName || bName;
    document.querySelectorAll('.brand-name, #footerBrandName, .dynamic-store-brand').forEach(el => {
      el.textContent = shortBName;
    });
    const tag = settings.tagline !== undefined ? settings.tagline : (settings.brand?.tagline !== undefined ? settings.brand?.tagline : '');
    document.querySelectorAll('.brand-sub').forEach(el => {
      if (tag && tag.trim()) {
        el.textContent = tag.toUpperCase();
        el.style.display = '';
      } else {
        el.textContent = '';
        el.style.display = 'none';
      }
    });
    document.querySelectorAll('.admin-title').forEach(el => el.textContent = bName.toUpperCase());
`;
      code = code.replace("if (settings.customCSS) {", injection + "\n    if (settings.customCSS) {");
      fs.writeFileSync(f, code, 'utf8');
      console.log('Updated brand logic in:', f);
    }
  }
});

// 5. Update app.js and client/public/app.js
['app.js', 'client/public/app.js'].forEach(f => {
  if (fs.existsSync(f)) {
    let code = fs.readFileSync(f, 'utf8');
    code = code.replace(
      "const shortWord = (settings.brand?.shortName || brandName.trim().split(' ')[0]).toUpperCase();",
      "const shortWord = settings.brand?.shortName || brandName || 'DIGITECHZO DIGIWATCHES';"
    );
    code = code.replace(
      /const tagline = settings\.tagline \|\| settings\.brand\?\.tagline;[\s\S]*?document\.querySelectorAll\('\.brand-sub'\)\.forEach\(el => el\.textContent = tagline\.toUpperCase\(\)\);/i,
      `const tagline = settings.tagline !== undefined ? settings.tagline : (settings.brand?.tagline !== undefined ? settings.brand?.tagline : '');
    document.querySelectorAll('.brand-sub').forEach(el => {
      if (tagline && tagline.trim()) {
        el.textContent = tagline.toUpperCase();
        el.style.display = '';
      } else {
        el.textContent = '';
        el.style.display = 'none';
      }
    });`
    );
    fs.writeFileSync(f, code, 'utf8');
    console.log('Updated:', f);
  }
});

// 6. Update shop.html and client/public/shop.html
['shop.html', 'client/public/shop.html'].forEach(f => {
  if (fs.existsSync(f)) {
    let code = fs.readFileSync(f, 'utf8');
    code = code.replace(
      "const sWord = bName.trim().split(' ')[0].toUpperCase();",
      "const sWord = settings.brand?.shortName || bName || 'DIGITECHZO DIGIWATCHES';"
    );
    code = code.replace(
      "document.querySelectorAll('.brand-sub').forEach(el => el.textContent = (settings.tagline || '').toUpperCase());",
      `const sTag = settings.tagline !== undefined ? settings.tagline : (settings.brand?.tagline !== undefined ? settings.brand?.tagline : '');
        document.querySelectorAll('.brand-sub').forEach(el => {
          if (sTag && sTag.trim()) {
            el.textContent = sTag.toUpperCase();
            el.style.display = '';
          } else {
            el.textContent = '';
            el.style.display = 'none';
          }
        });`
    );
    fs.writeFileSync(f, code, 'utf8');
    console.log('Updated branding in:', f);
  }
});

// 7. Update static HTML fallbacks in all pages
const htmlFiles = [
  'index.html', 'shop.html', 'about.html', 'contact.html', 'privacy.html',
  'terms.html', 'shipping-policy.html', 'sitemap.html', 'account.html', 'checkout.html',
  'product.html', 'admin.html', 'nimda.html',
  'client/public/index.html', 'client/public/shop.html', 'client/public/about.html',
  'client/public/contact.html', 'client/public/privacy.html', 'client/public/terms.html',
  'client/public/shipping-policy.html', 'client/public/sitemap.html', 'client/public/account.html',
  'client/public/checkout.html', 'client/public/product.html', 'client/public/admin.html',
  'client/public/nimda.html'
];

htmlFiles.forEach(f => {
  if (fs.existsSync(f)) {
    let h = fs.readFileSync(f, 'utf8');
    let changed = false;

    // Replace <span class="brand-name">AURELIA</span>
    if (h.includes('<span class="brand-name">AURELIA</span>')) {
      h = h.replace(/<span class="brand-name">AURELIA<\/span>/g, '<span class="brand-name">DIGITECHZO DIGIWATCHES</span>');
      changed = true;
    }
    // Remove or empty <span class="brand-sub">MASTERING TIME WITH PRECISION & ELEGANCE</span>
    if (h.includes('MASTERING TIME WITH PRECISION & ELEGANCE')) {
      h = h.replace(/<span class="brand-sub">MASTERING TIME WITH PRECISION & ELEGANCE<\/span>/g, '<span class="brand-sub" style="display:none;"></span>');
      changed = true;
    }

    // Replace in admin-title
    if (h.includes('<span class="admin-title">AURELIA CHRONOMETRY</span>') || h.includes('<span class="admin-title">NACHIYAR HERBALS</span>')) {
      h = h.replace(/<span class="admin-title">(AURELIA CHRONOMETRY|NACHIYAR HERBALS)<\/span>/g, '<span class="admin-title">DIGITECHZO DIGIWATCHES</span>');
      changed = true;
    }

    if (changed) {
      fs.writeFileSync(f, h, 'utf8');
      console.log('Updated static HTML:', f);
    }
  }
});
