const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database/convocation.db');
const db = new sqlite3.Database(dbPath);

db.get("SELECT * FROM convocation_students WHERE academic_year LIKE '%2013%14%' LIMIT 1", (err, row) => {
    if (err) {
        console.error(err);
    } else {
        console.log('RAW ROW DATA:');
        console.log(JSON.stringify(row, null, 2));
    }
    db.close();
});
