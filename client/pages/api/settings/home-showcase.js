import { getDb, saveDb } from '../../../lib/db';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const db = getDb();
    if (!db.site_settings) db.site_settings = {};
    if (!db.site_settings.homeShowcase) db.site_settings.homeShowcase = {};

    const { slot, remove, ...data } = req.body || {};
    if (slot) {
      if (remove) {
        delete db.site_settings.homeShowcase[slot];
      } else {
        db.site_settings.homeShowcase[slot] = data;
      }
    }
    saveDb(db);
    return res.status(200).json({ success: true, message: 'Home showcase updated', data: db.site_settings.homeShowcase });
  } catch (error) {
    console.error('Error in /api/settings/home-showcase:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
