import { getDb, saveDb } from '../../../lib/db.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  try {
    const db = getDb();
    if (!Array.isArray(db.contact_messages)) db.contact_messages = [];

    if (req.method === 'GET') {
      // Return deduplicated messages
      const unique = [];
      const seen = new Set();
      db.contact_messages.forEach(m => {
        if (!m || !m.id) return;
        const sig = `${(m.email || '').toLowerCase().trim()}::${(m.message || '').trim().toLowerCase()}`;
        if (seen.has(String(m.id)) || (sig.length > 5 && seen.has(sig))) return;
        seen.add(String(m.id));
        if (sig.length > 5) seen.add(sig);
        unique.push(m);
      });
      return res.status(200).json({ success: true, data: unique });
    }

    if (req.method === 'POST') {
      const msg = {
        id: req.body.id || `msg_${Date.now()}`,
        name: req.body.name || req.body.fullName || 'Visitor',
        email: (req.body.email || '').trim(),
        phone: (req.body.phone || '').trim(),
        subject: req.body.subject || 'General Inquiry',
        message: (req.body.message || '').trim(),
        status: req.body.status || 'unread',
        created_at: req.body.created_at || new Date().toISOString()
      };

      // Strict duplicate detection (by ID OR by same email + same message text)
      const isDuplicate = db.contact_messages.some(m => {
        if (!m) return false;
        if (String(m.id) === String(msg.id)) return true;
        const sameEmail = m.email && msg.email && m.email.toLowerCase().trim() === msg.email.toLowerCase().trim();
        const sameText = (m.message || '').trim().toLowerCase() === (msg.message || '').trim().toLowerCase();
        if (sameEmail && sameText) return true;
        return false;
      });

      if (!isDuplicate) {
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
