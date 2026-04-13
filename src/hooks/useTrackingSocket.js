/**
 * useTrackingSocket — thin wrapper around SocketContext.
 *
 * Previously this hook called io() directly on every invocation, creating
 * multiple independent socket connections (AppNavigator, DriverNavigator,
 * HomeScreen, LiveTrackingScreen each got their own socket).  The socket
 * stored in socketRef.current was also not reactive — React never re-rendered
 * consumers when it was assigned inside useEffect, so LiveTrackingScreen always
 * saw socket === null and its listener useEffect exited immediately.
 *
 * Now: one socket lives in SocketContext (SocketProvider in App.js).
 * This hook just exposes that shared, reactive socket to any screen.
 */
export { useSocket as useTrackingSocket } from '../context/SocketContext';
