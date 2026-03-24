/**
 * useDriverLocation — GPS tracking hook for driver screens
 *
 * Requests location permissions, watches position, and emits
 * update_location events via the tracking socket.
 *
 * Usage in DriverActiveTripScreen:
 *   const { location, isTracking, startTracking, stopTracking } = useDriverLocation(emitLocation, tripMeta);
 */
import { useState, useRef, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';

export function useDriverLocation(emitLocation, tripMeta = {}) {
  const [location, setLocation] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState(null);
  const watchRef = useRef(null);

  const { cabId, driverId, tripId } = tripMeta;

  const startTracking = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        return;
      }

      setIsTracking(true);
      setError(null);

      // Watch position and emit to socket
      watchRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,   // emit every 5 seconds
          distanceInterval: 10, // or every 10 meters
        },
        (loc) => {
          const pos = {
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
            speed: loc.coords.speed ?? 0,
            heading: loc.coords.heading ?? 0,
            accuracy: loc.coords.accuracy ?? 0,
          };

          setLocation(pos);

          // Emit to backend via socket
          if (emitLocation && cabId && driverId) {
            emitLocation({
              cabId,
              driverId,
              tripId: tripId ?? null,
              ...pos,
            });
          }
        }
      );
    } catch (err) {
      setError(err.message);
      setIsTracking(false);
    }
  }, [emitLocation, cabId, driverId, tripId]);

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
