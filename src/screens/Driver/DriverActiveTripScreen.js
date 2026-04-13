/**
 * DriverActiveTripScreen — Figma Driver Handoff
 *
 * Layout (flex, not absolute — works with bottom tab bar):
 *   ┌─────────────────────────────┐
 *   │  Floating header (absolute) │
 *   │                             │
 *   │       MAP  (flex:1)         │
 *   │                             │
 *   ├─────────────────────────────┤
 *   │  Bottom panel               │
 *   │  • "Trip Details" header    │
 *   │  • "Route Stops" subtitle   │
 *   │  • Scrollable stop list     │
 *   │    – every stop visible     │
 *   │    – current stop expanded  │
 *   │      (employees + call btn) │
 *   │  • CTA: Slide to Start/End  │
 *   └─────────────────────────────┘
 *
 * Behaviours:
 *  • OSRM dashed road-following route + ETA badges on map
 *  • Proximity → attendance popup (auto) → stop turns green → next auto-expands
 *  • "Slide To End Trip" only when ALL non-destination stops completed/arrived
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
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../theme/ThemeProvider';
import { Avatar, CrossPlatformMap } from '../../components';
import { SCREENS } from '../../constants';
import { fetchTripStops } from '../../redux/slices/tripSlice';
import { startTrip, endTrip } from '../../redux/slices/driverSlice';
import { useTrackingSocket } from '../../hooks/useTrackingSocket';
import { useDriverLocation } from '../../hooks/useDriverLocation';

const { width, height: SCREEN_H } = Dimensions.get('window');
const THUMB_SIZE   = 52;
const TRACK_W      = width - 64;
const PANEL_HEIGHT = Math.round(SCREEN_H * 0.50); // 50 % — fits above tab bar
const DEFAULT_REGION = { latitude: 12.9716, longitude: 80.2209, latitudeDelta: 0.05, longitudeDelta: 0.05 };

// ─── Slide gesture (reused for Start and End) ────────────────────────────────
const SlideButton = ({ label, color, onComplete }) => {
  const [done, setDone] = useState(false);
  const pan  = useRef(new Animated.Value(0)).current;
  const maxX = TRACK_W - THUMB_SIZE - 8;

  const pr = useRef(PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (_, g) => pan.setValue(Math.max(0, Math.min(g.dx, maxX))),
    onPanResponderRelease: (_, g) => {
      if (g.dx >= maxX * 0.8) {
        Animated.spring(pan, { toValue: maxX, useNativeDriver: false }).start(() => {
          setDone(true);
          onComplete?.();
        });
      } else {
        Animated.spring(pan, { toValue: 0, useNativeDriver: false }).start();
      }
    },
  })).current;

  return (
    <View style={[ss.slideTrack, { backgroundColor: color + '22', borderColor: color + '55' }]}>
      <Text style={[ss.slideLabel, { color }]}>{done ? '✓ Done!' : label}</Text>
      <Animated.View
        style={[ss.slideThumb, { backgroundColor: color, transform: [{ translateX: pan }] }]}
        {...pr.panHandlers}
      >
        <Ionicons name={done ? 'checkmark' : 'chevron-forward'} size={24} color="#fff" />
      </Animated.View>
    </View>
  );
};

// ─── Single stop row ──────────────────────────────────────────────────────────
const StopRow = ({ stop, isLast, colors, onCall, onConfirmAttendance }) => {
  const isCompleted  = stop.status === 'completed' || stop.status === 'arrived';
  const isNext       = stop.status === 'next_stop';
  const isDestination = stop.isDestination;

  const dotColor    = isCompleted ? '#16a34a' : isNext ? colors.primary : '#d1d5db';
  const statusLabel = isCompleted ? 'Completed' : isNext ? 'Next Stop' : isDestination ? '' : 'Pending';
  const statusColor = isCompleted ? '#16a34a' : isNext ? colors.primary : '#9ca3af';

  // Show up to 3 overlapping avatars in the header row
  const previewEmps = (stop.employees ?? []).slice(0, 3);

  return (
    <View style={ss.row}>
      {/* ── Timeline ── */}
      <View style={ss.tl}>
        <View style={[
          ss.dot,
          { borderColor: dotColor, backgroundColor: isCompleted ? '#16a34a' : 'transparent' },
        ]}>
          {isCompleted && <Ionicons name="checkmark" size={9} color="#fff" />}
        </View>
        {!isLast && (
          <View style={[ss.line, { borderColor: isCompleted ? '#16a34a' : '#e5e7eb' }]} />
        )}
      </View>

      {/* ── Content ── */}
      <View style={[ss.content, isLast && { borderBottomWidth: 0 }]}>
        {/* Header */}
        <View style={ss.rowHead}>
          <View style={{ flex: 1 }}>
            <Text style={[ss.stopTime, { color: colors.textSecondary }]}>{stop.time}</Text>
            <Text style={[ss.stopName, { color: colors.text }]}>{stop.name}</Text>
          </View>

          {/* Stacked mini avatars */}
          {previewEmps.length > 0 && (
            <View style={ss.avatarRow}>
              {previewEmps.map((e, i) => (
                <View key={e.id} style={{ marginLeft: i > 0 ? -6 : 0, zIndex: 3 - i }}>
                  <Avatar name={e.name} size={22} />
                </View>
              ))}
            </View>
          )}

          {statusLabel ? (
            <Text style={[ss.statusBadge, { color: statusColor }]}>{statusLabel}</Text>
          ) : null}
        </View>

        {/* Employee list — shown for current/next stop */}
        {isNext && (stop.employees ?? []).length > 0 && (
          <View style={ss.empBlock}>
            {stop.employees.map((emp) => (
              <View key={emp.id} style={[ss.empRow, { borderBottomColor: colors.borderLight }]}>
                <Avatar name={emp.name} size={36} />
                <Text style={[ss.empName, { color: colors.text }]}>{emp.name}</Text>
                {emp.phone ? (
                  <TouchableOpacity
                    style={[ss.callBtn, { borderColor: colors.borderLight }]}
                    onPress={() => onCall(emp.phone)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="call-outline" size={15} color={colors.primary} />
                  </TouchableOpacity>
                ) : null}
              </View>
            ))}
          </View>
        )}

        {/* Completed: show boarding outcome */}
        {isCompleted && (stop.employees ?? []).length > 0 && (
          <View style={ss.empBlock}>
            {stop.employees.map((emp) => (
              <View key={emp.id} style={[ss.empRow, { borderBottomColor: colors.borderLight }]}>
                <Avatar name={emp.name} size={28} />
                <Text style={[ss.empName, { color: colors.text }]}>{emp.name}</Text>
                <View style={[
                  ss.outcomePill,
                  { backgroundColor: emp.status === 'picked_up' ? '#dcfce7' : '#fee2e2' },
                ]}>
                  <Text style={{ fontSize: 10, fontWeight: '700', color: emp.status === 'picked_up' ? '#16a34a' : '#dc2626' }}>
                    {emp.status === 'picked_up' ? 'Boarded' : 'No Show'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const DriverActiveTripScreen = ({ navigation, route }) => {
  const { theme }  = useTheme();
  const colors     = theme.colors;
  const dispatch   = useDispatch();
  const trip       = route?.params?.trip ?? {};
  const tripId     = trip?.id;

  const tripStops  = useSelector((s) => s.trip.tripStops);
  const activeTrip = useSelector((s) => s.driver.activeTrip);
  const user       = useSelector((s) => s.auth.user);

  const [stops,       setStops]       = useState([]);
  const [tripStarted, setTripStarted] = useState(false);
  const [roadPoly,    setRoadPoly]    = useState([]);
  const [stopETAs,    setStopETAs]    = useState({});

  const lastFetchRef = useRef(0);
  const openedRef    = useRef(new Set());

  const { emitLocation, emitStopArrival } = useTrackingSocket();
  const tripMeta = {
    cabId:    trip?.cabId ?? activeTrip?.cabId ?? null,
    driverId: user?.id ?? null,
    tripId:   tripId ?? null,
  };

  // ── Stop arrival (proximity trigger) ──────────────────────────────────────
  const handleStopArrival = useCallback((stop) => {
    if (!stop?.id) return;
    if (openedRef.current.has(String(stop.id))) return;
    openedRef.current.add(String(stop.id));

    emitStopArrival({ tripId, stopId: stop.id, cabId: tripMeta.cabId, driverId: tripMeta.driverId });

    navigation.navigate(SCREENS.ATTENDANCE, {
      stop: { ...stop, stopNumber: stops.findIndex((s) => s.id === stop.id) + 1 },
      tripId,
    });
  }, [emitStopArrival, tripId, tripMeta, navigation, stops]);

  const trackable = stops.filter((s) => !s.isDestination && (s.latitude || s.longitude));

  const { location, startTracking, stopTracking } = useDriverLocation(
    emitLocation,
    tripMeta,
    tripStarted ? trackable : [],
    handleStopArrival,
  );

  // ── Load & sync stops ─────────────────────────────────────────────────────
  useEffect(() => {
    if (tripId) dispatch(fetchTripStops(tripId));
  }, [tripId, dispatch]);

  useEffect(() => {
    if (tripStops?.length) {
      setStops(tripStops);
      setRoadPoly([]);
      lastFetchRef.current = 0;
    }
  }, [tripStops]);

  // Refresh stops when returning from AttendanceScreen
  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      if (tripId) dispatch(fetchTripStops(tripId));
    });
    return unsub;
  }, [navigation, tripId, dispatch]);

  // ── OSRM road route + ETAs ────────────────────────────────────────────────
  const fetchRoute = useCallback(async (loc, curStops) => {
    if (!loc?.latitude) return;
    const rem = curStops.filter(
      (s) => s.latitude && s.longitude && s.status !== 'completed' && s.status !== 'arrived'
    );
    if (!rem.length) return;
    const now = Date.now();
    if (now - lastFetchRef.current < 30_000) return;
    lastFetchRef.current = now;

    const coords = [
      `${loc.longitude},${loc.latitude}`,
      ...rem.map((s) => `${s.longitude},${s.latitude}`),
    ].join(';');

    try {
      const res  = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`);
      const data = await res.json();
      const rt   = data.routes?.[0];
      if (!rt) return;

      setRoadPoly(rt.geometry.coordinates.map(([lng, lat]) => ({ latitude: lat, longitude: lng })));

      let cum = 0;
      const etaMap = {};
      rem.forEach((s, i) => {
        cum += rt.legs?.[i]?.duration ?? 0;
        etaMap[String(s.id)] = `${Math.max(1, Math.round(cum / 60))} min`;
      });
      setStopETAs(etaMap);
    } catch { /* silent fallback */ }
  }, []);

  useEffect(() => {
    if (tripStarted && location && stops.length) fetchRoute(location, stops);
  }, [location?.latitude, location?.longitude, tripStarted, fetchRoute, stops]);

  // ── Trip controls ─────────────────────────────────────────────────────────
  const handleStart = async () => {
    if (!tripMeta.cabId) console.warn('[DriverActiveTrip] cabId missing');
    const ok = await startTracking();
    if (ok === false) {
      Alert.alert('Location Required', 'Please enable location access in Settings.');
      return;
    }
    if (tripId) dispatch(startTrip(tripId));
    setTripStarted(true);
  };

  const allDone = stops.filter((s) => !s.isDestination).length > 0 &&
    stops.filter((s) => !s.isDestination).every((s) => s.status === 'completed' || s.status === 'arrived');

  const handleEnd = () => {
    Alert.alert('End Trip', 'This will log the trip data. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End Trip',
        style: 'destructive',
        onPress: () => {
          stopTracking();
          if (tripId) dispatch(endTrip({ tripId }));
          navigation.navigate(SCREENS.TRIP_SUMMARY, { trip });
        },
      },
    ]);
  };

  const callEmployee = (phone) => {
    if (!phone) return;
    Linking.openURL(`tel:${phone}`).catch(() => {});
  };

  // ── Map data ──────────────────────────────────────────────────────────────
  const markers = stops
    .filter((s) => s.latitude && s.longitude)
    .map((s, i) => ({
      id: s.id,
      latitude: s.latitude,
      longitude: s.longitude,
      title: s.name,
      label: String(i + 1),
      color: s.status === 'completed' || s.status === 'arrived'
        ? '#16a34a'
        : s.status === 'next_stop'
        ? '#643ee8'
        : '#9e9aa8',
      eta: stopETAs[String(s.id)] ?? null,
    }));

  const fallbackPoly = roadPoly.length === 0
    ? stops.filter((s) => s.latitude && s.longitude).map((s) => ({ latitude: s.latitude, longitude: s.longitude }))
    : [];

  const tripNumber = trip.tripNumber ?? `Trip #${tripId ?? ''}`;
  const vehicleNo  = trip.vehicle ?? trip.cabNumber ?? '';

  return (
    <View style={ss.root}>
      {/* ────────────────────────── MAP (flex fills remaining space) ── */}
      <View style={ss.mapBox}>
        <CrossPlatformMap
          style={StyleSheet.absoluteFillObject}
          region={
            location
              ? { latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 }
              : DEFAULT_REGION
          }
          driverLocation={location}
          markers={markers}
          roadRoute={roadPoly}
          polyline={fallbackPoly}
        />

        {/* Floating header over map */}
        <View style={ss.header}>
          <TouchableOpacity style={ss.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color="#1a1a2e" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginHorizontal: 10 }}>
            <Text style={ss.tripNo}>{tripNumber}</Text>
            {!!vehicleNo && <Text style={ss.vehicleNo}>{vehicleNo}</Text>}
          </View>
          <TouchableOpacity style={ss.sosBtn}>
            <Text style={ss.sosTxt}>SOS</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ─────────────────────── BOTTOM PANEL (fixed height) ── */}
      <View style={[ss.panel, { backgroundColor: colors.surface }]}>
        {/* Handle */}
        <View style={ss.handle} />

        {/* Header */}
        <View style={ss.panelHead}>
          <Text style={[ss.panelTitle, { color: colors.text }]}>Trip Details</Text>
          <Text style={[ss.panelSub, { color: colors.textSecondary }]}>Route Stops</Text>
        </View>

        {/* Stop list — scrollable, always visible */}
        <ScrollView
          style={ss.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 8 }}
        >
          {stops.length === 0 ? (
            <Text style={[ss.emptyTxt, { color: colors.textSecondary }]}>Loading route…</Text>
          ) : (
            stops.map((stop, idx) => (
              <StopRow
                key={stop.id ?? idx}
                stop={stop}
                isLast={idx === stops.length - 1}
                colors={colors}
                onCall={callEmployee}
                onConfirmAttendance={() => handleStopArrival(stop)}
              />
            ))
          )}
        </ScrollView>

        {/* ── CTA ── */}
        <View style={[ss.cta, { borderTopColor: colors.borderLight }]}>
          {!tripStarted ? (
            <SlideButton
              label="Slide to Start Trip"
              color={colors.primary}
              onComplete={handleStart}
            />
          ) : allDone ? (
            <SlideButton
              label="Slide to End Trip"
              color="#dc2626"
              onComplete={handleEnd}
            />
          ) : (
            /* In-progress: show a non-interactive status bar */
            <View style={[ss.inProgressBar, { backgroundColor: colors.primary + '15' }]}>
              <Ionicons name="navigate-outline" size={16} color={colors.primary} />
              <Text style={[ss.inProgressTxt, { color: colors.primary }]}>
                Trip in progress — complete all stops
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const ss = StyleSheet.create({
  root: { flex: 1 },

  // Map area
  mapBox: { flex: 1, position: 'relative' },

  // Floating header (sits on top of map)
  header: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 5,
  },
  backBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: '#f5f4f9', alignItems: 'center', justifyContent: 'center',
  },
  tripNo:    { fontSize: 14, fontWeight: '700', color: '#1a1a2e' },
  vehicleNo: { fontSize: 11, color: '#6b7280', marginTop: 1 },
  sosBtn: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 11, paddingVertical: 5,
    borderRadius: 7,
  },
  sosTxt: { color: '#fff', fontWeight: '700', fontSize: 12 },

  // Panel
  panel: {
    height: PANEL_HEIGHT,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8,
    overflow: 'hidden',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2,
    backgroundColor: '#e5e7eb', alignSelf: 'center',
    marginTop: 10, marginBottom: 6,
  },
  panelHead: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 18,
    paddingBottom: 8,
    gap: 8,
  },
  panelTitle: { fontSize: 17, fontWeight: '700' },
  panelSub:   { fontSize: 12, fontWeight: '500' },

  list: { flex: 1, paddingHorizontal: 14 },
  emptyTxt: { textAlign: 'center', paddingVertical: 20, fontSize: 13 },

  // CTA
  cta: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderTopWidth: 1,
  },
  inProgressBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    borderRadius: 12,
  },
  inProgressTxt: { fontSize: 13, fontWeight: '600' },

  // Slide button
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
  slideLabel: { fontSize: 15, fontWeight: '500', position: 'absolute' },
  slideThumb: {
    position: 'absolute', left: 4,
    width: THUMB_SIZE, height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 4,
  },

  // Stop row
  row: { flexDirection: 'row', minHeight: 48 },

  // Timeline
  tl:   { width: 28, alignItems: 'center', paddingTop: 12 },
  dot: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 2.5, alignItems: 'center', justifyContent: 'center',
  },
  line: {
    flex: 1, width: 2, marginTop: 4, minHeight: 16,
    borderLeftWidth: 2, borderStyle: 'dashed',
  },

  // Content
  content: {
    flex: 1,
    paddingTop: 8, paddingBottom: 10,
    marginLeft: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  rowHead:     { flexDirection: 'row', alignItems: 'flex-start' },
  stopTime:    { fontSize: 11, marginBottom: 1 },
  stopName:    { fontSize: 13, fontWeight: '700' },
  avatarRow:   { flexDirection: 'row', alignItems: 'center', marginHorizontal: 6, marginTop: 10 },
  statusBadge: { fontSize: 11, fontWeight: '700', marginTop: 12, marginLeft: 4 },

  // Employee block
  empBlock: { marginTop: 8, gap: 0 },
  empRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    gap: 10,
  },
  empName: { flex: 1, fontSize: 13, fontWeight: '500' },
  callBtn: {
    width: 34, height: 34, borderRadius: 9, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  outcomePill: {
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 999,
  },
});

export default DriverActiveTripScreen;
