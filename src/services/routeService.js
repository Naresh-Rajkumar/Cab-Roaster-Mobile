/**
 * Route Service — Road-following polylines via OSRM
 *
 * Uses the free OSRM public API (no API key needed).
 * Returns dense coordinate arrays that follow actual roads,
 * replacing straight-line polylines between stops.
 *
 * OSRM uses OpenStreetMap data — same provider as our map tiles.
 */

const OSRM_BASE = 'https://router.project-osrm.org/route/v1/driving';

/**
 * Fetch road-following coordinates between waypoints.
 *
 * @param {Array<{latitude: number, longitude: number}>} waypoints - ordered stops
 * @returns {Promise<Array<{latitude: number, longitude: number}>>} road-snapped coords
 */
export async function fetchRouteCoordinates(waypoints) {
  if (!waypoints || waypoints.length < 2) return waypoints || [];

  try {
    // OSRM expects: /lng1,lat1;lng2,lat2;...?overview=full&geometries=geojson
    const coords = waypoints
      .map((w) => `${w.longitude},${w.latitude}`)
      .join(';');

    const url = `${OSRM_BASE}/${coords}?overview=full&geometries=geojson`;
    const res = await fetch(url);
    const json = await res.json();

    if (json.code === 'Ok' && json.routes?.[0]?.geometry?.coordinates) {
      // GeoJSON coordinates are [lng, lat] — flip to { latitude, longitude }
      return json.routes[0].geometry.coordinates.map(([lng, lat]) => ({
        latitude: lat,
        longitude: lng,
      }));
    }

    // API returned unexpected response — fall back to straight lines
    return waypoints;
  } catch {
    // Network error or OSRM unreachable — fall back to straight lines
    return waypoints;
  }
}
