const fs = require('fs');

['theme-engine.js', 'client/public/theme-engine.js'].forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    if (!content.includes('--admin-primary')) {
      content = content.replace(
        "root.style.setProperty('--theme-color-primary', colors.primary);",
        "root.style.setProperty('--theme-color-primary', colors.primary);\n        root.style.setProperty('--admin-primary', colors.primary);\n        root.style.setProperty('--admin-primary-dark', colors.secondary || colors.primary);"
      );
      fs.writeFileSync(f, content, 'utf8');
      console.log('Updated:', f);
    }
  }
});

// Also ensure admin.html includes theme-engine.js
['admin.html', 'client/public/admin.html'].forEach(f => {
  if (fs.existsSync(f)) {
    let content = fs.readFileSync(f, 'utf8');
    if (!content.includes('theme-engine.js')) {
      content = content.replace(
        '<link rel="stylesheet" href="admin.css">',
        '<link rel="stylesheet" href="admin.css">\n  <script src="theme-engine.js"></script>'
      );
      fs.writeFileSync(f, content, 'utf8');
      console.log('Added theme-engine.js to:', f);
    }
  }
});
