import axiosInstance from '../api/axiosInstance';

export const fetchCsrfToken = async () => {
    try {
        const response = await axiosInstance.get('/api/csrf/');
        const csrfToken = response.data.csrfToken;
        axiosInstance.defaults.headers['X-CSRFToken'] = csrfToken;
    } catch (error) {
        console.error('CSRF token fetch error:', error);
    }
};