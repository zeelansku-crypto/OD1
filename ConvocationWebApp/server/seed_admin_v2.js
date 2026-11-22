const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.resolve(__dirname, 'database/convocation_v2.db');
const db = new sqlite3.Database(dbPath);

const seedAdmin = async () => {
    const passwordHash = await bcrypt.hash('admin123', 10);

    db.serialize(() => {
        const stmt = db.prepare("INSERT INTO users (name, email, mobile, password_hash, role) VALUES (?, ?, ?, ?, ?)");
        stmt.run('Admin User', 'admin@sku.ac.in', '9999999999', passwordHash, 'admin', function (err) {
            if (err) {
                console.error('Error seeding admin:', err.message);
            } else {
                console.log('Admin user seeded successfully with ID:', this.lastID);
            }
            db.close();
        });
        stmt.finalize();
    });
};

seedAdmin();
