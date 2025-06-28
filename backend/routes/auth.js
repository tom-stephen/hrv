const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../database');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password, userType } = req.body;

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND user_type = $2',
      [email, userType]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, userType: user.user_type },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.user_type
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Register endpoint
router.post('/register', async (req, res) => {
  try {
    const { email, password, name, userType } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (email, password, name, user_type) VALUES ($1, $2, $3, $4) RETURNING *',
      [email, hashedPassword, name, userType]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { userId: user.id, email: user.email, userType: user.user_type },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        userType: user.user_type
      }
    });
  } catch (error) {
    if (error.code === '23505') { // Unique constraint violation
      return res.status(400).json({ error: 'Email already exists' });
    }
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router; 