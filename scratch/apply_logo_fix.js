const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

// 1. Update app.js
const appJsPath = path.join(rootDir, 'app.js');
let appJs = fs.readFileSync(appJsPath, 'utf8');

const oldAppBlock = `    // 3. Dynamic Logo & Favicon from JSON
    const logoUrl = settings.brand?.logo || settings.logoUrl || settings.branding?.logoUrl || '';
    const activeLogo = logoUrl;
    const primaryCol = settings.brand?.colors?.primary || settings.themeColors?.primary || '#1E1B24';
    const secCol = settings.brand?.colors?.secondary || settings.themeColors?.secondary || '#D4AF37';
    const fallbackSvg = \`data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"><circle cx="30" cy="30" r="28" fill="\${encodeURIComponent(primaryCol)}" stroke="\${encodeURIComponent(secCol)}" stroke-width="2.5"/><text x="50%" y="54%" font-family="sans-serif" font-size="20" font-weight="700" fill="\${encodeURIComponent(secCol)}" dominant-baseline="middle" text-anchor="middle">\${initials}</text></svg>\`;

    document.querySelectorAll('.brand-logo-img, .footer-crest-img, .admin-logo').forEach(img => {
      if (activeLogo) {
        img.onerror = function() {
          this.onerror = null;
          this.src = fallbackSvg;
        };
        img.src = activeLogo;
      } else {
        img.src = fallbackSvg;
      }
    });

    // Dynamic Browser Tab Favicon from JSON
    const faviconHref = settings.brand?.favicon || settings.faviconUrl || activeLogo || fallbackSvg;
    document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').forEach(el => {
      el.href = faviconHref;
    });`;

const newAppBlock = `    // 3. Fixed Brand Logo & Favicon across the clone
    const rawLogo = settings.brand?.logo || settings.logoUrl || settings.branding?.logoUrl || '';
    const isExternalProductPic = rawLogo.includes('unsplash.com') || rawLogo.includes('nachiyar-logo') || rawLogo.includes('technova-logo') || rawLogo.includes('fashion-logo');
    const activeLogo = (rawLogo && !isExternalProductPic) ? rawLogo : '/assets/logo.png';
    const fallbackLogo = '/assets/logo.png';

    document.querySelectorAll('.brand-logo-img, .footer-crest-img, .admin-logo').forEach(img => {
      img.onerror = function() {
        this.onerror = null;
        this.src = fallbackLogo;
      };
      img.src = activeLogo;
    });

    // Dynamic Browser Tab Favicon
    const rawFavicon = settings.brand?.favicon || settings.faviconUrl || '';
    const isExternalFavicon = rawFavicon.includes('unsplash.com') || rawFavicon.includes('nachiyar-logo') || rawFavicon.includes('technova-logo');
    const faviconHref = (rawFavicon && !isExternalFavicon) ? rawFavicon : '/favicon.png';
    document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').forEach(el => {
      el.href = faviconHref;
    });`;

if (appJs.includes(oldAppBlock)) {
  appJs = appJs.replace(oldAppBlock, newAppBlock);
  fs.writeFileSync(appJsPath, appJs, 'utf8');
  console.log('Successfully updated app.js');
} else {
  console.log('Warning: oldAppBlock not found in app.js, checking with normalized line endings');
  const normApp = appJs.replace(/\r\n/g, '\n');
  const normOld = oldAppBlock.replace(/\r\n/g, '\n');
  if (normApp.includes(normOld)) {
    const replaced = normApp.replace(normOld, newAppBlock.replace(/\r\n/g, '\n'));
    fs.writeFileSync(appJsPath, replaced.replace(/\n/g, '\r\n'), 'utf8');
    console.log('Successfully updated app.js (normalized)');
  } else {
    console.log('Could not match in app.js');
  }
}

// 2. Update admin.js
const adminJsPath = path.join(rootDir, 'admin.js');
let adminJs = fs.readFileSync(adminJsPath, 'utf8');
let normAdmin = adminJs.replace(/\r\n/g, '\n');

// Replace bLogo logic in admin.js
normAdmin = normAdmin.replace(
  `let bLogo = storeSettings.logoUrl || storeSettings.branding?.logoUrl || '';\n        if (!isH && (bLogo.includes('nachiyar-logo') || !bLogo)) bLogo = '';`,
  `let bLogo = storeSettings.logoUrl || storeSettings.branding?.logoUrl || '/assets/logo.png';\n        if (bLogo.includes('unsplash.com') || bLogo.includes('nachiyar-logo') || bLogo.includes('technova-logo') || !bLogo) bLogo = '/assets/logo.png';`
);

