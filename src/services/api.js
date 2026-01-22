import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token storage
const TOKEN_KEY = 'jecoplus_access_token';
const REFRESH_TOKEN_KEY = 'jecoplus_refresh_token';

export const getAccessToken = () => localStorage.getItem(TOKEN_KEY);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

export const setTokens = (accessToken, refreshToken) => {
  if (accessToken) localStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem('csrf_token');
};

// CSRF Token management
let csrfToken = null;

export const getCSRFToken = async () => {
  if (csrfToken) {
    return csrfToken;
  }

  try {
    // Try to get from localStorage first
    const stored = localStorage.getItem('csrf_token');
    if (stored) {
      csrfToken = stored;
      return csrfToken;
    }

    // Fetch from server
    const response = await axios.get(`${API_URL}/csrf-token`, {
      withCredentials: true, // Important for cookies
    });

    if (response.data?.csrfToken) {
      csrfToken = response.data.csrfToken;
      localStorage.setItem('csrf_token', csrfToken);
      return csrfToken;
    }
  } catch (error) {
    console.warn('Failed to get CSRF token:', error);
  }

  return null;
};

// Initialize CSRF token on app start
getCSRFToken();

// Request interceptor - add auth header
api.interceptors.request.use(
  async (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add device ID
    let deviceId = localStorage.getItem('jecoplus_device_id');
    if (!deviceId) {
      deviceId = crypto.randomUUID();
      localStorage.setItem('jecoplus_device_id', deviceId);
    }
    config.headers['X-Device-ID'] = deviceId;

    // Add CSRF token for state-changing requests
    if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase())) {
      const token = await getCSRFToken();
      if (token) {
        config.headers['X-CSRF-Token'] = token;
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not a refresh request
    if (error.response?.status === 401 && !originalRequest._retry) {
      // Debug log
      console.log('[API] 401 Error intercepted:', {
        url: originalRequest.url,
        errorCode: error.response?.data?.error?.code,
        hasRefreshToken: !!getRefreshToken(),
      });

      // Check if it's a token expired error
      const errorCode = error.response?.data?.error?.code;

      // Try to refresh token for both TOKEN_EXPIRED and INVALID_TOKEN
      if ((errorCode === 'TOKEN_EXPIRED' || errorCode === 'INVALID_TOKEN') && getRefreshToken()) {
        if (isRefreshing) {
          // Queue the request while refreshing
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const { data } = await axios.post(`${API_URL}/auth/token/refresh`, {
            refreshToken: getRefreshToken(),
          });

          const newToken = data.data.accessToken;
          setTokens(newToken, null);

          processQueue(null, newToken);

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          clearTokens();

          // Redirect to login
          window.location.href = '/login';

          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      }

      // Token invalid, clear and redirect
      console.warn('[API] Redirecting to login - Invalid token:', {
        url: originalRequest.url,
        errorCode,
      });
      clearTokens();

      // Delay redirect slightly to allow logs to appear
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);
    }

    return Promise.reject(error);
  }
);

export default api;
