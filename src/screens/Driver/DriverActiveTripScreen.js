import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  PanResponder,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../theme/ThemeProvider';
import { StatusBadge, Avatar, CrossPlatformMap } from '../../components';
import { SCREENS, TRIP_STATUS } from '../../constants';
import { fetchTripStops } from '../../redux/slices/tripSlice';
import { startTrip, endTrip } from '../../redux/slices/driverSlice';
import { useTrackingSocket } from '../../hooks/useTrackingSocket';
import { useDriverLocation } from '../../hooks/useDriverLocation';

const { width, height: SCREEN_HEIGHT } = Dimensions.get('window');
const MAP_HEIGHT = Math.round(SCREEN_HEIGHT * 0.42);
const SLIDE_TRACK_WIDTH = width - 64;
const DEFAULT_REGION = { latitude: 12.9716, longitude: 80.2209, latitudeDelta: 0.05, longitudeDelta: 0.05 };
const THUMB_SIZE = 52;

// ─── Slide-to-start component ──────────────────────────────────────────────────
const SlideToStart = ({ label, onComplete, color }) => {
  const [completed, setCompleted] = useState(false);
  const pan = React.useRef(new Animated.Value(0)).current;
  const maxSlide = SLIDE_TRACK_WIDTH - THUMB_SIZE - 8;

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        const clampedX = Math.max(0, Math.min(gestureState.dx, maxSlide));
        pan.setValue(clampedX);
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx >= maxSlide * 0.8) {
          Animated.spring(pan, { toValue: maxSlide, useNativeDriver: false }).start(() => {
            setCompleted(true);
            onComplete && onComplete();
          });
        } else {
          Animated.spring(pan, { toValue: 0, useNativeDriver: false }).start();
        }
      },
    })
  ).current;

  return (
    <View style={[styles.slideTrack, { backgroundColor: color + '22', borderColor: color + '44' }]}>
      <Text style={[styles.slideLabel, { color: color }]}>{completed ? '✓ Started!' : label}</Text>
      <Animated.View
        style={[styles.slideThumb, { backgroundColor: color, transform: [{ translateX: pan }] }]}
        {...panResponder.panHandlers}
      >
        <Ionicons name={completed ? 'checkmark' : 'chevron-forward'} size={24} color="#fff" />
      </Animated.View>
    </View>
  );
};

