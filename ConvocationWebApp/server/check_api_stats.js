const http = require('http');
const { db } = require('./utils/db');

const login = (email, password) => {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ email, password });
        const req = http.request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) resolve(JSON.parse(body));
                else reject(new Error(`Login failed: ${res.statusCode} ${body}`));
            });
        });
        req.on('error', reject);
        req.write(data);
        req.end();
    });
};

const getStats = (token) => {
    return new Promise((resolve, reject) => {
        const req = http.request({
            hostname: 'localhost',
            port: 5000,
            path: '/api/convocation/stats',
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` }
        }, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) resolve(JSON.parse(body));
                else reject(new Error(`Stats failed: ${res.statusCode} ${body}`));
            });
        });
        req.on('error', reject);
        req.end();
    });
};

const run = async () => {
    try {
        console.log('1. Logging in as Admin...');
        const loginData = await login('admin@example.com', 'admin123');
        const token = loginData.token;
        const userId = loginData.user.id;
        console.log('Logged in. User ID:', userId);

        console.log('2. Fetching Stats...');
        let stats = await getStats(token);
        console.log('Initial Stats:', stats);

        console.log('3. Assigning an application to Admin in DB...');
        const sqlite3 = require('sqlite3').verbose();
        const dbPath = require('path').resolve(__dirname, 'database/convocation.db');
        const dbClient = new sqlite3.Database(dbPath);

        dbClient.run(`UPDATE convocation_students SET submitted_by = ? WHERE id = (SELECT id FROM convocation_students LIMIT 1)`, [userId], async (err) => {
            if (err) {
                console.error('Update failed:', err);
                return;
            }
            console.log('Update successful.');

            console.log('4. Fetching Stats again...');
            stats = await getStats(token);
            console.log('Updated Stats:', stats);
        });

    } catch (err) {
        console.error('Error:', err.message);
    }
};

run();
