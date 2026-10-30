import { getSiteConfig, saveSiteConfig } from '../../lib/db.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  try {
    if (req.method === 'GET') {
      const config = getSiteConfig();
      return res.status(200).json({ success: true, data: config });
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      const newConfig = req.body;
      if (!newConfig || typeof newConfig !== 'object') {
        return res.status(400).json({ success: false, message: 'Invalid configuration data' });
      }
      saveSiteConfig(newConfig);
      return res.status(200).json({ success: true, message: 'Configuration saved successfully', data: newConfig });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/config:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
