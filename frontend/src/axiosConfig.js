import axios from 'axios';
import { refreshToken } from './redux/authActions';

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Add response interceptor
axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // If error is 403 and we haven't tried to refresh yet
    if (error.response?.status === 403 &&
        error.response?.data?.error === "Invalid or expired token." &&
        !originalRequest._retry) {

      if (isRefreshing) {
        // If refresh already in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return axios(originalRequest);
          })
          .catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh token
        const newToken = await refreshToken();

        // Update authorization header
        originalRequest.headers['Authorization'] = `Bearer ${newToken}`;

        // Process any requests in the queue
        processQueue(null, newToken);

        return axios(originalRequest);
      } catch (refreshError) {
        // Process queue with error
        processQueue(refreshError, null);

        // Redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axios;
