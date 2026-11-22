const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve('server/database/convocation_v2.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.all("SELECT * FROM users", (err, rows) => {
        if (err) {
            console.error(err);
        } else {
            console.log('Users found:', rows.length);
            console.log(JSON.stringify(rows, null, 2));
        }
        db.close();
    });
});
