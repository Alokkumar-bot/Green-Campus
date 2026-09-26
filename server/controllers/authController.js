import bcrypt from 'bcryptjs';
import { query } from '../database/db.js';
import { generateToken } from '../middleware/auth.js';

export async function register(req, res) {
  try {
    const { name, email, password, department } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Please enter your full name.' });
    }

    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, message: 'Please provide a valid college or email address.' });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already registered
    const existing = await query.get('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
    if (existing) {
      return res.status(409).json({ success: false, message: 'An account with this email address already exists. Please log in.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const result = await query.run(
      'INSERT INTO users (name, email, password_hash, role, department) VALUES (?, ?, ?, ?, ?)',
      [name.trim(), normalizedEmail, passwordHash, 'student', department ? department.trim() : 'General Studies']
    );

    const newUser = {
      id: result.lastID,
      name: name.trim(),
      email: normalizedEmail,
      role: 'student',
      department: department ? department.trim() : 'General Studies'
    };

    const token = generateToken(newUser);

    return res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      user: newUser,
      token
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password.' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await query.get('SELECT * FROM users WHERE email = ?', [normalizedEmail]);

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department
    };

    const token = generateToken(safeUser);

    return res.json({
      success: true,
      message: `Welcome back, ${user.name.split(' ')[0]}!`,
      user: safeUser,
      token
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ success: false, message: 'Something went wrong. Please try again.' });
  }
}

export async function getMe(req, res) {
  try {
    const user = req.user;

    // Calculate user's report stats
    const stats = await query.get(`
      SELECT 
        COUNT(*) as total_reports,
        SUM(CASE WHEN status = 'Pending' THEN 1 ELSE 0 END) as pending_reports,
        SUM(CASE WHEN status = 'In Progress' OR status = 'Under Review' OR status = 'Assigned' THEN 1 ELSE 0 END) as active_reports,
        SUM(CASE WHEN status = 'Resolved' THEN 1 ELSE 0 END) as resolved_reports
      FROM reports
      WHERE user_id = ?
    `, [user.id]);

    return res.json({
      success: true,
      user,
      stats: {
        total: stats.total_reports || 0,
        pending: stats.pending_reports || 0,
        inProgress: stats.active_reports || 0,
        resolved: stats.resolved_reports || 0
      }
    });
  } catch (err) {
    console.error('Get profile error:', err);
    return res.status(500).json({ success: false, message: 'Failed to retrieve profile.' });
  }
}
