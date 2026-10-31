import { getDb, saveDb } from '../../../lib/db.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  try {
    const db = getDb();
    if (!Array.isArray(db.contact_messages)) db.contact_messages = [];

    if (req.method === 'GET') {
      return res.status(200).json({ success: true, data: db.contact_messages });
    }

    if (req.method === 'POST') {
      const msg = {
        id: req.body.id || `msg_${Date.now()}`,
        name: req.body.name || req.body.fullName || 'Visitor',
        email: req.body.email || '',
        phone: req.body.phone || '',
        subject: req.body.subject || 'General Inquiry',
        message: req.body.message || '',
        status: req.body.status || 'unread',
        created_at: req.body.created_at || new Date().toISOString()
      };

      const exists = db.contact_messages.some(m => String(m.id) === String(msg.id));
      if (!exists) {
        db.contact_messages.unshift(msg);
        saveDb(db);
      }
      return res.status(201).json({ success: true, data: msg });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/messages:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
