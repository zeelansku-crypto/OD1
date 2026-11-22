const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../utils/db');
const { SECRET_KEY } = require('../middleware/authMiddleware');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
    const { name, email, mobile, password, role } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(password, salt);
    const userRole = role || 'user';

    const sql = `INSERT INTO users (name, email, mobile, password_hash, role) VALUES ($1, $2, $3, $4, $5) RETURNING id`;

    try {
        const result = await db.query(sql, [name, email, mobile, password_hash, userRole]);
        res.status(201).json({ message: 'User registered successfully', userId: result.rows[0].id });
    } catch (err) {
        if (err.code === '23505') { // PostgreSQL Unique Violation
            return res.status(400).json({ message: 'Email already exists' });
        }
        return res.status(500).json({ message: 'Database error', error: err.message });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const sql = `SELECT * FROM users WHERE email = $1`;

    try {
        const result = await db.query(sql, [email]);
        const user = result.rows[0];

        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const isMatch = bcrypt.compareSync(password, user.password_hash);
        if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name },
            SECRET_KEY,
            { expiresIn: '24h' }
        );

        res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: 'Database error', error: err.message });
    }
});

module.exports = router;
