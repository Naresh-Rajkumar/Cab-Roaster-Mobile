/**
 * DriverActiveTripScreen — Figma Driver Handoff
 *
 * Layout:
 *   - Fullscreen map (background)
 *   - Floating header (trip number + SOS)
 *   - Floating bottom sheet:
 *       collapsed  → next stop preview + employee avatar row
 *       expanded   → scrollable stop list with employees + call buttons
 *   - Slide-to-start or End-Trip button anchored at screen bottom
 *
 * Map:
 *   - Dashed purple route from driver's GPS → remaining stops (OSRM, road-following)
 *   - ETA badges next to each stop marker ("15 mins")
 *   - Completed stops turn green
 *
 * Stop auto-attendance:
 *   - useDriverLocation triggers handleStopArrival at 150m proximity
 *   - Emits driver_at_stop over socket → employees see CabArrivedScreen
 *   - Navigates driver to AttendanceScreen
 *   - On focus-return, stops are re-fetched so completed ones turn green immediately
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../theme/ThemeProvider';
import { Avatar, CrossPlatformMap } from '../../components';
import { SCREENS } from '../../constants';
import { fetchTripStops } from '../../redux/slices/tripSlice';
import { startTrip, endTrip } from '../../redux/slices/driverSlice';
import { useTrackingSocket } from '../../hooks/useTrackingSocket';
import { useDriverLocation } from '../../hooks/useDriverLocation';

const { width, height: SCREEN_HEIGHT } = Dimensions.get('window');
const THUMB_SIZE = 52;
const SLIDE_TRACK_WIDTH = width - 64;
const SHEET_COLLAPSED_H = 130;
const SHEET_EXPANDED_H = Math.round(SCREEN_HEIGHT * 0.62);
const DEFAULT_REGION = { latitude: 12.9716, longitude: 80.2209, latitudeDelta: 0.05, longitudeDelta: 0.05 };

// ─── Slide-to-start ────────────────────────────────────────────────────────────
const SlideToStart = ({ label, onComplete, color }) => {
  const [completed, setCompleted] = useState(false);
  const pan = React.useRef(new Animated.Value(0)).current;
  const maxSlide = SLIDE_TRACK_WIDTH - THUMB_SIZE - 8;

  const panResponder = React.useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, g) => {
        pan.setValue(Math.max(0, Math.min(g.dx, maxSlide)));
      },
      onPanResponderRelease: (_, g) => {
        if (g.dx >= maxSlide * 0.8) {
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
      <Text style={[styles.slideLabel, { color }]}>{completed ? '✓ Started!' : label}</Text>
      <Animated.View
        style={[styles.slideThumb, { backgroundColor: color, transform: [{ translateX: pan }] }]}
        {...panResponder.panHandlers}
      >
        <Ionicons name={completed ? 'checkmark' : 'chevron-forward'} size={24} color="#fff" />
      </Animated.View>
    </View>
  );
};

// ─── Stop row (inside expanded sheet) ──────────────────────────────────────────
const StopRow = ({ stop, isLast, colors, onCallEmployee, onConfirmAttendance }) => {
  const isCompleted = stop.status === 'completed' || stop.status === 'arrived';
  const isNext = stop.status === 'next_stop';
  const isDestination = stop.isDestination;

  const circleColor = isCompleted ? '#16a34a' : isNext ? colors.primary : '#d1d5db';
  const statusLabel = isCompleted ? 'Completed' : isNext ? 'Next Stop' : isDestination ? 'Destination' : 'Pending';
  const statusColor = isCompleted ? '#16a34a' : isNext ? colors.primary : '#9ca3af';

  // Overlapping small avatars for this stop
  const avatarEmployees = (stop.employees ?? []).slice(0, 3);

  return (
    <View style={styles.stopRow}>
      {/* ── Timeline column ───────────────────────────── */}
      <View style={styles.timeline}>
        <View style={[
          styles.timelineCircle,
          {
            backgroundColor: isCompleted ? '#16a34a' : 'transparent',
            borderColor: circleColor,
          },
        ]}>
          {isCompleted && <Ionicons name="checkmark" size={10} color="#fff" />}
        </View>
        {!isLast && (
          <View style={[
            styles.timelineLine,
            { borderColor: isCompleted ? '#16a34a' : '#e5e7eb' },
          ]} />
        )}
      </View>

      {/* ── Content column ───────────────────────────── */}
      <View style={[styles.stopContent, isLast && { marginBottom: 0 }]}>
        {/* Header row */}
        <View style={styles.stopHeader}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.stopTime, { color: colors.textSecondary }]}>{stop.time}</Text>
            <Text style={[styles.stopName, { color: colors.text }]}>{stop.name}</Text>
          </View>
          {/* Stacked avatars */}
          {avatarEmployees.length > 0 && (
            <View style={styles.avatarStack}>
              {avatarEmployees.map((emp, i) => (
                <View key={emp.id} style={[styles.avatarWrap, { marginLeft: i > 0 ? -8 : 0, zIndex: 3 - i }]}>
                  <Avatar name={emp.name} size={26} />
                </View>
              ))}
            </View>
          )}
          <Text style={[styles.statusLabel, { color: statusColor }]}>{statusLabel}</Text>
        </View>

        {/* Employee list — shown for next stop so driver can call them */}
        {(isNext || isCompleted) && stop.employees && stop.employees.length > 0 && (
          <View style={styles.empList}>
            {stop.employees.map((emp) => (
              <View key={emp.id} style={[styles.empRow, { borderBottomColor: colors.borderLight }]}>
                <Avatar name={emp.name} size={34} />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.empName, { color: colors.text }]}>{emp.name}</Text>
                  {isCompleted && (
                    <Text style={[styles.empStatusText, {
                      color: emp.status === 'picked_up' ? '#16a34a' : emp.status === 'no_show' ? '#dc2626' : '#9ca3af',
                    }]}>
                      {emp.status === 'picked_up' ? 'Picked Up' : emp.status === 'no_show' ? 'No Show' : 'Pending'}
                    </Text>
                  )}
                </View>
                {isNext && emp.phone ? (
                  <TouchableOpacity
                    style={[styles.callBtn, { borderColor: colors.borderLight }]}
                    onPress={() => onCallEmployee(emp.phone)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="call-outline" size={16} color={colors.primary} />
                  </TouchableOpacity>
                ) : null}
              </View>
            ))}

            {/* Manual attendance button for next stop */}
            {isNext && !isDestination && (
              <TouchableOpacity
                style={[styles.confirmAttBtn, { backgroundColor: colors.primary }]}
                onPress={() => onConfirmAttendance(stop)}
                activeOpacity={0.85}
              >
                <Ionicons name="checkbox-outline" size={16} color="#fff" style={{ marginRight: 6 }} />
                <Text style={styles.confirmAttBtnText}>Confirm Attendance</Text>
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

  // Redux
  const tripStops = useSelector((state) => state.trip.tripStops);
  const activeTrip = useSelector((state) => state.driver.activeTrip);
  const user = useSelector((state) => state.auth.user);

  // Local state
  const [stops, setStops] = useState([]);
  const [tripStarted, setTripStarted] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [roadPolyline, setRoadPolyline] = useState([]);
  const [stopETAs, setStopETAs] = useState({}); // { stopId: 'X mins' }

  // Sheet animation
  const sheetAnim = useRef(new Animated.Value(SHEET_COLLAPSED_H)).current;

  const openSheet = () => {
    setShowDetails(true);
    Animated.spring(sheetAnim, { toValue: SHEET_EXPANDED_H, useNativeDriver: false, friction: 8 }).start();
  };

  const closeSheet = () => {
    Animated.spring(sheetAnim, { toValue: SHEET_COLLAPSED_H, useNativeDriver: false, friction: 8 }).start(() => {
      setShowDetails(false);
    });
  };

  // Socket + GPS
  const { emitLocation, emitStopArrival } = useTrackingSocket();
  const tripMeta = {
    cabId: trip?.cabId ?? activeTrip?.cabId ?? null,
    driverId: user?.id ?? null,
    tripId: tripId ?? null,
  };

  // OSRM throttle ref
  const lastRouteFetchRef = useRef(0);

  // Prevent duplicate attendance screens for the same stop
  const openedAttendanceForRef = useRef(new Set());

  // ── Stop arrival handler ─────────────────────────────────────────────────────
  const handleStopArrival = useCallback((stop) => {
    if (!stop?.id) return;
    if (openedAttendanceForRef.current.has(String(stop.id))) return;
    openedAttendanceForRef.current.add(String(stop.id));

    emitStopArrival({
      tripId: tripId ?? null,
      stopId: stop.id,
      cabId: tripMeta.cabId,
      driverId: tripMeta.driverId,
    });

    navigation.navigate(SCREENS.ATTENDANCE, {
      stop: { ...stop, stopNumber: stops.findIndex((s) => s.id === stop.id) + 1 },
      tripId,
    });
  }, [emitStopArrival, tripId, tripMeta, navigation, stops]);

  const trackableStops = stops.filter((s) => !s.isDestination && (s.latitude || s.longitude));

  const { location, startTracking, stopTracking } = useDriverLocation(
    emitLocation,
    tripMeta,
    tripStarted ? trackableStops : [],
    handleStopArrival,
  );

  // ── Load stops ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (tripId) dispatch(fetchTripStops(tripId));
  }, [tripId, dispatch]);

  useEffect(() => {
    if (tripStops && tripStops.length > 0) {
      setStops(tripStops);
      setRoadPolyline([]);
      lastRouteFetchRef.current = 0;
    }
  }, [tripStops]);

  // Re-fetch on focus (return from AttendanceScreen → completed stops go green)
  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      if (tripId) dispatch(fetchTripStops(tripId));
    });
    return unsub;
  }, [navigation, tripId, dispatch]);

  // ── OSRM road route + ETA ───────────────────────────────────────────────────
  const fetchRoadRoute = useCallback(async (driverLoc, currentStops) => {
    if (!driverLoc?.latitude || !driverLoc?.longitude) return;
    const remaining = currentStops.filter(
      (s) => s.latitude && s.longitude && s.status !== 'completed' && s.status !== 'arrived'
    );
    if (!remaining.length) return;

    const now = Date.now();
    if (now - lastRouteFetchRef.current < 30_000) return;
    lastRouteFetchRef.current = now;

    const coords = [
      `${driverLoc.longitude},${driverLoc.latitude}`,
      ...remaining.map((s) => `${s.longitude},${s.latitude}`),
    ].join(';');

    try {
      const res = await fetch(
        `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`
      );
      const data = await res.json();
      const routeData = data.routes?.[0];
      if (!routeData) return;

      // Road polyline
      const points = routeData.geometry.coordinates.map(([lng, lat]) => ({
        latitude: lat,
        longitude: lng,
      }));
      setRoadPolyline(points);

      // Per-stop ETAs from leg durations (cumulative)
      const legs = routeData.legs ?? [];
      let cumSecs = 0;
      const etaMap = {};
      remaining.forEach((stop, i) => {
        cumSecs += legs[i]?.duration ?? 0;
        const mins = Math.max(1, Math.round(cumSecs / 60));
        etaMap[String(stop.id)] = `${mins} min`;
      });
      setStopETAs(etaMap);
    } catch {
      // Fallback: straight-line polyline stays, no ETA badges
    }
  }, []);

  useEffect(() => {
    if (tripStarted && location && stops.length > 0) {
      fetchRoadRoute(location, stops);
    }
  }, [location?.latitude, location?.longitude, tripStarted, fetchRoadRoute, stops]);

  // ── Trip controls ────────────────────────────────────────────────────────────
  const handleStartTrip = async () => {
    if (!tripMeta.cabId) {
      console.warn('[DriverActiveTrip] cabId missing — GPS emission will be skipped');
    }
    const ok = await startTracking();
    if (ok === false) {
      Alert.alert(
        'Location Permission Required',
        'Please enable location access in your device Settings.',
        [{ text: 'OK' }]
      );
      return;
    }
    if (tripId) dispatch(startTrip(tripId));
    setTripStarted(true);
  };

  const handleConfirmAttendance = useCallback((stop) => {
    if (!tripId || !stop?.id) return;
    handleStopArrival(stop);
  }, [tripId, handleStopArrival]);

  const allStopsDone =
    stops.filter((s) => !s.isDestination).length > 0 &&
    stops.filter((s) => !s.isDestination).every(
      (s) => s.status === 'completed' || s.status === 'arrived'
    );

  const handleEndTrip = () => {
    Alert.alert(
      'End Trip',
      'Are you sure you want to end this trip?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'End Trip',
          style: 'destructive',
          onPress: () => {
            stopTracking();
            if (tripId) dispatch(endTrip({ tripId }));
            navigation.navigate(SCREENS.TRIP_SUMMARY, {
              trip: { tripNumber: trip.tripNumber ?? `Trip #${tripId ?? ''}` },
            });
          },
        },
      ]
    );
  };

  const callEmployee = (phone) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`).catch(() => {});
  };

  // ── Derived display data ─────────────────────────────────────────────────────
  const nextStop = stops.find((s) => s.status === 'next_stop') ?? stops.find((s) => s.status === 'pending');
  const tripNumber = trip.tripNumber ?? `Trip #${tripId ?? ''}`;
  const vehicleNo = trip.vehicle ?? trip.cabNumber ?? '';

  const mapMarkers = stops.filter(s => s.latitude && s.longitude).map((stop, idx) => ({
    id: stop.id,
    latitude: stop.latitude,
    longitude: stop.longitude,
    title: stop.name,
    label: String(idx + 1),
    color: (stop.status === 'completed' || stop.status === 'arrived')
      ? '#16a34a'
      : stop.status === 'next_stop'
      ? '#643ee8'
      : '#9e9aa8',
    eta: stopETAs[String(stop.id)] ?? null,
  }));

  // Straight-line fallback when OSRM hasn't responded yet
  const fallbackPolyline = roadPolyline.length === 0
    ? stops.filter(s => s.latitude && s.longitude).map(s => ({ latitude: s.latitude, longitude: s.longitude }))
    : [];

  return (
    <View style={styles.container}>
      {/* ── Fullscreen Map ─────────────────────────────────────────────────── */}
      <CrossPlatformMap
        style={StyleSheet.absoluteFillObject}
        region={
          location
            ? { latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 }
            : DEFAULT_REGION
        }
        driverLocation={location}
        markers={mapMarkers}
        roadRoute={roadPolyline}
        polyline={fallbackPolyline}
      />

      {/* ── Floating header ────────────────────────────────────────────────── */}
      <SafeAreaView edges={['top']} style={styles.headerWrapper}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color="#1a1a2e" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{tripNumber}</Text>
            {vehicleNo ? <Text style={styles.headerSub}>{vehicleNo}</Text> : null}
          </View>
          <TouchableOpacity style={styles.sosBtn}>
            <Text style={styles.sosBtnText}>SOS</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* ── Bottom sheet ───────────────────────────────────────────────────── */}
      <Animated.View style={[styles.sheet, { height: sheetAnim }]}>
        {/* Handle + sheet header */}
        <View style={styles.sheetHandle} />

        <View style={styles.sheetHeaderRow}>
          <Text style={[styles.sheetTitle, { color: '#1a1a2e' }]}>Trip Details</Text>
          {showDetails && (
            <TouchableOpacity onPress={closeSheet} style={styles.sheetCloseBtn}>
              <Ionicons name="close" size={20} color="#1a1a2e" />
            </TouchableOpacity>
          )}
        </View>

        {/* Route stops label (expanded only) */}
        {showDetails && (
          <Text style={styles.routeStopsLabel}>Route Stops</Text>
        )}

        {/* Collapsed: single next-stop row — tap to expand */}
        {!showDetails && nextStop && (
          <TouchableOpacity style={styles.collapsedRow} onPress={openSheet} activeOpacity={0.8}>
            <View style={[styles.collapsedCircle, { borderColor: '#643ee8', backgroundColor: '#643ee8' }]} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.collapsedTime}>{nextStop.time}</Text>
              <Text style={styles.collapsedName}>{nextStop.name}</Text>
            </View>
            {/* Stacked avatars */}
            <View style={styles.avatarStack}>
              {(nextStop.employees ?? []).slice(0, 3).map((emp, i) => (
                <View key={emp.id} style={[styles.avatarWrap, { marginLeft: i > 0 ? -8 : 0, zIndex: 3 - i }]}>
                  <Avatar name={emp.name} size={28} />
                </View>
              ))}
            </View>
            <Text style={[styles.nextStopBadge, { color: '#643ee8' }]}>Next Stop</Text>
          </TouchableOpacity>
        )}

        {/* Expanded: full stop list */}
        {showDetails && (
          <ScrollView
            style={styles.stopList}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 8 }}
          >
            {stops.map((stop, idx) => (
              <StopRow
                key={stop.id}
                stop={stop}
                isLast={idx === stops.length - 1}
                colors={colors}
                onCallEmployee={callEmployee}
                onConfirmAttendance={handleConfirmAttendance}
              />
            ))}
          </ScrollView>
        )}
      </Animated.View>

      {/* ── Bottom CTA (always visible above sheet) ────────────────────────── */}
      <SafeAreaView edges={['bottom']} style={styles.ctaWrapper}>
        <View style={styles.ctaInner}>
          {!tripStarted ? (
            <SlideToStart
              label="Slide to Start Trip"
              onComplete={handleStartTrip}
              color="#643ee8"
            />
          ) : (
            <>
              {!allStopsDone && (
                <Text style={styles.endTripHint}>Complete all stops to end the trip</Text>
              )}
              <TouchableOpacity
                style={[styles.endTripBtn, { backgroundColor: allStopsDone ? '#dc2626' : '#9ca3af' }]}
                onPress={allStopsDone ? handleEndTrip : undefined}
                disabled={!allStopsDone}
                activeOpacity={allStopsDone ? 0.85 : 1}
              >
                <Text style={styles.endTripBtnText}>End Trip</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f0f0f0' },

  // ── Floating header ──
  headerWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f5f4f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: { flex: 1, marginHorizontal: 10 },
  headerTitle: { fontSize: 15, fontWeight: '700', color: '#1a1a2e' },
  headerSub: { fontSize: 12, color: '#6b7280', marginTop: 1 },
  sosBtn: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  sosBtnText: { color: '#fff', fontWeight: '700', fontSize: 12 },

  // ── Bottom sheet ──
  sheet: {
    position: 'absolute',
    bottom: 80, // above CTA
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    overflow: 'hidden',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e5e7eb',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 4,
  },
  sheetHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 6,
  },
  sheetTitle: { flex: 1, fontSize: 17, fontWeight: '700' },
  sheetCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f5f4f9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeStopsLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    paddingHorizontal: 18,
    marginBottom: 8,
  },

  // Collapsed next-stop row
  collapsedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  collapsedCircle: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  collapsedTime: { fontSize: 11, color: '#6b7280' },
  collapsedName: { fontSize: 15, fontWeight: '700', color: '#1a1a2e' },
  nextStopBadge: { fontSize: 13, fontWeight: '700', marginLeft: 8 },

  // Stop list
  stopList: { flex: 1, paddingHorizontal: 16 },

  // Stop row
  stopRow: {
    flexDirection: 'row',
    marginBottom: 0,
  },

  // Timeline
  timeline: {
    width: 28,
    alignItems: 'center',
    paddingTop: 14,
  },
  timelineCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timelineLine: {
    flex: 1,
    width: 2,
    borderLeftWidth: 2,
    borderStyle: 'dashed',
    marginTop: 4,
    marginBottom: 0,
    minHeight: 24,
  },

  // Stop content
  stopContent: {
    flex: 1,
    paddingTop: 8,
    paddingBottom: 12,
    marginLeft: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  stopHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stopTime: { fontSize: 11, marginBottom: 1 },
  stopName: { fontSize: 14, fontWeight: '700' },
  statusLabel: { fontSize: 12, fontWeight: '700', marginLeft: 8, marginTop: 16 },

  // Stacked avatars
  avatarStack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 4,
    marginTop: 12,
  },
  avatarWrap: {},

  // Employee list
  empList: { marginTop: 10, gap: 0 },
  empRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  empName: { fontSize: 14, fontWeight: '500' },
  empStatusText: { fontSize: 11, marginTop: 2 },
  callBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  confirmAttBtn: {
    marginTop: 10,
    height: 40,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmAttBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  // ── Bottom CTA ──
  ctaWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 4,
  },
  ctaInner: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  endTripHint: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginBottom: 8,
  },
  endTripBtn: {
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  endTripBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // SlideToStart
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
});

export default DriverActiveTripScreen;
