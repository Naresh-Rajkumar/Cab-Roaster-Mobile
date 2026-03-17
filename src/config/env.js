/**
 * Environment & Feature Flags
 *
 * HOW TO SWITCH TO REAL BACKEND:
 *   1. Set USE_MOCK = false
 *   2. Set API_BASE_URL to your production URL
 *   3. Ensure auth tokens are stored via expo-secure-store
 *   That's it — all service calls will route to real endpoints automatically.
 */

// Master switch: true = mock data, false = real API
export const USE_MOCK = true;

// API base URL (used only when USE_MOCK = false)
export const API_BASE_URL = __DEV__
  ? 'http://localhost:3000/api'
  : 'https://api.vcommute.com/api';

// Simulated network delay range (ms) — realistic UX while mocking
export const MOCK_DELAY_MIN = 500;
export const MOCK_DELAY_MAX = 1000;
