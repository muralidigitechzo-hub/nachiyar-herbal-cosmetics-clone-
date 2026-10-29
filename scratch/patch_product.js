const fs = require('fs');
const path = require('path');

['product.html', 'client/public/product.html'].forEach(relPath => {
  const filePath = path.resolve(__dirname, '..', relPath);
  let content = fs.readFileSync(filePath, 'utf8');
  
  const startIdx = content.indexOf('async function loadProductPage() {');
  const endIdx = content.indexOf('await loadProductPage();');
  
  if (startIdx === -1 || endIdx === -1) {
    console.error('Markers not found in', relPath);
    return;
  }

  const oldCode = content.substring(startIdx, endIdx);
  const newCode = `async function loadProductPage() {
        try {
          const res = await fetch(\`/api/products/\${slug}?_t=\${Date.now()}\`, { cache: 'no-store' }).then(r => r.json()).catch(() => null);
          if (res && res.success && res.data) {
            currentProduct = res.data;
          } else {
            // Direct fallback to /data/db.json
            const dbFallback = await fetch('/data/db.json?_t=' + Date.now()).then(r => r.json()).catch(() => null);
            if (dbFallback && Array.isArray(dbFallback.products)) {
              const cleanSlug = (slug || '').toLowerCase();
              const found = dbFallback.products.find(p => (p.slug && p.slug.toLowerCase() === cleanSlug) || (p.id && p.id.toLowerCase() === cleanSlug));
              if (found) {
                currentProduct = {
                  ...found,
                  price: Number(found.price || 0),
                  mrp: Number(found.mrp || found.compareAtPrice || found.price || 0),
                  category: found.category || 'General',
                  themeColor: found.themeColor || found.theme_color || '#064E3B',
                  images: Array.isArray(found.images) ? found.images : (found.images ? [found.images] : []),
                  metricBadge: found.metricBadge || (typeof found.badge === 'string' ? found.badge : (found.badge?.number ? (found.badge.number + ' ' + (found.badge.unit || '')).trim() : 'PREMIUM'))
                };
              }
            }
            if (!currentProduct) {
              currentProduct = DEFAULT_PRODUCTS_MAP[slug] || Object.values(DEFAULT_PRODUCTS_MAP)[0];
            }
          }
        } catch (e) {
          console.warn('API error, attempting db.json fallback:', e);
          try {
            const dbFallback = await fetch('/data/db.json?_t=' + Date.now()).then(r => r.json()).catch(() => null);
            if (dbFallback && Array.isArray(dbFallback.products)) {
              const cleanSlug = (slug || '').toLowerCase();
              const found = dbFallback.products.find(p => (p.slug && p.slug.toLowerCase() === cleanSlug) || (p.id && p.id.toLowerCase() === cleanSlug));
              if (found) {
                currentProduct = {
                  ...found,
                  price: Number(found.price || 0),
                  mrp: Number(found.mrp || found.compareAtPrice || found.price || 0),
                  category: found.category || 'General',
                  themeColor: found.themeColor || found.theme_color || '#064E3B',
                  images: Array.isArray(found.images) ? found.images : (found.images ? [found.images] : []),
                  metricBadge: found.metricBadge || (typeof found.badge === 'string' ? found.badge : (found.badge?.number ? (found.badge.number + ' ' + (found.badge.unit || '')).trim() : 'PREMIUM'))
                };
              }
            }
          } catch(err) {}
          if (!currentProduct) {
            currentProduct = DEFAULT_PRODUCTS_MAP[slug] || Object.values(DEFAULT_PRODUCTS_MAP)[0];
          }
        }

        if (currentProduct) {
          renderProductPage(currentProduct);
        } else {
          document.getElementById('dynTitle').textContent = 'Product Not Found';
        }
      }

      `;

  content = content.replace(oldCode, newCode);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Successfully updated', relPath);
});
