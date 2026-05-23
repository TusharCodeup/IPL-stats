import axios from 'axios';
import useAuthStore from '../store/authStore';
import config from '../config';

const apiClient = axios.create({
  baseURL: config.apiUrl,
  timeout: 15000,
  withCredentials: true, // Enable cookie transmissions for CSRF / session cookies
  headers: {
    'Content-Type': 'application/json',
    'X-Requested-With': 'XMLHttpRequest' // Standard header to signal AJAX
  },
});

// Automatically inject JWT Bearer Token if logged in
apiClient.interceptors.request.use(
  (reqConfig) => {
    const token = useAuthStore.getState().token;
    if (token) {
      reqConfig.headers.Authorization = `Bearer ${token}`;
    }
    
    // Attempt to inject CSRF token from head meta if page was served with one
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
    if (csrfToken) {
      reqConfig.headers['X-CSRF-Token'] = csrfToken;
    }
    
    return reqConfig;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Unified error handler and retry logic
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // 1. Handle 401 Unauthorized - Auto logout
    if (error.response?.status === 401) {
      // Avoid looping if the login request itself fails with 401
      if (!originalRequest.url.includes('/auth/token')) {
        useAuthStore.getState().logout();
      }
    }
    
    // 2. Retry logic for 5xx Server Errors (max 3 retries)
    if (error.response?.status >= 500 && !originalRequest._retry) {
      originalRequest._retry = (originalRequest._retry || 0) + 1;
      if (originalRequest._retry <= 3) {
        // Progressive backoff delay: 1000ms, 2000ms, 3000ms
        const delay = 1000 * originalRequest._retry;
        console.warn(`[API Client]: Retrying request ${originalRequest.url} (Attempt ${originalRequest._retry}/3) in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return apiClient(originalRequest);
      }
    }
    
    const message = error.response?.data?.detail || 'An unexpected error occurred. Please try again.';
    logger_error(message);
    return Promise.reject(new Error(message));
  }
);

function logger_error(msg) {
  console.error(`[API Error]: ${msg}`);
}

export default apiClient;
