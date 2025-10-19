import express from 'express';
import pkg from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import cors from 'cors';
import session from 'express-session';
import nodemailer from 'nodemailer';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;
const app = express();
const PORT = process.env.PORT || 8000;

// ---------------------- Middleware ----------------------
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(session({
  secret: 'campuskart-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// ---------------------- PostgreSQL Connection ----------------------
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.connect()
  .then(() => console.log('✅ Connected to PostgreSQL database'))
  .catch(err => console.error('❌ Database connection error:', err));

// ---------------------- File Upload ----------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Ensure uploads dir exists
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// ---------------------- Auth Helpers ----------------------
function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Access token required' });

  jwt.verify(token, 'campuskart-secret-key', (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
}

function isAdmin(req, res, next) {
  if (req.user.role !== 'admin')
    return res.status(403).json({ message: 'Admin access required' });
  next();
}

// ---------------------- Password Validator ----------------------
function validatePassword(password) {
  const errors = [];
  if (password.length < 6) errors.push('Password must be at least 6 characters long');
  if (!/[A-Z]/.test(password)) errors.push('Must contain at least one uppercase letter');
  if (!/\d/.test(password)) errors.push('Must contain at least one number');
  return errors;
}

// ---------------------- Auth Routes ----------------------
app.post('/api/register', async (req, res) => {
  try {
    const { name, email, password, class: userClass, phone } = req.body;
    if (!name || !email || !password || !userClass || !phone)
      return res.status(400).json({ message: 'All fields required' });

    const pwErrors = validatePassword(password);
    if (pwErrors.length) return res.status(400).json({ message: pwErrors.join(', ') });

    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO users (name, email, password, class, phone)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
      RETURNING id, name, email, class, phone, role
    `;
    const result = await pool.query(query, [name, email, hashedPassword, userClass, phone]);
    const user = result.rows[0];
    if (!user) return res.status(400).json({ message: 'Email already exists' });

    const token = jwt.sign({ id: user.id, email, role: user.role }, 'campuskart-secret-key');
    res.json({ message: 'Registered successfully', token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: 'Email and password required' });

    const result = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
    if (result.rows.length === 0)
      return res.status(401).json({ message: 'Invalid credentials' });

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, 'campuskart-secret-key');
    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        class: user.class,
        phone: user.phone,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------------- Items ----------------------
app.get('/api/items', async (req, res) => {
  try {
    const { search, category, mode } = req.query;
    let query = `
      SELECT i.*, u.name AS seller_name, u.email AS seller_email, u.class AS seller_class, u.phone AS seller_phone
      FROM items i
      JOIN users u ON i.seller_id = u.id
      WHERE i.status='approved'
    `;
    const params = [];
    let index = 1;

    if (search) {
      query += ` AND (i.title ILIKE $${index} OR i.description ILIKE $${index + 1})`;
      params.push(`%${search}%`, `%${search}%`);
      index += 2;
    }
    if (category && category !== 'all') {
      query += ` AND i.category=$${index++}`;
      params.push(category);
    }
    if (mode && mode !== 'all') {
      query += ` AND i.mode=$${index++}`;
      params.push(mode);
    }
    query += ' ORDER BY i.created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

app.post('/api/items', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { title, description, price, category, mode, phone } = req.body;
    if (!title || !description || !category || !mode || !phone)
      return res.status(400).json({ message: 'Required fields missing' });

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const result = await pool.query(
      `INSERT INTO items (title, description, price, category, mode, image_url, phone, seller_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [title, description, price || 0, category, mode, imageUrl, phone, req.user.id]
    );
    res.json({ message: 'Item added successfully', itemId: result.rows[0].id });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

// ---------------------- Admin ----------------------
app.get('/api/admin/pending-items', authenticateToken, isAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT i.*, u.name AS seller_name, u.email AS seller_email, u.class AS seller_class
      FROM items i
      JOIN users u ON i.seller_id=u.id
      WHERE i.status='pending'
      ORDER BY i.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

app.put('/api/admin/items/:id/status', authenticateToken, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['approved', 'rejected'].includes(status))
      return res.status(400).json({ message: 'Invalid status' });

    await pool.query('UPDATE items SET status=$1 WHERE id=$2', [status, id]);
    res.json({ message: `Item ${status} successfully` });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

// ---------------------- Orders ----------------------
app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.body;
    const itemResult = await pool.query('SELECT * FROM items WHERE id=$1 AND status=$2', [itemId, 'approved']);
    if (itemResult.rows.length === 0)
      return res.status(404).json({ message: 'Item not found' });

    const item = itemResult.rows[0];
    if (item.seller_id === req.user.id)
      return res.status(400).json({ message: 'Cannot buy your own item' });

    const order = await pool.query(
      'INSERT INTO orders (item_id, buyer_id, seller_id) VALUES ($1, $2, $3) RETURNING id',
      [itemId, req.user.id, item.seller_id]
    );
    res.json({ message: 'Order created successfully', orderId: order.rows[0].id });
  } catch (err) {
    res.status(500).json({ message: 'Database error' });
  }
});

// ---------------------- Root ----------------------
app.get('/', (req, res) => {
  res.sendFile(path.join(process.cwd(), 'public', 'index.html'));
});

// ---------------------- Start Server ----------------------
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
