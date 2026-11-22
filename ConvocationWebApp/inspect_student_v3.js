const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve('server/database/convocation.db');
const db = new sqlite3.Database(dbPath);

console.log('Checking database:', dbPath);

db.serialize(() => {
    // Look for any student with academic_year containing 2013-2014
    db.all("SELECT * FROM convocation_students WHERE academic_year LIKE '%2013%2014%' LIMIT 5", (err, rows) => {
        if (err) {
            console.error('Error:', err);
        } else {
            if (rows.length > 0) {
                console.log('Students found:', rows.length);
                rows.forEach(row => {
                    console.log('HTNO:', row.hall_ticket_no, 'AY:', row.academic_year);
                    console.log('Part III Data:', {
                        part_iii: row.part_iii,
                        part3_class: row.part3_class,
                        part3_month: row.part3_month,
                        part3_year: row.part3_year
                    });
                });
            } else {
                console.log('No students found for Academic Year 2013-2014');
                // Let's check columns just in case
                db.all("PRAGMA table_info(convocation_students)", (err, cols) => {
                    console.log('Columns in convocation_students:', cols.map(c => c.name).join(', '));
                });
            }
        }
        db.close();
    });
});
