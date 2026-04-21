import axios from 'axios';
import { API_TIMEOUT } from '../constants';
import { API_BASE_URL } from '../config/env';

// Lazy store ref to avoid circular imports — injected from store.js
let _store = null;
export function injectStore(store) {
  _store = store;
}

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Device-Type': 'mobile',
  },
});

// ngrok free tier may serve an HTML interstitial to API clients without this header (looks like a failed / non-JSON response).
if (typeof API_BASE_URL === 'string' && /ngrok/i.test(API_BASE_URL)) {
  axiosInstance.defaults.headers.common['ngrok-skip-browser-warning'] = 'true';
}

export const setAuthToken = (token) => {
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common['Authorization'];
  }
};

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = axiosInstance.defaults.headers.common['Authorization'];
    if (token) {
      config.headers['Authorization'] = token;
    }
    if (typeof __DEV__ !== 'undefined' && __DEV__) {
      const fullUrl = `${config.baseURL || ''}${config.url || ''}`;
      console.log(`[HTTP] ${(config.method || 'GET').toUpperCase()} ${fullUrl}`);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      setAuthToken(null);
      if (_store) {
        const { logoutUser } = require('../redux/slices/authSlice');
        _store.dispatch(logoutUser());
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
