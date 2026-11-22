const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve('server/database/convocation.db');
const db = new sqlite3.Database(dbPath);

console.log('Checking database:', dbPath);

db.serialize(() => {
    db.get("SELECT * FROM users WHERE email = ?", ['admin@example.com'], (err, row) => {
        if (err) {
            console.error('Error:', err);
        } else {
            if (row) {
                console.log('User found:', JSON.stringify(row, null, 2));
            } else {
                console.log('User NOT found');
            }
        }
        db.close();
    });
});
