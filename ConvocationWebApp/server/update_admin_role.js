const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.resolve(__dirname, 'database/convocation.db');
const db = new sqlite3.Database(dbPath);

console.log('Updating user role in:', dbPath);

db.serialize(() => {
    db.run("UPDATE users SET role = 'admin' WHERE email = 'admin123@gmail.com'", function (err) {
        if (err) {
            console.error('Error updating role:', err);
        } else {
            console.log(`Row(s) updated: ${this.changes}`);
            if (this.changes > 0) {
                console.log('Successfully updated role for admin123@gmail.com to admin');
            } else {
                console.log('No user found with email admin123@gmail.com');
            }
        }
        db.close();
    });
});
