/**
 * AUTH SERVICE
 *
 * Automatically routes to mock or real API based on USE_MOCK flag.
 *
 * TO SWITCH TO REAL BACKEND:
 *   In src/config/env.js, set USE_MOCK = false
 *   All calls will then hit the real axiosInstance endpoints.
 */
import { USE_MOCK } from '../../config/env';
import { mockAuthService } from '../mock/mockAuthService';
import axiosInstance from '../axiosConfig';

const realAuthService = {
  login: (credentials) => axiosInstance.post('/auth/employee-login', credentials),
  refreshToken: (token) => axiosInstance.post('/auth/refresh', { refreshToken: token }),
  logout: () => axiosInstance.post('/auth/logout'),
  getProfile: () => axiosInstance.get('/auth/me'),
  sendOtp: (phone) => axiosInstance.post('/auth/send-otp', { phone }),
  verifyOtpCode: (phone, otp) => axiosInstance.post('/auth/verify-otp', { phone, otp }),
};

// Single export — screens/thunks never need to know which is active
export const authService = USE_MOCK ? mockAuthService : realAuthService;
