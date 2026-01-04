import axios from 'axios';
import { getAccessToken, removeAuthTokens } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect on network errors (backend not running)
    if (!error.response) {
      console.error('Network error: Backend server might not be running', error.message);
      return Promise.reject(new Error('Cannot connect to server. Please make sure the backend is running on port 5000.'));
    }
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      removeAuthTokens();
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;

