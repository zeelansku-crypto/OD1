const jwt = require('jsonwebtoken');
const fs = require('fs');
const http = require('http');

const SECRET_KEY = 'your_secret_key_here'; // Default from authMiddleware.js
const token = jwt.sign(
    { id: 1, email: 'admin@example.com', role: 'admin', name: 'Admin' },
    SECRET_KEY,
    { expiresIn: '1h' }
);

const data = JSON.stringify({
    degree: 'UG',
    faculty: 'Faculty of Arts',
    hall_ticket_no: 'REPORT_TEST_HT_01'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/reports/convocation',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(data)
    }
};

console.log('Requesting PDF for PG_VAL_TEST_2017...');

const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);

    if (res.statusCode === 200) {
        const fileStream = fs.createWriteStream('test_report_output.pdf');
        res.pipe(fileStream);
        fileStream.on('finish', () => {
            console.log('PDF saved to test_report_output.pdf');
            try {
                const stats = fs.statSync('test_report_output.pdf');
                console.log(`File size: ${stats.size} bytes`);
                if (stats.size > 1000) {
                    console.log('SUCCESS: PDF looks valid (size > 1KB)');
                } else {
                    console.log('FAILURE: PDF size is too small');
                }
            } catch (e) {
                console.error('Error checking file size:', e.message);
            }
            process.exit(0);
        });
    } else {
        let body = '';
        res.on('data', (d) => {
            body += d;
        });
        res.on('end', () => {
            console.error('Error body:', body);
            process.exit(1);
        });
    }
});

req.on('error', (error) => {
    console.error('Error fetching PDF:', error);
    process.exit(1);
});

req.write(data);
req.end();
