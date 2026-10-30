import { getSiteConfig, saveSiteConfig } from '../../../lib/db';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const config = getSiteConfig();
    if (!config.content) config.content = {};
    if (!config.content.homeShowcase) config.content.homeShowcase = {};

    const { slot, remove, ...data } = req.body || {};
    if (slot) {
      if (remove) {
        delete config.content.homeShowcase[slot];
      } else {
        config.content.homeShowcase[slot] = data;
      }
      config.homeShowcase = config.content.homeShowcase;
    }

    saveSiteConfig(config);

    return res.status(200).json({
      success: true,
      message: 'Home showcase updated in site-config.json',
      data: config.content.homeShowcase
    });
  } catch (error) {
    console.error('Error in /api/settings/home-showcase:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
