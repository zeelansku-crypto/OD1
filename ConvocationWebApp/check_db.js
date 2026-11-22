const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve('server/database/convocation.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    db.all("SELECT id, hall_ticket_no, created_at FROM convocation_students ORDER BY id DESC LIMIT 5", (err, rows) => {
        if (err) {
            console.error(err);
        } else {
            console.log(JSON.stringify(rows, null, 2));
        }
        db.close();
    });
});
