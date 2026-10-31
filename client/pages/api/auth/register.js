import { getDb, saveDb } from '../../../lib/db.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { username, email, password, name, role, phone } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password required' });
    }

    const cleanUsername = String(username).trim();
    const db = getDb();
    if (!Array.isArray(db.users)) db.users = [];

    const existingIdx = db.users.findIndex(u => u.username && u.username.toLowerCase() === cleanUsername.toLowerCase());
    const newUser = {
      id: `user_${Date.now()}`,
      username: cleanUsername,
      email: email ? String(email).trim() : `${cleanUsername}@nachiyarherbals.com`,
      phone: phone ? String(phone).trim() : '',
      password: String(password).trim(),
      name: name ? String(name).trim() : cleanUsername,
      role: role || 'super_admin',
      updated_at: new Date().toISOString()
    };

    if (existingIdx >= 0) {
      db.users[existingIdx] = { ...db.users[existingIdx], ...newUser };
    } else {
      db.users.push(newUser);
    }

    saveDb(db);
    return res.status(200).json({ success: true, message: 'Account saved successfully', user: newUser });
  } catch (error) {
    console.error('Error in /api/auth/register:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}
