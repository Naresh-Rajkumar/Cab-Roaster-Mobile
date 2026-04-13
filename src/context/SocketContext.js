/**
 * SocketContext — Single shared Socket.IO connection for the entire app.
 *
 * Why: calling useTrackingSocket() in multiple components created independent
 * io() connections (navigator + HomeScreen + LiveTrackingScreen = 3+ sockets).
 * LiveTrackingScreen's socket was null on first render because socketRef.current
 * is not reactive — React never re-rendered when it was set inside useEffect.
 *
 * Fix: one socket, created here, exposed via React context as reactive state.
 * All consumers (useTrackingSocket, LiveTrackingScreen, HomeScreen) share the
 * same connection and get a real re-render when connected state changes.
 */
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '../config/env';
import { addNotification } from '../redux/slices/appSlice';

const SOCKET_URL = API_BASE_URL.replace(/\/api\/v\d+$/, '');

const SocketContext = createContext(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  // socket is stored in STATE (not just a ref) so consumers re-render when it changes
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const token = useSelector((state) => state.auth.token);
  const dispatch = useDispatch();

  useEffect(() => {
    // No token → disconnect any existing socket and wait
    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    const s = io(`${SOCKET_URL}/tracking`, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      auth: { token },
    });

    s.on('connect', () => {
      console.log('[Socket] Connected:', s.id);
      setConnected(true);
    });

    s.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      setConnected(false);
    });

    s.on('connect_error', (err) => {
      console.warn('[Socket] Connection error:', err.message);
    });

    s.on('error', (err) => {
      console.warn('[Socket] Server error:', err?.message ?? err);
    });

    // All notification_received events are dispatched to Redux so any screen
    // can react to them via useSelector — no per-component callback needed.
    s.on('notification_received', (data) => {
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

    socketRef.current = s;
    setSocket(s); // reactive — triggers re-renders in consumers

    return () => {
      s.disconnect();
      socketRef.current = null;
      setSocket(null);
      setConnected(false);
    };
  }, [token, dispatch]);

  // ─── Event helpers (stable refs — safe to put in dependency arrays) ─────────

  const emitLocation = useCallback((payload) => {
    socketRef.current?.emit('update_location', payload);
  }, []);

  const getActiveCabs = useCallback(() => {
    socketRef.current?.emit('get_active_cabs');
  }, []);

  const watchCab = useCallback((cabId) => {
    socketRef.current?.emit('watch_cab', { cabId });
  }, []);

  const unwatchCab = useCallback((cabId) => {
    socketRef.current?.emit('unwatch_cab', { cabId });
  }, []);

  const emitSOS = useCallback((payload) => {
    socketRef.current?.emit('sos_alert', payload);
  }, []);

  /**
   * Driver: notify backend (and through it, relevant employees) that the
   * driver has physically reached a stop.
   * payload: { tripId, stopId, cabId, driverId }
   * Backend should relay this as 'driver_at_stop' to employees at the stop.
   */
  const emitStopArrival = useCallback((payload) => {
    socketRef.current?.emit('driver_at_stop', payload);
  }, []);

  return (
    <SocketContext.Provider
      value={{ socket, connected, emitLocation, getActiveCabs, watchCab, unwatchCab, emitSOS, emitStopArrival }}
    >
      {children}
    </SocketContext.Provider>
  );
}

// ─── Consumer hook ───────────────────────────────────────────────────────────

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    throw new Error('useSocket must be called inside <SocketProvider>');
  }
  return ctx;
}
