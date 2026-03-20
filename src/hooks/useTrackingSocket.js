/**
 * useTrackingSocket — Real-time GPS tracking via Socket.IO
 *
 * Connects to the /tracking namespace on the backend.
 * Emits admin:register (with ack callback) to join admin room and get initial cab snapshot.
 * Emits admin:watch { cabId } to subscribe to a specific cab's location.
 * Listens to cab:location events for live position updates.
 *
 * NOTE: Backend sends { lat, lng } but Leaflet/RN uses { latitude, longitude }.
 * This hook normalises both formats via nullish coalescing (??) so either works.
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import { SOCKET_URL } from '../config/env';

const MAX_TRAIL_POINTS = 200;

export const useTrackingSocket = (token) => {
  const [connected, setConnected] = useState(false);
  const [cabPosition, setCabPosition] = useState(null);
  const [allCabPositions, setAllCabPositions] = useState({});
  const [trail, setTrail] = useState([]);
  const [speed, setSpeed] = useState(0);
  const [heading, setHeading] = useState(0);
  const socketRef = useRef(null);

  useEffect(() => {
    // Connect even with a mock token — backend allows unauthenticated sockets
    const socket = io(`${SOCKET_URL}/tracking`, {
      auth: { token: token || 'anonymous' },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });

    socket.on('connect', () => {
      setConnected(true);
      // Register as admin — backend returns snapshot via ack callback (not event)
      socket.emit('admin:register', {}, (response) => {
        if (response?.cabs?.length > 0) {
          const posMap = {};
          response.cabs.forEach((cab) => {
            const lat = cab.latitude ?? cab.lat;
            const lon = cab.longitude ?? cab.lng;
            const id = cab.cabRegNo || cab.cabId;
            if (id && lat != null && lon != null) {
              posMap[id] = {
                latitude: lat,
                longitude: lon,
                heading: cab.heading || 0,
                speed: cab.speed || 0,
              };
            }
          });
          setAllCabPositions(posMap);
        }
      });
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    // Listen for cab location updates
    // Backend sends { lat, lng } — normalise to { latitude, longitude }
    socket.on('cab:location', (data) => {
      const lat = data?.latitude ?? data?.lat;
      const lon = data?.longitude ?? data?.lng;

      if (lat != null && lon != null) {
        const pos = {
          latitude: lat,
          longitude: lon,
          heading: data.heading || 0,
          speed: data.speed || 0,
          timestamp: data.timestamp || data.ts,
          cabRegNo: data.cabRegNo || data.cabId,
        };

        setCabPosition(pos);
        setSpeed(data.speed || 0);
        setHeading(data.heading || 0);

        // Accumulate breadcrumb trail (capped)
        setTrail((prev) => {
          const point = { latitude: lat, longitude: lon };
          const updated = [...prev, point];
          return updated.length > MAX_TRAIL_POINTS
            ? updated.slice(-MAX_TRAIL_POINTS)
            : updated;
        });

        setAllCabPositions((prev) => ({
          ...prev,
          [data.cabRegNo || data.cabId]: {
            latitude: lat,
            longitude: lon,
            heading: data.heading || 0,
            speed: data.speed || 0,
          },
        }));
      }
    });

    socket.on('connect_error', (err) => {
      setConnected(false);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  const watchCab = useCallback((cabId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('admin:watch', { cabId });
    }
  }, []);

  const unwatchCab = useCallback((cabId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('admin:unwatch', { cabId });
    }
  }, []);

  return {
    socket: socketRef.current,
    connected,
    cabPosition,
    allCabPositions,
    trail,
    speed,
    heading,
    watchCab,
    unwatchCab,
  };
};
