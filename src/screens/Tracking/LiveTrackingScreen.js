/**
 * Live Tracking Screen — Figma: Employee Handoff 09/02/2026 "Track Location"
 * Two states: map + minimal panel, and expanded ride-detail sheet.
 */
import React, { useState, useEffect } from 'react';
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
import { Avatar } from '../../components';
import { SCREENS } from '../../constants';
import { fetchCurrentRide, fetchTripStops } from '../../redux/slices/tripSlice';
import { useTrackingSocket } from '../../hooks/useTrackingSocket';

const { height: SCREEN_H } = Dimensions.get('window');

// Map stop status to display values
function stopDisplay(status) {
  switch (status) {
    case 'completed': return { label: 'Picked Up', color: '#16a34a' };
    case 'in_progress':
    case 'arriving': return { label: 'Arriving Soon', color: '#643ee8' };
    default: return { label: 'Pending', color: '#9ca3af' };
  }
}

// ─── Fake Map Render ──────────────────────────────────────────────────────────
const FakeMap = ({ colors }) => (
  <View style={[styles.mapView, { backgroundColor: '#d1d5db' }]}>
    {/* Base road grid */}
    {[20, 38, 55, 72].map((top) => (
      <View key={`h${top}`} style={[styles.mapRoadH, { top: `${top}%`, backgroundColor: '#e5e7eb' }]} />
    ))}
    {[25, 48, 68].map((left) => (
      <View key={`v${left}`} style={[styles.mapRoadV, { left: `${left}%`, backgroundColor: '#e5e7eb' }]} />
    ))}
    {/* Route line - solid green (completed) */}
    <View style={styles.routeSolidLine} />
    {/* Route line - dashed purple (remaining) */}
    {[0, 14, 28, 42, 56, 70].map((top) => (
      <View key={`d${top}`} style={[styles.routeDashSegment, { top: `${top + 30}%` }]} />
    ))}
    {/* Pickup dot */}
    <View style={[styles.mapPickupDot, { backgroundColor: '#16a34a', borderColor: '#fff' }]} />
    {/* Car marker */}
    <View style={[styles.mapCarMarker, { backgroundColor: colors.primaryContainer, borderColor: colors.primary }]}>
      <Ionicons name="car" size={18} color={colors.primary} />
    </View>
    {/* ETA badge on route */}
    <View style={[styles.routeEtaBadge, { backgroundColor: colors.primary }]}>
      <View style={[styles.routeEtaDot, { backgroundColor: '#fff' }]} />
      <Text style={styles.routeEtaText}>15 mins</Text>
    </View>
    {/* Lower ETA badge */}
    <View style={[styles.routeEtaBadge2, { backgroundColor: colors.primary }]}>
      <View style={[styles.routeEtaDot, { backgroundColor: '#fff' }]} />
      <Text style={styles.routeEtaText}>25 mins</Text>
    </View>
    {/* Dest dot */}
    <View style={[styles.mapDestDot, { backgroundColor: colors.primary, borderColor: '#fff' }]} />
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
  const { socket, connected, getActiveCabs } = useTrackingSocket();
  const [liveCabLocation, setLiveCabLocation] = useState(null);

  useEffect(() => {
    dispatch(fetchCurrentRide());
  }, [dispatch]);

  useEffect(() => {
    if (currentRide?.id) {
      dispatch(fetchTripStops(currentRide.id));
    }
  }, [currentRide?.id, dispatch]);

  // Listen for real-time cab location updates via socket
  useEffect(() => {
    if (!socket) return;

    const handleLocationUpdate = (data) => {
      // data: { cabId, latitude, longitude, speed, heading, timestamp }
      setLiveCabLocation(data);
    };

    socket.on('cab_location_update', handleLocationUpdate);

    // Request initial active cabs
    if (connected) {
      getActiveCabs();
    }

    return () => {
      socket.off('cab_location_update', handleLocationUpdate);
    };
  }, [socket, connected, getActiveCabs]);

  // Derive display data from Redux (fall back to empty strings)
  const ride = {
    tripNumber: currentRide?.tripNumber ?? '',
    vehicleNo: currentRide?.vehicleNo ?? '',
    vehicleType: currentRide?.vehicleType ?? '',
    driverName: currentRide?.driverName ?? '',
    nextStop: currentRide?.dropoff ?? '',
    eta: currentRide?.eta ?? '',
    currentLocation: '',
    currentAddress: '',
  };

  // Build ROUTE_STOPS from Redux tripStops
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

  // Find the "current" stop (first non-completed)
  const currentStopIndex = routeStops.findIndex((s) => s.status !== 'completed');

  return (
    <View style={styles.container}>
      {/* Header overlay on map */}
      <View style={[styles.header]}>
        <TouchableOpacity
          style={[styles.headerBtn, { backgroundColor: '#fff' }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color="#1a1a2e" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Tracking</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Map */}
      <FakeMap colors={colors} />

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
  mapRoadH: { position: 'absolute', left: 0, right: 0, height: 10 },
  mapRoadV: { position: 'absolute', top: 0, bottom: 0, width: 10 },
  routeSolidLine: {
    position: 'absolute',
    width: 4,
    left: '48%',
    top: '8%',
    height: '22%',
    backgroundColor: '#16a34a',
    borderRadius: 2,
  },
  routeDashSegment: {
    position: 'absolute',
    width: 4,
    left: '48%',
    height: 12,
    backgroundColor: '#643ee8',
    borderRadius: 2,
    opacity: 0.8,
  },
  mapPickupDot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    top: '6%',
    left: '46.5%',
  },
  mapCarMarker: {
    position: 'absolute',
    width: 44,
    height: 44,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    top: '25%',
    left: '43%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  routeEtaBadge: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    top: '40%',
    left: '53%',
    gap: 4,
  },
  routeEtaBadge2: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    top: '62%',
    left: '53%',
    gap: 4,
  },
  routeEtaDot: { width: 6, height: 6, borderRadius: 3 },
  routeEtaText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  mapDestDot: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 3,
    top: '75%',
    left: '46.5%',
  },

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
  currentLocRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  currentLocLabel: { fontSize: 12 },
  currentLocName: { fontSize: 15, fontWeight: '700', marginBottom: 4 },
  currentLocAddress: { fontSize: 12, lineHeight: 18, marginBottom: 10 },
  trackBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 44, borderRadius: 12, gap: 6 },
  trackBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});

export default LiveTrackingScreen;
