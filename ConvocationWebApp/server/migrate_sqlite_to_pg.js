const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

const SQLITE_DB = path.join(__dirname, 'database', 'convocation.db');

// Use the DATABASE_URL if available, else local PostgreSQL credentials.
// For local Postgres without SSL, ssl must be false or omitted.
const pgConfig = process.env.DATABASE_URL 
    ? { 
        connectionString: process.env.DATABASE_URL, 
        ssl: process.env.DATABASE_URL.includes('supabase') ? { rejectUnauthorized: false } : false 
      }
    : { database: 'convocation', user: 'postgres', password: 'password', port: 5432 };

const pool = new Pool(pgConfig);

const sqliteDb = new sqlite3.Database(SQLITE_DB, (err) => {
    if (err) {
        console.error('Error opening SQLite database', err.message);
        process.exit(1);
    }
});

async function migrateTable(tableName) {
    return new Promise((resolve, reject) => {
        sqliteDb.all(`SELECT * FROM ${tableName}`, async (err, rows) => {
            if (err) {
                // Table might not exist in SQLite
                console.error(`Error or table missing for ${tableName} in SQLite`, err.message);
                return resolve();
            }
            if (rows.length === 0) {
                console.log(`Table ${tableName} is empty, skipping.`);
                return resolve();
            }

            const client = await pool.connect();
            try {
                let successCount = 0;
                for (const row of rows) {
                    // Cleanse dates
                    for (let key in row) {
                        if (row[key] === '' || row[key] === '0' || row[key] === 0) {
                            if (key.includes('date') || key.includes('created') || key.includes('updated') || key === 'dob') {
                                row[key] = null;
                            }
                        }
                    }
                    const columns = Object.keys(row);
                    const values = Object.values(row);
                    
                    const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
                    const colNames = columns.join(', ');
                    
                    const query = `INSERT INTO ${tableName} (${colNames}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`;
                    try {
                        await client.query(query, values);
                        successCount++;
                    } catch(e) {
                         if (e.code === '23505') {
                             // Duplicate key error, ignore
                         } else {
                             console.log(`Failed inserting row into ${tableName}:`, e.message);
                         }
                    }
                }
                
                // Update primary key sequence if there's an 'id'
                try {
                     await client.query(`SELECT setval(pg_get_serial_sequence('${tableName}', 'id'), coalesce(max(id),0) + 1, false) FROM ${tableName};`);
                } catch(seqErr) {
                     // Table might not have an id sequence, skip
                }

                console.log(`Successfully migrated ${successCount} rows to ${tableName}`);
            } catch (pgErr) {
                console.error(`Error inserting into PG ${tableName}`, pgErr);
                reject(pgErr);
            } finally {
                client.release();
                resolve();
            }
        });
    });
}

(async () => {
    try {
        console.log('Starting Migration from SQLite to Postgres...');
        console.log('Connecting to PostgreSQL using Config:', pgConfig.connectionString || 'Local DB');
        
        await pool.query('SELECT NOW()'); // test connection
        console.log('Successfully connected to PG DB and it is ready.');
        
        // This relies on the utils/db.js to have initialized the schema first
        const { initDb } = require('./utils/db');
        console.log('Ensuring PG schema is initialized...');
        await initDb();
        console.log('Schema is ready.');

        const tablesToMigrate = [
            'users',
            'convocation_students',
            'category_master',
            'degree_master',
            'faculty_master',
            'course_master',
            'subject_master',
            'specialization_master',
            'medium_master',
            'payment_category_master',
            'payment_mode_master',
            'convocation_issued_master',
            'second_language_master',
            'part_ii_master',
            'part_iii_master'
        ];

        for (const table of tablesToMigrate) {
            console.log(`--- Migrating ${table} ---`);
            await migrateTable(table);
        }

        console.log('Migration Completed successfully.');
    } catch (e) {
        console.error('Migration failed:', e.message);
    } finally {
        sqliteDb.close();
        pool.end();
        process.exit();
    }
})();
