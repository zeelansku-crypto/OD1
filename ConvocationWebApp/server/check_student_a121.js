const { db } = require('./utils/db');

const htno = 'A121';

db.get('SELECT * FROM convocation_students WHERE hall_ticket_no = ?', [htno], (err, row) => {
    if (err) {
        console.error(err);
    } else {
        if (row) {
            console.log('Student Found:', row.candidate_name);
            console.log('Degree:', row.degree);
            console.log('Academic Year:', row.academic_year);

            console.log('--- Part-I Data ---');
            console.log('Part1 Class:', row.part1_class);
            console.log('Part1 Month:', row.part1_month);
            console.log('Part1 Year:', row.part1_year);

            // Logic Check
            const degreeCode = (row.degree || '').toUpperCase();
            const yearStr = row.academic_year || '';
            const yearMatch = yearStr.match(/(\d{4})/);
            const startYear = yearMatch ? parseInt(yearMatch[0], 10) : 0;

            let showPart1 = true;
            if (degreeCode === 'PG') {
                if (startYear >= 2005 && startYear <= 2014) {
                    showPart1 = true;
                } else {
                    showPart1 = false;
                }
            }
            console.log(`Logic Result (Show Part-I): ${showPart1}`);
        } else {
            console.log('Student A121 not found');
        }
    }
});
