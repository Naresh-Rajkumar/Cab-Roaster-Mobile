/**
 * useDriverLocation — GPS tracking hook for driver screens
 *
 * Requests location permissions, watches position, emits update_location
 * events via the tracking socket, and fires onStopArrival when the driver
 * enters the arrival radius of any stop.
 *
 * Usage:
 *   const { location, isTracking, startTracking, stopTracking } =
 *     useDriverLocation(emitLocation, tripMeta, stops, onStopArrival);
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import * as Location from 'expo-location';

/** Radius in metres within which a stop is considered "arrived at" */
const ARRIVAL_RADIUS_METERS = 300;

/**
 * Haversine great-circle distance between two lat/lng points, in metres.
 */
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000; // Earth radius in metres
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/**
 * @param {Function} emitLocation  - socket emit callback from useTrackingSocket
 * @param {Object}   tripMeta      - { cabId, driverId, tripId }
 * @param {Array}    stops         - array of stop objects with { id, latitude, longitude, ... }
 * @param {Function} onStopArrival - called with the matched stop object when driver is within radius
 */
export function useDriverLocation(emitLocation, tripMeta = {}, stops = [], onStopArrival) {
  const [location, setLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState(null);
  const watchRef = useRef(null);

  // Keep refs of frequently-changing values so watch callback never has stale closures
  const tripMetaRef = useRef(tripMeta);
  useEffect(() => { tripMetaRef.current = tripMeta; });

  const stopsRef = useRef(stops);
  useEffect(() => { stopsRef.current = stops; });

  const onStopArrivalRef = useRef(onStopArrival);
  useEffect(() => { onStopArrivalRef.current = onStopArrival; });

  // Track which stops have already fired to avoid repeated triggers as the
  // driver lingers near the stop (resets when tracking restarts)
  const arrivedStopIdsRef = useRef(new Set());

  // Socket emit is throttled to 5 s so the server isn't flooded, while the
  // local GPS watch fires every 1 s for instant map updates on the driver's screen.
  const lastEmitRef = useRef(0);

  const startTracking = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied. Please enable it in Settings.');
        return false;
      }

      setIsTracking(true);
      setError(null);
      arrivedStopIdsRef.current = new Set(); // reset on each trip start
      lastEmitRef.current = 0;

      watchRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,   // fire every 1 s — no movement required
          distanceInterval: 0,  // 0 = fire on time interval alone, not distance
        },
        (loc) => {
          const pos = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            speed: loc.coords.speed ?? 0,
            heading: loc.coords.heading ?? 0,
            accuracy: loc.coords.accuracy ?? 0,
          };

          // Always update local state immediately (instant map movement)
          setLocation(pos);

          // ─── Emit GPS to socket — throttled to 5 s ─────────────────────────
          const now = Date.now();
          if (now - lastEmitRef.current >= 5000) {
            lastEmitRef.current = now;
            const { cabId, driverId, tripId } = tripMetaRef.current;
            if (!cabId) {
              console.warn('[useDriverLocation] cabId missing — location not emitted');
            } else if (!driverId) {
              console.warn('[useDriverLocation] driverId missing — location not emitted');
            } else if (emitLocation) {
              emitLocation({ cabId, driverId, tripId: tripId ?? null, ...pos });
            }
          }

          // ─── Proximity check against each stop ─────────────────────────────
          const currentStops = stopsRef.current;
          const handleArrival = onStopArrivalRef.current;

          if (handleArrival && currentStops.length >= 0) {
            for (const stop of currentStops) {
              if (!stop.latitude || !stop.longitude) continue;

              // Build a stable dedup key — fall back to stop name if id is empty
              const stopKey = stop.id
                ? String(stop.id)
                : `name:${stop.name ?? ''}`;

              if (arrivedStopIdsRef.current.has(stopKey)) continue;

              const dist = haversineDistance(
                pos.latitude,
                pos.longitude,
                stop.latitude,
                stop.longitude,
              );

              // Trigger when within 300 m  OR  when speed-based ETA ≤ 30 s
              // (catches fast approach before hitting the radius)
              const speedMps = pos.speed > 0 ? pos.speed : 0;
              const etaSecs  = speedMps > 0 ? dist / speedMps : Infinity;
              const shouldTrigger = dist <= ARRIVAL_RADIUS_METERS || etaSecs <= 30;

              if (shouldTrigger) {
                console.log(
                  `[useDriverLocation] Triggering attendance at "${stop.name}" — ` +
                  `dist=${Math.round(dist)}m, eta=${Math.round(etaSecs)}s`
                );
                arrivedStopIdsRef.current.add(stopKey);
                handleArrival(stop);
                break; // only one stop per GPS update
              }
            }
          }
        }
      );

      return true;
    } catch (err) {
      setError(err.message);
      setIsTracking(false);
      return false;
    }
  }, [emitLocation]);

  const stopTracking = useCallback(() => {
    if (watchRef.current) {
      watchRef.current.remove();
      watchRef.current = null;
    }
    setIsTracking(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchRef.current) {
        watchRef.current.remove();
      }
    };
  }, []);

  return { location, isTracking, error, startTracking, stopTracking };
}
