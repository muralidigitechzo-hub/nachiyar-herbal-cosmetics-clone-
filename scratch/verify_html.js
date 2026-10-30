const fs = require('fs');

['admin.html', 'nimda.html', 'client/public/admin.html', 'client/public/nimda.html'].forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  console.log(`=== ${f} ===`);
  console.log('has sidebar-brand-lockup:', content.includes('sidebar-brand-lockup'));
  console.log('has admin-main-wrapper:', content.includes('admin-main-wrapper'));
  console.log('admin-topbar count:', (content.match(/admin-topbar/g) || []).length);
});
