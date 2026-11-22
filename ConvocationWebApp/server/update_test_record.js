const { db } = require('./utils/db');
const fs = require('fs');
const path = require('path');

const updateRecord = () => {
    const hallTicketNo = 'REPORT_TEST_HT_01';

    // Read photo buffer
    // ensuring we use the valid photo we copied earlier: test_photo.png
    const photoPath = path.join(__dirname, 'test_photo.png');
    let photoBlob = null;
    if (fs.existsSync(photoPath)) {
        photoBlob = fs.readFileSync(photoPath);
        console.log('Photo loaded, size:', photoBlob.length);
    } else {
        console.error('test_photo.png not found!');
        return;
    }

    const updates = [
        "second_language = 'Telugu'",
        "part_ii = 'History, Political Science, Public Administration'",
        "part_iii = 'Indian Heritage and Culture, Science and Civilization'",
        "part1_month = 'July'",
        "part1_year = '2024'",
        "part1_class = 'Second'",
        "part2_month = 'November'",
        "part2_year = '2025'",
        "part2_class = 'First'",
        "student_photo = 'test_photo.png'",
        "student_photo_blob = ?"
    ];

    const sql = `UPDATE convocation_students SET ${updates.join(', ')} WHERE hall_ticket_no = ?`;

    db.run(sql, [photoBlob, hallTicketNo], function (err) {
        if (err) {
            console.error('Update failed:', err);
        } else {
            console.log(`Updated ${this.changes} record(s) for ${hallTicketNo}`);
        }
    });
};

updateRecord();
