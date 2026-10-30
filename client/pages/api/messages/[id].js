import { getDb, saveDb } from '../../../lib/db';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  try {
    const { id } = req.query;
    const db = getDb();
    if (!Array.isArray(db.contact_messages)) db.contact_messages = [];

    if (req.method === 'DELETE') {
      db.contact_messages = db.contact_messages.filter(m => m.id !== id);
      saveDb(db);
      return res.status(200).json({ success: true, message: 'Message deleted' });
    }

    if (req.method === 'PATCH' || req.method === 'PUT') {
      const msg = db.contact_messages.find(m => m.id === id);
      if (msg) {
        if (req.body.status) msg.status = req.body.status;
        saveDb(db);
        return res.status(200).json({ success: true, data: msg });
      }
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/messages/[id]:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
