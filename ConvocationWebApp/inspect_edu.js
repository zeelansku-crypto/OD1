const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve('server/database/convocation.db');
const db = new sqlite3.Database(dbPath);

console.log('Checking database:', dbPath);

db.serialize(() => {
    db.all("SELECT * FROM convocation_students WHERE faculty LIKE '%Education%' LIMIT 5", (err, rows) => {
        if (err) {
            console.error('Error:', err);
        } else {
            console.log(JSON.stringify(rows, null, 2));
        }
        db.close();
    });
});
