const fs = require('fs');
const path = require('path');

function hexToRgba(hex, alpha) {
  if (!hex || typeof hex !== 'string') return `rgba(37, 99, 235, ${alpha})`;
  let clean = hex.replace('#', '').trim();
  if (clean.length === 3) clean = clean.split('').map(ch => ch + ch).join('');
  if (clean.length !== 6) return `rgba(37, 99, 235, ${alpha})`;
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function syncAll(rootDir) {
  rootDir = rootDir || path.resolve(__dirname, '..', '..', '..');
  const configPath = path.join(rootDir, 'data', 'site-config.json');
  const dbPath = path.join(rootDir, 'data', 'db.json');

  if (!fs.existsSync(configPath)) {
    console.error('[Sync] Config not found:', configPath);
    return false;
  }

  let config = {};
  try {
    config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } catch (err) {
    console.error('[Sync] JSON Parse Error in site-config.json:', err.message);
    return false;
  }

  const brand = config.brand || {};
  const business = config.business || {};
  const content = config.content || {};
  const products = Array.isArray(config.products) && config.products.length > 0 ? config.products : [];
  const reviews = Array.isArray(config.reviews) && config.reviews.length > 0 ? config.reviews : [];
  const colors = brand.colors || {};
  const fonts = brand.fonts || {};

  const brandName = brand.name || 'Store';
  const shortName = brand.shortName || brandName.split(' ')[0].toUpperCase();
  const tagline = brand.tagline || 'Excellence & Precision';
  const logo = (brand.logo && !brand.logo.includes('unsplash.com')) ? brand.logo : 'assets/logo.png';
  const favicon = (brand.favicon && !brand.favicon.includes('unsplash.com')) ? brand.favicon : 'assets/logo.png';
  const phone = business.phone || '+91 98765 43210';
  const email = business.email || 'support@store.com';
  const address = business.address || 'Heritage Atelier, MG Road, Bengaluru, Karnataka - 560001';
  const gstin = business.gstin || '29AAACA1234E1Z8';
  const timings = business.timings || 'Mon - Sat: 10:00 AM - 7:30 PM';

  const primaryColor = colors.primary || '#0F172A';
  const secondaryColor = colors.secondary || '#2563EB';
  const accentColor = colors.accent || '#38BDF8';
  const bgColor = colors.background || '#F8FAFC';
  const bgAltColor = colors.backgroundAlt || '#F1F5F9';
  const surfaceColor = colors.surface || '#FFFFFF';
  const textColor = colors.text || '#0F172A';
  const mutedColor = colors.muted || '#475569';

  const p1 = products[0] || { name: 'Featured Creation', slug: 'featured-creation', price: 999, compareAtPrice: 1299, images: [logo], tagline: 'Signature Edition', category: 'Collection' };
  const p2 = products[1] || { name: 'Second Creation', slug: 'second-creation', price: 1499, compareAtPrice: 1999, images: [logo], tagline: 'Precision Edition', category: 'Collection' };
  const p3 = products[2] || { name: 'Prestige Creation', slug: 'prestige-creation', price: 2499, compareAtPrice: 3499, images: [logo], tagline: 'Prestige Edition', category: 'Collection' };

  const p1Card = p1.themeColor || colors.cardBg1 || primaryColor;
  const p2Card = p2.themeColor || colors.cardBg2 || secondaryColor;
  const bundleCard = p3.themeColor || colors.bundleBg || '#1E1B4B';

  const rawCats = config.categories && config.categories.length > 0
    ? config.categories
    : [...new Set(products.map(p => p.category).filter(Boolean))];
  const categories = rawCats.length > 0 ? rawCats : ['Collection'];

  const couponCode = content.coupon?.code || 'PRIVILEGE15';
  const discountPct = content.coupon?.discountPercent || 15;
  const freeShipThreshold = content.freeShippingThreshold || 999;
  const annText = content.announcement || `✨ COMPLIMENTARY EXPRESS SHIPPING ON ALL ORDERS OVER ₹${freeShipThreshold} ✨`;

  console.log(`[Sync] Brand: "${brandName}" (${products.length} products, ${reviews.length} reviews, primary: ${primaryColor}, secondary: ${secondaryColor})`);

  // ==========================================
  // 1. Sync data/db.json
  // ==========================================
  try {
    let db = {};
    if (fs.existsSync(dbPath)) {
      try { db = JSON.parse(fs.readFileSync(dbPath, 'utf8')); } catch (e) { db = {}; }
    }

    db.site_settings = {
      ...(db.site_settings || {}),
      brandName: brandName,
      tagline: tagline,
      logoUrl: logo,
      faviconUrl: favicon,
      supportPhone: phone,
      supportEmail: email,
      storeAddress: address,
      gstin: gstin,
      storeTimings: timings,
      announcementText: annText,
      freeShippingThreshold: freeShipThreshold,
      couponCode: couponCode,
      discountPercent: discountPct,
      couponActive: content.coupon?.active !== false,
      branding: brand,
      themeColors: colors,
      modules: config.modules || { reviews: true, marketplaces: true, billing: true, coupons: true, whatsapp_chat: true, announcements: true },
      content: content,
      business: business,
      socialLinks: {
        whatsapp: business.socialLinks?.whatsapp || phone,
        instagram: business.socialLinks?.instagram || `https://instagram.com/${shortName.toLowerCase()}`,
        facebook: business.socialLinks?.facebook || '',
        youtube: business.socialLinks?.youtube || ''
      },
      paymentMethods: {
        cod: { enabled: true, label: 'Cash on Delivery (COD)', description: 'Pay cash to courier executive upon delivery' },
        upi: { enabled: true, label: 'UPI (Google Pay, PhonePe, Paytm, BHIM)', description: 'Instant UPI payment with dynamic QR & VPA', upiId: `${shortName.toLowerCase()}@okhdfcbank`, merchantName: brandName },
        card: { enabled: true, label: 'Credit / Debit Card', description: 'Visa, MasterCard, RuPay, Maestro' },
        netbanking: { enabled: true, label: 'Net Banking', description: 'All major Indian banks supported' }
      },
      homeShowcase: {
        slot1: { productId: p1.id || 'p1', title: p1.name, subtitle: p1.tagline || p1.shortDescription || '', price: p1.price, mrp: p1.compareAtPrice, customImage: p1.images?.[0] || '' },
        slot2: { productId: p2.id || 'p2', title: p2.name, subtitle: p2.tagline || p2.shortDescription || '', price: p2.price, mrp: p2.compareAtPrice, customImage: p2.images?.[0] || '' },
        combo: { productId: p3.id || 'p3', title: p3.name, subtitle: p3.tagline || p3.shortDescription || '', price: p3.price, mrp: p3.compareAtPrice, customImage: p3.images?.[0] || '', tag: 'BEST VALUE' }
      }
    };

    if (products.length > 0) {
      db.products = products.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        category: p.category,
        price: Number(p.price),
        mrp: Number(p.compareAtPrice || Math.round(p.price * 1.2)),
        stock: p.stock || 50,
        status: 'active',
        images: p.images || [],
        subtitle: p.tagline || p.shortDescription || '',
        description: p.description || '',
        rating: p.rating || 4.9,
        review_count: p.reviewCount || 100,
        featured: p.featured !== false,
        sku: p.sku || p.id,
        themeColor: p.themeColor || p1Card,
        tagline: p.tagline || '',
        badge: p.badge || null,
        specifications: p.specifications || {},
        benefits: p.benefits || [],
        howToUse: p.howToUse || ''
      }));

      db.categories = categories.map((c, i) => {
        const cName = typeof c === 'string' ? c : (c.name || c.id);
        return {
          id: `cat_${i + 1}`,
          name: cName,
          slug: cName.toLowerCase().replace(/\s+/g, '-'),
          product_count: products.filter(p => p.category === cName).length
        };
      });
    }

    if (reviews.length > 0) {
      db.reviews = reviews.map((r, i) => ({
        id: r.id || `rev_${i + 1}`,
        name: r.name || 'Verified Client',
        product_name: r.product_name || r.productName || p1.name,
        rating: Number(r.rating || 5),
        title: r.title || 'Exceptional Quality',
        comment: r.comment || '',
        status: 'approved',
        created_at: r.created_at || new Date().toISOString()
      }));
    }

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error('[Sync] Error updating db.json:', err.message);
  }

  // ==========================================
  // 2. Dynamic Theme Style Block
  // ==========================================
  function getDynamicThemeStyle() {
    return `<style id="dynamicBrandTheme">
    :root {
      --color-canvas: ${bgColor};
      --color-canvas-alt: ${bgAltColor};
      --color-surface: ${surfaceColor};
      --color-text-main: ${textColor};
      --color-text-muted: ${mutedColor};
      --color-lavender-primary: ${primaryColor};
      --color-lavender-dark: ${accentColor};
      --color-lavender-light: ${hexToRgba(primaryColor, 0.12)};
      --color-gold: ${secondaryColor};
      --color-gold-light: ${hexToRgba(secondaryColor, 0.18)};
      --color-gold-dark: ${accentColor};
      --gold-gradient: linear-gradient(135deg, ${secondaryColor} 0%, ${accentColor} 100%);
      --gold-glow: 0 4px 20px ${hexToRgba(secondaryColor, 0.35)};
      --color-hibiscus-primary: ${p2Card};
      --color-hibiscus-dark: ${p2Card};
      --color-bundle-dark: ${bundleCard};
      --color-bundle-accent: ${secondaryColor};
      --card-bg-1: ${p1Card};
      --card-bg-2: ${p2Card};
      --card-bg-bundle: ${bundleCard};
      --promo-banner-bg: linear-gradient(135deg, ${primaryColor} 0%, ${bundleCard} 100%);
      ${fonts.heading ? `--font-heading: '${fonts.heading}', serif;` : ''}
      ${fonts.body ? `--font-body: '${fonts.body}', sans-serif;` : ''}
    }
    ${config.customCSS || ''}
  </style>`;
  }

  // ==========================================
  // 3. Navbar Mega Menu Generator (Pristine <li> Replacement)
  // ==========================================
  function getShopDropdownLiHtml() {
    const trio = [p1, p2, p3];
    const cards = trio.map((item) => {
      const tag = item.badge?.unit || item.category || 'Featured';
      return `                <a href="/product/?slug=${item.slug}" class="mega-card">
                  <div class="mega-card-thumb" style="display:flex;align-items:center;justify-content:center;background:var(--color-canvas-alt, #F1F5F9);padding:10px;border-radius:10px;">
                    <img src="${item.images?.[0] || 'assets/product-placeholder.png'}" alt="${item.name}" style="max-height:90px;object-fit:contain;">
                  </div>
                  <div class="mega-card-info">
                    <span class="mega-tag">${tag}</span>
                    <h4 style="font-size:0.95rem;margin:4px 0;">${item.name}</h4>
                    <p class="mega-price" style="font-weight:700;color:var(--color-gold, #2563EB);">₹${item.price?.toLocaleString('en-IN')}</p>
                    <span class="mega-cta">View Details →</span>
                  </div>
                </a>`;
    }).join('\n');

    return `<li class="nav-item has-dropdown nav-item--has-dropdown">
            <a href="/shop/" class="nav-link">Shop Collections <span class="caret">▾</span></a>
            <!-- Mega-menu Preview -->
            <div class="nav-dropdown-mega">
              <div class="mega-grid">
${cards}
              </div>
              <div class="mega-footer-bar">
                <a href="/shop/" class="mega-view-all-link">
                  <span>Explore Complete ${brandName} Collection</span>
                  <span class="view-all-arrow">Browse All →</span>
                </a>
              </div>
            </div>
          </li>`;
  }

  // ==========================================
  // 4. Full Luxury 4-Column Footer Generator
  // ==========================================
  function getFullFooterHtml() {
    const footerCatLinks = categories.slice(0, 4).map(c => {
      const cName = typeof c === 'string' ? c : (c.name || c.id);
      return `            <li><a href="/shop/?category=${encodeURIComponent(cName)}">${cName}</a></li>`;
    }).join('\n');

    const igUrl = business.socialLinks?.instagram || `https://instagram.com/${shortName.toLowerCase()}`;

    return `<footer class="site-footer">
    <div class="footer-container">
      
      <!-- Newsletter Row -->
      <div class="footer-newsletter-row">
        <div class="newsletter-text-col">
          <span class="footer-sub-eyebrow">${content.footer?.newsletterEyebrow || `${shortName} VIP INSIDER`}</span>
          <h2 class="footer-newsletter-heading">${content.footer?.newsletterTitle || `RECEIVE ${discountPct}% OFF YOUR FIRST ORDER`}</h2>
          <p class="footer-newsletter-sub">${content.footer?.newsletterSub || `Subscribe for flagship creations, architecture releases, and exclusive private discounts.`}</p>
        </div>
        <div class="newsletter-form-col">
          <form class="footer-form" id="newsletterForm" onsubmit="event.preventDefault(); showSideToast({ title: 'Welcome to ${shortName} Insider! ✨', body: 'Privilege Code ${couponCode} has been applied for your order.', type: 'info' }); this.reset();">
            <div class="form-input-group">
              <input type="email" placeholder="Enter your email address" required aria-label="Email Address" autocomplete="email" spellcheck="false">
              <button type="submit" class="newsletter-submit-btn" aria-label="Submit email">
                <span>Subscribe</span>
                <span class="submit-arrow">→</span>
              </button>
            </div>
            <p class="form-fineprint">Your information is protected. Zero spam, ever.</p>
          </form>
        </div>
      </div>

      <!-- Links Columns Grid -->
      <div class="footer-nav-grid">
        <div class="footer-col">
          <h4 class="footer-col-title">SHOP COLLECTIONS</h4>
          <ul class="footer-col-links">
${footerCatLinks}
            <li><a href="/shop/">Browse All Collections</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4 class="footer-col-title">COMPANY &amp; ATELIER</h4>
          <ul class="footer-col-links">
            <li><a href="/about/">About ${brandName}</a></li>
            <li><a href="/about/#architecture">Architecture &amp; Quality</a></li>
            <li><a href="/about/#warranty">Official Guarantee</a></li>
            <li><a href="/contact/">Store Concierge &amp; Inquiries</a></li>
          </ul>
        </div>

        <div class="footer-col">
          <h4 class="footer-col-title">CUSTOMER CARE</h4>
          <ul class="footer-col-links">
            <li><a href="/order-status/">Track Your Order</a></li>
            <li><a href="/contact/">Client Concierge &amp; Support</a></li>
            <li><a href="/checkout/">Direct Web Checkout</a></li>
            <li><a href="/shop/">Complete Catalog</a></li>
          </ul>
        </div>

        <!-- Contact & Connect Column -->
        <div class="footer-col footer-col--contact">
          <h4 class="footer-col-title">CONTACT US</h4>
          <ul class="footer-contact-list">
            <li>
              <span class="footer-contact-icon">&#128222;</span>
              <a href="tel:${phone.replace(/\s+/g, '')}" id="footerContactPhone">${phone}</a>
            </li>
            <li>
              <span class="footer-contact-icon">&#9993;&#65039;</span>
              <a href="mailto:${email}" id="footerContactEmail">${email}</a>
            </li>
            <li class="footer-address-item">
              <span class="footer-contact-icon">&#128205;</span>
              <address id="footerContactAddress">${address}</address>
            </li>
          </ul>

          <div class="footer-social-block">
            <h4 class="footer-col-title footer-col-title--sm">CONNECT WITH US</h4>
            <div class="footer-social-icons">
              <a href="${igUrl}" target="_blank" rel="noopener noreferrer" class="footer-social-link footer-social-link--instagram" aria-label="Follow ${brandName} on Instagram">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                <span>Instagram</span>
              </a>
            </div>
          </div>
        </div>

        <!-- Brand Information Column -->
        <div class="footer-col brand-col">
          <div class="footer-crest-wrap">
            <img src="${logo}" alt="${brandName} Logo" class="footer-crest-img">
          </div>
          <p class="footer-brand-bio">
            ${content.footer?.bio || `${brandName} is dedicated to delivering premier craftsmanship, verified quality, and timeless elegance across India.`}
          </p>
        </div>
      </div>

      <div class="footer-watermark-row">
        <span class="footer-watermark-text">${shortName}</span>
      </div>

      <div class="footer-legal-bar">
        <p>${content.footer?.copyright || `© 2026 ${brandName.toUpperCase()}. ALL RIGHTS RESERVED.`}</p>
        <p class="footer-developer-credit">${content.footer?.developerCredit || `Powered by ${brandName} Platform`}</p>
        <p class="legal-links">
          <a href="/">Home</a> • <a href="/shop/">Shop</a> • <a href="/about/">About Us</a> • <a href="/contact/">Contact</a> • <a href="/privacy/">Privacy Policy</a> • <a href="/terms/">Terms of Service</a> • <a href="/shipping-policy/">Shipping & Returns</a> • <a href="/sitemap/">Sitemap</a>
        </p>
      </div>

    </div>
  </footer>`;
  }

  // ==========================================
  // 5. Common Elements Updater for Any Page
  // ==========================================
  function updateCommonPageElements(html, filename = '') {
    // Dynamic Theme Style
    const themeStyleBlock = getDynamicThemeStyle();
    if (html.includes('id="dynamicBrandTheme"')) {
      html = html.replace(/<style id="dynamicBrandTheme">[\s\S]*?<\/style>/i, themeStyleBlock);
    } else if (html.includes('</head>')) {
      html = html.replace('</head>', `  ${themeStyleBlock}\n</head>`);
    }

    // Theme Engine Script
    if (!html.includes('theme-engine.js') && html.includes('</head>')) {
      html = html.replace('</head>', `  <script src="/theme-engine.js"></script>\n</head>`);
    }

    // Favicon & Touch Icons
    html = html.replace(/<link rel="(icon|shortcut icon|apple-touch-icon)"[^>]*>/gi, (m, rel) => {
      return `<link rel="${rel}" type="image/png" href="${favicon}">`;
    });

    // Clean Section Title
    const sectionTitles = {
      'shop.html': 'Shop Collections',
      'about.html': 'Our Story & Heritage',
      'contact.html': 'Contact & Concierge',
      'account.html': 'Patron Portal',
      'checkout.html': 'Secure Web Checkout',
      'order-status.html': 'Track Your Order',
      'nimda.html': 'Management Console',
      'nimda-login.html': 'Admin Authentication',
      'privacy.html': 'Privacy & Data Protection',
      'terms.html': 'Terms & Conditions',
      'shipping-policy.html': 'Shipping & Returns Policy',
      'product.html': 'Product Specifications',
      'sitemap.html': 'Sitemap'
    };
    if (sectionTitles[filename]) {
      html = html.replace(/<title>[^<]*<\/title>/i, `<title>${brandName} | ${sectionTitles[filename]}</title>`);
    }

    // Announcement Ticker
    html = html.replace(/<div class="ticker-track"[^>]*>[\s\S]*?<\/div>/gi, () => {
      return `<div class="ticker-track">
        <span>${annText}</span>
        <span aria-hidden="true">•</span>
        <span>${annText}</span>
        <span aria-hidden="true">•</span>
        <span>${annText}</span>
      </div>`;
    });

    // Brand Crest & Lockup in Header
    html = html.replace(/<div class="brand-crest">[\s\S]*?<\/div>\s*<div class="brand-text-lockup">[\s\S]*?<\/div>/gi, () => {
      return `<div class="brand-crest">
          <img src="${logo}" alt="${brandName} Logo" class="brand-logo-img">
        </div>
        <div class="brand-text-lockup">
          <span class="brand-name">${shortName}</span>
          <span class="brand-sub">${tagline.toUpperCase()}</span>
        </div>`;
    });

    // Replace the entire Shop Dropdown <li> cleanly with zero stray tags
    if (html.includes('has-dropdown')) {
      html = html.replace(/<li class="nav-item has-dropdown[^>]*>[\s\S]*?<\/li>/i, getShopDropdownLiHtml());
    }

    // Mobile Drawer Contact
    html = html.replace(/<p class="drawer-support">.*?<\/p>/gi, `<p class="drawer-support">Customer Concierge: ${email}</p>`);

    // Clean Cart Drawer Scroll Body
    const cleanCartScroll = `<div class="cart-drawer-scroll-body" id="cartDrawerScrollBody">
        <div class="cart-items-container" id="cartItemsList">
          <div class="cart-empty-state" id="cartEmptyState">
            <div class="empty-icon">✨</div>
            <h4>Your bag is currently empty</h4>
            <p>Discover the official ${brandName} signature collection.</p>
            <a href="/shop/" class="btn btn--primary empty-shop-btn">Explore Collection</a>
          </div>
        </div>

        <div class="cart-upsell-module" id="cartUpsellModule" style="display: none;">
          <span class="upsell-badge">✦ PERFECT PAIRING</span>
          <div class="upsell-content">
            <img src="${p2.images?.[0] || 'assets/product-placeholder.png'}" alt="${p2.name}" class="upsell-img" id="upsellImg">
            <div class="upsell-details">
              <h5 id="upsellTitle">${p2.name}</h5>
              <p class="upsell-price">₹${p2.price?.toLocaleString('en-IN')}</p>
              <button class="btn-upsell-add" id="btnUpsellAdd">+ Add to Bag</button>
            </div>
          </div>
        </div>
      </div>`;

    if (html.includes('cartDrawerScrollBody')) {
      html = html.replace(/<div class="cart-drawer-scroll-body" id="cartDrawerScrollBody">[\s\S]*?<\/div>\s*<\/div>\s*<div class="cart-drawer-footer"/i, `${cleanCartScroll}\n\n      <div class="cart-drawer-footer"`);
    }

    html = html.replace(/Add ₹\d+ more for Free Pan-India Delivery!/gi, `Add ₹${freeShipThreshold} more for Free Pan-India Delivery!`);

    // Complete Luxury Footer
    html = html.replace(/<footer class="site-footer"[\s\S]*?<\/footer>/i, getFullFooterHtml());

    return html;
  }

  // ==========================================
  // 6. Policy Pages Dynamic Generators
  // ==========================================
  function getDynamicPrivacyMain() {
    return `<main class="policy-container">
    <div class="policy-card">
      <div class="policy-meta">Last Updated: October 2026 • Official Legal Document</div>
      <h1>Privacy &amp; Data Protection Policy</h1>
      <p>
        At <strong>${brandName}</strong>, we honor the privacy, confidentiality, and trust of every patron who visits our official boutique. This Privacy Policy details how we collect, safeguard, and process your information.
      </p>

      <h2>1. Information We Collect</h2>
      <p>When you browse, create a patron account, or place an order for our creations, we collect:</p>
      <ul>
        <li><strong>Contact Particulars:</strong> Full name, verified shipping address, phone number, and email.</li>
        <li><strong>Order &amp; Transaction Details:</strong> Products acquired, order totals, and fulfillment timelines. Payment card and bank credentials are processed via secure RBI-authorized payment gateways; we never store raw banking credentials.</li>
        <li><strong>Device &amp; Telemetry Data:</strong> IP address, device type, browser specifications, and anonymous telemetry strictly to optimize user browsing.</li>
      </ul>

      <h2>2. Purpose of Processing</h2>
      <p>Your details are used strictly to:</p>
      <ul>
        <li>Fulfill and deliver orders via insured courier partners to your doorstep.</li>
        <li>Send automated tracking updates and tax invoices.</li>
        <li>Provide dedicated client concierge assistance regarding product inquiries.</li>
      </ul>

      <h2>3. Information Protection &amp; Confidentiality</h2>
      <p>
        We employ 256-bit TLS encryption across our entire architecture. ${brandName} operates under a strict Zero-Spam pledge: we never monetize, sell, or disclose patron information to third-party brokers.
      </p>

      <h2>4. Concierge Data Inquiries</h2>
      <p>
        For inquiries regarding your personal data or account records, contact our Privacy Concierge at <a href="mailto:${email}">${email}</a> or write to ${address}.
      </p>
    </div>
  </main>`;
  }

  function getDynamicTermsMain() {
    return `<main class="policy-container">
    <div class="policy-card">
      <div class="policy-meta">Last Updated: October 2026 • Official Terms of Service</div>
      <h1>Terms &amp; Conditions of Service</h1>
      <p>
        Welcome to <strong>${brandName}</strong>. By accessing our platform, placing an order, or utilizing our customer services, you acknowledge and agree to comply with the terms and conditions outlined below.
      </p>

      <h2>1. Craft &amp; Product Authenticity</h2>
      <p>
        All ${brandName} creations are engineered, hand-inspected, and calibrated in authorized facilities, adhering strictly to global quality standards and rigorous safety specifications.
      </p>

      <h2>2. Orders, Pricing &amp; Invoices</h2>
      <p>
        All listed prices are denominated in Indian National Rupees (INR) and inclusive of applicable GST taxes (GSTIN: ${gstin}). We reserve the right to cancel orders arising from erroneous pricing or inventory adjustments, issuing immediate 100% refunds.
      </p>

      <h2>3. Manufacturer Warranty &amp; Guarantee</h2>
      <p>
        Every authentic ${brandName} creation is covered by our official manufacturer guarantee against defects in workmanship and materials.
      </p>

      <h2>4. Governing Jurisdiction</h2>
      <p>
        These terms are governed by the laws of India. For any disputes or service inquiries, please contact our Legal Concierge at <a href="mailto:${email}">${email}</a>.
      </p>
    </div>
  </main>`;
  }

  function getDynamicShippingMain() {
    return `<main class="policy-container">
    <div class="policy-card">
      <div class="policy-meta">Last Updated: October 2026 • Official Logistics &amp; Returns Policy</div>
      <h1>Pan-India Shipping &amp; Returns Policy</h1>
      <p>
        At <strong>${brandName}</strong>, we partner with premier express air logistics carriers to deliver freshly packaged creations securely to doorsteps across India.
      </p>

      <div class="highlight-badge-box" style="background:var(--color-canvas-alt, #F1F5F9); border-left:4px solid var(--color-gold, #2563EB); padding:16px; margin:20px 0; border-radius:8px;">
        <strong>✨ Free Pan-India Delivery Threshold</strong>
        <p>All orders with subtotal of <strong>₹${freeShipThreshold} and above</strong> qualify for 100% Free Express Shipping pan-India. For orders below ₹${freeShipThreshold}, a nominal subsidized fee of ₹70 is applied at checkout.</p>
      </div>

      <h2>1. Processing &amp; Dispatch Timeline</h2>
      <p>
        All orders are verified and dispatched within 24 business hours from our central fulfillment facility. Metros receive delivery in 2-3 business days; other regions in 3-5 business days.
      </p>

      <h2>2. 7-Day Inspection &amp; Returns Privilege</h2>
      <p>
        We offer a 7-day doorstep inspection privilege. If your creation arrives damaged or differs from specifications, contact our concierge at <a href="mailto:${email}">${email}</a> for complimentary doorstep replacement or full refund.
      </p>
    </div>
  </main>`;
  }

  // ==========================================
  // 7. Update All Auxiliary Pages
  // ==========================================
  const auxiliaryPages = [
    'shop.html', 'about.html', 'contact.html', 'account.html',
    'checkout.html', 'order-status.html', 'nimda.html', 'nimda-login.html',
    'privacy.html', 'terms.html', 'shipping-policy.html', 'product.html', 'sitemap.html'
  ];

  auxiliaryPages.forEach(filename => {
    const filePath = path.join(rootDir, filename);
    if (!fs.existsSync(filePath)) return;

    try {
      let pageHtml = fs.readFileSync(filePath, 'utf8');

      pageHtml = updateCommonPageElements(pageHtml, filename);

      // Privacy Page
      if (filename === 'privacy.html') {
        pageHtml = pageHtml.replace(/<main[\s\S]*?<\/main>/i, getDynamicPrivacyMain());
      }

      // Terms Page
      if (filename === 'terms.html') {
        pageHtml = pageHtml.replace(/<main[\s\S]*?<\/main>/i, getDynamicTermsMain());
      }

      // Shipping Policy Page
      if (filename === 'shipping-policy.html') {
        pageHtml = pageHtml.replace(/<main[\s\S]*?<\/main>/i, getDynamicShippingMain());
      }

      // About Page Handler
      if (filename === 'about.html') {
        const eyebrow = content.aboutPage?.heroEyebrow || content.story?.badge || 'OUR HERITAGE & VISION';
        const storyTitle = content.aboutPage?.heroTitle || content.story?.title || `The ${brandName} Story`;
        const storyDesc = content.aboutPage?.heroDesc || content.story?.description || brand.tagline;

        const dynamicAboutMain = `<main>
    <section class="about-hero">
      <div class="section-container">
        <span class="section-eyebrow">${eyebrow}</span>
        <h1 class="section-heading" style="font-size:clamp(2.25rem, 5vw, 3.75rem); line-height: 1.25;">${storyTitle}</h1>
        <p class="section-subtext" style="margin-inline:auto; max-width: 780px;">
          ${storyDesc}
        </p>
      </div>
    </section>

    <section class="section-container">
      
      <!-- Story 1: Signature Creation -->
      <div class="about-story-row" id="architecture">
        <div class="about-img-box" style="background: radial-gradient(circle at center, ${hexToRgba(p1Card, 0.35)} 0%, #0F172A 100%); display: flex; align-items: center; justify-content: center; padding: 2.5rem;">
          <img src="${p1.images?.[0] || 'assets/product-placeholder.png'}" alt="${p1.name}" style="max-height: 380px; object-fit: contain;">
        </div>
        <div>
          <span class="section-eyebrow">${p1.badge?.title || 'SIGNATURE CREATION'}</span>
          <h2 class="section-heading" style="font-size:2rem; line-height: 1.3;">${p1.name}</h2>
          <p class="product-card-desc" style="font-size: 1.05rem; line-height: 1.7; margin-bottom: 1rem;">
            ${p1.description || p1.shortDescription || ''}
          </p>
          <p class="product-card-desc" style="font-size: 1.05rem; line-height: 1.7;">
            ${p1.tagline || ''}
          </p>
        </div>
      </div>

      <!-- Story 2: Masterpiece Precision -->
      <div class="about-story-row reverse" id="warranty">
        <div class="about-img-box" style="background: radial-gradient(circle at center, ${hexToRgba(p2Card, 0.35)} 0%, #0F172A 100%); display: flex; align-items: center; justify-content: center; padding: 2.5rem;">
          <img src="${p2.images?.[0] || 'assets/product-placeholder.png'}" alt="${p2.name}" style="max-height: 380px; object-fit: contain;">
        </div>
        <div>
          <span class="section-eyebrow">${p2.badge?.title || 'PRECISION CRAFT'}</span>
          <h2 class="section-heading" style="font-size:2rem; line-height: 1.3;">${p2.name}</h2>
          <p class="product-card-desc" style="font-size: 1.05rem; line-height: 1.7; margin-bottom: 1rem;">
            ${p2.description || p2.shortDescription || ''}
          </p>
          <p class="product-card-desc" style="font-size: 1.05rem; line-height: 1.7;">
            Every ${brandName} creation arrives with our official manufacturer guarantee and comprehensive coverage.
          </p>
        </div>
      </div>

      <!-- Story 3: Connected Heritage / Collection -->
      <div class="about-story-row" id="ecosystem">
        <div class="about-img-box" style="background: radial-gradient(circle at center, ${hexToRgba(bundleCard, 0.35)} 0%, #0F172A 100%); display: flex; align-items: center; justify-content: center; padding: 2.5rem;">
          <img src="${p3.images?.[0] || 'assets/product-placeholder.png'}" alt="${p3.name}" style="max-height: 380px; object-fit: contain;">
        </div>
        <div>
          <span class="section-eyebrow">${p3.badge?.title || 'DISTINGUISHED EXCELLENCE'}</span>
          <h2 class="section-heading" style="font-size:2rem; line-height: 1.3;">${p3.name}</h2>
          <p class="product-card-desc" style="font-size: 1.05rem; line-height: 1.7; margin-bottom: 1rem;">
            ${p3.description || p3.shortDescription || ''}
          </p>
          <p class="product-card-desc" style="font-size: 1.05rem; line-height: 1.7;">
            ${content.quote?.text || brand.tagline}
          </p>
        </div>
      </div>

    </section>
  </main>`;

        pageHtml = pageHtml.replace(/<main>[\s\S]*?<\/main>/i, dynamicAboutMain);
      }

      // Contact Page Handler
      if (filename === 'contact.html') {
        const contactEyebrow = content.contactPage?.eyebrow || 'CLIENT CONCIERGE & ATELIER';
        const contactTitle = content.contactPage?.title || `Connect with ${brandName}`;
        const contactSub = content.contactPage?.subtitle || `Have questions about our collections, bespoke orders, tracking, or corporate gifting? Our concierge team is at your service.`;

        const dynamicContactMain = `<main>
    <div class="section-container contact-section-wrapper">
      <div class="contact-grid">
        
        <!-- LEFT: BOUTIQUE & CONCIERGE INFO -->
        <div class="contact-info-card">
          <div>
            <div class="contact-card-header">
              <span class="section-eyebrow">${contactEyebrow}</span>
              <h1 class="contact-card-title">${contactTitle}</h1>
              <p class="contact-card-subtitle">
                ${contactSub}
              </p>
            </div>

            <div class="contact-items-list">
              <div class="contact-item">
                <div class="contact-icon-pill">📍</div>
                <div class="contact-item-content">
                  <strong>${content.contactPage?.boutiqueTitle || 'Flagship Retail Atelier & Showroom'}</strong>
                  <p id="contactStoreAddress">${address}</p>
                </div>
              </div>

              <div class="contact-item">
                <div class="contact-icon-pill">📞</div>
                <div class="contact-item-content">
                  <strong>${content.contactPage?.phoneTitle || 'Telephone Concierge & WhatsApp'}</strong>
                  <p><a href="tel:${phone.replace(/\s+/g, '')}" id="contactStorePhone">${phone}</a> <span class="availability-badge">Live</span></p>
                </div>
              </div>

              <div class="contact-item">
                <div class="contact-icon-pill">✉️</div>
                <div class="contact-item-content">
                  <strong>${content.contactPage?.emailTitle || 'Direct Concierge Email'}</strong>
                  <p><a href="mailto:${email}" id="contactStoreEmail">${email}</a></p>
                </div>
              </div>

              <div class="contact-item">
                <div class="contact-icon-pill">🕒</div>
                <div class="contact-item-content">
                  <strong>${content.contactPage?.hoursTitle || 'Atelier Concierge Hours'}</strong>
                  <p id="contactStoreTimings">${timings}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="contact-gstin-badge" id="contactGstinBox">
            <span class="gstin-label">OFFICIAL REGISTRATION:</span>
            <span class="gstin-number" id="contactStoreGstin">${gstin}</span>
          </div>
        </div>

        <!-- RIGHT: CLIENT INQUIRY FORM -->
        <div class="contact-form-card">
          <form class="boutique-contact-form" id="boutiqueContactForm" onsubmit="event.preventDefault(); showSideToast({ title: 'Inquiry Submitted', body: 'Thank you for reaching out to ${brandName}. Our concierge will respond promptly.', type: 'info' }); this.reset();">
            <h2 class="form-card-title">Send a Direct Message</h2>
            <p class="form-card-subtitle">Every message is answered individually within 4 business hours.</p>

            <div class="form-group">
              <label for="contactFullName">Your Full Name *</label>
              <input type="text" id="contactFullName" required placeholder="e.g. Senthil Kumar">
            </div>

            <div class="form-row-2col">
              <div class="form-group">
                <label for="contactEmail">Email Address *</label>
                <input type="email" id="contactEmail" required placeholder="name@domain.com">
              </div>
              <div class="form-group">
                <label for="contactPhone">Phone / WhatsApp</label>
                <input type="tel" id="contactPhone" placeholder="+91 98765 43210">
              </div>
            </div>

            <div class="form-group">
              <label for="contactSubject">Subject of Inquiry</label>
              <select id="contactSubject">
                <option value="Product Inquiries">Product Specifications & Inquiries</option>
                <option value="Order Tracking">Existing Order Tracking & Logistics</option>
                <option value="Bespoke Request">Bespoke Orders & Corporate Inquiries</option>
                <option value="General Support">General Client Concierge</option>
              </select>
            </div>

            <div class="form-group">
              <label for="contactMessage">Your Message *</label>
              <textarea id="contactMessage" rows="5" required placeholder="Please describe your inquiry with ${brandName}..."></textarea>
            </div>

            <button type="submit" class="contact-submit-btn">
              <span>Transmit Message</span>
              <span class="btn-arrow">→</span>
            </button>
          </form>
        </div>

      </div>
    </div>
  </main>`;

        pageHtml = pageHtml.replace(/<main>[\s\S]*?<\/main>/i, dynamicContactMain);
        pageHtml = pageHtml.replace(/Thank you for reaching out to [^.]*\. Our (concierge|apothecary) team will get back to you shortly\./gi, `Thank you for reaching out to ${brandName}. Our concierge team will get back to you shortly.`);
        pageHtml = pageHtml.replace(/'[^']*_offline_inquiries'/g, `'store_offline_inquiries'`);
      }

      // Shop Page Handler
      if (filename === 'shop.html') {
        pageHtml = pageHtml.replace(/<h1 class="page-title"[^>]*>[\s\S]*?<\/h1>/i, `<h1 class="page-title">All ${brandName} Products</h1>`);
        pageHtml = pageHtml.replace(/<p class="page-subtext"[^>]*>[\s\S]*?<\/p>/i, `<p class="page-subtext">${content.collection?.subtitle || brand.tagline}</p>`);

        // Dynamic category filter buttons
        const catButtons = ['All Collections', ...categories].map((c, i) => {
          const isAll = i === 0;
          return `          <button class="filter-btn ${isAll ? 'active' : ''}" data-cat="${isAll ? 'all' : c}">${c}</button>`;
        }).join('\n');
        pageHtml = pageHtml.replace(/<div class="catalog-filters">[\s\S]*?<\/div>/i, `<div class="catalog-filters">\n${catButtons}\n        </div>`);
        pageHtml = pageHtml.replace(/<div class="filter-group" id="categoryFilterGroup">[\s\S]*?<\/div>/i, `<div class="filter-group" id="categoryFilterGroup">\n${catButtons}\n          </div>`);

        pageHtml = pageHtml.replace(/There are currently no active (formulations|creations|items) in this category\.[^<]*/gi, `There are currently no active creations in this category. New items from ${brandName} will appear here as they are published.`);
        pageHtml = pageHtml.replace(/TechNova Electronics-logo/g, 'store-logo');
        pageHtml = pageHtml.replace(/[^'"]*_cart/g, 'store_cart');
        pageHtml = pageHtml.replace(/[^'"]*_store_channel/g, 'store_channel');
        pageHtml = pageHtml.replace(/[^'"]*_products_updated/g, 'store_products_updated');
        pageHtml = pageHtml.replace(/[^'"]*_store_products/g, 'store_products');
        pageHtml = pageHtml.replace(/assets\/technova-phone-transparent\.png/g, p1.images?.[0] || 'assets/product-placeholder.png');

        const dynShopProducts = products.map(p => ({
          id: p.id,
          slug: p.slug,
          name: p.name,
          category: p.category,
          price: Number(p.price),
          mrp: Number(p.compareAtPrice || Math.round(p.price * 1.2)),
          themeColor: p.themeColor || primaryColor,
          badge: p.badge?.unit || 'Featured',
          metricBadge: p.badge?.number || 'SIGNATURE',
          tagline: p.tagline || '',
          shortDescription: p.shortDescription || p.tagline || '',
          description: p.description || '',
          images: p.images || []
        }));

        pageHtml = pageHtml.replace(
          /const defaultFallbackProducts = \[[\s\S]*?\n\s*\];/i,
          `const defaultFallbackProducts = ${JSON.stringify(dynShopProducts, null, 2)};`
        );
      }

      // Product Details Page Handler
      if (filename === 'product.html') {
        const defaultSlug = products[0]?.slug || 'product-1';
        pageHtml = pageHtml.replace(/slug\s*=\s*slug\s*\?\s*slug\.trim\(\)\s*:\s*['"][^'"]*['"]/g, `slug = slug ? slug.trim() : '${defaultSlug}'`);

        const dynMap = {};
        products.forEach(p => {
          dynMap[p.slug] = {
            id: p.id,
            slug: p.slug,
            name: p.name,
            subtitle: p.tagline || p.shortDescription || '',
            category: p.category || 'Collection',
            price: Number(p.price),
            mrp: Number(p.compareAtPrice || Math.round(p.price * 1.2)),
            stock: p.stock || 50,
            badge: p.badge?.unit || 'Featured',
            themeColor: p.themeColor || primaryColor,
            tagline: p.tagline || '',
            metricBadge: p.badge?.number || 'ORIGINAL',
            images: p.images || [],
            description: p.description || '',
            benefits: p.benefits?.length ? p.benefits : [
              'Official manufacturer warranty included',
              `Complimentary pan-India express air shipping on ₹${freeShipThreshold}+`,
              '7-day hassle-free doorstep replacement guarantee',
              'Certified quality tested for optimal daily performance'
            ],
            ingredients: Object.entries(p.specifications || {}).map(([k, v]) => `<strong>${k.toUpperCase()}:</strong> ${v}`).join('<br>') || 'Crafted with certified materials and precision architecture.',
            howToUse: p.howToUse || 'Inspect care guide and follow the simple on-screen quick start manual.',
            variants: [
              { id: `${p.id}_std`, name: 'Standard Edition', price: Number(p.price) }
            ]
          };
        });

        pageHtml = pageHtml.replace(/const DEFAULT_PRODUCTS_MAP = \{[\s\S]*?\n\s*\};\s*\n\s*\/\/ Fetch product data from API/i, () => {
          return `const DEFAULT_PRODUCTS_MAP = ${JSON.stringify(dynMap, null, 2)};\n\n      // Fetch product data from API`;
        });
      }

      // Order Status Page Handler
      if (filename === 'order-status.html') {
        pageHtml = pageHtml.replace(
          /Our (fulfillment specialists are preparing your certified [^.]* creation for insured dispatch|master herbalists are preparing your fresh cold-pressed formulation)\./gi,
          `Our fulfillment specialists are preparing your certified ${brandName} creation for insured dispatch.`
        );
        pageHtml = pageHtml.replace(
          /'[^']*_customer_orders'/gi,
          `'store_customer_orders'`
        );
      }

      // Checkout Page Harmonization
      if (filename === 'checkout.html') {
        pageHtml = pageHtml.replace(/'[^']*_cart'/g, `'store_cart'`);
        pageHtml = pageHtml.replace(/'[^']*_active_coupon'/g, `'store_active_coupon'`);
        pageHtml = pageHtml.replace(/'[^']*_customer'/g, `'store_customer'`);
        pageHtml = pageHtml.replace(/'[^']*_placed_orders'/g, `'store_placed_orders'`);
        pageHtml = pageHtml.replace(/'[^']*_customer_orders'/g, `'store_customer_orders'`);
        pageHtml = pageHtml.replace(/merchantName:\s*'[^']*'/g, `merchantName: '${brandName}'`);
        pageHtml = pageHtml.replace(/merchantName\)\s*\|\|\s*'[^']*'/g, `merchantName) || '${brandName}'`);
      }

      // Account Page Harmonization
      if (filename === 'account.html') {
        pageHtml = pageHtml.replace(/'[^']*_customer'/g, `'store_customer'`);
        pageHtml = pageHtml.replace(/'[^']*_customer_orders'/g, `'store_customer_orders'`);
        pageHtml = pageHtml.replace(/'[^']*_token'/g, `'store_customer_token'`);
        pageHtml = pageHtml.replace(/'[^']*_customer_token=/g, `'store_customer_token=`);
        pageHtml = pageHtml.replace(/'[^']*_cancellations'/g, `'store_cancellations'`);
        pageHtml = pageHtml.replace(/Thank you for (choosing|revering your hair with) [^.]*\./gi, `Thank you for choosing ${brandName}.`);
        pageHtml = pageHtml.replace(/<title>Invoice - \${o\.orderNumber} \| [^<]*<\/title>/g, `<title>Invoice - \${o.orderNumber} | ${brandName}</title>`);
        pageHtml = pageHtml.replace(/assets\/technova-phone-transparent\.png/g, p1.images?.[0] || 'assets/product-placeholder.png');
      }

      fs.writeFileSync(filePath, pageHtml, 'utf8');
      console.log(`[Sync] Updated ${filename}`);
    } catch (err) {
      console.error(`[Sync] Error updating ${filename}:`, err.message);
    }
  });

  // ==========================================
  // 8. Update index.html dynamically and comprehensively
  // ==========================================
  const indexPath = path.join(rootDir, 'index.html');
  if (fs.existsSync(indexPath)) {
    try {
      let html = fs.readFileSync(indexPath, 'utf8');

      // Title & Meta
      html = html.replace(/<title>[^<]*<\/title>/i, `<title>${brandName} | ${tagline}</title>`);
      html = html.replace(/<meta name="description" content="[^"]*">/i, `<meta name="description" content="${content.hero?.subtitle || tagline}">`);

      // Common Page Elements (Theme, Favicon, Header Lockup, Footer, Navbar Mega Menu)
      html = updateCommonPageElements(html, 'index.html');

      // Announcement Bar & Coupon
      html = html.replace(/<div class="ticker-track" id="headerTickerTrack">[\s\S]*?<\/div>/i, () => {
        return `<div class="ticker-track" id="headerTickerTrack">
        <span>${annText}</span>
        <span>•</span>
        <span>USE CODE <strong class="code-highlight">${couponCode}</strong> FOR ${discountPct}% OFF YOUR ORDER</span>
        <span>•</span>
        <span>${annText}</span>
        <span>•</span>
        <span>USE CODE <strong class="code-highlight">${couponCode}</strong> FOR ${discountPct}% OFF YOUR ORDER</span>
      </div>`;
      });

      // Promo Hero Banner Title & Sub
      html = html.replace(/<h2 class="promo-banner-title"[^>]*>[\s\S]*?<\/h2>/i, () => {
        return `<h2 class="promo-banner-title" id="promoBannerTitle">
              Flat <span class="promo-highlight-pct" id="promoBannerDiscount">${discountPct}%</span> OFF On All ${brandName} Orders
            </h2>`;
      });
      html = html.replace(/<p class="promo-banner-sub"[^>]*>[\s\S]*?<\/p>/i, () => {
        return `<p class="promo-banner-sub" id="promoBannerSub">
              Use code <strong class="promo-code-box" id="promoBannerCode">${couponCode}</strong> at checkout. <span id="promoBannerExpiryText">Valid for a limited period.</span>
            </p>`;
      });
      html = html.replace(/<strong class="promo-code-box" id="promoBannerCode">.*?<\/strong>/i, `<strong class="promo-code-box" id="promoBannerCode">${couponCode}</strong>`);
      html = html.replace(/<span class="promo-code-display" id="promoBannerCodePill">.*?<\/span>/i, `<span class="promo-code-display" id="promoBannerCodePill">${couponCode}</span>`);

      // Hero Title
      const heroWords = (content.hero?.title || 'Mastering Timeless Precision.').trim().split(' ');
      const lastHeroWord = heroWords.length > 1 ? heroWords.pop() : '';
      const cleanHeroTitle = lastHeroWord 
        ? `${heroWords.join(' ')} <span class="title-italic-accent">${lastHeroWord}</span>`
        : (content.hero?.title || 'Mastering Timeless Precision');

      // Full Dual-Flanking Hero
      const fullHeroHtml = `<section class="hero-section hero-section--flanking" id="home">
      <div class="hero-flanking-wrapper">

        <!-- LEFT PRODUCT: ${p1.name} -->
        <div class="hero-product-flank hero-product-flank--left">
          <div class="hero-flank-card" style="--flank-theme: ${p1Card};">
            <div class="flank-badge-top">
              <span class="flank-tag">${p1.badge?.unit || 'PRESTIGE'}</span>
              <span class="flank-stat">${p1.badge?.number || 'ORIGINAL'}</span>
            </div>
            <div class="flank-img-box">
              <img src="${p1.images?.[0] || 'assets/product-placeholder.png'}" alt="${p1.name}" class="flank-img">
            </div>
            <div class="flank-details">
              <h3 class="flank-name">${p1.name}</h3>
              <p class="flank-sub">${p1.shortDescription || p1.tagline || ''}</p>
              <div class="flank-price-row">
                <span class="flank-price">₹${p1.price?.toLocaleString('en-IN')}</span>
                <button class="btn-flank-add btn-quick-add" data-id="${p1.id}" data-name="${p1.name}" data-price="${p1.price}" data-img="${p1.images?.[0]}" data-size="${p1.tagline || ''}">
                  + Add to Bag
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- CENTER EDITORIAL MESSAGE & BRAND CORE -->
        <div class="hero-container hero-center-content">
          <div class="hero-badge-pill">
            <span class="gold-sparkle">✦</span> ${content.hero?.eyebrow || 'EXCELLENCE &amp; TIMELESS CRAFT'}
          </div>
          
          <h1 class="hero-title">
            ${cleanHeroTitle}
          </h1>

          <p class="hero-description">
            ${content.hero?.subtitle || 'Experience signature quality, artisan finish, and enduring elegance designed for discerning clients.'}
          </p>

          <div class="hero-cta-group">
            <a href="/shop/" class="btn btn--primary">
              <span>${content.hero?.ctaPrimaryText || 'Explore Collection'}</span>
              <span class="btn-arrow">→</span>
            </a>
            <a href="/about/" class="btn btn--secondary">
              <span>${content.hero?.ctaSecondaryText || 'Our Atelier'}</span>
            </a>
          </div>

          <!-- Hero Feature Pillars -->
          <div class="hero-pillars">
            <div class="pillar-item">
              <span class="pillar-icon">${content.features?.[0]?.icon || '💎'}</span>
              <span class="pillar-text"><strong>${content.features?.[0]?.title || 'Master Certified'}</strong><br>${content.features?.[0]?.subtitle || 'Precision Architecture'}</span>
            </div>
            <div class="pillar-divider"></div>
            <div class="pillar-item">
              <span class="pillar-icon">${content.features?.[1]?.icon || '🛡️'}</span>
              <span class="pillar-text"><strong>${content.features?.[1]?.title || 'Official Guarantee'}</strong><br>${content.features?.[1]?.subtitle || 'Comprehensive Coverage'}</span>
            </div>
            <div class="pillar-divider"></div>
            <div class="pillar-item">
              <span class="pillar-icon">${content.features?.[2]?.icon || '🚀'}</span>
              <span class="pillar-text"><strong>${content.features?.[2]?.title || 'Express Courier'}</strong><br>${content.features?.[2]?.subtitle || 'Insured Doorstep Delivery'}</span>
            </div>
          </div>
        </div>

        <!-- RIGHT PRODUCT: ${p2.name} -->
        <div class="hero-product-flank hero-product-flank--right">
          <div class="hero-flank-card" style="--flank-theme: ${p2Card};">
            <div class="flank-badge-top">
              <span class="flank-tag">${p2.badge?.unit || 'DISTINCTION'}</span>
              <span class="flank-stat">${p2.badge?.number || 'CLASSIC'}</span>
            </div>
            <div class="flank-img-box">
              <img src="${p2.images?.[0] || 'assets/product-placeholder.png'}" alt="${p2.name}" class="flank-img">
            </div>
            <div class="flank-details">
              <h3 class="flank-name">${p2.name}</h3>
              <p class="flank-sub">${p2.shortDescription || p2.tagline || ''}</p>
              <div class="flank-price-row">
                <span class="flank-price">₹${p2.price?.toLocaleString('en-IN')}</span>
                <button class="btn-flank-add btn-quick-add" data-id="${p2.id}" data-name="${p2.name}" data-price="${p2.price}" data-img="${p2.images?.[0]}" data-size="${p2.tagline || ''}">
                  + Add to Bag
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>

      <!-- Mobile Hero Showcase -->
      <div class="mobile-hero-showcase" id="mobileHeroShowcase">
        <div class="m-hero-scroll-track" id="mHeroScrollTrack">
          <div class="m-hero-sticky-frame" id="mHeroStickyFrame">
            
            <div class="m-hero-stage m-hero-stage--heading" data-stage="1">
              <h1 class="m-hero-title">${cleanHeroTitle}</h1>
            </div>

            <div class="m-hero-products-row">
              <div class="m-hero-product-col m-hero-product-col--oil">
                <div class="m-hero-stage m-hero-stage--oil" data-stage="2">
                  <span class="m-bottle-pill">${p1.badge?.unit || 'PRESTIGE'}</span>
                  <a href="/product/?slug=${p1.slug}" class="m-bottle-link" aria-label="${p1.name}">
                    <div class="m-bottle-box">
                      <img src="${p1.images?.[0] || 'assets/product-placeholder.png'}" alt="${p1.name}" class="m-bottle-img">
                    </div>
                  </a>
                  <div class="m-bottle-meta">
                    <span class="m-bottle-name">${p1.name}</span>
                    <span class="m-bottle-sub">₹${p1.price?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <div class="m-hero-stage m-hero-stage--buy-oil" data-stage="4">
                  <button class="m-btn-buy btn-quick-add" data-id="${p1.id}" data-name="${p1.name}" data-price="${p1.price}" data-img="${p1.images?.[0]}" data-size="${p1.tagline || ''}">
                    Buy Now
                  </button>
                </div>
              </div>

              <div class="m-hero-product-col m-hero-product-col--shampoo">
                <div class="m-hero-stage m-hero-stage--shampoo" data-stage="3">
                  <span class="m-bottle-pill m-bottle-pill--shampoo">${p2.badge?.unit || 'CLASSIC'}</span>
                  <a href="/product/?slug=${p2.slug}" class="m-bottle-link" aria-label="${p2.name}">
                    <div class="m-bottle-box">
                      <img src="${p2.images?.[0] || 'assets/product-placeholder.png'}" alt="${p2.name}" class="m-bottle-img">
                    </div>
                  </a>
                  <div class="m-bottle-meta">
                    <span class="m-bottle-name">${p2.name}</span>
                    <span class="m-bottle-sub">₹${p2.price?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <div class="m-hero-stage m-hero-stage--buy-shampoo" data-stage="4">
                  <button class="m-btn-buy m-btn-buy--shampoo btn-quick-add" data-id="${p2.id}" data-name="${p2.name}" data-price="${p2.price}" data-img="${p2.images?.[0]}" data-size="${p2.tagline || ''}">
                    Buy Now
                  </button>
                </div>
              </div>
            </div>

            <div class="m-hero-stage m-hero-stage--desc" data-stage="5">
              <p class="m-hero-desc">${content.hero?.subtitle || 'Experience signature quality, artisan finish, and enduring elegance designed for discerning clients.'}</p>
            </div>

            <div class="m-hero-stage m-hero-stage--cta" data-stage="6">
              <div class="m-cta-group">
                <a href="/shop/" class="btn btn--primary m-cta-btn">
                  <span>${content.hero?.ctaPrimaryText || 'Explore Collection'}</span>
                  <span class="btn-arrow">→</span>
                </a>
                <a href="/about/" class="btn btn--secondary m-cta-btn">
                  <span>${content.hero?.ctaSecondaryText || 'Our Atelier'}</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>`;

      html = html.replace(/<section class="hero-section hero-section--flanking"[\s\S]*?<\/section>/i, fullHeroHtml);

      // Marquee Section
      const rawOrbit = content.orbit || [];
      const marqueeItems = content.marquee || (rawOrbit.length > 0 
        ? rawOrbit.slice(0, 8).map(o => o.name.toUpperCase())
        : [brandName.toUpperCase(), tagline.toUpperCase(), 'OFFICIAL GUARANTEE', 'PREMIUM CRAFT']);
      const marqueeHtml = marqueeItems.map(item => `<span class="marquee-item">${item}</span><span class="marquee-star">✦</span>`).join('');
      html = html.replace(/<section class="marquee-section"[\s\S]*?<\/section>/i, () => {
        return `<section class="marquee-section" aria-hidden="true">
      <div class="marquee-track">
        <div class="marquee-content">${marqueeHtml}</div>
        <div class="marquee-content">${marqueeHtml}</div>
      </div>
    </section>`;
      });

      // 18 Orbit Nodes Generation (Exact Math: 18 nodes x 20deg = 360deg)
      const orbitList = content.orbit && content.orbit.length >= 18 
        ? content.orbit.slice(0, 18) 
        : Array.from({ length: 18 }, (_, i) => ({
            name: `Module ${i + 1}`,
            icon: '✦',
            tag: 'Architecture',
            desc: `Precision architectural engineering component ${i + 1} of ${brandName}.`
          }));

      const orbitNodesHtml = orbitList.map((item, idx) => {
        const deg = idx * 20;
        const iconHtml = (item.icon && (item.icon.startsWith('http') || item.icon.startsWith('assets/')))
          ? `<img src="${item.icon}" alt="${item.name}" class="node-avatar" loading="lazy">`
          : `<span class="node-avatar-icon" style="font-size: 1.4rem; display: flex; align-items: center; justify-content: center; width: 100%; height: 100%; background: var(--card-bg-1, #1E293B); border-radius: 50%; border: 1.5px solid var(--color-gold, #2563EB); box-shadow: 0 4px 10px rgba(0,0,0,0.3); color: #FFF;">${item.icon || '✦'}</span>`;

        return `            <!-- ${idx + 1}. ${item.name} (${deg}deg) -->
            <div class="orbit-node" style="--angle: ${deg}deg;" data-index="${idx}" data-name="${item.name}" data-tag="${item.tag || ''}" data-desc="${item.desc || ''}" data-icon="${item.icon || ''}">
              <div class="orbit-node-inner">
                <div class="node-avatar-wrap">
                  ${iconHtml}
                </div>
                <span class="node-label">${item.name}</span>
                
                <div class="node-tooltip">
                  <span class="tooltip-tag">${item.tag || 'Module'}</span>
                  <h5 class="tooltip-title">${item.name}</h5>
                  <p class="tooltip-desc">${item.desc || ''}</p>
                </div>
              </div>
            </div>`;
      }).join('\n\n');

      const orbitCenter = content.orbitStage?.centerImage || content.orbitCenterImage || p1.images?.[0] || 'assets/product-placeholder.png';

      // Replace Entire Orbit Stage Header & Track
      html = html.replace(/<section class="herbal-ingredients-section"[^>]*>[\s\S]*?<!-- Bottom Interactive Spotlight Bar/i, () => {
        return `<section class="herbal-ingredients-section" id="botanical-ingredients">
      <div class="section-container text-center">
        <div class="ingredients-section-header">
          <span class="section-eyebrow">${content.orbitStage?.eyebrow || content.orbitEyebrow || 'PRECISION ARCHITECTURE'}</span>
          <h2 class="section-heading">${content.orbitStage?.heading || content.orbitHeading || '18 Precision Engineering Modules'}</h2>
          <p class="section-subtext">
            ${content.orbitStage?.subtext || content.orbitSubtext || 'Constructed with 18 precision hand-finished components and complications. Hover over any node to explore.'}
          </p>
        </div>
      </div>

      <!-- Main Orbital Interactive Stage -->
      <div class="orbit-stage-wrapper">
        <div class="orbit-stage" id="orbitStage">
          
          <!-- Concentric Background Orbit Rings -->
          <div class="orbit-ring orbit-ring--outer"></div>
          <div class="orbit-ring orbit-ring--middle"></div>
          <div class="orbit-ring orbit-ring--inner"></div>
          <div class="orbit-glow-disc"></div>

          <!-- Centered Bottle / Masterpiece -->
          <div class="orbit-center-bottle-wrap" title="${brandName} Signature Architecture">
            <div class="bottle-pedestal-glow"></div>
            <img src="${orbitCenter}" alt="${brandName} Masterpiece" class="orbit-center-bottle" id="orbitCenterBottle">
            <div class="bottle-caption-badge">
              <span class="badge-dot"></span>
              <span>${content.orbitStage?.centerBadge || content.orbitBadge || 'Precision Built • Certified Excellence'}</span>
            </div>
          </div>

          <!-- Rotating Circular Orbit Track -->
          <div class="orbit-track" id="orbitTrack">
${orbitNodesHtml}
          </div> <!-- end #orbitTrack -->

        </div> <!-- end #orbitStage -->
        <!-- Bottom Interactive Spotlight Bar`;
      });

      // Orbit Spotlight Bar Idle Text
      html = html.replace(/<div class="spotlight-idle-wrap" id="spotlightIdleWrap">[\s\S]*?<\/div>/i, () => {
        return `<div class="spotlight-idle-wrap" id="spotlightIdleWrap">
            <span class="spotlight-idle-icon">${content.orbitStage?.idleIcon || content.orbitIdleIcon || '✦'}</span>
            <span class="spotlight-idle-text">${content.orbitStage?.idleText || content.orbitIdleText || 'Hover over any precision module to inspect its specifications'}</span>
          </div>`;
      });

      // Featured Collection Section Header
      html = html.replace(/<div class="section-header">[\s\S]*?<div class="products-grid"/i, () => {
        return `<div class="section-header">
          <span class="section-eyebrow">${content.collection?.eyebrow || 'THE SIGNATURE SELECTION'}</span>
          <h2 class="section-heading">${content.collection?.title || 'Featured Masterpieces. Pure Distinction.'}</h2>
          <p class="section-subtext">${content.collection?.subtitle || 'Handpicked premier creations designed for distinction, durability, and daily elegance.'}</p>
        </div>

        <div class="products-grid"`;
      });

      // Featured Collection Cards Grid
      html = html.replace(/<div class="products-grid" id="dynamicProductsGrid">[\s\S]*?<\/div>\s*<\/section>/i, () => {
        return `<div class="products-grid" id="dynamicProductsGrid">

          <!-- PRODUCT CARD 1: ${p1.name} -->
          <article class="product-card product-card--oil" id="card-oil" style="--card-bg: ${p1Card}; --card-color: #FFFFFF; --accent-hover: ${accentColor};">
            <div class="card-inner">
              <div class="card-top-bar">
                <span class="pill-tag">${p1.tagline || 'Signature Edition'}</span>
                <div class="circle-badge" title="${p1.badge?.title || 'Signature Masterpiece'}">
                  <span class="badge-number">${p1.badge?.number || '01'}</span>
                  <span class="badge-unit">${p1.badge?.unit || 'PRESTIGE'}</span>
                </div>
              </div>

              <div class="card-image-wrap">
                <img src="${p1.images?.[0] || 'assets/product-placeholder.png'}" alt="${p1.name}" class="card-product-img" loading="lazy">
                <a href="/product/?slug=${p1.slug}" class="quick-view-badge">View Specifications ↗</a>
              </div>

              <div class="card-details">
                <div class="card-meta-row">
                  <span class="product-category">${p1.category || 'Collection'}</span>
                  <div class="rating-stars">★★★★★ <span class="rating-score">${p1.rating || 4.9}</span></div>
                </div>

                <h3 class="product-card-title">${p1.name}</h3>
                <p class="product-card-subtitle">${p1.shortDescription || p1.tagline || ''}</p>

                <p class="product-card-desc">
                  ${p1.description || ''}
                </p>

                <div class="card-action-bar">
                  <div class="card-pricing">
                    <span class="price-current">₹${p1.price?.toLocaleString('en-IN')}</span>
                    <span class="price-mrp">₹${p1.compareAtPrice?.toLocaleString('en-IN')}</span>
                  </div>

                  <button class="btn-quick-add" data-id="${p1.id}" data-name="${p1.name}" data-price="${p1.price}" data-img="${p1.images?.[0]}" data-size="${p1.tagline || ''}">
                    <span class="btn-text">Add To Bag</span>
                    <span class="btn-icon">+</span>
                  </button>
                </div>
              </div>
            </div>
          </article>

          <!-- PRODUCT CARD 2: ${p2.name} -->
          <article class="product-card product-card--shampoo" id="card-shampoo" style="--card-bg: ${p2Card}; --card-color: #FFFFFF; --accent-hover: ${secondaryColor};">
            <div class="card-inner">
              <div class="card-top-bar">
                <span class="pill-tag">${p2.tagline || 'Precision Edition'}</span>
                <div class="circle-badge" title="${p2.badge?.title || 'Precision Masterpiece'}">
                  <span class="badge-number">${p2.badge?.number || '02'}</span>
                  <span class="badge-unit">${p2.badge?.unit || 'CLASSIC'}</span>
                </div>
              </div>

              <div class="card-image-wrap">
                <img src="${p2.images?.[0] || 'assets/product-placeholder.png'}" alt="${p2.name}" class="card-product-img" loading="lazy">
                <a href="/product/?slug=${p2.slug}" class="quick-view-badge">View Specifications ↗</a>
              </div>

              <div class="card-details">
                <div class="card-meta-row">
                  <span class="product-category">${p2.category || 'Collection'}</span>
                  <div class="rating-stars">★★★★★ <span class="rating-score">${p2.rating || 4.8}</span></div>
                </div>

                <h3 class="product-card-title">${p2.name}</h3>
                <p class="product-card-subtitle">${p2.shortDescription || p2.tagline || ''}</p>

                <p class="product-card-desc">
                  ${p2.description || ''}
                </p>

                <div class="card-action-bar">
                  <div class="card-pricing">
                    <span class="price-current">₹${p2.price?.toLocaleString('en-IN')}</span>
                    <span class="price-mrp">₹${p2.compareAtPrice?.toLocaleString('en-IN')}</span>
                  </div>

                  <button class="btn-quick-add" data-id="${p2.id}" data-name="${p2.name}" data-price="${p2.price}" data-img="${p2.images?.[0]}" data-size="${p2.tagline || ''}">
                    <span class="btn-text">Add To Bag</span>
                    <span class="btn-icon">+</span>
                  </button>
                </div>
              </div>
            </div>
          </article>

        </div>

        <!-- FEATURED INNOVATION / BUNDLE -->
        <div class="bundle-banner" style="--card-bg: ${bundleCard}; --card-color: #FFFFFF;">
          <div class="bundle-grid">
            <div class="bundle-visual">
              <img src="${p3.images?.[0] || 'assets/product-placeholder.png'}" alt="${p3.name}" class="bundle-img">
              <span class="bundle-badge">${content.bundle?.badge || `★ BEST VALUE: SAVE ₹${((p3.compareAtPrice || Math.round(p3.price * 1.2)) - p3.price).toLocaleString('en-IN')}`}</span>
            </div>
            <div class="bundle-content">
              <span class="bundle-eyebrow">${content.bundle?.eyebrow || 'FEATURED MASTERPIECE'}</span>
              <h3 class="bundle-title">${p3.name}</h3>
              <p class="bundle-description">
                ${p3.description || p3.shortDescription || 'Exquisite creation crafted for timeless distinction and supreme craftsmanship.'}
              </p>
              <div class="bundle-features">
                ${(content.bundle?.features || [
                  '✔ 100% Certified Authentic Craft',
                  '✔ Official Manufacturer Guarantee',
                  '✔ Complimentary Insured Air Delivery'
                ]).map(f => `<span>${f}</span>`).join('\n                ')}
              </div>
              <div class="bundle-cta-row">
                <div class="bundle-pricing">
                  <span class="bundle-price-now">₹${p3.price?.toLocaleString('en-IN')}</span>
                  <span class="bundle-price-was">₹${p3.compareAtPrice?.toLocaleString('en-IN')}</span>
                  <span class="discount-pill">SPECIAL OFFER</span>
                </div>
                <button class="btn-bundle-add btn-quick-add" data-id="${p3.id}" data-name="${p3.name}" data-price="${p3.price}" data-img="${p3.images?.[0]}" data-size="${p3.tagline || 'Special Edition'}">
                  Add To Bag
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>`;
      });

      // Dynamic Feature Triad Grid
      const f1 = content.features?.[0] || { icon: '🛡️', title: 'Master Quality', subtitle: 'Individually calibrated and verified' };
      const f2 = content.features?.[1] || { icon: '⚡', title: 'Zero Compromise', subtitle: 'High durability surgical materials' };
      const f3 = content.features?.[2] || { icon: '🚀', title: 'Official Guarantee', subtitle: 'Global warranty & insured air courier' };

      html = html.replace(/<div class="triad-grid">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/i, () => {
        return `<div class="triad-grid">
          
          <div class="triad-card">
            <div class="triad-icon-wrap">
              <span style="font-size: 2rem;">${f1.icon || '🛡️'}</span>
            </div>
            <h3 class="triad-title">${f1.title}</h3>
            <p class="triad-text">
              ${f1.subtitle}
            </p>
          </div>

          <div class="triad-card">
            <div class="triad-icon-wrap">
              <span style="font-size: 2rem;">${f2.icon || '⚡'}</span>
            </div>
            <h3 class="triad-title">${f2.title}</h3>
            <p class="triad-text">
              ${f2.subtitle}
            </p>
          </div>

          <div class="triad-card">
            <div class="triad-icon-wrap">
              <span style="font-size: 2rem;">${f3.icon || '🔄'}</span>
            </div>
            <h3 class="triad-title">${f3.title}</h3>
            <p class="triad-text">
              ${f3.subtitle}
            </p>
          </div>

        </div>
      </div>
    </section>`;
      });

      // Dynamic Editorial Story Quote Split Section
      const storyQuote = content.story?.quote || content.quote?.text || 'Mastering the art of timeless perfection with uncompromising passion.';
      const storyAuthor = content.story?.author || content.quote?.author || `${brandName} Atelier`;
      const storyAuthorTitle = content.story?.authorTitle || content.quote?.role || 'Atelier & Studios';
      const storyBadge = content.story?.badge || 'PRECISION ARCHITECTURE';
      const storyImage = content.story?.image || p1.images?.[0] || 'assets/product-placeholder.png';

      html = html.replace(/<section class="quote-split-section" id="story">[\s\S]*?<\/section>/i, () => {
        return `<section class="quote-split-section" id="story">
      <div class="quote-split-grid">
        <div class="quote-image-col">
          <img src="${storyImage}" alt="${brandName} Showcase" class="quote-bg-img">
          <div class="quote-img-overlay">
            <div class="quote-badge">
              <span>${storyBadge}</span>
            </div>
          </div>
        </div>
        <div class="quote-text-col">
          <div class="quote-inner">
            <span class="quote-mark">“</span>
            <blockquote class="quote-text">
              ${storyQuote}
            </blockquote>
            <div class="quote-author">
              <strong class="author-name">${storyAuthor}</strong>
              <span class="author-title">${storyAuthorTitle}</span>
            </div>
            <a href="/shop/" class="btn btn--primary quote-cta">
              Explore The Collection →
            </a>
          </div>
        </div>
      </div>
    </section>`;
      });

      // Reviews Header
      html = html.replace(/<section class="reviews-ticker-section"[\s\S]*?<div class="reviews-scroller-viewport"/i, () => {
        return `<section class="reviews-ticker-section" id="customer-reviews-section">
      <div class="section-container">
        <div class="reviews-section-header">
          <div class="reviews-header-info">
            <span class="section-eyebrow">${content.reviewsSection?.eyebrow || 'VERIFIED CLIENT EXPERIENCES'}</span>
            <h2 class="section-heading">${content.reviewsSection?.title || `Loved by Over 50,000+ ${brandName} Clients`}</h2>
            <div class="reviews-aggregate-summary">
              <div class="stars-gold">★★★★★</div>
              <span class="aggregate-score" id="reviewsAvgScore">${content.reviewsSection?.ratingScore || '4.9 / 5.0'}</span>
              <span class="aggregate-divider">•</span>
              <span class="aggregate-count" id="reviewsCountText">${content.reviewsSection?.ratingText || 'Based on Verified Client Reviews'}</span>
            </div>
          </div>
          <div class="reviews-header-action">
            <button class="btn btn-comment-review" id="btnOpenReviewModal">
              <span class="btn-review-icon">✍️</span>
              <span>Comment Your Review</span>
            </button>
          </div>
        </div>
      </div>

      <div class="reviews-scroller-viewport"`;
      });

      // Review Submission Modal Product Options & Placeholders
      const productSelectOptions = products.map(p => `              <option value="${p.name}">${p.name}</option>`).join('\n');
      html = html.replace(/<select id="reviewProductSelect" class="form-input">[\s\S]*?<\/select>/i, () => {
        return `<select id="reviewProductSelect" class="form-input">\n${productSelectOptions}\n            </select>`;
      });

      html = html.replace(/<span class="section-eyebrow">COMMUNITY BOTANICAL REVIEWS<\/span>/i, `<span class="section-eyebrow">VERIFIED CLIENT REVIEWS</span>`);
      html = html.replace(/Your feedback is reviewed by our [^.]*concierge team and published to the live community ticker\.|Your feedback is reviewed by our apothecary team and published to the live community ticker\./gi, `Your feedback is reviewed by our ${brandName} concierge team and published to the live community ticker.`);
      html = html.replace(/placeholder="e\.g\. Transformed my hair texture within 3 weeks!"/i, `placeholder="e.g. Exceptional craftsmanship and performance!"`);
      html = html.replace(/placeholder="Tell us how (your experience with [^.]*has been|the botanical aroma[^"]*)\.\.\."/gi, `placeholder="Tell us how your experience with ${brandName} has been..."`);

      fs.writeFileSync(indexPath, html, 'utf8');
      console.log('[Sync] index.html updated successfully with 100% dynamic JSON data.');
    } catch (err) {
      console.error('[Sync] Error updating index.html:', err.message);
    }
  }

  // ==========================================
  // 9. Harmonize app.js default reviews & keys
  // ==========================================
  const appJsPath = path.join(rootDir, 'app.js');
  if (fs.existsSync(appJsPath)) {
    try {
      let appJs = fs.readFileSync(appJsPath, 'utf8');

      const dynReviews = reviews.length > 0 ? reviews : [
        {
          id: 'rev_01',
          name: 'Vikramaditya S.',
          product_name: p1.name,
          rating: 5,
          title: 'Unrivaled Precision & Finishing',
          comment: `Exceeded all expectations. The craftsmanship and attention to detail from ${brandName} is extraordinary.`,
          created_at: '2026-10-15T12:00:00Z'
        },
        {
          id: 'rev_02',
          name: 'Ananya Deshmukh',
          product_name: p2.name,
          rating: 5,
          title: 'Signature Masterpiece',
          comment: 'The packaging, express delivery, and overall product performance are world-class.',
          created_at: '2026-10-12T12:00:00Z'
        },
        {
          id: 'rev_03',
          name: 'Rajesh Nair',
          product_name: p3.name,
          rating: 5,
          title: 'Absolute Value & Elegance',
          comment: 'Remarkable attention to detail. Arrived in a secure, tamper-proof luxury case.',
          created_at: '2026-10-10T12:00:00Z'
        }
      ];

      appJs = appJs.replace(
        /const DEFAULT_REVIEWS = \[[\s\S]*?\n\s*\];/i,
        `const DEFAULT_REVIEWS = ${JSON.stringify(dynReviews, null, 2)};`
      );

      fs.writeFileSync(appJsPath, appJs, 'utf8');
      console.log('[Sync] app.js synchronized successfully.');
    } catch (err) {
      console.error('[Sync] Error updating app.js:', err.message);
    }
  }

  
  // Copy synced files to client/public
  const clientPublicDir = path.join(rootDir, 'client', 'public');
  if (fs.existsSync(clientPublicDir)) {
    const filesToSync = [
      ['data/site-config.json', 'data/site-config.json'],
      ['data/db.json', 'data/db.json'],
      ['index.html', 'index.html'],
      ['shop.html', 'shop.html'],
      ['product.html', 'product.html'],
      ['app.js', 'app.js'],
      ['styles.css', 'styles.css'],
      ['theme-engine.js', 'theme-engine.js']
    ];
    filesToSync.forEach(([src, dest]) => {
      const srcPath = path.join(rootDir, src);
      const destPath = path.join(clientPublicDir, dest);
      if (fs.existsSync(srcPath)) {
        fs.mkdirSync(path.dirname(destPath), { recursive: true });
        fs.copyFileSync(srcPath, destPath);
      }
    });
    console.log('[Sync] client/public synchronized with root files.');
  }

  return true;
}

if (require.main === module) {
  syncAll();
}

module.exports = { syncAll };