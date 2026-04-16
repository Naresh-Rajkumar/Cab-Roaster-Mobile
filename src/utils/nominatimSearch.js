/**
 * OpenStreetMap Nominatim forward + reverse search.
 * @see https://operations.osmfoundation.org/policies/nominatim/
 */
const HEADERS = {
  'Accept-Language': 'en',
  'User-Agent': 'CabrosterCommuteMobile/1.0',
};

/**
 * Forward search — returns address suggestions for a text query.
 * @param {string} query
 * @param {{ signal?: AbortSignal; limit?: number }} [options]
 * @returns {Promise<Array<{ display_name: string; lat: string; lon: string }>>}
 */
export function nominatimSearch(query, { signal, limit = 8 } = {}) {
  const q = query?.trim();
  if (!q || q.length < 2) return Promise.resolve([]);
  const url =
    'https://nominatim.openstreetmap.org/search?' +
    `q=${encodeURIComponent(q)}&format=json&limit=${limit}&addressdetails=1&countrycodes=in`;
  return fetch(url, { signal, headers: HEADERS })
    .then((r) => r.json())
    .then((data) => (Array.isArray(data) ? data : []))
    .catch(() => []);
}

/**
 * Reverse geocode — returns a human-readable address for lat/lng coordinates.
 * @param {number} latitude
 * @param {number} longitude
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<string>} Formatted address string, or empty string on failure
 */
export async function nominatimReverse(latitude, longitude, { signal } = {}) {
  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}` +
      `&format=json&addressdetails=1`;
    const res = await fetch(url, { signal, headers: HEADERS });
    const data = await res.json();
    return data?.display_name ?? '';
  } catch {
    return '';
  }
}
