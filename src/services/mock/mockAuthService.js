/**
 * MOCK AUTH SERVICE
 * Simulates phone-based OTP authentication with realistic delays.
 * Replace with real API calls by setting USE_MOCK = false in src/config/env.js
 */
import { MOCK_DELAY_MIN, MOCK_DELAY_MAX } from '../../config/env';
import { MOCK_USERS } from './mockData';

const delay = () =>
  new Promise((resolve) =>
    setTimeout(
      resolve,
      Math.random() * (MOCK_DELAY_MAX - MOCK_DELAY_MIN) + MOCK_DELAY_MIN
    )
  );

export const mockAuthService = {
  /**
   * Step 1: Request OTP — just confirms the phone number was received.
   * Does NOT return a token. Authentication happens after OTP verification.
   */
  login: async (credentials) => {
    await delay();
    return {
      data: {
        success: true,
        message: 'OTP sent successfully',
        phone: credentials?.phone,
      },
    };
  },

  /**
   * Step 2: Verify OTP — authenticates the user.
   * Accepts any OTP in mock mode. Role determines which user profile is returned.
   */
  verifyOTP: async (phone, otp, role = 'employee') => {
    await delay();
    const user = MOCK_USERS[role] ?? MOCK_USERS.employee;
    return {
      data: {
        user,
        token: `mock-jwt-${role}-${Date.now()}`,
        refreshToken: `mock-refresh-${role}-${Date.now()}`,
        expiresIn: 3600,
      },
    };
  },

  sendOtp: async (phone) => {
    await delay();
    return {
      data: {
        success: true,
        message: 'OTP sent successfully',
        data: { phone, devOtp: '123456' },
      },
    };
  },

  verifyOtpCode: async (phone, otp) => {
    await delay();
    const user = MOCK_USERS['driver'] ?? MOCK_USERS.employee;
    return {
      data: {
        success: true,
        message: 'Success',
        data: {
          accessToken: `mock-jwt-driver-${Date.now()}`,
          refreshToken: `mock-refresh-driver-${Date.now()}`,
          user,
        },
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
