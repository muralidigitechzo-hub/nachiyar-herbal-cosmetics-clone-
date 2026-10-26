/**
 * ==============================================================================
 * CRM REUSABLE PRODUCT ARCHITECTURE: DYNAMIC THEME & CONFIGURATION ENGINE
 * ==============================================================================
 * Automatically classifies and hydrates:
 * 1. Configurable Branding (Logo, Favicon, Brand Name, Tagline, Typography)
 * 2. Dynamic Theming (CSS Variables for Primary, Secondary, Accent, Background)
 * 3. Feature Flags & Module Toggles (Reviews, Marketplaces, Billing, WhatsApp, Coupons)
 * 4. Multi-Tab Synchronization via BroadcastChannel
 * ==============================================================================
 */

(function () {
  'use strict';

  // 1. FAST LOCAL STORAGE CACHE REHYDRATION (Zero Layout Shift & Zero Flash)
  try {
    const cached = localStorage.getItem('crm_active_theme');
    if (cached) {
      applyThemeAndSettings(JSON.parse(cached), false);
    }
  } catch (e) {
    console.warn('[ThemeEngine] LocalStorage read warning:', e);
  }

  // 2. FETCH LATEST DYNAMIC SETTINGS FROM SERVER
  async function fetchAndApplySettings() {
    try {
      const res = await fetch('/api/settings/public?_t=' + Date.now(), { cache: 'no-store' });
      if (!res.ok) return;
      const json = await res.json();
      if (json.success && json.data) {
        try {
          localStorage.setItem('crm_active_theme', JSON.stringify(json.data));
        } catch (e) {}
        applyThemeAndSettings(json.data, true);
      }
    } catch (err) {
      console.warn('[ThemeEngine] Failed to fetch settings from server:', err);
    }
  }

  // Execute fetch when DOM is ready or immediate
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchAndApplySettings);
  } else {
    fetchAndApplySettings();
  }

  // 3. LISTEN FOR REAL-TIME SETTINGS CHANGES FROM ADMIN (BroadcastChannel)
  try {
    const channel = new BroadcastChannel('nachiyar_store_channel');
    channel.onmessage = function (event) {
      if (event.data && (event.data.type === 'SETTINGS_UPDATED' || event.data.type === 'THEME_UPDATED' || event.data.type === 'settings_updated')) {
        if (event.data.settings) {
          try {
            localStorage.setItem('crm_active_theme', JSON.stringify(event.data.settings));
          } catch (e) {}
          applyThemeAndSettings(event.data.settings, true);
        } else {
          fetchAndApplySettings();
        }
      }
    };
  } catch (e) {}

  /**
   * Main function to apply branding, colors, and module toggles to the DOM
   */
  function applyThemeAndSettings(data, isLive) {
    if (!data) return;

    const branding = data.branding || {};
    const colors = branding.themeColors || data.themeColors || {};
    const modules = data.modules || {};
    const brandName = branding.brandName || data.brandName || 'Nachiyar Herbals & Cosmetics';
    const tagline = branding.tagline || data.tagline || '';
    let logoUrl = branding.logoUrl || data.logoUrl || 'assets/nachiyar-logo.png';
    if (logoUrl === 'assets/logo.png') logoUrl = 'assets/nachiyar-logo.png';
    let faviconUrl = branding.faviconUrl || data.faviconUrl || 'assets/nachiyar-logo.png';

    // ----------------------------------------------------
    // A. INJECT DYNAMIC CSS VARIABLES INTO :root
    // ----------------------------------------------------
    const root = document.documentElement;

    if (colors.primary) {
      root.style.setProperty('--brand-primary', colors.primary);
      root.style.setProperty('--color-lavender-primary', colors.primary);
      root.style.setProperty('--admin-primary', colors.primary);
      root.style.setProperty('--theme-color-primary', colors.primary);
    }

    if (colors.secondary) {
      root.style.setProperty('--brand-secondary', colors.secondary);
      root.style.setProperty('--color-gold', colors.secondary);
      root.style.setProperty('--admin-accent', colors.secondary);
      root.style.setProperty('--theme-color-secondary', colors.secondary);
    }

    if (colors.accent) {
      root.style.setProperty('--brand-accent', colors.accent);
      root.style.setProperty('--color-lavender-dark', colors.accent);
    }

    if (colors.bg) {
      root.style.setProperty('--brand-bg', colors.bg);
      root.style.setProperty('--color-canvas', colors.bg);
    }

    if (colors.text) {
      root.style.setProperty('--brand-text', colors.text);
      root.style.setProperty('--color-text-main', colors.text);
    }

    // ----------------------------------------------------
    // B. DYNAMIC LOGO & CREST INJECTION
    // ----------------------------------------------------
    if (logoUrl) {
      const logoImgs = document.querySelectorAll('.brand-logo-img, .footer-crest-img, .admin-logo-img, img[data-dynamic-logo]');
      logoImgs.forEach(img => {
        img.onerror = function() {
          this.onerror = null;
          this.src = 'assets/nachiyar-logo.png';
        };
        if (img.getAttribute('src') !== logoUrl) {
          img.setAttribute('src', logoUrl);
        }
      });
    }

    // ----------------------------------------------------
    // C. DYNAMIC FAVICON INJECTION
    // ----------------------------------------------------
    if (faviconUrl) {
      let iconLink = document.querySelector('link[rel="icon"]') || document.querySelector('link[rel="shortcut icon"]');
      if (!iconLink) {
        iconLink = document.createElement('link');
        iconLink.rel = 'icon';
        document.head.appendChild(iconLink);
      }
      if (iconLink.getAttribute('href') !== faviconUrl) {
        iconLink.setAttribute('href', faviconUrl);
      }
    }

    // ----------------------------------------------------
    // D. DYNAMIC BRAND NAME, TAGLINE & TITLES
    // ----------------------------------------------------
    if (brandName) {
      // Split into main word & subtitle if needed (e.g. "NACHIYAR" & "HERBALS & COSMETICS")
      const words = brandName.trim().split(' ');
      const mainWord = words[0].toUpperCase();
      const subWords = words.length > 1 ? words.slice(1).join(' ').toUpperCase() : (tagline ? tagline.toUpperCase() : '');

      const brandNameEls = document.querySelectorAll('.brand-name, [data-dynamic-brand-name]');
      brandNameEls.forEach(el => {
        el.textContent = mainWord;
      });

      const brandSubEls = document.querySelectorAll('.brand-sub, [data-dynamic-brand-sub]');
      brandSubEls.forEach(el => {
        if (subWords) {
          el.textContent = subWords;
          el.style.display = '';
        }
      });

      const watermarkEls = document.querySelectorAll('.footer-watermark-text');
      watermarkEls.forEach(el => {
        el.textContent = mainWord;
      });

      const fullBrandEls = document.querySelectorAll('#footerBrandName, .dynamic-brand-full');
      fullBrandEls.forEach(el => {
        el.textContent = brandName.toUpperCase();
      });

      // Update footer copyright year & brand
      const legalP = document.querySelector('.footer-legal-bar p');
      if (legalP && !legalP.classList.contains('legal-links') && !legalP.classList.contains('footer-developer-credit')) {
        legalP.textContent = `© ${new Date().getFullYear()} ${brandName.toUpperCase()}. ALL RIGHTS RESERVED.`;
      }

      // Dynamic Page Title (if on home page or default title)
      if (document.title.includes('Nachiyar') || document.title.includes('Apothecary') || document.title.includes('CRM') || document.title.includes('Admin')) {
        const isNimda = window.location.pathname.includes('nimda');
        if (isNimda) {
          document.title = `${brandName} | Master Executive Command Console`;
        } else if (data.seo && data.seo.metaTitle) {
          document.title = data.seo.metaTitle;
        } else {
          document.title = `${brandName}${tagline ? ' | ' + tagline : ''}`;
        }
      }
    }

    // ----------------------------------------------------
    // E. MODULE TOGGLES (FEATURE FLAGS)
    // ----------------------------------------------------

    // 1. Reviews Module Toggle
    const reviewsSection = document.getElementById('customer-reviews-section');
    const reviewsNavLinks = document.querySelectorAll('a[href*="review"], a[href="#customer-reviews-section"]');
    const btnOpenReviewModal = document.getElementById('btnOpenReviewModal');
    const adminReviewsTab = document.getElementById('tabNavReviews');
    const adminReviewsPane = document.getElementById('pane-reviews');

    if (modules.reviews === false) {
      if (reviewsSection) reviewsSection.style.display = 'none';
      if (btnOpenReviewModal) btnOpenReviewModal.style.display = 'none';
      reviewsNavLinks.forEach(link => link.closest('li') ? (link.closest('li').style.display = 'none') : (link.style.display = 'none'));
      if (adminReviewsTab) adminReviewsTab.style.display = 'none';
      if (adminReviewsPane) adminReviewsPane.style.display = 'none';
    } else {
      if (reviewsSection) reviewsSection.style.display = '';
      if (btnOpenReviewModal) btnOpenReviewModal.style.display = '';
      reviewsNavLinks.forEach(link => link.closest('li') ? (link.closest('li').style.display = '') : (link.style.display = ''));
      if (adminReviewsTab) adminReviewsTab.style.display = '';
    }

    // 2. Marketplaces Module Toggle (Amazon, Flipkart, Meesho)
    const adminMktTab = document.getElementById('tabNavMarketplaces');
    const adminMktPane = document.getElementById('pane-marketplaces');
    if (modules.marketplaces === false) {
      if (adminMktTab) adminMktTab.style.display = 'none';
      if (adminMktPane) adminMktPane.style.display = 'none';
    } else {
      if (adminMktTab) adminMktTab.style.display = '';
    }

    // 3. Billing & POS Invoices Module Toggle
    const adminBillingTab = document.getElementById('tabNavBilling');
    const adminInvoicesTab = document.getElementById('tabNavInvoices');
    if (modules.billing === false) {
      if (adminBillingTab) adminBillingTab.style.display = 'none';
      if (adminInvoicesTab) adminInvoicesTab.style.display = 'none';
    } else {
      if (adminBillingTab) adminBillingTab.style.display = '';
      if (adminInvoicesTab) adminInvoicesTab.style.display = '';
    }

    // 4. Coupons & Promotional Banner Toggle
    const promoBanner = document.getElementById('promoHeroBanner');
    if (modules.coupons === false) {
      if (promoBanner) promoBanner.style.display = 'none';
    }

    // 5. Announcements Marquee Toggle
    const marqueeBar = document.querySelector('.announcement-bar');
    if (modules.announcements === false) {
      if (marqueeBar) marqueeBar.style.display = 'none';
    } else {
      if (marqueeBar) marqueeBar.style.display = '';
    }

    // 6. WhatsApp Floating Quick-Chat Widget
    const phone = data.supportPhone || data.socialLinks?.whatsapp || '';
    handleWhatsAppWidget(modules.whatsapp_chat !== false, phone, brandName);
  }

  /**
   * Inject or toggle dynamic floating WhatsApp Concierge
   */
  function handleWhatsAppWidget(isEnabled, phone, brandName) {
    let existingWidget = document.getElementById('crmDynamicWhatsAppWidget');
    if (!isEnabled || !phone || window.location.pathname.includes('nimda')) {
      if (existingWidget) existingWidget.style.display = 'none';
      return;
    }

    const cleanNumber = phone.replace(/[^0-9]/g, '');
    if (!cleanNumber) return;

    if (!existingWidget) {
      existingWidget = document.createElement('a');
      existingWidget.id = 'crmDynamicWhatsAppWidget';
      existingWidget.target = '_blank';
      existingWidget.rel = 'noopener noreferrer';
      existingWidget.setAttribute('aria-label', 'Chat on WhatsApp');
      existingWidget.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 54px;
        height: 54px;
        border-radius: 50%;
        background-color: #25D366;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 18px rgba(37, 211, 102, 0.45);
        z-index: 9999;
        cursor: pointer;
        transition: transform 0.25s ease, box-shadow 0.25s ease;
      `;
      existingWidget.innerHTML = `
        <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.969.587 1.838.883 2.796.883 3.181 0 5.767-2.586 5.767-5.766.001-3.18-2.585-5.77-5.767-5.77zm0-2.172c4.418 0 8 3.582 8 8 0 1.547-.442 2.993-1.207 4.223l1.176 4.297-4.407-1.156c-1.181.714-2.569 1.12-4.048 1.12-4.418 0-8-3.582-8-8s3.582-8.484 8.486-8.484z"/>
        </svg>
      `;
      existingWidget.onmouseenter = () => { existingWidget.style.transform = 'scale(1.1)'; };
      existingWidget.onmouseleave = () => { existingWidget.style.transform = 'scale(1.0)'; };
      document.body.appendChild(existingWidget);
    }

    existingWidget.href = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(`Hello ${brandName}! I would like to inquire about your products.`)}`;
    existingWidget.style.display = 'flex';
  }

  // Expose global controller
  window.ThemeEngine = {
    reapply: fetchAndApplySettings,
    applyDirect: applyThemeAndSettings
  };
})();
