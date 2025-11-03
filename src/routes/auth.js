import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../config/db.js';
import { issueToken } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  
  try {
    const db = await getDb();
    
    // Check if email already exists
    const existing = await db.get('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    
    // Hash password and create user
    const hash = await bcrypt.hash(password, 10);
    const result = await db.run('INSERT INTO users (email, password_hash) VALUES (?, ?)', [email, hash]);
    
    // Generate JWT token
    const token = issueToken({ id: result.lastID, email });
    return res.json({ token });
    
  } catch (e) {
    console.error('Registration error:', e);
    return res.status(500).json({ error: 'Server error during registration' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'email and password required' });
  
  try {
    const db = await getDb();
    
    // Find user by email
    const user = await db.get('SELECT id, email, password_hash FROM users WHERE email = ?', [email]);
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });
    
    // Generate JWT token
    const token = issueToken({ id: user.id, email: user.email });
    return res.json({ token });
    
  } catch (e) {
    console.error('Login error:', e);
    return res.status(500).json({ error: 'Server error during login' });
  }
});

export default router;
