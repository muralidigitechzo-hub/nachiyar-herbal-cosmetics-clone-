const fs = require('fs');
const path = require('path');

const DIGITECHZO_COLORS = {
  primary: "#57B71B",
  secondary: "#469815",
  accent: "#00f5a0",
  background: "#FFFFFF",
  backgroundAlt: "#F8FAFC",
  surface: "#FFFFFF",
  text: "#1E242B",
  muted: "#556070",
  cardBg1: "#0F172A",
  cardBg2: "#1E293B",
  bundleBg: "#111827"
};

// 1. Process site-config.json
['data/site-config.json', 'client/public/data/site-config.json'].forEach(filePath => {
  if (fs.existsSync(filePath)) {
    const config = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    // Update brand colors
    if (!config.brand) config.brand = {};
    config.brand.colors = { ...(config.brand.colors || {}), ...DIGITECHZO_COLORS };
    
    // Update customCSS with DigiTechzo styling
    let css = config.customCSS || '';
    
    // Replace old palette occurrences in customCSS
    css = css.replace(/#064E3B/gi, '#57B71B');
    css = css.replace(/#047857/gi, '#469815');
    css = css.replace(/#7C5AAB/gi, '#57B71B');
    css = css.replace(/#583B82/gi, '#469815');
    css = css.replace(/rgba\(6,\s*78,\s*59,\s*([0-9.]+)\)/gi, 'rgba(87, 183, 27, $1)');
    css = css.replace(/rgba\(124,\s*90,\s*171,\s*([0-9.]+)\)/gi, 'rgba(87, 183, 27, $1)');
    
    // Append or prepend global theme definitions
    const digitechzoCssBlock = `
/* ==========================================================================
   DIGITECHZO THEME OVERRIDES (DRIVEN VIA site-config.json)
   ========================================================================== */
:root {
  --color-lavender-primary: #57B71B !important;
  --theme-color-primary: #57B71B !important;
  --color-lavender-dark: #469815 !important;
  --color-gold: #57B71B !important;
  --color-gold-dark: #469815 !important;
  --gold-gradient: linear-gradient(135deg, #57B71B 0%, #469815 100%) !important;
  --gold-glow: 0 4px 20px rgba(87, 183, 27, 0.35) !important;
  --admin-primary: #57B71B !important;
  --admin-primary-dark: #469815 !important;
}

/* Storefront Action Buttons & Accents */
.btn-primary,
.btn-explore,
.btn-cta,
.btn-submit,
.btn-checkout,
.mystery-discount-banner,
.announcement-bar,
.hero-cta-group .btn-primary {
  background: #57B71B !important;
  border-color: #57B71B !important;
  color: #FFFFFF !important;
}

.btn-primary:hover,
.btn-explore:hover,
.hero-cta-group .btn-primary:hover {
  background: #469815 !important;
  border-color: #469815 !important;
}

/* Admin Console Top Action, Sidebar Active Tab, and POS Buttons */
.admin-sidebar-nav .nav-item.is-active,
.admin-sidebar-nav .nav-item.active,
#nav-dashboard.is-active {
  background: #57B71B !important;
  color: #FFFFFF !important;
}

.admin-sidebar-nav .nav-item.is-active .nav-icon svg,
.admin-sidebar-nav .nav-item.active .nav-icon svg {
  stroke: #FFFFFF !important;
}

#btnHeaderNewSale,
#btnOpenPosModal,
.btn-pos-primary,
#btnGenerateInvoice,
#btnReceiptOkClose {
  background: #57B71B !important;
  border-color: #57B71B !important;
  color: #FFFFFF !important;
}

#btnHeaderNewSale:hover,
#btnGenerateInvoice:hover {
  background: #469815 !important;
  border-color: #469815 !important;
}

/* Badges & Metrics in DigiTechzo Green */
.badge-primary,
.badge-success {
  background: rgba(87, 183, 27, 0.12) !important;
  color: #57B71B !important;
  border-color: rgba(87, 183, 27, 0.25) !important;
}
`;

    if (!css.includes('DIGITECHZO THEME OVERRIDES')) {
      css = digitechzoCssBlock + '\n' + css;
    }
    config.customCSS = css;
    
    fs.writeFileSync(filePath, JSON.stringify(config, null, 2), 'utf8');
    console.log('Updated:', filePath);
  }
});

// 2. Process db.json
['data/db.json', 'client/public/data/db.json'].forEach(filePath => {
  if (fs.existsSync(filePath)) {
    const db = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    if (db.site_settings) {
      db.site_settings.themeColors = { ...(db.site_settings.themeColors || {}), ...DIGITECHZO_COLORS };
      if (!db.site_settings.branding) db.site_settings.branding = {};
      db.site_settings.branding.colors = { ...(db.site_settings.branding.colors || {}), ...DIGITECHZO_COLORS };
      
      // Bottom navigation colors
      if (db.site_settings.content && db.site_settings.content.nav && db.site_settings.content.nav.bottomNav) {
        db.site_settings.content.nav.bottomNav.theme = {
          bubbleGradient: "linear-gradient(135deg, #57B71B 0%, #469815 100%)",
          bubbleBorder: "rgba(87, 183, 27, 0.6)",
          activeTextColor: "#57B71B",
          inactiveTextColor: "#556070",
          waveStroke: "rgba(87, 183, 27, 0.22)"
        };
      }
    }
    
    fs.writeFileSync(filePath, JSON.stringify(db, null, 2), 'utf8');
    console.log('Updated:', filePath);
  }
});
