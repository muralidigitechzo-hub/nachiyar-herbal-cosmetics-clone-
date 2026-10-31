import { getDb, saveDb } from '../../../lib/db.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  try {
    const db = getDb();
    if (!Array.isArray(db.contact_messages)) db.contact_messages = [];

    if (req.method === 'GET') {
      // Deduplicate on GET as well to clean up any past duplicates
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

      // Strict duplicate detection (by ID OR by same email + same message within 60s)
      const isDuplicate = db.contact_messages.some(m => {
        if (!m) return false;
        if (String(m.id) === String(msg.id)) return true;
        const sameEmail = m.email && msg.email && m.email.toLowerCase() === msg.email.toLowerCase();
        const sameText = (m.message || '').trim().toLowerCase() === msg.message.toLowerCase();
        if (sameEmail && sameText) {
          const timeDiff = Math.abs(new Date(m.created_at || 0).getTime() - new Date(msg.created_at || 0).getTime());
          if (isNaN(timeDiff) || timeDiff < 60000) return true;
        }
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
