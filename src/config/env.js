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
export const USE_MOCK = false;

// API base URL (used only when USE_MOCK = false)
// For physical device testing, replace 'localhost' with your LAN IP (e.g. 192.168.x.x)
export const API_BASE_URL = __DEV__
  ? 'http://localhost:4000/api'
  : 'https://api.vcommute.com/api';

// Socket.IO URL for real-time tracking
export const SOCKET_URL = __DEV__
  ? 'http://localhost:4000'
  : 'https://api.vcommute.com';

// Microsoft Azure AD config (for SSO)
export const AZURE_CLIENT_ID = 'your-azure-client-id'; // Replace with actual Azure AD app client ID
export const AZURE_TENANT_ID = 'your-azure-tenant-id'; // Replace with actual tenant ID
export const ALLOWED_EMAIL_DOMAIN = 'vthink.co.in';

// Simulated network delay range (ms) — realistic UX while mocking
export const MOCK_DELAY_MIN = 500;
export const MOCK_DELAY_MAX = 1000;
