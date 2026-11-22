const fetch = require('node-fetch');

const login = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@sku.ac.in',
                password: 'admin123'
            })
        });
        const data = await response.json();
        console.log('Login Status:', response.status);
        console.log('Response:', JSON.stringify(data, null, 2));
    } catch (err) {
        console.error('Login failed:', err);
    }
};

login();
