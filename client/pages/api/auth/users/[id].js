import { getDb, saveDb } from '../../../../lib/db.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  try {
    const db = getDb();
    if (!Array.isArray(db.users)) db.users = [];

    if (req.method === 'DELETE') {
      const { id } = req.query;
      const username = req.query.username;
      db.users = db.users.filter(u => u.id !== id && (!username || u.username.toLowerCase() !== username.toLowerCase()));
      saveDb(db);
      return res.status(200).json({ success: true, message: 'User deleted' });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/auth/users/[id]:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
