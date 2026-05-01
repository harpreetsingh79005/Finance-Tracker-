import express from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { pool, initializeDatabase } from './db.js';

dotenv.config({ override: true });

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_finance_key_123!';

app.use(cors());
app.use(express.json());

// Initialize the database on startup
initializeDatabase();

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access denied. No token provided.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token.' });
    req.user = user;
    next();
  });
};

// --- Routes ---

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Check if user already exists
    const [existingUsers] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    
    const userId = crypto.randomUUID();

    // Insert user into DB
    await pool.query(
      'INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)',
      [userId, email, passwordHash]
    );

    // Insert default assets
    const defaultAssets = [
      { id: crypto.randomUUID(), name: 'Account Balance', type: 'bank' },
      { id: crypto.randomUUID(), name: 'Wallet (Cash)', type: 'cash' },
      { id: crypto.randomUUID(), name: 'Coins', type: 'coins' },
      { id: crypto.randomUUID(), name: 'Stocks', type: 'investment' },
      { id: crypto.randomUUID(), name: 'Mutual Funds', type: 'investment' }
    ];

    for (const asset of defaultAssets) {
      await pool.query(
        'INSERT INTO assets (id, user_id, name, type, amount) VALUES (?, ?, ?, ?, 0)',
        [asset.id, userId, asset.name, asset.type]
      );
    }

    // Generate JWT
    const token = jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, user: { id: userId, email } });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user by email
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = users[0];

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // Compare passwords
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid email or password.' });
    }

    // Generate JWT
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.status(200).json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// Get Current User (Me)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const [users] = await pool.query('SELECT id, email, created_at FROM users WHERE id = ?', [req.user.id]);
    const user = users[0];

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('Fetch user error:', error);
    res.status(500).json({ error: 'Server error fetching user details.' });
  }
});

// --- Transactions ---

// Get monthly stats
app.get('/api/transactions/monthly', authenticateToken, async (req, res) => {
  try {
    const query = `
      SELECT 
        DATE_FORMAT(date, '%Y-%m') as month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense
      FROM transactions
      WHERE user_id = ?
      GROUP BY DATE_FORMAT(date, '%Y-%m')
      ORDER BY month DESC
    `;
    const [rows] = await pool.query(query, [req.user.id]);
    res.status(200).json(rows);
  } catch (error) {
    console.error('Fetch monthly stats error:', error);
    res.status(500).json({ error: 'Server error fetching monthly stats.' });
  }
});

// Get all transactions for a user
app.get('/api/transactions', authenticateToken, async (req, res) => {
  try {
    const { month } = req.query;
    let query = 'SELECT * FROM transactions WHERE user_id = ?';
    const params = [req.user.id];

    if (month) {
      query += ' AND DATE_FORMAT(date, "%Y-%m") = ?';
      params.push(month);
    }
    
    query += ' ORDER BY date DESC';

    const [transactions] = await pool.query(query, params);
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Fetch transactions error:', error);
    res.status(500).json({ error: 'Server error fetching transactions.' });
  }
});

// Add a new transaction
app.post('/api/transactions', authenticateToken, async (req, res) => {
  try {
    console.log("Received POST /api/transactions payload:", req.body);
    const { type, amount, date, source, description, category, walletId } = req.body;
    
    if (!type || !amount || !date) {
      return res.status(400).json({ error: 'Type, amount, and date are required.' });
    }

    const transactionId = crypto.randomUUID();
    const mysqlDate = new Date(date).toISOString().slice(0, 19).replace('T', ' ');

    await pool.query(
      `INSERT INTO transactions (id, user_id, type, amount, date, source, description, category, walletId) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [transactionId, req.user.id, type, amount, mysqlDate, source || null, description || null, category || null, walletId || null]
    );

    // Return the inserted transaction
    const [newTx] = await pool.query('SELECT * FROM transactions WHERE id = ?', [transactionId]);
    res.status(201).json(newTx[0]);
  } catch (error) {
    console.error('Add transaction error:', error);
    res.status(500).json({ error: 'Server error adding transaction.' });
  }
});

// Delete a transaction
app.delete('/api/transactions/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if it belongs to user
    const [existing] = await pool.query('SELECT id FROM transactions WHERE id = ? AND user_id = ?', [id, req.user.id]);
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Transaction not found or access denied.' });
    }

    await pool.query('DELETE FROM transactions WHERE id = ?', [id]);
    res.status(200).json({ message: 'Transaction deleted successfully.' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Server error deleting transaction.' });
  }
});

// --- Assets ---

// Get all assets for a user
app.get('/api/assets', authenticateToken, async (req, res) => {
  try {
    const [assets] = await pool.query(
      'SELECT * FROM assets WHERE user_id = ? ORDER BY created_at ASC',
      [req.user.id]
    );
    res.status(200).json(assets);
  } catch (error) {
    console.error('Fetch assets error:', error);
    res.status(500).json({ error: 'Server error fetching assets.' });
  }
});

// Add a new asset
app.post('/api/assets', authenticateToken, async (req, res) => {
  try {
    const { name, type, amount } = req.body;
    
    if (!name || !type) {
      return res.status(400).json({ error: 'Name and type are required.' });
    }

    const assetId = crypto.randomUUID();

    await pool.query(
      'INSERT INTO assets (id, user_id, name, type, amount) VALUES (?, ?, ?, ?, ?)',
      [assetId, req.user.id, name, type, amount || 0]
    );

    const [newAsset] = await pool.query('SELECT * FROM assets WHERE id = ?', [assetId]);
    res.status(201).json(newAsset[0]);
  } catch (error) {
    console.error('Add asset error:', error);
    res.status(500).json({ error: 'Server error adding asset.' });
  }
});

// Update an asset
app.put('/api/assets/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, amount } = req.body;

    const [existing] = await pool.query('SELECT id FROM assets WHERE id = ? AND user_id = ?', [id, req.user.id]);
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Asset not found or access denied.' });
    }

    await pool.query(
      'UPDATE assets SET name = COALESCE(?, name), type = COALESCE(?, type), amount = COALESCE(?, amount) WHERE id = ?',
      [name, type, amount, id]
    );

    const [updatedAsset] = await pool.query('SELECT * FROM assets WHERE id = ?', [id]);
    res.status(200).json(updatedAsset[0]);
  } catch (error) {
    console.error('Update asset error:', error);
    res.status(500).json({ error: 'Server error updating asset.' });
  }
});

// Delete an asset
app.delete('/api/assets/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const [existing] = await pool.query('SELECT id FROM assets WHERE id = ? AND user_id = ?', [id, req.user.id]);
    
    if (existing.length === 0) {
      return res.status(404).json({ error: 'Asset not found or access denied.' });
    }

    await pool.query('DELETE FROM assets WHERE id = ?', [id]);
    res.status(200).json({ message: 'Asset deleted successfully.' });
  } catch (error) {
    console.error('Delete asset error:', error);
    res.status(500).json({ error: 'Server error deleting asset.' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
