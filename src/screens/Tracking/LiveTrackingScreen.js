/**
 * Live Tracking Screen — Figma: Employee Handoff 09/02/2026 "Track Location"
 * Two states: map + minimal panel, and expanded ride-detail sheet.
 *
 * Real-time data flow:
 *   1. Socket connects (via useTrackingSocket)
 *   2. getActiveCabs() → active_cabs event → find our cab → watchCab(cabId)
 *   3. cab_location_update / cab_detail → update marker + trail on MapView
 *   4. cab_offline → show OFFLINE status badge
 *   5. On unmount → unwatchCab(cabId)
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../theme/ThemeProvider';
import { Avatar, CrossPlatformMap } from '../../components';
import { SCREENS } from '../../constants';
import { fetchCurrentRide, fetchTripStops } from '../../redux/slices/tripSlice';
import { useTrackingSocket } from '../../hooks/useTrackingSocket';

const { height: SCREEN_H } = Dimensions.get('window');

const DEFAULT_REGION = {
  latitude: 12.9716,
  longitude: 80.2209,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

// Map stop status to display values
function stopDisplay(status) {
  switch (status) {
    case 'completed': return { label: 'Picked Up', color: '#16a34a' };
    case 'in_progress':
    case 'arriving': return { label: 'Arriving Soon', color: '#643ee8' };
    default: return { label: 'Pending', color: '#9ca3af' };
  }
}

// ─── Live Map Component ───────────────────────────────────────────────────────
// mapRef is forwarded to CrossPlatformMap → NativeMap → MapView so that
// animateMapTo() can call mapRef.current.animateToRegion() as GPS updates arrive.
const LiveMap = ({ cabLocation, trail, mapStatus, colors, mapRef }) => (
  <View style={styles.mapView}>
    <CrossPlatformMap
      ref={mapRef}
      style={StyleSheet.absoluteFillObject}
      region={cabLocation
        ? { latitude: cabLocation.latitude, longitude: cabLocation.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 }
        : DEFAULT_REGION
      }
      driverLocation={cabLocation}
      polyline={trail}
      markers={[]}
    />

    {/* Map status badge */}
    <View style={styles.statusBadgeContainer}>
      <View style={[
        styles.statusBadge,
        {
          backgroundColor:
            mapStatus === 'live' ? '#16a34a' :
            mapStatus === 'offline' ? '#dc2626' :
            '#6b7280',
        },
      ]}>
        <View style={[styles.statusDot, mapStatus === 'live' && styles.statusDotPulse]} />
        <Text style={styles.statusText}>
          {mapStatus === 'live' ? 'LIVE' : mapStatus === 'offline' ? 'OFFLINE' : 'CONNECTING'}
        </Text>
      </View>
    </View>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const LiveTrackingScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const dispatch = useDispatch();
  const [showDetails, setShowDetails] = useState(false);

  const currentRide = useSelector((state) => state.trip.currentRide);
  const tripStops = useSelector((state) => state.trip.tripStops);

  // Map state
  const mapRef = useRef(null);
  const [cabLocation, setCabLocation] = useState(null);
  const [trail, setTrail] = useState([]);
  const [mapStatus, setMapStatus] = useState('connecting'); // connecting | live | offline
  const watchedCabIdRef = useRef(null); // numeric cabId for watch_cab

  const { socket, connected, getActiveCabs, watchCab, unwatchCab } = useTrackingSocket();

  useEffect(() => {
    dispatch(fetchCurrentRide());
  }, [dispatch]);

  useEffect(() => {
    if (currentRide?.id) {
      dispatch(fetchTripStops(currentRide.id));
    }
  }, [currentRide?.id, dispatch]);

  // ─── Socket event handlers ─────────────────────────────────────────────────

  const handleActiveCabs = useCallback((cabs) => {
    // Need at least one identifier to match the cab
    if (!currentRide?.vehicleNo && !currentRide?.cabId) return;
    const list = Array.isArray(cabs) ? cabs : [];

    // Find our cab by vehicleNo (cabReg) or cabId
    const match = list.find(
      (c) => c.cabReg === currentRide.vehicleNo ||
             String(c.cabId) === String(currentRide.cabId)
    );

    if (match?.location?.latitude) {
      const coord = { latitude: match.location.latitude, longitude: match.location.longitude };
      setCabLocation({ ...coord, speed: match.location.speed || 0 });
      setMapStatus('live');
      animateMapTo(coord);

      // Subscribe to this cab's detailed trail updates
      if (!watchedCabIdRef.current && match.cabId) {
        watchedCabIdRef.current = match.cabId;
        watchCab(match.cabId);
      }
    }
  }, [currentRide?.vehicleNo, currentRide?.cabId, watchCab]);

  const handleCabLocationUpdate = useCallback((data) => {
    if (!currentRide?.vehicleNo && !currentRide?.cabId) return;

    const isOurCab =
      String(data.cabId) === String(currentRide?.cabId) ||
      data.cabReg === currentRide?.vehicleNo;

    if (!isOurCab) return;

    const coord = { latitude: data.latitude, longitude: data.longitude };
    setCabLocation({ ...coord, speed: data.speed || 0 });
    setTrail((prev) => {
      const updated = [...prev, coord];
      return updated.length > 200 ? updated.slice(-200) : updated;
    });
    setMapStatus('live');
    animateMapTo(coord);

    // If we haven't watched yet (e.g. cab came online after screen loaded), watch now
    if (!watchedCabIdRef.current && data.cabId) {
      watchedCabIdRef.current = data.cabId;
      watchCab(data.cabId);
    }
  }, [currentRide?.cabId, currentRide?.vehicleNo, watchCab]);

  const handleCabDetail = useCallback((data) => {
    if (!data.location?.latitude) return;

    const isOurCab =
      String(data.cabId) === String(currentRide?.cabId) ||
      data.cabReg === currentRide?.vehicleNo;

    if (!isOurCab) return;

    const coord = { latitude: data.location.latitude, longitude: data.location.longitude };
    setCabLocation({ ...coord, speed: data.location.speed || 0 });
    setMapStatus('live');
    animateMapTo(coord);

    if (data.history?.length) {
      setTrail(
        data.history
          .filter((p) => p.latitude && p.longitude)
          .map((p) => ({ latitude: p.latitude, longitude: p.longitude }))
      );
    }
  }, [currentRide?.cabId, currentRide?.vehicleNo]);

  const handleCabOffline = useCallback((data) => {
    if (String(data.cabId) === String(watchedCabIdRef.current)) {
      setMapStatus('offline');
    }
  }, []);

  // Animate map camera to cab position
  const animateMapTo = useCallback((coord) => {
    mapRef.current?.animateToRegion(
      {
        latitude: coord.latitude,
        longitude: coord.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      },
      600
    );
  }, []);

  // ─── driver_at_stop handler — employee sees CabArrivedScreen ─────────────────
  const handleDriverAtStop = useCallback((data) => {
    // Only react if this event is for our current trip
    const ourTripId = String(currentRide?.id ?? currentRide?.tripId ?? '');
    if (!ourTripId || String(data.tripId) !== ourTripId) return;

    navigation.navigate(SCREENS.CAB_ARRIVED, {
      driverName: currentRide?.driverName ?? 'Driver',
      vehicleNo: currentRide?.vehicleNo ?? '',
      vehicleType: currentRide?.vehicleType ?? '',
      tripId: data.tripId,
      stopId: data.stopId,
      cabLocation: cabLocation, // last known live position
    });
  }, [currentRide, cabLocation, navigation]);

  // ─── Attach / detach socket listeners ────────────────────────────────────────
  useEffect(() => {
    if (!socket) return;

    socket.on('active_cabs', handleActiveCabs);
    socket.on('cab_location_update', handleCabLocationUpdate);
    socket.on('cab_detail', handleCabDetail);
    socket.on('cab_offline', handleCabOffline);
    socket.on('driver_at_stop', handleDriverAtStop);

    if (connected) {
      getActiveCabs();
    }

    return () => {
      socket.off('active_cabs', handleActiveCabs);
      socket.off('cab_location_update', handleCabLocationUpdate);
      socket.off('cab_detail', handleCabDetail);
      socket.off('cab_offline', handleCabOffline);
      socket.off('driver_at_stop', handleDriverAtStop);
    };
  }, [socket, connected, handleActiveCabs, handleCabLocationUpdate, handleCabDetail, handleCabOffline, handleDriverAtStop, getActiveCabs]);

  // Re-request active cabs when connection is established
  useEffect(() => {
    if (connected && socket) {
      getActiveCabs();
    }
  }, [connected, socket, getActiveCabs]);

  // Re-request active cabs when currentRide first loads — the socket may have
  // already connected and fired active_cabs before ride data was available,
  // causing the cab-matching handler to return early (race condition)
  useEffect(() => {
    if (connected && socket && currentRide?.id) {
      getActiveCabs();
    }
  }, [currentRide?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup: unwatch cab on unmount
  useEffect(() => {
    return () => {
      if (watchedCabIdRef.current) {
        unwatchCab(watchedCabIdRef.current);
        watchedCabIdRef.current = null;
      }
    };
  }, [unwatchCab]);

  // ─── Derive display data from Redux ──────────────────────────────────────────
  const ride = {
    tripNumber: currentRide?.tripNumber ?? '',
    vehicleNo: currentRide?.vehicleNo ?? '',
    vehicleType: currentRide?.vehicleType ?? '',
    driverName: currentRide?.driverName ?? '',
    nextStop: currentRide?.dropoff ?? '',
    eta: currentRide?.eta ?? '',
  };

  const routeStops = tripStops.map((stop) => {
    const display = stopDisplay(stop.status);
    return {
      id: stop.id,
      time: stop.time ?? '',
      name: stop.name ?? '',
      status: stop.status,
      statusLabel: display.label,
      statusColor: display.color,
    };
  });

  const currentStopIndex = routeStops.findIndex((s) => s.status !== 'completed');

  return (
    <View style={styles.container}>
      {/* Header overlay on map */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.headerBtn, { backgroundColor: '#fff' }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color="#1a1a2e" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Tracking</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Real-time Map */}
      <LiveMap
        cabLocation={cabLocation}
        trail={trail}
        mapStatus={mapStatus}
        colors={colors}
        mapRef={mapRef}
      />

      {/* Bottom Panel */}
      {!showDetails ? (
        <View style={[styles.bottomPanel, { backgroundColor: colors.surface }]}>
          <View style={[styles.handleBar, { backgroundColor: colors.border }]} />

          {/* Next Stop */}
          <TouchableOpacity
            style={styles.nextStopRow}
            onPress={() => setShowDetails(true)}
            activeOpacity={0.9}
          >
            <View style={[styles.nextStopIcon, { backgroundColor: colors.primaryContainer }]}>
              <Ionicons name="person-outline" size={18} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.nextStopLabel, { color: colors.textSecondary }]}>Next Stop</Text>
              <Text style={[styles.nextStopName, { color: colors.text }]}>{ride.nextStop}</Text>
            </View>
            <View style={[styles.etaBadge, { backgroundColor: colors.primaryContainer }]}>
              <View style={[styles.etaDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.etaText, { color: colors.primary }]}>{ride.eta}</Text>
            </View>
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          {/* Driver row */}
          <View style={styles.driverRow}>
            <Avatar name={ride.driverName} size={44} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.driverName, { color: colors.text }]}>{ride.driverName}</Text>
              <Text style={[styles.vehicleText, { color: colors.textSecondary }]}>
                {ride.vehicleNo}{' '}
                <Text style={{ color: colors.textTertiary }}>•</Text>{' '}
                {ride.vehicleType}
              </Text>
            </View>
            <TouchableOpacity style={[styles.callBtn, { borderColor: colors.borderLight }]}>
              <Ionicons name="call-outline" size={18} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        /* Ride Details Sheet */
        <View style={[styles.detailsSheet, { backgroundColor: colors.surface }]}>
          <View style={[styles.handleBar, { backgroundColor: colors.border }]} />

          <View style={styles.detailsHeader}>
            <Text style={[styles.detailsTitle, { color: colors.text }]}>Ride Details</Text>
            <TouchableOpacity onPress={() => setShowDetails(false)}>
              <Ionicons name="close" size={22} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Trip meta */}
          <View style={styles.tripMeta}>
            <View>
              <Text style={[styles.tripNumber, { color: colors.text }]}>{ride.tripNumber}</Text>
              <Text style={[styles.vehicleText, { color: colors.textSecondary }]}>
                {ride.vehicleNo}{' '}
                <Text style={{ color: colors.textTertiary }}>•</Text>{' '}
                {ride.vehicleType}
              </Text>
            </View>
            <View style={[styles.activeBadge, { backgroundColor: '#dcfce7' }]}>
              <View style={[styles.activeDot, { backgroundColor: '#16a34a' }]} />
              <Text style={[styles.activeText, { color: '#16a34a' }]}>Active</Text>
            </View>
          </View>

          <Text style={[styles.routeStopsTitle, { color: colors.text }]}>Route Stops</Text>

          <ScrollView showsVerticalScrollIndicator={false}>
            {routeStops.map((stop, idx) => (
              <View key={stop.id}>
                <View style={styles.stopRow}>
                  <View style={styles.stopTimelineCol}>
                    <View style={[
                      styles.stopCircle,
                      {
                        borderColor: stop.status === 'pending' ? colors.border : stop.statusColor,
                        backgroundColor: stop.status === 'pending' ? 'transparent' : stop.statusColor + '20',
                      },
                    ]}>
                      {(stop.status === 'completed' || stop.status === 'arriving' || stop.status === 'in_progress') && (
                        <View style={[styles.stopCircleInner, { backgroundColor: stop.statusColor }]} />
                      )}
                    </View>
                    {idx < routeStops.length - 1 && (
                      <View style={[styles.stopLine, { borderColor: colors.border }]} />
                    )}
                  </View>
                  <View style={styles.stopContent}>
                    <View style={styles.stopContentTop}>
                      <Text style={[styles.stopTime, { color: colors.textSecondary }]}>{stop.time}</Text>
                      <Text style={[styles.stopStatusText, { color: stop.statusColor }]}>{stop.statusLabel}</Text>
                    </View>
                    <Text style={[styles.stopName, { color: colors.text }]}>{stop.name}</Text>

                    {/* Current location card (shown at current/next stop) */}
                    {idx === currentStopIndex && (
                      <View style={[styles.currentLocCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <TouchableOpacity
                          style={[styles.trackBtn, { backgroundColor: colors.primary }]}
                          onPress={() => navigation.navigate(SCREENS.CAB_ARRIVED)}
                          activeOpacity={0.85}
                        >
                          <Ionicons name="navigate-outline" size={16} color="#fff" />
                          <Text style={styles.trackBtnText}>Track Ride</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}

            {/* Driver footer */}
            <View style={[styles.divider, { backgroundColor: colors.borderLight, marginVertical: 12 }]} />
            <View style={styles.driverRow}>
              <Avatar name={ride.driverName} size={44} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.driverName, { color: colors.text }]}>{ride.driverName}</Text>
                <Text style={[styles.vehicleText, { color: colors.textSecondary }]}>
                  {ride.vehicleNo}{' '}
                  <Text style={{ color: colors.textTertiary }}>•</Text>{' '}
                  {ride.vehicleType}
                </Text>
              </View>
              <TouchableOpacity style={[styles.callBtn, { borderColor: colors.borderLight }]}>
                <Ionicons name="call-outline" size={18} color={colors.text} />
              </TouchableOpacity>
            </View>
            <View style={{ height: 32 }} />
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#d1d5db' },

  // Header
  header: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  headerBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: '#1a1a2e' },

  // Map
  mapView: {
    flex: 1,
    position: 'relative',
  },
  cabMarker: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },

  // Status badge
  statusBadgeContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 5,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    gap: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#fff',
  },
  statusDotPulse: {
    opacity: 0.9,
  },
  statusText: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },

  // Bottom panel
  bottomPanel: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: 12,
  },
  nextStopRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingBottom: 12 },
  nextStopIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  nextStopLabel: { fontSize: 12 },
  nextStopName: { fontSize: 16, fontWeight: '700' },
  etaBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, gap: 4 },
  etaDot: { width: 6, height: 6, borderRadius: 3 },
  etaText: { fontSize: 12, fontWeight: '700' },
  divider: { height: 1 },
  driverRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 12 },
  driverName: { fontSize: 15, fontWeight: '600' },
  vehicleText: { fontSize: 13, marginTop: 1 },
  callBtn: { width: 44, height: 44, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },

  // Details sheet
  detailsSheet: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    maxHeight: SCREEN_H * 0.72,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  detailsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
  },
  detailsTitle: { fontSize: 18, fontWeight: '700' },
  tripMeta: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 },
  tripNumber: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  activeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, gap: 4 },
  activeDot: { width: 6, height: 6, borderRadius: 3 },
  activeText: { fontSize: 12, fontWeight: '600' },
  routeStopsTitle: { fontSize: 15, fontWeight: '700', marginBottom: 12 },

  // Stop items
  stopRow: { flexDirection: 'row', gap: 12 },
  stopTimelineCol: { alignItems: 'center', width: 20 },
  stopCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  stopCircleInner: { width: 10, height: 10, borderRadius: 5 },
  stopLine: { flex: 1, borderLeftWidth: 1.5, borderStyle: 'dashed', minHeight: 30 },
  stopContent: { flex: 1, paddingBottom: 8 },
  stopContentTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  stopTime: { fontSize: 12, marginBottom: 2 },
  stopStatusText: { fontSize: 12, fontWeight: '600' },
  stopName: { fontSize: 15, fontWeight: '600', marginBottom: 4 },

  // Current location card
  currentLocCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginTop: 8,
    marginBottom: 4,
  },
  trackBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 44, borderRadius: 12, gap: 6 },
  trackBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});

export default LiveTrackingScreen;
