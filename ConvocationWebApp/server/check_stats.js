const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database/convocation.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.all("SELECT id, name, email FROM users", (err, users) => {
        if (err) console.error(err);
        else {
            console.log('--- USERS ---');
            users.forEach(u => console.log(`ID: ${u.id}, Name: ${u.name}, Email: ${u.email}`));
        }
    });

    db.all("SELECT submitted_by, COUNT(*) as count FROM convocation_students GROUP BY submitted_by", (err, rows) => {
        if (err) console.error(err);
        else {
            console.log('--- APPLICATION COUNTS ---');
            if (rows.length === 0) console.log('No applications found.');
            rows.forEach(r => console.log(`User ID: ${r.submitted_by}, Count: ${r.count}`));
        }
    });
});
