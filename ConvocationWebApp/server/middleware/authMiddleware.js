const jwt = require('jsonwebtoken');
require('dotenv').config();

const SECRET_KEY = process.env.JWT_SECRET || 'your_secret_key_here'; // Use env variable in production

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) {
        console.log('[Auth] No token provided');
        return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            console.error('[Auth] Token verification failed:', err.message);
            return res.status(403).json({ message: 'Forbidden' });
        }
        req.user = user;
        console.log('[Auth] User authenticated:', user.email, 'Role:', user.role);
        next();
    });
};

const isAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        console.warn('[Auth] Access denied. User is not admin:', req.user.email);
        res.status(403).json({ message: 'Access denied. Admins only.' });
    }
};

module.exports = { authenticateToken, isAdmin, SECRET_KEY };
