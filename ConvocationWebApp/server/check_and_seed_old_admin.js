const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'database/convocation.db');
const db = new sqlite3.Database(dbPath);

console.log('Checking database:', dbPath);

db.serialize(() => {
    db.get("SELECT * FROM users WHERE email = ?", ['admin@example.com'], async (err, row) => {
        if (err) {
            console.error('Error checking user:', err);
        } else if (row) {
            console.log('User found:', row.email);
            console.log('Existing user details:', JSON.stringify(row, null, 2));
        } else {
            console.log('User NOT found. Seeding...');
            const passwordHash = await bcrypt.hash('admin123', 10);
            const stmt = db.prepare("INSERT INTO users (name, email, mobile, password_hash, role) VALUES (?, ?, ?, ?, ?)");
            stmt.run('Admin User', 'admin@example.com', '9999999999', passwordHash, 'admin', function (err) {
                if (err) {
                    console.error('Error seeding admin:', err.message);
                } else {
                    console.log('Seeded admin@example.com with password: admin123');
                }
            });
            stmt.finalize();
        }
    });
});