// ─── Stop item ─────────────────────────────────────────────────────────────────
const StopItem = ({ stop, index, isLast, colors, onConfirmAttendance }) => {
  const isCompleted = stop.status === 'completed';
  const isNext = stop.status === 'next_stop';
  const isPending = stop.status === 'pending';
  const isDestination = stop.isDestination;

  const dotColor = isCompleted ? '#16a34a' : isNext ? colors.primary : colors.border;

  return (
    <View style={styles.stopRow}>
      {/* Timeline */}
      <View style={styles.stopTimeline}>
        <View style={[styles.stopDot, { backgroundColor: dotColor, borderColor: dotColor }]} />
        {!isLast && (
          <View style={[styles.stopLine, { borderLeftColor: isCompleted ? '#16a34a' : colors.border }]} />
        )}
      </View>

      {/* Content */}
      <View style={[styles.stopContent, { backgroundColor: colors.surface }]}>
        {/* Header */}
        <View style={styles.stopHeader}>
          <View style={styles.stopHeaderLeft}>
            <Text style={[styles.stopTime, { color: colors.textSecondary }]}>{stop.time}</Text>
            <Text style={[styles.stopName, { color: colors.text }]}>{stop.name}</Text>
            {isDestination && (
              <Text style={[styles.stopSubLabel, { color: colors.textSecondary }]}>Destination</Text>
            )}
          </View>
          <StatusBadge status={isCompleted ? 'completed' : isNext ? 'in_progress' : 'scheduled'} />
        </View>

        {/* Employees at stop */}
        {stop.employees && stop.employees.length > 0 && (
          <View style={styles.employeeList}>
            {stop.employees.map((emp) => (
              <View key={emp.id} style={styles.empRow}>
                <Avatar name={emp.name} size={30} />
                <Text style={[styles.empName, { color: colors.text }]}>{emp.name}</Text>
                <View style={[styles.empStatus, { backgroundColor: emp.status === 'picked_up' ? '#e8f6ed' : emp.status === 'no_show' ? '#fce8e8' : '#f5f6f7' }]}>
                  <Text style={[styles.empStatusText, {
                    color: emp.status === 'picked_up' ? '#16a34a' : emp.status === 'no_show' ? '#dc2626' : '#5e5c66'
                  }]}>
                    {emp.status === 'picked_up' ? 'Picked Up' : emp.status === 'no_show' ? 'No Show' : 'Pending'}
                  </Text>
                </View>
              </View>
            ))}

            {isNext && !isDestination && (
              <TouchableOpacity
                style={[styles.attendanceBtn, { backgroundColor: colors.primary }]}
                onPress={() => onConfirmAttendance(stop)}
                activeOpacity={0.85}
              >
                <Text style={styles.attendanceBtnText}>Confirm Attendance</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    </View>
  );
};

// ─── Main Screen ───────────────────────────────────────────────────────────────
const DriverActiveTripScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const dispatch = useDispatch();
  const trip = route?.params?.trip ?? {};
  const tripId = trip?.id;

  // Redux state
  const tripStops = useSelector((state) => state.trip.tripStops);
  const stopsLoading = useSelector((state) => state.trip.isLoading);
  const driverLoading = useSelector((state) => state.driver.isLoading);
  const activeTrip = useSelector((state) => state.driver.activeTrip);
  const user = useSelector((state) => state.auth.user);

  // Socket.IO — emit GPS while trip is active
  const { emitLocation, connected: socketConnected } = useTrackingSocket();
  const tripMeta = {
    cabId: trip?.cabId ?? activeTrip?.cabId ?? null,
    driverId: user?.id ?? null,
    tripId: tripId ?? null,
  };
  const { location, isTracking, startTracking, stopTracking } = useDriverLocation(emitLocation, tripMeta);

  // Local stops state (synced from Redux, allows in-screen status updates)
  const [stops, setStops] = useState([]);
  const [tripStarted, setTripStarted] = useState(false);

  // Load stops from API when screen mounts
  useEffect(() => {
    if (tripId) {
      dispatch(fetchTripStops(tripId));
    }
  }, [tripId, dispatch]);

  // Sync local stops from Redux
  useEffect(() => {
    if (tripStops && tripStops.length > 0) {
      setStops(tripStops);
    }
  }, [tripStops]);

  const tripDetails = {
    tripNumber: trip.tripNumber ?? `Trip #${tripId ?? ''}`,
    vehicle: trip.vehicle ?? trip.cabNumber ?? '',
    vehicleType: trip.vehicleType ?? '',
    startTime: trip.pickup?.time ?? '',
    etaTime: trip.destination?.eta ?? '',
    pickups: stops.reduce((acc, s) => acc + (s.employees?.length ?? 0), 0),
    totalStops: stops.filter((s) => !s.isDestination).length,
  };

  const handleStartTrip = () => {
    if (tripId) {
      dispatch(startTrip(tripId));
    }
    setTripStarted(true);
    // Start emitting GPS location to backend via socket
    startTracking();
  };

  const handleConfirmAttendance = (stop) => {
    navigation.navigate(SCREENS.ATTENDANCE, { stop, tripId });
  };

  const handleEndTrip = () => {
    Alert.alert(
      'End Trip',
      'Are you sure you want to end this trip? This will log the trip data.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Trip',
          style: 'destructive',
          onPress: () => {
            stopTracking(); // Stop GPS emission
            if (tripId) {
              dispatch(endTrip({ tripId }));
            }
            navigation.navigate(SCREENS.TRIP_SUMMARY, { trip: tripDetails });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Active Trip</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>{tripDetails.tripNumber}</Text>
        </View>
        <View style={{ width: 50 }} />
      </View>

      {/* ── Live Map ── */}
      <View style={styles.mapContainer}>
        <CrossPlatformMap
          style={styles.map}
          region={
            location
              ? { latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 }
              : DEFAULT_REGION
          }
          driverLocation={location}
          markers={stops.filter(s => s.latitude && s.longitude).map((stop, idx) => ({
            id: stop.id,
            latitude: stop.latitude,
            longitude: stop.longitude,
            title: stop.name,
            label: String(idx + 1),
            color: stop.status === 'completed' ? '#16a34a' : stop.status === 'next_stop' ? '#643ee8' : '#9e9aa8',
          }))}
        />

        {/* SOS overlay on map */}
        <TouchableOpacity style={styles.sosOverlay} activeOpacity={0.8}>
          <Text style={styles.sosOverlayText}>SOS</Text>
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Trip Summary card */}
        <View style={[styles.summaryCard, { backgroundColor: colors.surface }]}>
          <View style={styles.summaryRow}>
            <View style={[styles.vehicleBadge, { backgroundColor: colors.primaryContainer }]}>
              <Ionicons name="car" size={16} color={colors.primary} />
            </View>
            <View style={styles.summaryVehicle}>
              <Text style={[styles.vehicleNo, { color: colors.text }]}>{tripDetails.vehicle}</Text>
              <Text style={[styles.vehicleType, { color: colors.textSecondary }]}>{tripDetails.vehicleType}</Text>
            </View>
            <StatusBadge status={tripStarted ? 'in_progress' : 'scheduled'} />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

          <View style={styles.summaryStats}>
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.text }]}>{tripDetails.pickups}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pickups</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.borderLight }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.text }]}>{tripDetails.totalStops}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Stops</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.borderLight }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.text }]}>{tripDetails.startTime}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Start</Text>
            </View>
            <View style={[styles.statDivider, { backgroundColor: colors.borderLight }]} />
            <View style={styles.statBox}>
              <Text style={[styles.statValue, { color: colors.text }]}>{tripDetails.etaTime}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>ETA</Text>
            </View>
          </View>
        </View>

        {/* Route Stops */}
        <Text style={[styles.routeTitle, { color: colors.text }]}>Route Stops</Text>
        <View style={styles.stopsContainer}>
          {stops.map((stop, idx) => (
            <StopItem
              key={stop.id}
              stop={stop}
              index={idx}
              isLast={idx === stops.length - 1}
              colors={colors}
              onConfirmAttendance={handleConfirmAttendance}
            />
          ))}
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom CTA */}
      <View style={[styles.bottomCTA, { backgroundColor: colors.surface, borderTopColor: colors.borderLight }]}>
        {!tripStarted ? (
          <SlideToStart
            label="Slide to Start Trip"
            onComplete={handleStartTrip}
            color={colors.primary}
          />
        ) : (
          <TouchableOpacity
            style={[styles.endTripBtn, { backgroundColor: '#dc2626' }]}
            onPress={handleEndTrip}
            activeOpacity={0.85}
          >
            <Text style={styles.endTripBtnText}>End Trip</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Map
  mapContainer: { height: MAP_HEIGHT, position: 'relative' },
  map: { flex: 1 },
  driverMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#643ee8',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  stopMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  stopMarkerText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  sosOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#dc2626',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  sosOverlayText: { color: '#fff', fontWeight: '700', fontSize: 13 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '700' },
  headerSub: { fontSize: 13, marginTop: 1 },

  scrollContent: { padding: 16 },

  // Summary card
  summaryCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  vehicleBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryVehicle: { flex: 1 },
  vehicleNo: { fontSize: 15, fontWeight: '700' },
  vehicleType: { fontSize: 12, marginTop: 1 },
  divider: { height: 1, marginVertical: 14 },
  summaryStats: { flexDirection: 'row', alignItems: 'center' },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 16, fontWeight: '700' },
  statLabel: { fontSize: 11, marginTop: 2 },
  statDivider: { width: 1, height: 32, marginHorizontal: 4 },

  // Route stops
  routeTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },
  stopsContainer: { gap: 0 },
  stopRow: { flexDirection: 'row', gap: 12 },
  stopTimeline: { alignItems: 'center', width: 20 },
  stopDot: { width: 12, height: 12, borderRadius: 6, borderWidth: 2, marginTop: 14 },
  stopLine: { flex: 1, borderLeftWidth: 2, borderStyle: 'dashed', marginTop: 4, minHeight: 30 },
  stopContent: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  stopHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  stopHeaderLeft: { flex: 1 },
  stopTime: { fontSize: 11, marginBottom: 2 },
  stopName: { fontSize: 15, fontWeight: '700' },
  stopSubLabel: { fontSize: 12, marginTop: 2 },
  employeeList: { marginTop: 12, gap: 8 },
  empRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  empName: { flex: 1, fontSize: 13, fontWeight: '500' },
  empStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  empStatusText: { fontSize: 11, fontWeight: '600' },
  attendanceBtn: {
    marginTop: 8,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attendanceBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // Slide
  bottomCTA: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  slideTrack: {
    height: THUMB_SIZE + 8,
    borderRadius: (THUMB_SIZE + 8) / 2,
    borderWidth: 1.5,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  slideLabel: { fontSize: 16, fontWeight: '500', position: 'absolute' },
  slideThumb: {
    position: 'absolute',
    left: 4,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  endTripBtn: {
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endTripBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default DriverActiveTripScreen;
