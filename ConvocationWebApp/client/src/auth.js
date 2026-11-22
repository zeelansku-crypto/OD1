export const API_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000/api' : '/api');

export const login = async (email, password) => {
    console.log(`Attempting login at: ${API_URL}/auth/login`);
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            throw new Error(response.status === 404 ? 'API service unavailable (404). Please ensure backend functions are deployed.' : `Server error (${response.status}): ${text.substring(0, 100)}`);
        }

        if (!response.ok) {
            const errorDetail = data.error ? `${data.message}: ${data.error}` : (data.message || 'Login failed');
            throw new Error(errorDetail);
        }

        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        return data;
    } catch (error) {
        throw error;
    }
};

export const register = async (name, email, mobile, password, role = 'user') => {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, mobile, password, role })
        });

        let data;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            throw new Error(response.status === 404 ? 'API service unavailable (404). Please ensure backend functions are deployed.' : `Server error (${response.status}): ${text.substring(0, 100)}`);
        }

        if (!response.ok) throw new Error(data.message || 'Registration failed');
        return data;
    } catch (error) {
        throw error;
    }
};

export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
};

export const getToken = () => localStorage.getItem('token');
export const isAuthenticated = () => !!localStorage.getItem('token');
