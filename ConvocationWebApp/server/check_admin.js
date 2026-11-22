const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'database/convocation.db');
const db = new sqlite3.Database(dbPath);
const bcrypt = require('bcryptjs');

db.serialize(() => {
    db.get("SELECT * FROM users WHERE role = 'admin'", (err, row) => {
        if (row) {
            console.log('Admin exists:', row.email);
        } else {
            console.log('No admin found. Checking for any user...');
            db.get("SELECT * FROM users", (err, user) => {
                if (user) {
                    console.log('Promoting user to admin:', user.email);
                    db.run("UPDATE users SET role = 'admin' WHERE id = ?", [user.id]);
                } else {
                    console.log('Creating new admin user...');
                    const hash = bcrypt.hashSync('admin123', 10);
                    db.run("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)", ['Admin User', 'admin@example.com', hash, 'admin']);
                    console.log('Created admin: admin@example.com / admin123');
                }
            });
        }
    });
});
