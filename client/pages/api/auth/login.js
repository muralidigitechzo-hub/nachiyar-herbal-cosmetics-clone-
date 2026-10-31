import { getDb, saveDb } from '../../../lib/db.js';

export default function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { username, password, localUsers } = req.body || {};
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    const cleanUser = String(username).trim().toLowerCase();
    const cleanPass = String(password).trim();

    const db = getDb();
    if (!Array.isArray(db.users)) db.users = [];
    const users = db.users;

    // 1. Check in db.json users list
    let matched = users.find(u => 
      (u.username && u.username.toLowerCase() === cleanUser) || 
      (u.email && u.email.toLowerCase() === cleanUser)
    );

    // 2. If client provided localUsers list, check and auto-sync into db.users
    if (Array.isArray(localUsers)) {
      const foundInLocal = localUsers.find(u => 
        (u.username && u.username.toLowerCase() === cleanUser) ||
        (u.email && u.email.toLowerCase() === cleanUser)
      );
      if (foundInLocal && String(foundInLocal.password) === cleanPass) {
        matched = foundInLocal;
        const existingIdx = users.findIndex(u => u.username && u.username.toLowerCase() === cleanUser);
        const userToSave = {
          id: foundInLocal.id || `user_${Date.now()}`,
          username: foundInLocal.username || cleanUser,
          email: foundInLocal.email || `${cleanUser}@nachiyarherbals.com`,
          password: cleanPass,
          name: foundInLocal.name || foundInLocal.username || cleanUser,
          role: foundInLocal.role || 'super_admin'
        };
        if (existingIdx >= 0) {
          users[existingIdx] = { ...users[existingIdx], ...userToSave };
        } else {
          users.push(userToSave);
        }
        db.users = users;
        try { saveDb(db); } catch (e) {}
      }
    }

    // 3. Default hardcoded fallback credentials
    const DEFAULT_PASSWORDS = {
      nimda: ['admin', 'admin123', 'nimda123'],
      admin: ['admin', 'admin123', 'nimda123'],
      murali: ['123', 'admin123']
    };

    let isValid = false;
    let userObj = null;

    if (matched && String(matched.password) === cleanPass) {
      isValid = true;
      userObj = {
        id: matched.id || `user_${matched.username}`,
        username: matched.username,
        email: matched.email || `${matched.username}@store.com`,
        name: matched.name || matched.username,
        role: matched.role || 'super_admin'
      };
    } else if (DEFAULT_PASSWORDS[cleanUser] && DEFAULT_PASSWORDS[cleanUser].includes(cleanPass)) {
      isValid = true;
      userObj = {
        id: `user_${cleanUser}`,
        username: cleanUser,
        email: `${cleanUser}@store.com`,
        name: cleanUser === 'murali' ? 'Murali' : 'Super Administrator',
        role: 'super_admin'
      };
    }

    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid username or password' });
    }

    const token = `adm_token_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;

    return res.status(200).json({
      success: true,
      token: token,
      user: userObj
    });
  } catch (error) {
    console.error('Error in /api/auth/login:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
}
