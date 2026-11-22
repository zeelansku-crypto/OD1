const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database/convocation.db');
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
                    console.log('Part III Data:', JSON.stringify({
                        part_iii: row.part_iii,
                        part3_class: row.part3_class,
                        part3_month: row.part3_month,
                        part3_year: row.part3_year
                    }, null, 2));
                });
            } else {
                console.log('No students found for Academic Year 2013-2014');
                // Check some recent students to see what the AY looks like
                db.all("SELECT academic_year FROM convocation_students LIMIT 5", (err, ayRows) => {
                    console.log('Sample Academic Years:', ayRows.map(r => r.academic_year).join(', '));
                });
            }

            // Log columns just to be absolutely sure
            db.all("PRAGMA table_info(convocation_students)", (err, cols) => {
                if (cols) {
                    console.log('Columns in convocation_students:', cols.map(c => c.name).filter(n => n.includes('part3')).join(', '));
                }
            });
        }
        db.close();
    });
});
