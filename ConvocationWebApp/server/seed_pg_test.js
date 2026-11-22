const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const dbPath = path.resolve(__dirname, 'database/convocation.db');
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
    // Insert a student that triggers the new PG logic (PG, Year 2000-2020)
    const sql = `INSERT OR REPLACE INTO convocation_students (
        hall_ticket_no, university, candidate_name, father_name, dob, gender, category, 
        aadhaar_no, mode_of_study, degree, faculty, course_group, subject, specialization, 
        medium, student_photo, payment_category, payment_mode, convocation_fee, 
        convocation_issued_in, academic_year, submitted_by,
        part1_class, part1_month, part1_year,
        part2_class, part2_month, part2_year,
        part_ii
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    const params = [
        'PG_VAL_TEST_2017', 'University of Testing', 'John Doe PG', 'Robert Doe', '1992-10-10', 'Male', 'General',
        '112233445566', 'Regular', 'PG', 'Faculty of Science', 'M.Sc. Physics', 'Physics', 'Nuclear Physics',
        'English', 'photo.jpg', 'Normal', 'Online', '1000',
        'In Person', '2017-2018', 1,
        'DISTINCTION', 'NOVEMBER', '2017',
        'FIRST', 'APRIL', '2018',
        'Physics, Mathematics'
    ];

    db.run(sql, params, function (err) {
        if (err) {
            console.error('Error seeding PG test student:', err.message);
        } else {
            console.log(`Successfully seeded PG test student with HT: PG_VAL_TEST_2017`);
        }
        db.close();
    });
});
