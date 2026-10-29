import fs from 'fs';
import path from 'path';

function getSiteConfig() {
  const possiblePaths = [
    path.join(process.cwd(), 'public', 'data', 'site-config.json'),
    path.join(process.cwd(), 'data', 'site-config.json'),
    path.join(__dirname, '..', '..', '..', 'public', 'data', 'site-config.json'),
    path.join(__dirname, '..', '..', '..', '..', 'data', 'site-config.json')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        return JSON.parse(fs.readFileSync(p, 'utf8'));
      } catch (e) {}
    }
  }
  return {};
}

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  try {
    const config = getSiteConfig();
    const brand = config.brand || {};
    const colors = brand.colors || {};

    const publicSettings = {
      brandName: brand.name || 'Aurelia Chronometry',
      tagline: brand.tagline || 'Mastering The Art Of Timeless Precision',
      logoUrl: brand.logo || 'assets/logo.png',
      faviconUrl: brand.favicon || 'favicon.png',
      themeColors: {
        primary: colors.primary || '#064E3B',
        secondary: colors.secondary || '#D4AF37',
        accent: colors.accent || '#10B981',
        bg: colors.background || '#F9F8F5',
        text: colors.text || '#0F172A'
      },
      customCSS: config.customCSS || "",
      content: config.content || {
        orbitCenterImage: 'assets/aurelia-emerald-watch.png',
        orbitBadge: 'Swiss Caliber 2824 • Certified Chronometer',
        orbitEyebrow: 'HOROLOGICAL ARCHITECTURE',
        orbitHeading: '18 Precision Mechanical Engineering Modules',
        orbitSubtext: 'Constructed with 18 precision hand-finished watchmaking components and complications. Hover over any node to explore.',
        orbitIdleIcon: '⏱️',
        orbitIdleText: 'Hover over any chronometer component to inspect its horological specifications'
      },
      orbit: config.orbit || config.content?.orbit || [],
      categories: config.categories || [
        { id: 'cat_chrono', name: 'Automatic Chronometers' },
        { id: 'cat_diver', name: 'Ceramic Divers' },
        { id: 'cat_duo', name: 'Collector Duos' },
        { id: 'cat_straps', name: 'Horological Straps' }
      ],
      modules: {
        reviews: true,
        whatsapp_chat: true,
        announcements: true
      }
    };

    return res.status(200).json({ success: true, data: publicSettings });
  } catch (error) {
    console.error('Error in /api/settings/public:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
