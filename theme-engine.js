// Antigravity Universal White-Label Theme & Configuration Engine
(function() {
  function hexToRgba(hex, alpha) {
    if (!hex || typeof hex !== 'string') return '';
    let clean = hex.replace('#', '').trim();
    if (clean.length === 3) clean = clean.split('').map(c => c + c).join('');
    if (clean.length !== 6) return '';
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  function applyTheme(settings) {
    if (!settings) return;
    const root = document.documentElement;

    // Resolve active colors from settings, brand, or branding block
    const colors = settings.brand?.colors || settings.themeColors || settings.branding?.themeColors || settings.colors;
    if (colors) {
      if (colors.primary) {
        root.style.setProperty('--color-lavender-primary', colors.primary);
        root.style.setProperty('--theme-color-primary', colors.primary);
        const pRgba = hexToRgba(colors.primary, 0.12);
        if (pRgba) root.style.setProperty('--color-lavender-light', pRgba);
      }
      if (colors.secondary) {
        root.style.setProperty('--color-gold', colors.secondary);
        root.style.setProperty('--theme-color-secondary', colors.secondary);
        const sRgba = hexToRgba(colors.secondary, 0.18);
        if (sRgba) root.style.setProperty('--color-gold-light', sRgba);
        const glowRgba = hexToRgba(colors.secondary, 0.35);
        if (glowRgba) root.style.setProperty('--gold-glow', `0 4px 20px ${glowRgba}`);
      }
      if (colors.accent) {
        root.style.setProperty('--color-lavender-dark', colors.accent);
        root.style.setProperty('--color-gold-dark', colors.accent);
      }
      if (colors.secondary && colors.accent) {
        root.style.setProperty('--gold-gradient', `linear-gradient(135deg, ${colors.secondary} 0%, ${colors.accent} 100%)`);
      }
      if (colors.bg || colors.background) {
        root.style.setProperty('--color-canvas', colors.bg || colors.background);
      }
      if (colors.backgroundAlt || colors.bgAlt) {
        root.style.setProperty('--color-canvas-alt', colors.backgroundAlt || colors.bgAlt);
      }
      if (colors.surface) {
        root.style.setProperty('--color-surface', colors.surface);
      }
      if (colors.text) {
        root.style.setProperty('--color-text-main', colors.text);
      }
      if (colors.muted) {
        root.style.setProperty('--color-text-muted', colors.muted);
      }

      // Card Background overrides if present
      const c1 = colors.cardBg1 || colors.primary;
      const c2 = colors.cardBg2 || colors.secondary;
      const c3 = colors.bundleBg || colors.accent;

      if (c1) {
        root.style.setProperty('--card-bg-1', c1);
        const card1 = document.getElementById('card-oil');
        if (card1) card1.style.setProperty('--card-bg', c1);
        const flankLeft = document.querySelector('.hero-product-flank--left .hero-flank-card');
        if (flankLeft) flankLeft.style.setProperty('--flank-theme', c1);
      }
      if (c2) {
        root.style.setProperty('--card-bg-2', c2);
        root.style.setProperty('--color-hibiscus-primary', c2);
        const card2 = document.getElementById('card-shampoo');
        if (card2) card2.style.setProperty('--card-bg', c2);
        const flankRight = document.querySelector('.hero-product-flank--right .hero-flank-card');
        if (flankRight) flankRight.style.setProperty('--flank-theme', c2);
      }
      if (c3) {
        root.style.setProperty('--card-bg-bundle', c3);
        root.style.setProperty('--color-bundle-dark', c3);
        const bBanner = document.querySelector('.bundle-banner');
        if (bBanner) bBanner.style.setProperty('--card-bg', c3);
      }
    }

    const rawFav = settings.faviconUrl || settings.brand?.favicon || '';
    const isBadFav = rawFav.includes('unsplash.com') || rawFav.includes('technova-logo') || rawFav.includes('nachiyar-logo');
    const fav = (rawFav && !isBadFav) ? rawFav : '/favicon.png';
    document.querySelectorAll('link[rel*="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').forEach(el => el.href = fav);
    if (settings.customCSS) {
      let customStyleEl = document.getElementById('dynamicCustomCSS');
      if (!customStyleEl) {
        customStyleEl = document.createElement('style');
        customStyleEl.id = 'dynamicCustomCSS';
        document.head.appendChild(customStyleEl);
      }
      customStyleEl.textContent = settings.customCSS;
    }

    const bName = settings.brandName || settings.brand?.name;
    const tag = settings.tagline || settings.brand?.tagline || 'Official Store';
    if (bName && !document.title.includes('Admin') && !document.title.includes('Nimda')) {
      document.title = `${bName} | ${tag}`;
    }
  }

  // Hydrate immediately from cache
  try {
    const liveConfig = JSON.parse(localStorage.getItem('site_config_live') || 'null');
    if (liveConfig && (liveConfig.brand || liveConfig.themeColors)) {
      applyTheme(liveConfig.brand || liveConfig);
    } else {
      const cachedSettings = JSON.parse(localStorage.getItem('nachiyar_store_settings') || localStorage.getItem('crm_active_theme') || 'null');
      if (cachedSettings) {
        if (cachedSettings.brand) {
          if (cachedSettings.brand.logo && (cachedSettings.brand.logo.includes('unsplash.com') || cachedSettings.brand.logo.includes('technova-logo') || cachedSettings.brand.logo.includes('nachiyar-logo'))) {
            cachedSettings.brand.logo = '/assets/logo.png';
          }
          if (cachedSettings.brand.favicon && (cachedSettings.brand.favicon.includes('unsplash.com') || cachedSettings.brand.favicon.includes('technova-logo') || cachedSettings.brand.favicon.includes('nachiyar-logo'))) {
            cachedSettings.brand.favicon = '/favicon.png';
          }
        }
        if (cachedSettings.faviconUrl && (cachedSettings.faviconUrl.includes('unsplash.com') || cachedSettings.faviconUrl.includes('technova-logo') || cachedSettings.faviconUrl.includes('nachiyar-logo'))) {
          cachedSettings.faviconUrl = '/favicon.png';
        }
        applyTheme(cachedSettings);
      }
    }
  } catch (e) {}

  // Async fetch fresh settings from API to guarantee latest live theme
  try {
    fetch('/api/settings/public?_t=' + Date.now(), { cache: 'no-store' })
      .then(r => r.json())
      .then(d => {
        if (d && d.success && d.data) {
          if (localStorage.getItem('nachiyar_has_local_customization') !== 'true') {
            applyTheme(d.data);
            try {
              localStorage.setItem('nachiyar_store_settings', JSON.stringify(d.data));
            } catch (e) {}
          }
        }
      })
      .catch(() => {});
  } catch (e) {}

  // Real-time BroadcastChannel listener for live theme adjustments from Admin
  try {
    const ch = new BroadcastChannel('nachiyar_store_channel');
    ch.onmessage = (e) => {
      if (e.data && (e.data.type === 'THEME_UPDATED' || e.data.type === 'SETTINGS_UPDATED') && e.data.settings) {
        applyTheme(e.data.settings);
      }
    };
  } catch (e) {}

  window.ThemeEngine = { applyDirect: applyTheme };
})();
