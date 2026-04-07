/**
 * Environment & Feature Flags
 *
 * HOW TO SWITCH TO REAL BACKEND:
 *   1. Set USE_MOCK = false
 *   2. Set EXPO_PUBLIC_API_BASE_URL (see below) — required for phones on cellular / other Wi‑Fi
 *   3. Ensure auth tokens are stored via expo-secure-store
 *
 * API URL (LAN vs public):
 *   - Local dev on same Wi‑Fi: leave EXPO_PUBLIC unset → fallback LAN IP below.
 *   - Field testing / APK / any network: set EXPO_PUBLIC_API_BASE_URL to your HTTPS API
 *     (e.g. https://api.example.com/api/v1 or https://api.example.com — /api/v1 is appended if missing).
 *   - EAS build: add EXPO_PUBLIC_API_BASE_URL in eas.json "env" for that profile, or use EAS Environment Variables.
 */

// Master switch: true = mock data, false = real API
export const USE_MOCK = false;

// LAN fallback when EXPO_PUBLIC_API_BASE_URL is unset — must match Cabroster-BE `PORT` in .env (default 4000 in .env.example).
const FALLBACK_LAN_API_BASE = 'http://192.168.2.156:4000/api/v1';

function resolveApiBaseUrl() {
  const raw = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (typeof raw === 'string' && raw.trim()) {
    const base = raw.trim().replace(/\/+$/, '');
    if (/\/api\/v\d+$/i.test(base)) return base;
    return `${base}/api/v1`;
  }
  return FALLBACK_LAN_API_BASE;
}

// API base URL (used only when USE_MOCK = false). Tracking socket URL is derived from this in useTrackingSocket.
export const API_BASE_URL = resolveApiBaseUrl();

// Simulated network delay range (ms) — realistic UX while mocking
export const MOCK_DELAY_MIN = 500;
export const MOCK_DELAY_MAX = 1000;
