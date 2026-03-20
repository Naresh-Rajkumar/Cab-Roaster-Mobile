/**
 * Live Tracking Screen — Employee Handoff
 * Real MapView with Socket.IO live cab tracking.
 * Two states: map + minimal panel, and expanded ride-detail sheet.
 * Camera follows cab with Google Maps-style 3D perspective.
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
import { useSelector } from 'react-redux';
import { useTheme } from '../../theme/ThemeProvider';
import { Avatar } from '../../components';
import { SCREENS } from '../../constants';
import CabMapView from '../../components/CabMapView';
import { useTrackingSocket } from '../../hooks/useTrackingSocket';
import { fetchRouteCoordinates } from '../../services/routeService';

const { height: SCREEN_H } = Dimensions.get('window');

// Fallback data when no real ride is loaded
const DEFAULT_RIDE = {
  tripNumber: 'Trip #482',
  vehicleNo: 'TN 14 CV 3755',
  vehicleType: 'Ertiga',
  status: 'active',
  driverName: 'Rogelio Adams',
  nextStop: 'Sholinganallur',
  eta: '15 mins',
  currentLocation: 'Chennai One IT SEZ',
  currentAddress: '200 Feet Radial Road, MCN Nagar Extension, Pallavaram, Thoraipakkam',
};

const ROUTE_STOPS = [
  { id: 's1', time: '9:30 AM', name: 'Madipakkam', status: 'picked_up', statusLabel: 'Picked Up', statusColor: '#16a34a' },
  { id: 's2', time: '9:45 AM', name: 'BSR Mall', status: 'arriving', statusLabel: 'Arriving Soon', statusColor: '#643ee8' },
  { id: 's3', time: '10:15 AM', name: 'Aavin Bus Stop', status: 'pending', statusLabel: 'Pending', statusColor: '#9ca3af' },
  { id: 's4', time: '10:30 AM', name: 'vThink Office', status: 'pending', statusLabel: 'Pending', statusColor: '#9ca3af' },
];

// Stop coordinates for map markers
const STOP_COORDS = [
  { latitude: 12.9637, longitude: 80.1991 }, // Madipakkam
  { latitude: 12.9600, longitude: 80.2030 }, // BSR Mall
  { latitude: 12.9823, longitude: 80.2185 }, // Aavin Bus Stop
  { latitude: 12.9010, longitude: 80.2279 }, // vThink Office
];

const LiveTrackingScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [showDetails, setShowDetails] = useState(false);
  const [followCab, setFollowCab] = useState(true);
  const [completedRoute, setCompletedRoute] = useState([]);
  const [remainingRoute, setRemainingRoute] = useState([]);

  const token = useSelector((state) => state.auth.token);
  const currentRide = useSelector((state) => state.trip.currentRide);
  const ride = currentRide || DEFAULT_RIDE;

  // Connect to Socket.IO for live tracking
  const { connected, cabPosition, trail, speed, heading, watchCab } = useTrackingSocket(token);

  // Watch the specific cab for this ride
  useEffect(() => {
    if (connected && ride.vehicleNo) {
      watchCab(ride.vehicleNo);
    }
  }, [connected, ride.vehicleNo, watchCab]);

  // Fetch road-following route polylines from OSRM on mount
  useEffect(() => {
    fetchRouteCoordinates([STOP_COORDS[0], STOP_COORDS[1]])
      .then(setCompletedRoute);
    fetchRouteCoordinates([STOP_COORDS[1], STOP_COORDS[2], STOP_COORDS[3]])
      .then(setRemainingRoute);
  }, []);

  // Build map markers from route stops
  const markers = ROUTE_STOPS.map((stop, idx) => ({
    id: stop.id,
    coordinate: STOP_COORDS[idx],
    title: stop.name,
    description: stop.statusLabel,
    type: idx === ROUTE_STOPS.length - 1 ? 'drop' : (stop.status === 'picked_up' ? 'pickup' : 'stop'),
  }));

  // Cab position from socket or fallback
  const cabPos = cabPosition || {
    latitude: 12.9550,
    longitude: 80.2050,
  };

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
        {connected ? (
          <View style={styles.connectedDot} />
        ) : (
          <View style={styles.disconnectedDot} />
        )}
        {/* Re-center / follow toggle button */}
        <TouchableOpacity
          style={[
            styles.headerBtn,
            { backgroundColor: followCab ? '#643ee8' : '#fff' },
          ]}
          onPress={() => setFollowCab((prev) => !prev)}
        >
          <Ionicons
            name="navigate"
            size={18}
            color={followCab ? '#fff' : '#1a1a2e'}
          />
        </TouchableOpacity>
      </View>

      {/* Offline banner */}
      {!connected && (
        <View style={styles.offlineBanner}>
          <Ionicons name="cloud-offline-outline" size={14} color="#fff" />
          <Text style={styles.offlineBannerText}>Connecting to live tracking...</Text>
        </View>
      )}

      {/* Real Map */}
      <CabMapView
        markers={markers}
        completedPolylineCoords={completedRoute}
        polylineCoords={remainingRoute}
        cabPosition={cabPos}
        cabHeading={heading}
        cabSpeed={speed}
        trailCoords={trail}
        followCab={followCab}
        showSpeedBadge={connected && speed > 0}
        initialRegion={{
          latitude: 12.9400,
          longitude: 80.2100,
          latitudeDelta: 0.08,
          longitudeDelta: 0.08,
        }}
        style={styles.mapView}
        fitToMarkers={!followCab}
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
            {ROUTE_STOPS.map((stop, idx) => (
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
                      {(stop.status === 'picked_up' || stop.status === 'arriving') && (
                        <View style={[styles.stopCircleInner, { backgroundColor: stop.statusColor }]} />
                      )}
                    </View>
                    {idx < ROUTE_STOPS.length - 1 && (
                      <View style={[styles.stopLine, { borderColor: colors.border }]} />
                    )}
                  </View>
                  <View style={styles.stopContent}>
                    <View style={styles.stopContentTop}>
                      <Text style={[styles.stopTime, { color: colors.textSecondary }]}>{stop.time}</Text>
                      <Text style={[styles.stopStatusText, { color: stop.statusColor }]}>{stop.statusLabel}</Text>
                    </View>
                    <Text style={[styles.stopName, { color: colors.text }]}>{stop.name}</Text>

                    {/* Current location card (after BSR Mall) */}
                    {stop.id === 's2' && (
                      <View style={[styles.currentLocCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
                        <View style={styles.currentLocRow}>
                          <Ionicons name="location-outline" size={16} color={colors.textSecondary} />
                          <Text style={[styles.currentLocLabel, { color: colors.textSecondary }]}>Current Location</Text>
                        </View>
                        <Text style={[styles.currentLocName, { color: colors.text }]}>{ride.currentLocation}</Text>
                        <Text style={[styles.currentLocAddress, { color: colors.textSecondary }]}>{ride.currentAddress}</Text>
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
  connectedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E',
    marginRight: 8,
  },
  disconnectedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    marginRight: 8,
  },

  // Offline banner
  offlineBanner: {
    position: 'absolute',
    top: 102,
    left: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  offlineBannerText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },

  // Map
  mapView: {
    flex: 1,
    borderRadius: 0,
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
