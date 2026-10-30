import { getDb, saveDb } from '../../../lib/db.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  try {
    const db = getDb();
    if (!Array.isArray(db.users)) db.users = [];

    if (req.method === 'GET') {
      const safeUsers = db.users.map(u => ({
        id: u.id,
        username: u.username,
        email: u.email,
        name: u.name,
        role: u.role || 'super_admin'
      }));
      return res.status(200).json({ success: true, data: safeUsers });
    }

    if (req.method === 'DELETE') {
      const { id, username } = req.query;
      db.users = db.users.filter(u => u.id !== id && u.username !== username);
      saveDb(db);
      return res.status(200).json({ success: true, message: 'User deleted' });
    }

    return res.status(405).json({ success: false, message: 'Method not allowed' });
  } catch (error) {
    console.error('Error in /api/auth/users:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
