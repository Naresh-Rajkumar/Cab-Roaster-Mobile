/**
 * Normalize Axios / NestJS error payloads for user-facing alerts.
 * Nest validation: { statusCode: 400, message: string | string[] }
 */
import { API_BASE_URL } from '../config/env';

function isPrivateLanUrl(url) {
  try {
    const u = new URL(url);
    const h = u.hostname;
    if (h === 'localhost' || h === '127.0.0.1') return true;
    if (/^192\.168\./.test(h)) return true;
    if (/^10\./.test(h)) return true;
    const m = /^172\.(1[6-9]|2\d|3[0-1])\./.exec(h);
    return Boolean(m);
  } catch {
    return false;
  }
}

export function parseAxiosErrorMessage(error, fallback = 'Something went wrong') {
  const data = error?.response?.data;
  if (data != null) {
    const { message } = data;
    if (typeof message === 'string' && message.trim()) return message;
    if (Array.isArray(message) && message.length) return message.join(', ');
    if (typeof data.error === 'string' && data.error.trim()) return data.error;
  }
  if (error?.code === 'ECONNABORTED') {
    return `Request timed out to ${API_BASE_URL}. Check connection and that the server is running.`;
  }
  if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error') {
    const base = API_BASE_URL;
    const lanHint = isPrivateLanUrl(base)
      ? ' This build points at a LAN/private IP — that will not work on mobile data or off your Wi‑Fi. Rebuild the APK with EXPO_PUBLIC_API_BASE_URL set to your public URL (e.g. ngrok) in eas.json.'
      : ' Keep ngrok running on your PC, or update eas.json and rebuild if the tunnel URL changed.';
    return `Cannot reach:\n${base}\n${lanHint}`;
  }
  return error?.message || fallback;
}
