const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('d:/CONV/backup/ConvocationWebApp-10Jan-2026/ConvocationWebApp/server/database/convocation.db');

db.all("SELECT degree, faculty, academic_year, hall_ticket_no FROM convocation_students WHERE faculty LIKE '%Education%' LIMIT 20", (err, rows) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(JSON.stringify(rows, null, 2));
    db.close();
});
