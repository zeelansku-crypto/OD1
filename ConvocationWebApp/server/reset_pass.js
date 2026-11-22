const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'database/convocation.db');
const db = new sqlite3.Database(dbPath);
const bcrypt = require('bcryptjs');

const hash = bcrypt.hashSync('admin123', 10);
db.serialize(() => {
    db.run("UPDATE users SET password_hash = ? WHERE email = 'browsertest@example.com'", [hash], (err) => {
        if (err) console.error(err);
        else console.log('Password reset to admin123 for browsertest@example.com');
    });
});
