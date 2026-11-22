import { login } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const messageDiv = document.getElementById('message');

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            messageDiv.textContent = '';
            messageDiv.className = 'mt-4 text-center text-sm text-gray-600';

            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                await login(email, password);
                // Redirect to dashboard on success
                window.location.href = '/';
            } catch (error) {
                messageDiv.textContent = error.message || 'Login failed';
                messageDiv.className = 'mt-4 text-center text-sm text-red-600';
            }
        });
    }

    // Toggle register link logic (simple redirect for now)
    const toggleRegisterStr = document.getElementById('toggleRegister');
    if (toggleRegisterStr) {
        toggleRegisterStr.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = '/register.html';
        });
    }
});
