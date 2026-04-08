/**
 * OpenStreetMap Nominatim forward search (addresses / places in India).
 * @see https://operations.osmfoundation.org/policies/nominatim/
 */
const HEADERS = {
  'Accept-Language': 'en',
  'User-Agent': 'CabrosterCommuteMobile/1.0',
};

/**
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
