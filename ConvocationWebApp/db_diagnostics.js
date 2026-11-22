const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const dbPath = path.resolve('server/database/convocation.db');
const db = new sqlite3.Database(dbPath);

const output = [];

function log(msg) {
    console.log(msg);
    output.push(msg);
}

log('--- DB DIAGNOSTICS ---');
log(`Time: ${new Date().toISOString()}`);

db.serialize(() => {
    // 1. Check if the table exists
    db.all("SELECT name FROM sqlite_master WHERE type='table' AND name='convocation_students'", (err, rows) => {
        if (err) log('Error checking table: ' + err.message);
        else log('Table exists: ' + (rows.length > 0));
    });

    // 2. Check Column Names
    db.all("PRAGMA table_info(convocation_students)", (err, rows) => {
        if (err) log('Error reading schema: ' + err.message);
        else {
            log('Columns: ' + rows.map(r => r.name).join(', '));
        }
    });

    // 3. Search for Education records
    db.all("SELECT hall_ticket_no, degree, faculty, course_group FROM convocation_students WHERE (faculty LIKE '%Education%' OR degree LIKE '%Education%' OR course_group LIKE '%Education%') LIMIT 10", (err, rows) => {
        if (err) log('Error searching records: ' + err.message);
        else {
            log('Education Records Found: ' + rows.length);
            rows.forEach(r => log(JSON.stringify(r)));
        }

        // 4. Summarize Degree/Faculty combinations for Education
        db.all("SELECT DISTINCT degree, faculty FROM convocation_students WHERE faculty LIKE '%Education%'", (err, rows) => {
            if (err) log('Error summarizing: ' + err.message);
            else {
                log('Education Degree/Faculty pairs in DB:');
                rows.forEach(r => log(JSON.stringify(r)));
            }

            // Write all to a file
            fs.writeFileSync('db_diagnostics_output.txt', output.join('\n'));
            log('Diagnostics written to db_diagnostics_output.txt');
            db.close();
        });
    });
});
