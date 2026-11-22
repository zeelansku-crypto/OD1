const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'database/convocation.db');
const db = new sqlite3.Database(dbPath);

console.log('Seeding test student to:', dbPath);

db.serialize(() => {
    db.get("SELECT id FROM users LIMIT 1", (err, user) => {
        if (err) {
            console.error('Error fetching user:', err);
            return db.close();
        }
        if (!user) {
            console.error('No users found. Please register a user first.');
            return db.close();
        }

        const userId = user.id;
        console.log('Using User ID:', userId);

        const sql = `INSERT OR REPLACE INTO convocation_students (
             hall_ticket_no, university, candidate_name, father_name, dob, gender, category, 
            aadhaar_no, mode_of_study, degree, faculty, course_group, subject, specialization, 
            medium, student_photo, payment_category, payment_mode, convocation_fee, 
            convocation_issued_in, academic_year, submitted_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const params = [
            'REPORT_TEST_HT_01', 'SKU', 'Test Student', 'Test Father', '1990-01-01', 'Male', 'OC',
            '123456789012', 'Regular', 'UG', 'Faculty of Arts', 'B.A.', 'History', 'General',
            'English', 'dummy_photo.png', 'Normal', 'Challan', '500',
            'In Person', '2023-2024', userId
        ];

        db.run(sql, params, function (err) {
            if (err) {
                console.error('Insert Error:', err.message);
            } else {
                console.log(`Inserted/Replaced row with ID ${this.lastID}`);
            }
            db.close();
        });
    });
});
