import axios from 'axios';

/**
 * Create an Axios instance with default configuration
 */
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Backend URbaseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',L
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Request Interceptor
 * This runs BEFORE every request is sent
 * We use it to attach the JWT token to every request
 */
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');

    // If token exists, attach it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    // If there's an error before the request is sent, handle it here
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * This runs AFTER every response comes back from the server
 * We use it to handle errors globally
 */
api.interceptors.response.use(
  (response) => {
    // If response is successful, just return it
    return response;
  },
  (error) => {
    // If response is an error
    if (error.response?.status === 401) {
      // 401 = Unauthorized (token expired or invalid)
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
