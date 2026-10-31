const fs = require('fs');

// 1. Update client/pages/api/settings/index.js
const setApi = 'client/pages/api/settings/index.js';
if (fs.existsSync(setApi)) {
  let code = fs.readFileSync(setApi, 'utf8');
  code = code.replace(/brandName:\s*b\.name\s*\|\|\s*'Aurelia Chronometry'/g, "brandName: b.name || 'Digitechzo DigiWatches'");
  code = code.replace(/tagline:\s*b\.tagline\s*\|\|\s*'Mastering The Art Of Timeless Precision'/g, "tagline: b.tagline !== undefined ? b.tagline : ''");
  fs.writeFileSync(setApi, code, 'utf8');
  console.log('Fixed:', setApi);
}

// 2. Update admin.js and client/public/admin.js
['admin.js', 'client/public/admin.js'].forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let js = fs.readFileSync(filePath, 'utf8');

    // Purge stale cache at top of loadAllData
    if (!js.includes('PURGE_STALE_AURELIA_CACHE')) {
      const purgeCode = `
      /* PURGE_STALE_AURELIA_CACHE */
      try {
        const cachedSt = JSON.parse(localStorage.getItem('nachiyar_store_settings') || '{}');
        if (cachedSt && ((cachedSt.brandName && cachedSt.brandName.includes('Aurelia')) || (cachedSt.brand && cachedSt.brand.name && cachedSt.brand.name.includes('Aurelia')))) {
          localStorage.removeItem('nachiyar_store_settings');
        }
      } catch (e) {}
`;
      js = js.replace('async function loadAllData() {', 'async function loadAllData() {' + purgeCode);
    }

    // Always prioritize server settings over localStorage
    js = js.replace(
      /if \(setRes && setRes\.success && setRes\.data\) \{\s*storeSettings = setRes\.data;\s*\}\s*try \{\s*const ls = JSON\.parse\(localStorage\.getItem\('nachiyar_store_settings'\) \|\| 'null'\);\s*if \(ls\) storeSettings = \{ \.\.\.\(storeSettings \|\| \{\}\), \.\.\.ls \};\s*\} catch \(e\) \{\}/i,
      `if (setRes && setRes.success && setRes.data && setRes.data.brandName) {
        storeSettings = setRes.data;
        try { localStorage.setItem('nachiyar_store_settings', JSON.stringify(storeSettings)); } catch(e) {}
      } else {
        try {
          const ls = JSON.parse(localStorage.getItem('nachiyar_store_settings') || 'null');
          if (ls) storeSettings = ls;
        } catch (e) {}
      }`
    );

    // Update branding sync in admin.js
    js = js.replace(
      "const bName = storeSettings.brandName || storeSettings.branding?.brandName || 'NACHIYAR HERBALS';",
      "const bName = storeSettings.brand?.name || storeSettings.brandName || storeSettings.branding?.brandName || 'Digitechzo DigiWatches';"
    );

    fs.writeFileSync(filePath, js, 'utf8');
    console.log('Fixed admin branding in:', filePath);
  }
});

// 3. Update CSS in admin.css and client/public/admin.css so title never truncates
['admin.css', 'client/public/admin.css'].forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let css = fs.readFileSync(filePath, 'utf8');
    css = css.replace(
      /\.sidebar-brand-lockup \.admin-title \{[\s\S]*?\}/i,
      `.sidebar-brand-lockup .admin-title {
  font-family: var(--font-heading) !important;
  font-weight: 800 !important;
  font-size: 0.85rem !important;
  letter-spacing: 0.04em !important;
  color: #FFFFFF !important;
  line-height: 1.25 !important;
  white-space: normal !important;
  word-break: break-word !important;
}`
    );
    fs.writeFileSync(filePath, css, 'utf8');
    console.log('Fixed sidebar title CSS in:', filePath);
  }
});

// 4. Update static welcome-sub and admin-title in HTML files
['admin.html', 'nimda.html', 'client/public/admin.html', 'client/public/nimda.html'].forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let html = fs.readFileSync(filePath, 'utf8');
    
    // Replace welcome message
    html = html.replace(/Welcome to your (TechNova Electronics|Aurelia Chronometry|Nachiyar Herbals) Command Center/g, 'Welcome to your Digitechzo DigiWatches Command Center');
    
    // Replace admin-title
    html = html.replace(/<span class="admin-title">.*?<\/span>/g, '<span class="admin-title">DIGITECHZO DIGIWATCHES</span>');

    fs.writeFileSync(filePath, html, 'utf8');
    console.log('Fixed static title & welcome in:', filePath);
  }
});
