/**
 * DriverActiveTripScreen — two states
 *
 * State 1  !tripStarted  → Pre-trip details view (no map)
 *   • Back header + vehicle card + stats + route stops list
 *   • Every stop expanded with employees
 *   • Stop labels: "Trip starts" | "2nd Stop" | "3rd Stop" | "Destination"
 *   • Slide To Start Trip at the bottom
 *
 * State 2  tripStarted   → Map + bottom panel
 *   • Full-screen Leaflet map with dashed OSRM route + ETA badges
 *   • Bottom panel: Trip Details + live stop list
 *   • Proximity (300 m or ≤30 s ETA) → attendance popup → stop turns green
 *   • Slide To End Trip only when ALL non-destination stops completed
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

const { width, height: SCREEN_H } = Dimensions.get('window');
const THUMB_SIZE   = 52;
const TRACK_W      = width - 64;
const PANEL_H      = Math.round(SCREEN_H * 0.50);
const DEFAULT_REGION = { latitude: 12.9716, longitude: 80.2209, latitudeDelta: 0.05, longitudeDelta: 0.05 };

// ─── ordinal helper ───────────────────────────────────────────────────────────
const ordLabel = (n) => {
  if (n === 1) return 'Trip starts';
  const s = ['th','st','nd','rd'], v = n % 100;
  return `${n}${s[(v-20)%10] || s[v] || s[0]} Stop`;
};

// ─── Slide button ─────────────────────────────────────────────────────────────
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

// ─── Pre-trip stop row (full employee list, no liveETA) ───────────────────────
const PreStopRow = ({ stop, idx, total, colors, onCall }) => {
  const isDestination = stop.isDestination;
  const isFirst       = idx === 0;
  const isLast        = idx === total - 1;
  const labelText     = isDestination ? 'Destination' : ordLabel(idx + 1);
  const labelColor    = isFirst ? colors.primary : isDestination ? colors.primary : '#9ca3af';

  return (
    <View style={ss.row}>
      {/* Timeline */}
      <View style={ss.tl}>
        <View style={[ss.dot, { borderColor: isFirst ? colors.primary : '#d1d5db', backgroundColor: 'transparent' }]} />
        {!isLast && <View style={[ss.line, { borderColor: '#e5e7eb' }]} />}
      </View>

      {/* Content */}
      <View style={[ss.content, isLast && { borderBottomWidth: 0 }]}>
        <View style={ss.rowHead}>
          <View style={{ flex: 1 }}>
            <Text style={[ss.stopTime, { color: colors.textSecondary }]}>{stop.time}</Text>
            <Text style={[ss.stopName, { color: colors.text }]}>{stop.name}</Text>
          </View>
          {/* Overlapping avatars */}
          {(stop.employees ?? []).length > 0 && (
            <View style={ss.avatarRow}>
              {stop.employees.slice(0, 3).map((e, i) => (
                <View key={e.id} style={{ marginLeft: i > 0 ? -6 : 0, zIndex: 3 - i }}>
                  <Avatar name={e.name} size={22} />
                </View>
              ))}
            </View>
          )}
          <Text style={[ss.statusBadge, { color: labelColor }]}>{labelText}</Text>
        </View>

        {/* Employee rows — always shown in pre-trip view */}
        {(stop.employees ?? []).length > 0 && !isDestination && (
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
      </View>
    </View>
  );
};

