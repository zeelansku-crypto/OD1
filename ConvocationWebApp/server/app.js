const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const serverless = require('serverless-http');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const convocationRoutes = require('./routes/convocation');
const masterRoutes = require('./routes/masterRoutes');
const { initDb } = require('./utils/db');

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allows all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Request Logger (Optional for serverless, can be removed to save logs)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use(express.json());

// Initialize Database (Async)
// Note: In serverless, top-level await isn't always ideal. 
// We'll call it once.
let isDbInitialized = false;
app.use(async (req, res, next) => {
    if (!isDbInitialized) {
        try {
            await initDb();
            isDbInitialized = true;
        } catch (err) {
            console.error('DB Init Error:', err);
        }
    }
    next();
});

// API Routes router
const apiRouter = express.Router();
apiRouter.get('/health', async (req, res) => {
    try {
        const hasDbUrl = Boolean(process.env.DATABASE_URL || process.env.SUPABASE_DB_URL);
        let dbOk = false;
        let dbError = null;
        if (hasDbUrl) {
            try {
                const db = require('./utils/db');
                await db.query('SELECT 1');
                dbOk = true;
            } catch (e) {
                dbError = e.message;
            }
        }
        res.status(200).json({
            status: 'ok',
            databaseConfigured: hasDbUrl,
            databaseConnected: dbOk,
            databaseError: dbError
        });
    } catch (err) {
        res.status(500).json({ status: 'error', error: err.message });
    }
});
apiRouter.get('/storage-check', (req, res) => {
    const keyNames = Object.keys(process.env).filter(k => k.toLowerCase().includes('supabase'));
    const hasKey = Boolean(
        process.env.SUPABASE_KEY ||
        process.env.SUPABASE_SERVICE_ROLE_KEY ||
        process.env.SUPABASE_ANON_KEY ||
        process.env.VITE_SUPABASE_ANON_KEY ||
        process.env.VITE_SUPABASE_KEY
    );
    res.json({
        status: 'ok',
        supabaseUrl: process.env.SUPABASE_URL || 'https://kgmvydgghddaqkqscjpb.supabase.co',
        bucket: process.env.SUPABASE_BUCKET || 'uploads',
        supabaseKeyConfigured: hasKey,
        detectedSupabaseEnvVars: keyNames
    });
});
apiRouter.use('/auth', authRoutes);
apiRouter.use('/convocation', convocationRoutes);
apiRouter.use('/master', masterRoutes);
apiRouter.use('/reports', require('./routes/reports'));

// Mount router on /api, /.netlify/functions/app, and root /
app.use('/api', apiRouter);
app.use('/.netlify/functions/app', apiRouter);
app.use('/', apiRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err);
  res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Export for Netlify Functions
module.exports = app;
module.exports.handler = serverless(app);

if (require.main === module) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
