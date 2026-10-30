const fs = require('fs');

['admin.html', 'nimda.html'].forEach(f => {
  const lines = fs.readFileSync(f, 'utf8').split('\n');
  console.log(`=== ${f} ===`);
  lines.forEach((l, i) => {
    if (l.includes('admin-topbar') || l.includes('admin-layout') || l.includes('class="admin-sidebar"')) {
      console.log(i + 1, l.trim());
    }
  });
});
