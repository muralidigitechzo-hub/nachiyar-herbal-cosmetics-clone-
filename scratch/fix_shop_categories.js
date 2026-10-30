const fs = require('fs');

const targetFunction = `      function updateCategoryFilters(prods, categories) {
        const filtersContainer = document.querySelector('.catalog-filters');
        if (!filtersContainer) return;

        let cats = [];
        if (Array.isArray(categories) && categories.length > 0) {
          cats = categories.map(c => {
            if (typeof c === 'string') {
              const name = c.trim();
              return name && name !== 'undefined' ? { id: name, name } : null;
            }
            if (c && typeof c === 'object') {
              const name = (c.name || c.title || c.label || c.id || '').trim();
              const id = (c.id || c.slug || name).trim();
              return name && name !== 'undefined' ? { id, name } : null;
            }
            return null;
          }).filter(Boolean);
        }

        if (cats.length === 0 && Array.isArray(prods) && prods.length > 0) {
          const unique = [...new Set(prods.map(p => {
            if (typeof p.category === 'string') return p.category.trim();
            if (p.category && typeof p.category === 'object') return (p.category.name || '').trim();
            return '';
          }).filter(Boolean))];
          cats = unique.map(c => ({ id: c, name: c }));
        }

        if (cats.length === 0) return;

        const activeCat = filtersContainer.querySelector('.filter-btn.active')?.dataset.cat || 'all';
        filtersContainer.innerHTML = \`
          <button class="filter-btn \${activeCat === 'all' ? 'active' : ''}" data-cat="all">All Collections</button>
          \${cats.map(c => \`
            <button class="filter-btn \${activeCat === c.id || activeCat === c.name ? 'active' : ''}" data-cat="\${c.id}">\${c.name}</button>
          \`).join('')}
        \`;

        filtersContainer.querySelectorAll('.filter-btn').forEach(btn => {
          btn.onclick = () => {
            filtersContainer.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderCatalog(btn.dataset.cat);
          };
        });
      }`;

['shop.html', 'client/public/shop.html'].forEach(filePath => {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    const oldFnRegex = /function updateCategoryFilters\(prods, categories\) \{[\s\S]*?filtersContainer\.querySelectorAll\('\.filter-btn'\)\.forEach\(btn => \{[\s\S]*?\}\);\s*\}/i;
    if (oldFnRegex.test(content)) {
      content = content.replace(oldFnRegex, targetFunction.trim());
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Successfully patched updateCategoryFilters in:', filePath);
    } else {
      console.error('Regex did not match in:', filePath);
    }
  }
});
