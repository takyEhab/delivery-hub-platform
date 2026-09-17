import axios from 'axios';

const baseURL = import.meta.env.API_URL || "https://delivery-hub-platform-api.vercel.app"

export const apiClient = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Attach Authorization header if token exists
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('deliveryhub_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercept responses for centralized error parsing and 401 handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If unauthorized, clear stored token and dispatch an auth expired event
      const currentPath = window.location.pathname;
      if (currentPath !== '/login') {
        localStorage.removeItem('deliveryhub_token');
        localStorage.removeItem('deliveryhub_user');
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Extracts a user-friendly error message from backend responses or network errors
 */
export function getErrorMessage(error) {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message === 'Network Error') {
    return 'Unable to connect to the server. Please check your network or backend status.';
  }
  return error.message || 'An unexpected error occurred. Please try again.';
}
