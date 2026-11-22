const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Connection Successful!', res.rows[0]);
    process.exit(0);
  } catch (err) {
    console.error('Connection Failed:', err.message);
    process.exit(1);
  }
}

testConnection();
