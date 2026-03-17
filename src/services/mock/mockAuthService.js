/**
 * MOCK AUTH SERVICE
 * Simulates authentication API calls with realistic delays.
 * Replace with real API calls by setting USE_MOCK = false in src/config/env.js
 */
import { MOCK_DELAY_MIN, MOCK_DELAY_MAX } from '../../config/env';
import { MOCK_USERS } from './mockData';

/** Simulates network delay */
const delay = () =>
  new Promise((resolve) =>
    setTimeout(
      resolve,
      Math.random() * (MOCK_DELAY_MAX - MOCK_DELAY_MIN) + MOCK_DELAY_MIN
    )
  );

/**
 * MOCK CREDENTIALS (for reference / testing):
 *   Employee: role = 'employee' (any input accepted)
 *   Driver:   role = 'driver'   (any input accepted)
 *
 * When backend is ready, remove this file and set USE_MOCK = false.
 */
export const mockAuthService = {
  /** Accepts any credentials. Role is determined by credentials.role field. */
  login: async (credentials) => {
    await delay();
    const role = credentials?.role || 'employee';
    const user = MOCK_USERS[role];
    if (!user) throw new Error('Invalid role');
    return {
      data: {
        user,
        token: `mock-jwt-${role}-${Date.now()}`,
        refreshToken: `mock-refresh-${role}-${Date.now()}`,
        expiresIn: 3600,
      },
    };
  },

  verifyOTP: async (phone, otp) => {
    await delay();
    // Accept any OTP in mock mode
    return {
      data: {
        user: MOCK_USERS.employee,
        token: `mock-jwt-employee-${Date.now()}`,
        refreshToken: `mock-refresh-employee-${Date.now()}`,
        expiresIn: 3600,
      },
    };
  },

  refreshToken: async (refreshToken) => {
    await delay();
    return {
      data: {
        token: `mock-jwt-refreshed-${Date.now()}`,
        expiresIn: 3600,
      },
    };
  },

  logout: async () => {
    await delay();
    return { data: { success: true } };
  },

  getProfile: async () => {
    await delay();
    return { data: MOCK_USERS.employee };
  },
};
