const fs = require('fs');

function restructure(filePath) {
  if (!fs.existsSync(filePath)) return;
  let html = fs.readFileSync(filePath, 'utf8');

  // Extract topbar-right from original topbar
  const topbarRightMatch = html.match(/<div class="topbar-right">[\s\S]*?<\/header>/i);
  if (!topbarRightMatch) {
    console.error('topbar-right not found in', filePath);
    return;
  }
  let topbarRight = topbarRightMatch[0].replace(/<\/header>/i, '').trim();

  // Make sure user pill uses green theme
  topbarRight = topbarRight.replace(/rgba\(124,\s*90,\s*171,\s*([0-9.]+)\)/g, 'rgba(87, 183, 27, $1)');
  topbarRight = topbarRight.replace(/#6B21A8/g, '#57B71B');

  const newRightTopbar = `
    <!-- Topbar located ONLY to the right of the sidebar, above workspace -->
    <header class="admin-topbar">
      <div class="topbar-left">
        <button class="admin-sidebar-toggle" id="adminSidebarToggle" aria-label="Toggle navigation menu">
          <span class="admin-hamburger-line"></span>
          <span class="admin-hamburger-line"></span>
          <span class="admin-hamburger-line"></span>
        </button>
        <div class="topbar-breadcrumb" style="display: flex; align-items: center; font-size: 0.875rem;">
          <span style="color: #64748B; font-weight: 600;">Console</span>
          <span style="color: #CBD5E1; margin: 0 8px;">/</span>
          <span id="topbarCurrentTab" style="color: #1E293B; font-weight: 700;">Dashboard Overview</span>
        </div>
      </div>
      ${topbarRight}
    </header>
  `;

  const sidebarBrandLockup = `
      <!-- SIDEBAR BRAND LOCKUP (Starts at the very top of sidebar) -->
      <div class="sidebar-brand-lockup">
        <img src="assets/nachiyar-logo.png" alt="Brand Logo" class="admin-logo">
        <div class="brand-info">
          <span class="admin-title">AURELIA CHRONOMETRY</span>
          <span class="admin-subtitle">OPERATIONS & POS CONSOLE</span>
        </div>
        <button class="admin-sidebar-close" id="adminSidebarClose" aria-label="Close menu">✕</button>
      </div>
  `;

  // 1. Remove old topbar spanning above admin-layout
  html = html.replace(/<header class="admin-topbar">[\s\S]*?<\/header>\s*(<!-- =+ MAIN DASHBOARD LAYOUT =+ -->)?\s*<div class="admin-layout">/i, '<div class="admin-layout">');

  // 2. Replace sidebar-header-mobile with sidebarBrandLockup
  if (html.includes('<div class="sidebar-header-mobile">')) {
    html = html.replace(/<div class="sidebar-header-mobile">[\s\S]*?<\/div>/i, sidebarBrandLockup);
  } else {
    html = html.replace(/<aside class="admin-sidebar"[^>]*>/i, `$&${sidebarBrandLockup}`);
  }

  // 3. Wrap workspace in admin-main-wrapper with new right topbar
  html = html.replace(/<main class="admin-workspace"/i, `<div class="admin-main-wrapper">${newRightTopbar}\n    <main class="admin-workspace"`);
  
  // 4. Close admin-main-wrapper right after </main>
  html = html.replace(/<\/main>\s*<\/div>/i, `</main>\n    </div> <!-- .admin-main-wrapper -->\n  </div> <!-- .admin-layout -->`);

  fs.writeFileSync(filePath, html, 'utf8');
  console.log('Restructured:', filePath);
}

['admin.html', 'nimda.html', 'client/public/admin.html', 'client/public/nimda.html'].forEach(restructure);
