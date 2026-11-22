import { register } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const registerForm = document.getElementById('registerForm');
    const messageDiv = document.getElementById('message');

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            messageDiv.textContent = '';
            messageDiv.className = 'mt-4 text-center text-sm text-gray-600';

            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const mobile = document.getElementById('mobile').value;
            const password = document.getElementById('password').value;

            try {
                await register(name, email, mobile, password);
                messageDiv.textContent = 'Registration successful! Redirecting to login...';
                messageDiv.className = 'mt-4 text-center text-sm text-green-600';
                setTimeout(() => {
                    window.location.href = '/login.html';
                }, 2000);
            } catch (error) {
                messageDiv.textContent = error.message || 'Registration failed';
                messageDiv.className = 'mt-4 text-center text-sm text-red-600';
            }
        });
    }
});