normAdmin = normAdmin.replace(
  `document.getElementById('setBrandLogoUrl').value = branding.logoUrl || storeSettings.logoUrl || 'assets/nachiyar-logo.png';`,
  `document.getElementById('setBrandLogoUrl').value = (branding.logoUrl || storeSettings.logoUrl || 'assets/logo.png').replace(/.*unsplash\\.com.*/, 'assets/logo.png');`
);

normAdmin = normAdmin.replace(
  `const bLogo = document.getElementById('setBrandLogoUrl')?.value || 'assets/nachiyar-logo.png';`,
  `const bLogo = document.getElementById('setBrandLogoUrl')?.value || 'assets/logo.png';`
);

fs.writeFileSync(adminJsPath, normAdmin.replace(/\n/g, '\r\n'), 'utf8');
console.log('Successfully updated admin.js');

// 3. Update shop.html
const shopPath = path.join(rootDir, 'shop.html');
let shopHtml = fs.readFileSync(shopPath, 'utf8');
let normShop = shopHtml.replace(/\r\n/g, '\n');

const oldShopLogic = `        let aLogo = settings.logoUrl || settings.branding?.logoUrl || '';
        if (!isH && (aLogo.includes('store-logo') || !aLogo)) aLogo = '';

        const crestSvg = \`data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60"><circle cx="30" cy="30" r="28" fill="%231E1B24" stroke="%23D4AF37" stroke-width="2"/><text x="50%" y="54%" font-family="Cinzel,Playfair Display,serif" font-size="20" font-weight="700" fill="%23D4AF37" dominant-baseline="middle" text-anchor="middle">\${inits}</text></svg>\`;
        document.querySelectorAll('.brand-logo-img, .footer-crest-img').forEach(img => {
          if (aLogo) {
            img.onerror = function() { this.onerror = null; this.src = crestSvg; };
            img.src = aLogo;
          } else {
            img.src = crestSvg;
          }
        });`;

const newShopLogic = `        let aLogo = settings.logoUrl || settings.branding?.logoUrl || '/assets/logo.png';
        if (aLogo.includes('unsplash.com') || aLogo.includes('nachiyar-logo') || aLogo.includes('technova-logo') || aLogo.includes('store-logo') || !aLogo) {
          aLogo = '/assets/logo.png';
        }

        document.querySelectorAll('.brand-logo-img, .footer-crest-img').forEach(img => {
          img.onerror = function() { this.onerror = null; this.src = '/assets/logo.png'; };
          img.src = aLogo;
        });`;

if (normShop.includes(oldShopLogic)) {
  normShop = normShop.replace(oldShopLogic, newShopLogic);
  fs.writeFileSync(shopPath, normShop.replace(/\n/g, '\r\n'), 'utf8');
  console.log('Successfully updated shop.html');
}

// 4. Update server/src/routes/config.js
const serverConfigPath = path.join(rootDir, 'server', 'src', 'routes', 'config.js');
if (fs.existsSync(serverConfigPath)) {
  let srvCfg = fs.readFileSync(serverConfigPath, 'utf8').replace(/\r\n/g, '\n');
  srvCfg = srvCfg.replace(
    `logoUrl: newConfig.brand?.logo || db.site_settings?.logoUrl,`,
    `logoUrl: (newConfig.brand?.logo && !newConfig.brand.logo.includes('unsplash.com')) ? newConfig.brand.logo : (db.site_settings?.logoUrl || '/assets/logo.png'),`
  );
  srvCfg = srvCfg.replace(
    `faviconUrl: newConfig.brand?.favicon || db.site_settings?.faviconUrl,`,
    `faviconUrl: (newConfig.brand?.favicon && !newConfig.brand.favicon.includes('unsplash.com')) ? newConfig.brand.favicon : (db.site_settings?.faviconUrl || '/favicon.png'),`
  );
  fs.writeFileSync(serverConfigPath, srvCfg.replace(/\n/g, '\r\n'), 'utf8');
  console.log('Successfully updated server/src/routes/config.js');
}

console.log('All logo scripts applied cleanly.');
