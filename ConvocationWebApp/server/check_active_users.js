const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database/convocation.db');
const db = new sqlite3.Database(dbPath);

console.log('Checking database:', dbPath);

db.serialize(() => {
    db.all("SELECT id, name, email, role, password_hash FROM users", (err, rows) => {
        if (err) {
            console.error(err);
        } else {
            console.log('Users found:', rows.length);
            rows.forEach(row => {
                console.log(`ID: ${row.id}, Name: ${row.name}, Email: ${row.email}, Role: ${row.role}`);
            });
        }
        db.close();
    });
});
