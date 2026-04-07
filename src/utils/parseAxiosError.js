/**
 * Normalize Axios / NestJS error payloads for user-facing alerts.
 * Nest validation: { statusCode: 400, message: string | string[] }
 */
export function parseAxiosErrorMessage(error, fallback = 'Something went wrong') {
  const data = error?.response?.data;
  if (data != null) {
    const { message } = data;
    if (typeof message === 'string' && message.trim()) return message;
    if (Array.isArray(message) && message.length) return message.join(', ');
    if (typeof data.error === 'string' && data.error.trim()) return data.error;
  }
  if (error?.code === 'ECONNABORTED') {
    return 'Request timed out. Check your connection and that the server is running.';
  }
  if (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error') {
    return 'Cannot reach the server. Check internet/VPN, that ngrok (or your API) is running, and EXPO_PUBLIC_API_BASE_URL / eas.json env.';
  }
  return error?.message || fallback;
}
