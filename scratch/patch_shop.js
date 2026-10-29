const fs = require('fs');
const path = require('path');

['shop.html', 'client/public/shop.html'].forEach(relPath => {
  const filePath = path.resolve(__dirname, '..', relPath);
  let content = fs.readFileSync(filePath, 'utf8');
  
  const startIdx = content.indexOf('async function loadShopProducts() {');
  const endIdx = content.indexOf('await loadShopProducts();');
  
  if (startIdx === -1 || endIdx === -1) {
    console.error('Markers not found in', relPath);
    return;
  }

  const oldCode = content.substring(startIdx, endIdx);
  const newCode = `async function loadShopProducts() {
        try {
          const [pRes, sRes] = await Promise.all([
            fetch('/api/products?_t=' + Date.now(), { cache: 'no-store' }).then(r => r.json()).catch(() => null),
            fetch('/api/settings/public?_t=' + Date.now(), { cache: 'no-store' }).then(r => r.json()).catch(() => null)
          ]);

          if (sRes && sRes.success && sRes.data) {
            updateShopPageBranding(sRes.data);
          }

          if (pRes && pRes.success && Array.isArray(pRes.data) && pRes.data.length > 0) {
            allProducts = pRes.data;
          } else {
            // Direct fallback to static /data/db.json
            const dbFallback = await fetch('/data/db.json?_t=' + Date.now()).then(r => r.json()).catch(() => null);
            if (dbFallback && Array.isArray(dbFallback.products)) {
              allProducts = dbFallback.products.map(p => ({
                ...p,
                price: Number(p.price || 0),
                mrp: Number(p.mrp || p.compareAtPrice || p.price || 0),
                category: p.category || 'General',
                themeColor: p.themeColor || p.theme_color || '#064E3B',
                images: Array.isArray(p.images) ? p.images : (p.images ? [p.images] : []),
                metricBadge: p.metricBadge || (typeof p.badge === 'string' ? p.badge : (p.badge?.number ? (p.badge.number + ' ' + (p.badge.unit || '')).trim() : 'PREMIUM'))
              }));
            } else {
              allProducts = [];
            }
          }
          updateCategoryFilters(allProducts, sRes?.data?.categories);
        } catch (e) {
          console.warn('API unavailable, attempting db.json fallback:', e);
          try {
            const dbFallback = await fetch('/data/db.json?_t=' + Date.now()).then(r => r.json()).catch(() => null);
            if (dbFallback && Array.isArray(dbFallback.products)) {
              allProducts = dbFallback.products.map(p => ({
                ...p,
                price: Number(p.price || 0),
                mrp: Number(p.mrp || p.compareAtPrice || p.price || 0),
                category: p.category || 'General',
                themeColor: p.themeColor || p.theme_color || '#064E3B',
                images: Array.isArray(p.images) ? p.images : (p.images ? [p.images] : []),
                metricBadge: p.metricBadge || (typeof p.badge === 'string' ? p.badge : (p.badge?.number ? (p.badge.number + ' ' + (p.badge.unit || '')).trim() : 'PREMIUM'))
              }));
            }
          } catch(err) {}
        }
        renderCatalog(document.querySelector('.filter-btn.active')?.dataset.cat || 'all');
      }

      `;

  content = content.replace(oldCode, newCode);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated', relPath);
});
