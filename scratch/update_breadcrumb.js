const fs = require('fs');

['admin.js', 'client/public/admin.js'].forEach(f => {
  if (fs.existsSync(f)) {
    let js = fs.readFileSync(f, 'utf8');
    if (!js.includes('topbarCurrentTab')) {
      js = js.replace(
        "localStorage.setItem('nachiyar_admin_active_tab', tabId);",
        `localStorage.setItem('nachiyar_admin_active_tab', tabId);
    const tabTitles = { dashboard: 'Dashboard Overview', products: 'Product Manager', inventory: 'Unified Stock Matrix', billing: 'POS & Offline Billing', invoices: 'Invoice History', orders: 'Online Orders', marketplaces: 'Marketplace Hub', reviews: 'Customer Reviews', messages: 'Customer Inquiries', staff: 'Nimda Accounts', settings: 'Store Settings & SEO' };
    const curEl = document.getElementById('topbarCurrentTab');
    if (curEl) curEl.textContent = tabTitles[tabId] || (tabId.charAt(0).toUpperCase() + tabId.slice(1));`
      );
      fs.writeFileSync(f, js, 'utf8');
      console.log('Updated breadcrumb in:', f);
    }
  }
});
