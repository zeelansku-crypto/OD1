export const API_URL = import.meta.env.VITE_API_URL || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') ? 'http://localhost:5000/api' : '/api');
import { getToken } from './auth.js';

const getHeaders = (isMultipart = false) => {
    const headers = {
        'Authorization': `Bearer ${getToken()}`
    };
    if (!isMultipart) {
        headers['Content-Type'] = 'application/json';
    }
    return headers;
};

const handleResponse = async (response) => {
    if (response.status === 401 || response.status === 403) {
        alert('Session expired or unauthorized. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login.html';
        throw new Error('Session expired');
    }
    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
        data = await response.json();
    } else {
        const text = await response.text();
        throw new Error(response.status === 404 ? 'API service unavailable (404).' : `Server error (${response.status}): ${text.substring(0, 100)}`);
    }
    if (!response.ok) throw new Error(data.message || 'Request failed');
    return data;
};

export const api = {
    submitConvocation: async (formData) => {
        try {
            const response = await fetch(`${API_URL}/convocation`, {
                method: 'POST',
                headers: getHeaders(true),
                body: formData
            });
            return await handleResponse(response);
        } catch (error) {
            throw error;
        }
    },

    getConvocation: async (hallTicketNo) => {
        try {
            const response = await fetch(`${API_URL}/convocation/${hallTicketNo}`, {
                method: 'GET',
                headers: getHeaders()
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error fetching Data');
            return data;
        } catch (error) {
            throw error;
        }
    },

    updateConvocation: async (hallTicketNo, formData) => {
        try {
            const response = await fetch(`${API_URL}/convocation/${hallTicketNo}`, {
                method: 'PUT',
                headers: getHeaders(true),
                body: formData
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message);
            return data;
        } catch (error) {
            throw error;
        }
    },

    downloadPDF: async (hallTicketNo) => {
        try {
            const response = await fetch(`${API_URL}/convocation/download/pdf`, {
                method: 'POST',
                headers: getHeaders(), // JSON content type
                body: JSON.stringify({ hall_ticket_no: hallTicketNo })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Download failed');
            }

            // Handle Blob
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `convocation_${hallTicketNo}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            throw error;
        }
    },

    getCategories: async () => {
        try {
            const response = await fetch(`${API_URL}/master/categories`, {
                method: 'GET',
                headers: getHeaders()
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error fetching categories');
            return data;
        } catch (error) {
            throw error;
        }
    },

    addCategory: async (categoryData) => {
        try {
            const response = await fetch(`${API_URL}/master/categories`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(categoryData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error creating category');
            return data;
        } catch (error) {
            throw error;
        }
    },

    updateCategory: async (id, categoryData) => {
        try {
            const response = await fetch(`${API_URL}/master/categories/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(categoryData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error updating category');
            return data;
        } catch (error) {
            throw error;
        }
    },

    deleteCategory: async (id) => {
        try {
            const response = await fetch(`${API_URL}/master/categories/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error deleting category');
            return data;
        } catch (error) {
            throw error;
        }
    },

    // Degree Master API
    getDegrees: async () => {
        try {
            const response = await fetch(`${API_URL}/master/degrees`, {
                method: 'GET',
                headers: getHeaders()
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error fetching degrees');
            return data;
        } catch (error) {
            throw error;
        }
    },

    addDegree: async (degreeData) => {
        try {
            const response = await fetch(`${API_URL}/master/degrees`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(degreeData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error creating degree');
            return data;
        } catch (error) {
            throw error;
        }
    },

    updateDegree: async (id, degreeData) => {
        try {
            const response = await fetch(`${API_URL}/master/degrees/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(degreeData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error updating degree');
            return data;
        } catch (error) {
            throw error;
        }
    },

    deleteDegree: async (id) => {
        try {
            const response = await fetch(`${API_URL}/master/degrees/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error deleting degree');
            return data;
        } catch (error) {
            throw error;
        }
    },

    // Faculty Master API
    getFaculties: async () => {
        try {
            const response = await fetch(`${API_URL}/master/faculties`, {
                method: 'GET',
                headers: getHeaders()
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error fetching faculties');
            return data;
        } catch (error) {
            throw error;
        }
    },

    addFaculty: async (facultyData) => {
        try {
            const response = await fetch(`${API_URL}/master/faculties`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(facultyData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error creating faculty');
            return data;
        } catch (error) {
            throw error;
        }
    },

    updateFaculty: async (id, facultyData) => {
        try {
            const response = await fetch(`${API_URL}/master/faculties/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(facultyData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error updating faculty');
            return data;
        } catch (error) {
            throw error;
        }
    },

    deleteFaculty: async (id) => {
        try {
            const response = await fetch(`${API_URL}/master/faculties/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error deleting faculty');
            return data;
        } catch (error) {
            throw error;
        }
    },

    // Course Master API
    getCourses: async () => {
        try {
            const response = await fetch(`${API_URL}/master/courses`, {
                method: 'GET',
                headers: getHeaders()
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error fetching courses');
            return data;
        } catch (error) {
            throw error;
        }
    },

    addCourse: async (courseData) => {
        try {
            const response = await fetch(`${API_URL}/master/courses`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(courseData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error creating course');
            return data;
        } catch (error) {
            throw error;
        }
    },

    updateCourse: async (id, courseData) => {
        try {
            const response = await fetch(`${API_URL}/master/courses/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(courseData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error updating course');
            return data;
        } catch (error) {
            throw error;
        }
    },

    deleteCourse: async (id) => {
        try {
            const response = await fetch(`${API_URL}/master/courses/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error deleting course');
            return data;
        } catch (error) {
            throw error;
        }
    },

    // Subject Master API
    getSubjects: async () => {
        try {
            const response = await fetch(`${API_URL}/master/subjects`, {
                method: 'GET',
                headers: getHeaders()
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error fetching subjects');
            return data;
        } catch (error) {
            throw error;
        }
    },

    addSubject: async (subjectData) => {
        try {
            const response = await fetch(`${API_URL}/master/subjects`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(subjectData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error creating subject');
            return data;
        } catch (error) {
            throw error;
        }
    },

    updateSubject: async (id, subjectData) => {
        try {
            const response = await fetch(`${API_URL}/master/subjects/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(subjectData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error updating subject');
            return data;
        } catch (error) {
            throw error;
        }
    },

    deleteSubject: async (id) => {
        try {
            const response = await fetch(`${API_URL}/master/subjects/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error deleting subject');
            return data;
        } catch (error) {
            throw error;
        }
    },

    // Specialization Master API
    getSpecializations: async () => {
        try {
            const response = await fetch(`${API_URL}/master/specializations`, {
                method: 'GET',
                headers: getHeaders()
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error fetching specializations');
            return data;
        } catch (error) {
            throw error;
        }
    },

    addSpecialization: async (specData) => {
        try {
            const response = await fetch(`${API_URL}/master/specializations`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(specData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error creating specialization');
            return data;
        } catch (error) {
            throw error;
        }
    },

    updateSpecialization: async (id, specData) => {
        try {
            const response = await fetch(`${API_URL}/master/specializations/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(specData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error updating specialization');
            return data;
        } catch (error) {
            throw error;
        }
    },

    deleteSpecialization: async (id) => {
        try {
            const response = await fetch(`${API_URL}/master/specializations/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error deleting specialization');
            return data;
        } catch (error) {
            throw error;
        }
    },

    // Medium Master API
    getMediums: async () => {
        try {
            const response = await fetch(`${API_URL}/master/mediums`, {
                method: 'GET',
                headers: getHeaders()
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error fetching mediums');
            return data;
        } catch (error) {
            throw error;
        }
    },

    addMedium: async (mediumData) => {
        try {
            const response = await fetch(`${API_URL}/master/mediums`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(mediumData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error creating medium');
            return data;
        } catch (error) {
            throw error;
        }
    },

    updateMedium: async (id, mediumData) => {
        try {
            const response = await fetch(`${API_URL}/master/mediums/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(mediumData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error updating medium');
            return data;
        } catch (error) {
            throw error;
        }
    },

    deleteMedium: async (id) => {
        try {
            const response = await fetch(`${API_URL}/master/mediums/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error deleting medium');
            return data;
        } catch (error) {
            throw error;
        }
    },

    // Payment Category Master API
    getPaymentCategories: async () => {
        try {
            const response = await fetch(`${API_URL}/master/payment-categories`, {
                method: 'GET',
                headers: getHeaders()
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error fetching payment categories');
            return data;
        } catch (error) {
            throw error;
        }
    },

    addPaymentCategory: async (categoryData) => {
        try {
            const response = await fetch(`${API_URL}/master/payment-categories`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(categoryData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error creating payment category');
            return data;
        } catch (error) {
            throw error;
        }
    },

    updatePaymentCategory: async (id, categoryData) => {
        try {
            const response = await fetch(`${API_URL}/master/payment-categories/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(categoryData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error updating payment category');
            return data;
        } catch (error) {
            throw error;
        }
    },

    deletePaymentCategory: async (id) => {
        try {
            const response = await fetch(`${API_URL}/master/payment-categories/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error deleting payment category');
            return data;
        } catch (error) {
            throw error;
        }
    },

    // Payment Mode Master API
    getPaymentModes: async () => {
        try {
            const response = await fetch(`${API_URL}/master/payment-modes`, {
                method: 'GET',
                headers: getHeaders()
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error fetching payment modes');
            return data;
        } catch (error) {
            throw error;
        }
    },

    addPaymentMode: async (modeData) => {
        try {
            const response = await fetch(`${API_URL}/master/payment-modes`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(modeData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error creating payment mode');
            return data;
        } catch (error) {
            throw error;
        }
    },

    updatePaymentMode: async (id, modeData) => {
        try {
            const response = await fetch(`${API_URL}/master/payment-modes/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(modeData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error updating payment mode');
            return data;
        } catch (error) {
            throw error;
        }
    },

    deletePaymentMode: async (id) => {
        try {
            const response = await fetch(`${API_URL}/master/payment-modes/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error deleting payment mode');
            return data;
        } catch (error) {
            throw error;
        }
    },

    // Convocation Issued Master API
    getConvocationIssued: async () => {
        try {
            const response = await fetch(`${API_URL}/master/convocation-issued`, {
                method: 'GET',
                headers: getHeaders()
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error fetching convocation issued items');
            return data;
        } catch (error) {
            throw error;
        }
    },

    addConvocationIssued: async (itemData) => {
        try {
            const response = await fetch(`${API_URL}/master/convocation-issued`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(itemData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error creating convocation issued item');
            return data;
        } catch (error) {
            throw error;
        }
    },

    updateConvocationIssued: async (id, itemData) => {
        try {
            const response = await fetch(`${API_URL}/master/convocation-issued/${id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(itemData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error updating convocation issued item');
            return data;
        } catch (error) {
            throw error;
        }
    },

    deleteConvocationIssued: async (id) => {
        try {
            const response = await fetch(`${API_URL}/master/convocation-issued/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error deleting convocation issued item');
            return data;
        } catch (error) {
            throw error;
        }
    },

    getSecondLanguages: async () => {
        try {
            const response = await fetch(`${API_URL}/master/second-languages`, {
                method: 'GET',
                headers: getHeaders()
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error fetching second languages');
            return data;
        } catch (error) {
            throw error;
        }
    },

    getPartII: async () => {
        try {
            const response = await fetch(`${API_URL}/master/part-ii`, {
                method: 'GET',
                headers: getHeaders()
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error fetching Part II options');
            return data;
        } catch (error) {
            throw error;
        }
    },

    getPartIII: async () => {
        try {
            const response = await fetch(`${API_URL}/master/part-iii`, {
                method: 'GET',
                headers: getHeaders()
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Error fetching Part III options');
            return data;
        } catch (error) {
            throw error;
        }
    },

    // Report Generation
    generateReport: async (criteria) => {
        try {
            const response = await fetch(`${API_URL}/reports/convocation`, {
                method: 'POST',
                headers: getHeaders(), // JSON content type
                body: JSON.stringify(criteria)
            });

            if (response.status === 401 || response.status === 403) {
                await handleResponse(response); // Will throw and redirect
            }

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Report generation failed');
            }

            // Handle Blob for PDF
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            throw error;
        }
    },

    getDashboardStats: async () => {
        try {
            const response = await fetch(`${API_URL}/convocation/stats`, {
                method: 'GET',
                headers: getHeaders()
            });
            return await handleResponse(response);
        } catch (error) {
            console.error('Error in getDashboardStats:', error);
            throw error;
        }
    }
};
