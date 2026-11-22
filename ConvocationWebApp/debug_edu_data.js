const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve('server/database/convocation.db');
const db = new sqlite3.Database(dbPath);

console.log('Searching for Education records...');

db.serialize(() => {
    // Search for any record with 'Education' in faculty or degree or course
    db.all("SELECT hall_ticket_no, degree, faculty, course_group FROM convocation_students WHERE faculty LIKE '%Education%' OR degree LIKE '%Education%' OR course_group LIKE '%Education%' LIMIT 10", (err, rows) => {
        if (err) {
            console.error('Error:', err);
        } else {
            console.log('Found records:');
            console.log(JSON.stringify(rows, null, 2));
        }
        db.close();
    });
});
