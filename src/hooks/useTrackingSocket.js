/**
 * useTrackingSocket — Socket.IO hook for /tracking namespace
 *
 * Connects to BE WebSocket with JWT auth.
 * Used by:
 *   - LiveTrackingScreen (employee) — listens for cab_location_update
 *   - DriverActiveTripScreen (driver) — emits update_location
 */
import { useEffect, useRef, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../config/env';
import { addNotification } from '../redux/slices/appSlice';

// Derive socket URL from API base URL (strip /api/v1 suffix)
const SOCKET_URL = API_BASE_URL.replace(/\/api\/v\d+$/, '');

export function useTrackingSocket() {
  const socketRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!token) return;

    const socket = io(`${SOCKET_URL}/tracking`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      auth: { token },
    });

    socket.on('connect', () => {
      console.log('[Tracking] Connected:', socket.id);
      setConnected(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Tracking] Disconnected:', reason);
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.warn('[Tracking] Connection error:', err.message);
    });

    socket.on('error', (err) => {
      console.warn('[Tracking] Server error:', err?.message ?? err);
    });

    socket.on('notification_received', (data) => {
      if (data?.title) {
        dispatch(addNotification({
          id: String(Date.now()),
          title: data.title,
          body: data.body || '',
          time: 'Just now',
          unread: true,
          iconName: 'notifications-outline',
          iconBg: '#EDE9FE',
          iconColor: '#7C3AED',
          category: 'today',
        }));
      }
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  // ─── Event helpers ──────────────────────────────────────────────────────

  /** Driver: send current GPS position */
  const emitLocation = useCallback((payload) => {
    // payload: { cabId, driverId, tripId?, latitude, longitude, speed?, heading?, accuracy? }
    socketRef.current?.emit('update_location', payload);
  }, []);

  /** Employee/Admin: request all active cabs */
  const getActiveCabs = useCallback(() => {
    socketRef.current?.emit('get_active_cabs');
  }, []);

  /** Admin: subscribe to a specific cab trail */
  const watchCab = useCallback((cabId) => {
    socketRef.current?.emit('watch_cab', { cabId });
  }, []);

  /** Admin: unsubscribe from a cab trail */
  const unwatchCab = useCallback((cabId) => {
    socketRef.current?.emit('unwatch_cab', { cabId });
  }, []);

  /** Driver: trigger SOS alert */
  const emitSOS = useCallback((payload) => {
    // payload: { alertType, latitude, longitude, message? }
    socketRef.current?.emit('sos_alert', payload);
  }, []);

  return {
    socket: socketRef.current,
    connected,
    emitLocation,
    getActiveCabs,
    watchCab,
    unwatchCab,
    emitSOS,
  };
}
