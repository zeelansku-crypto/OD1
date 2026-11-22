const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'database/convocation.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.all("SELECT id, name, email, role FROM users", (err, rows) => {
        if (err) {
            console.error(err);
            return;
        }
        console.log('Users found:', rows);
    });
});
