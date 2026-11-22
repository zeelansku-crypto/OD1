const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'server/database/convocation.db');
const db = new sqlite3.Database(dbPath);

console.log('Inspecting schema of convocation_students...');

db.all("PRAGMA table_info(convocation_students)", (err, rows) => {
    if (err) {
        console.error(err);
    } else {
        rows.forEach(row => {
            console.log(`${row.name} (${row.type})`);
        });
    }
    db.close();
});