// ─── Active-trip stop row (liveETA + completed state) ────────────────────────
const ActiveStopRow = ({ stop, isLast, isCurrent, colors, onCall, onConfirmAttendance }) => {
  const isCompleted   = stop.status === 'completed' || stop.status === 'arrived';
  const isNext        = isCurrent || stop.status === 'next_stop';
  const isDestination = stop.isDestination;
  const dotColor      = isCompleted ? '#16a34a' : isNext ? colors.primary : '#d1d5db';
  const statusLabel   = isCompleted ? 'Completed' : isNext ? 'Next Stop' : isDestination ? '' : 'Pending';
  const statusColor   = isCompleted ? '#16a34a' : isNext ? colors.primary : '#9ca3af';
  const previewEmps   = (stop.employees ?? []).slice(0, 3);

  return (
    <View style={ss.row}>
      <View style={ss.tl}>
        <View style={[ss.dot, { borderColor: dotColor, backgroundColor: isCompleted ? '#16a34a' : 'transparent' }]}>
          {isCompleted && <Ionicons name="checkmark" size={9} color="#fff" />}
        </View>
        {!isLast && <View style={[ss.line, { borderColor: isCompleted ? '#16a34a' : '#e5e7eb' }]} />}
      </View>

      <View style={[ss.content, isLast && { borderBottomWidth: 0 }]}>
        <View style={ss.rowHead}>
          <View style={{ flex: 1 }}>
            <Text style={[ss.stopTime, { color: colors.textSecondary }]}>{stop.time}</Text>
            <Text style={[ss.stopName, { color: colors.text }]}>{stop.name}</Text>
            {stop.liveETA && !isCompleted && (
              <Text style={[ss.liveETA, {
                color: stop.liveETA === 'Arrived' ? '#16a34a'
                  : stop.liveETA === '< 1 min'   ? '#f59e0b'
                  : colors.primary,
              }]}>
                {stop.liveETA === 'Arrived' ? '📍 Arrived' : `🕐 ${stop.liveETA}`}
              </Text>
            )}
          </View>
          {previewEmps.length > 0 && (
            <View style={ss.avatarRow}>
              {previewEmps.map((e, i) => (
                <View key={e.id} style={{ marginLeft: i > 0 ? -6 : 0, zIndex: 3 - i }}>
                  <Avatar name={e.name} size={22} />
                </View>
              ))}
            </View>
          )}
          {statusLabel ? <Text style={[ss.statusBadge, { color: statusColor }]}>{statusLabel}</Text> : null}
        </View>

        {/* Next stop: employees + call buttons */}
        {isNext && !isCompleted && (stop.employees ?? []).length > 0 && (
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

        {/* Completed: boarding outcome */}
        {isCompleted && (stop.employees ?? []).length > 0 && (
          <View style={ss.empBlock}>
            {stop.employees.map((emp) => (
              <View key={emp.id} style={[ss.empRow, { borderBottomColor: colors.borderLight }]}>
                <Avatar name={emp.name} size={28} />
                <Text style={[ss.empName, { color: colors.text }]}>{emp.name}</Text>
                <View style={[ss.outcomePill, {
                  backgroundColor: emp.status === 'boarded' || emp.status === 'picked_up' ? '#dcfce7' : '#fee2e2',
                }]}>
                  <Text style={{ fontSize: 10, fontWeight: '700',
                    color: emp.status === 'boarded' || emp.status === 'picked_up' ? '#16a34a' : '#dc2626' }}>
                    {emp.status === 'boarded' || emp.status === 'picked_up' ? 'Boarded' : 'No Show'}
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

  const stopKey = (s) => s?.id ? String(s.id) : `name:${s?.name ?? ''}`;

  const metersTo = (lat1, lon1, lat2, lon2) => {
    const R = 6_371_000, r = Math.PI / 180;
    const dLat = (lat2 - lat1) * r, dLon = (lon2 - lon1) * r;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1*r)*Math.cos(lat2*r)*Math.sin(dLon/2)**2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const { emitLocation, emitStopArrival } = useTrackingSocket();
  const tripMeta = {
    cabId:    trip?.cabId ?? activeTrip?.cabId ?? null,
    driverId: user?.id ?? null,
    tripId:   tripId ?? null,
  };

  // ── Proximity handler ──────────────────────────────────────────────────────
  const handleStopArrival = useCallback((stop) => {
    if (!stop) return;
    const key = stopKey(stop);
    if (openedRef.current.has(key)) return;
    openedRef.current.add(key);
    emitStopArrival({ tripId, stopId: stop.id, cabId: tripMeta.cabId, driverId: tripMeta.driverId });
    navigation.navigate(SCREENS.ATTENDANCE, {
      stop: { ...stop, stopNumber: stops.findIndex((s) => s.id === stop.id) + 1 },
      tripId,
    });
  }, [emitStopArrival, tripId, tripMeta, navigation, stops]);

  // Single current stop — strict order
  const currentStop = stops.find(
    (s) => !s.isDestination && s.status !== 'completed' && s.status !== 'arrived' && (s.latitude || s.longitude)
  );
  const trackable = currentStop ? [currentStop] : [];

  const { location, startTracking, stopTracking } = useDriverLocation(
    emitLocation,
    tripMeta,
    tripStarted ? trackable : [],
    handleStopArrival,
  );

  // ── Load stops ─────────────────────────────────────────────────────────────
  useEffect(() => { if (tripId) dispatch(fetchTripStops(tripId)); }, [tripId, dispatch]);

  useEffect(() => {
    if (tripStops?.length) {
      setStops(tripStops);
      setRoadPoly([]);
      lastFetchRef.current = 0;
    }
  }, [tripStops]);

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      if (tripId) dispatch(fetchTripStops(tripId));
    });
    return unsub;
  }, [navigation, tripId, dispatch]);

  // ── OSRM geometry (throttled 10 s) ────────────────────────────────────────
  const fetchRoute = useCallback(async (loc, curStops) => {
    if (!loc?.latitude) return;
    const rem = curStops.filter((s) => s.latitude && s.longitude && s.status !== 'completed' && s.status !== 'arrived');
    if (!rem.length) return;
    const now = Date.now();
    if (now - lastFetchRef.current < 10_000) return;
    lastFetchRef.current = now;
    const coords = [`${loc.longitude},${loc.latitude}`, ...rem.map((s) => `${s.longitude},${s.latitude}`)].join(';');
    try {
      const res  = await fetch(`https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`);
      const data = await res.json();
      const rt   = data.routes?.[0];
      if (rt) setRoadPoly(rt.geometry.coordinates.map(([lng, lat]) => ({ latitude: lat, longitude: lng })));
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    if (tripStarted && location && stops.length) fetchRoute(location, stops);
  }, [location?.latitude, location?.longitude, tripStarted, fetchRoute, stops]);

  // ── Live ETA (every GPS tick) ──────────────────────────────────────────────
  useEffect(() => {
    if (!tripStarted || !location?.latitude) return;
    const pending = stops.filter((s) => s.latitude && s.longitude && s.status !== 'completed' && s.status !== 'arrived');
    if (!pending.length) { setStopETAs({}); return; }
    const speedMps = (location.speed ?? 0) > 0.5 ? location.speed : 8.33;
    let prevLat = location.latitude, prevLng = location.longitude, cumMeters = 0;
    const etaMap = {};
    pending.forEach((stop) => {
      cumMeters += metersTo(prevLat, prevLng, stop.latitude, stop.longitude);
      prevLat = stop.latitude; prevLng = stop.longitude;
      const key = stop.id ? String(stop.id) : `name:${stop.name ?? ''}`;
      if (cumMeters <= 300)       etaMap[key] = 'Arrived';
      else {
        const secs = cumMeters / speedMps;
        etaMap[key] = secs < 60 ? '< 1 min' : `${Math.round(secs / 60)} min`;
      }
    });
    setStopETAs(etaMap);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.latitude, location?.longitude, location?.speed, tripStarted, stops.length]);

  // ── Trip controls ──────────────────────────────────────────────────────────
  const handleStart = async () => {
    if (!tripMeta.cabId) console.warn('[DriverActiveTrip] cabId missing');
    const ok = await startTracking();
    if (ok === false) {
      Alert.alert('Location Required', 'Enable location access in Settings.');
      return;
    }
    if (tripId) dispatch(startTrip(tripId));
    lastFetchRef.current = 0;
    setTripStarted(true);
  };

  const allDone = stops.filter((s) => !s.isDestination).length > 0 &&
    stops.filter((s) => !s.isDestination).every((s) => s.status === 'completed' || s.status === 'arrived');

  const handleEnd = () => {
    Alert.alert('End Trip', 'This will log the trip data. Continue?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'End Trip', style: 'destructive', onPress: () => {
        stopTracking();
        if (tripId) dispatch(endTrip({ tripId }));

        // Build summary synchronously from current screen state so TripSummaryScreen
        // doesn't have to wait for the async endTrip thunk to resolve.
        const pickedUpCount = stops.reduce(
          (n, s) => n + (s.employees?.filter(
            (e) => e.status === 'boarded' || e.status === 'picked_up'
          ).length ?? 0),
          0,
        );
        navigation.navigate(SCREENS.TRIP_SUMMARY, {
          summary: {
            tripNumber:   tripNumber,
            vehicle:      vehicleNo,
            vehicleType:  vehicleType,
            startedAt:    activeTrip?.startedAt ?? startTime ?? '',
            endedAt:      new Date().toISOString(),
            totalPickups: pickedUpCount,
            totalStops:   stops.filter((s) => !s.isDestination).length,
            totalDistance: '',
            routeStops:   stops,
          },
        });
      }},
    ]);
  };

  const callEmployee = (phone) => { if (phone) Linking.openURL(`tel:${phone}`).catch(() => {}); };

  // ── Derived display values ─────────────────────────────────────────────────
  const tripNumber  = trip.tripNumber  ?? `Trip #${tripId ?? ''}`;
  const vehicleNo   = trip.vehicle     ?? trip.cabNumber ?? trip.vehicleNo ?? '';
  const vehicleType = trip.vehicleType ?? '';
  const startTime   = trip.scheduledTime ?? trip.pickup?.time ?? '';
  const etaTime     = trip.eta          ?? trip.destination?.eta ?? '';
  const pickupCount = stops.reduce((n, s) => n + (s.employees?.length ?? 0), 0);
  const stopCount   = stops.filter((s) => !s.isDestination).length;

  // Map markers (for active view)
  const markers = stops.filter((s) => s.latitude && s.longitude).map((s, i) => ({
    id: s.id, latitude: s.latitude, longitude: s.longitude,
    title: s.name, label: String(i + 1),
    color: s.status === 'completed' || s.status === 'arrived' ? '#16a34a'
         : s.status === 'next_stop' ? '#643ee8' : '#9e9aa8',
    eta: stopETAs[s.id ? String(s.id) : `name:${s.name ?? ''}`] ?? null,
  }));

  const fallbackPoly = roadPoly.length === 0
    ? stops.filter((s) => s.latitude && s.longitude).map((s) => ({ latitude: s.latitude, longitude: s.longitude }))
    : [];

  // ════════════════════════════════════════════════════════════
  //  STATE 1 — Pre-trip details view
  // ════════════════════════════════════════════════════════════
  if (!tripStarted) {
    return (
      <SafeAreaView style={[ss.root, { backgroundColor: colors.background }]} edges={['top']}>
        {/* Header */}
        <View style={[ss.preHeader, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]}>
          <TouchableOpacity style={ss.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <View style={{ flex: 1, marginHorizontal: 10 }}>
            <Text style={[ss.preHeaderTitle, { color: colors.text }]}>Trip Details</Text>
          </View>
          <View style={ss.startNowBadge}>
            <View style={ss.startNowDot} />
            <Text style={ss.startNowTxt}>Start Now</Text>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
          {/* Vehicle card */}
          <View style={[ss.vehicleCard, { backgroundColor: colors.surface }]}>
            <View style={ss.vehicleCardRow}>
              <Text style={ss.vehicleEmoji}>🚌</Text>
              <View style={{ flex: 1 }}>
                <Text style={[ss.vehicleCardNo, { color: colors.text }]}>
                  {vehicleNo}{vehicleType ? `  ·  ${vehicleType}` : ''}
                </Text>
                <View style={ss.vehicleCardTimes}>
                  {startTime ? <Text style={[ss.vehicleCardTime, { color: colors.textSecondary }]}>Start @ {startTime}</Text> : null}
                  {startTime && etaTime ? <Text style={[ss.vehicleCardDot, { color: colors.textSecondary }]}> ·· </Text> : null}
                  {etaTime   ? <Text style={[ss.vehicleCardTime, { color: colors.textSecondary }]}>ETA @ {etaTime}</Text>    : null}
                </View>
              </View>
            </View>

            <View style={[ss.vehicleCardDivider, { backgroundColor: colors.borderLight }]} />

            {/* Stats */}
            <View style={ss.statsRow}>
              <View style={ss.statBox}>
                <Text style={[ss.statVal, { color: colors.text }]}>{pickupCount}</Text>
                <Text style={[ss.statLbl, { color: colors.textSecondary }]}>Pickups</Text>
              </View>
              <View style={[ss.statDivider, { backgroundColor: colors.borderLight }]} />
              <View style={ss.statBox}>
                <Text style={[ss.statVal, { color: colors.text }]}>{stopCount}</Text>
                <Text style={[ss.statLbl, { color: colors.textSecondary }]}>Stops</Text>
              </View>
            </View>
          </View>

          {/* Route stops */}
          <Text style={[ss.sectionTitle, { color: colors.text }]}>Route Stops</Text>
          <View style={{ paddingHorizontal: 16 }}>
            {stops.length === 0 ? (
              <Text style={[ss.emptyTxt, { color: colors.textSecondary }]}>Loading route…</Text>
            ) : (
              stops.map((stop, idx) => (
                <PreStopRow
                  key={stop.id ?? idx}
                  stop={stop}
                  idx={idx}
                  total={stops.length}
                  colors={colors}
                  onCall={callEmployee}
                />
              ))
            )}
          </View>
        </ScrollView>

        {/* Slide to Start */}
        <View style={[ss.preCTA, { backgroundColor: colors.surface, borderTopColor: colors.borderLight }]}>
          <SlideButton label="Slide to Start Trip" color={colors.primary} onComplete={handleStart} />
        </View>
      </SafeAreaView>
    );
  }

  // ════════════════════════════════════════════════════════════
  //  STATE 2 — Active trip: map + bottom panel
  // ════════════════════════════════════════════════════════════
  return (
    <View style={ss.root}>
      {/* Map */}
      <View style={ss.mapBox}>
        <CrossPlatformMap
          style={StyleSheet.absoluteFillObject}
          region={location
            ? { latitude: location.latitude, longitude: location.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 }
            : DEFAULT_REGION}
          driverLocation={location}
          markers={markers}
          roadRoute={roadPoly}
          polyline={fallbackPoly}
        />
        {/* Floating header */}
        <View style={ss.mapHeader}>
          <TouchableOpacity style={ss.backBtn} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={20} color="#1a1a2e" />
          </TouchableOpacity>
          <View style={{ flex: 1, marginHorizontal: 10 }}>
            <Text style={ss.tripNo}>{tripNumber}</Text>
            {!!vehicleNo && <Text style={ss.vehicleNoSm}>{vehicleNo}</Text>}
          </View>
          <TouchableOpacity style={ss.sosBtn}>
            <Text style={ss.sosTxt}>SOS</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom panel */}
      <View style={[ss.panel, { backgroundColor: colors.surface }]}>
        <View style={ss.handle} />
        <View style={ss.panelHead}>
          <Text style={[ss.panelTitle, { color: colors.text }]}>Trip Details</Text>
          <Text style={[ss.panelSub, { color: colors.textSecondary }]}>Route Stops</Text>
        </View>

        <ScrollView style={ss.list} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 8 }}>
          {stops.length === 0 ? (
            <Text style={[ss.emptyTxt, { color: colors.textSecondary }]}>Loading route…</Text>
          ) : (() => {
            const currentIdx = stops.findIndex(
              (s) => !s.isDestination && s.status !== 'completed' && s.status !== 'arrived'
            );
            return stops.map((stop, idx) => {
              const etaKey = stop.id ? String(stop.id) : `name:${stop.name ?? ''}`;
              return (
                <ActiveStopRow
                  key={stop.id ?? idx}
                  stop={{ ...stop, liveETA: stopETAs[etaKey] ?? null }}
                  isLast={idx === stops.length - 1}
                  isCurrent={idx === currentIdx}
                  colors={colors}
                  onCall={callEmployee}
                  onConfirmAttendance={() => handleStopArrival(stop)}
                />
              );
            });
          })()}
        </ScrollView>

        <View style={[ss.cta, { borderTopColor: colors.borderLight }]}>
          {allDone ? (
            <SlideButton label="Slide to End Trip" color="#dc2626" onComplete={handleEnd} />
          ) : (
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

  // ── Pre-trip ──
  preHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1,
  },
  preHeaderTitle: { fontSize: 18, fontWeight: '700' },
  startNowBadge:  { flexDirection: 'row', alignItems: 'center', gap: 5 },
  startNowDot:    { width: 7, height: 7, borderRadius: 4, backgroundColor: '#16a34a' },
  startNowTxt:    { fontSize: 13, fontWeight: '700', color: '#16a34a' },

  vehicleCard: {
    margin: 16, borderRadius: 16, padding: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  vehicleCardRow:    { flexDirection: 'row', alignItems: 'center', gap: 12 },
  vehicleEmoji:      { fontSize: 28 },
  vehicleCardNo:     { fontSize: 15, fontWeight: '700' },
  vehicleCardTimes:  { flexDirection: 'row', alignItems: 'center', marginTop: 3 },
  vehicleCardTime:   { fontSize: 12 },
  vehicleCardDot:    { fontSize: 12 },
  vehicleCardDivider:{ height: 1, marginVertical: 14 },
  statsRow:          { flexDirection: 'row', alignItems: 'center' },
  statBox:           { flex: 1, alignItems: 'center', paddingVertical: 4 },
  statVal:           { fontSize: 20, fontWeight: '800' },
  statLbl:           { fontSize: 11, marginTop: 2 },
  statDivider:       { width: 1, height: 32 },

  sectionTitle: { fontSize: 16, fontWeight: '700', marginHorizontal: 16, marginBottom: 12 },

  preCTA: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 28,
    borderTopWidth: 1,
  },

  // ── Map view ──
  mapBox: { flex: 1, position: 'relative' },
  mapHeader: {
    position: 'absolute', top: 12, left: 12, right: 12,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 14,
    paddingHorizontal: 12, paddingVertical: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14, shadowRadius: 8, elevation: 5,
  },
  tripNo:     { fontSize: 14, fontWeight: '700', color: '#1a1a2e' },
  vehicleNoSm:{ fontSize: 11, color: '#6b7280', marginTop: 1 },
  sosBtn: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 11, paddingVertical: 5, borderRadius: 7,
  },
  sosTxt: { color: '#fff', fontWeight: '700', fontSize: 12 },

  panel: {
    height: PANEL_H, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08, shadowRadius: 10, elevation: 8, overflow: 'hidden',
  },
  handle: {
    width: 40, height: 4, borderRadius: 2, backgroundColor: '#e5e7eb',
    alignSelf: 'center', marginTop: 10, marginBottom: 6,
  },
  panelHead: { flexDirection: 'row', alignItems: 'baseline', paddingHorizontal: 18, paddingBottom: 8, gap: 8 },
  panelTitle: { fontSize: 17, fontWeight: '700' },
  panelSub:   { fontSize: 12, fontWeight: '500' },

  list: { flex: 1, paddingHorizontal: 14 },
  emptyTxt: { textAlign: 'center', paddingVertical: 20, fontSize: 13 },

  cta: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12, borderTopWidth: 1 },
  inProgressBar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, height: 44, borderRadius: 12,
  },
  inProgressTxt: { fontSize: 13, fontWeight: '600' },

  // ── Slide button ──
  slideTrack: {
    height: THUMB_SIZE + 8, borderRadius: (THUMB_SIZE + 8) / 2, borderWidth: 1.5,
    paddingHorizontal: 4, justifyContent: 'center', alignItems: 'center',
    overflow: 'hidden', position: 'relative',
  },
  slideLabel: { fontSize: 15, fontWeight: '500', position: 'absolute' },
  slideThumb: {
    position: 'absolute', left: 4, width: THUMB_SIZE, height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 6, elevation: 4,
  },

  // ── Shared stop row ──
  row:  { flexDirection: 'row', minHeight: 48 },
  tl:   { width: 28, alignItems: 'center', paddingTop: 12 },
  dot: {
    width: 18, height: 18, borderRadius: 9, borderWidth: 2.5,
    alignItems: 'center', justifyContent: 'center',
  },
  line: { flex: 1, width: 2, marginTop: 4, minHeight: 16, borderLeftWidth: 2, borderStyle: 'dashed' },
  content: {
    flex: 1, paddingTop: 8, paddingBottom: 10, marginLeft: 8,
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  rowHead:     { flexDirection: 'row', alignItems: 'flex-start' },
  stopTime:    { fontSize: 11, marginBottom: 1 },
  stopName:    { fontSize: 13, fontWeight: '700' },
  liveETA:     { fontSize: 11, fontWeight: '600', marginTop: 3 },
  avatarRow:   { flexDirection: 'row', alignItems: 'center', marginHorizontal: 6, marginTop: 10 },
  statusBadge: { fontSize: 11, fontWeight: '700', marginTop: 12, marginLeft: 4 },

  empBlock: { marginTop: 8 },
  empRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 7, borderBottomWidth: 1, gap: 10,
  },
  empName:    { flex: 1, fontSize: 13, fontWeight: '500' },
  callBtn: {
    width: 34, height: 34, borderRadius: 9, borderWidth: 1,
    alignItems: 'center', justifyContent: 'center',
  },
  outcomePill: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 999 },

  backBtn: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: '#f5f4f9', alignItems: 'center', justifyContent: 'center',
  },
});

export default DriverActiveTripScreen;
