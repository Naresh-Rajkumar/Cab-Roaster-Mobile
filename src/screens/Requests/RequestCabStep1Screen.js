import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useSelector } from 'react-redux';
import { useTheme } from '../../theme/ThemeProvider';
import { configService } from '../../services/api/configService';
import { SCREENS } from '../../constants';
import spacing from '../../theme/spacing.json';
import { nominatimSearch, nominatimReverse } from '../../utils/nominatimSearch';
import CrossPlatformMap from '../../components/common/CrossPlatformMap';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const unwrap = (res) => {
  const body = res?.data;
  if (body?.data) return body.data;
  if (Array.isArray(body)) return body;
  return body ?? [];
};

function normalizeStopsList(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray(raw.rows)) return raw.rows;
  return [];
}

function stopMatchesQuery(stop, filter) {
  const q = filter.trim().toLowerCase();
  if (!q) return true;
  const name = String(stop.name || stop.stopName || '').toLowerCase();
  const area = String(stop.area || '').toLowerCase();
  const landmark = String(stop.landmark || '').toLowerCase();
  return name.includes(q) || area.includes(q) || landmark.includes(q);
}

const haversineKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const DEFAULT_REGION = { latitude: 12.9279, longitude: 80.2088, latitudeDelta: 0.05, longitudeDelta: 0.05 };

/**
 * Fetch a road-following route from OSRM between two coordinate points.
 * Returns an array of { latitude, longitude } or [] on failure.
 */
/**
 * Fetch a road-following route from OSRM.
 * Returns { coords: [{latitude, longitude}], distanceKm: number }
 * or null on failure (aborted / all servers down).
 *
 * Tries two public OSRM instances in sequence so a single server
 * outage / rate-limit doesn't silently kill the route.
 */
async function fetchOsrmRoute(from, to, signal) {
  const SERVERS = [
    'https://router.project-osrm.org',
    'https://routing.openstreetmap.de/routed-car',
  ];

  for (const server of SERVERS) {
    if (signal?.aborted) return null;
    try {
      const url =
        `${server}/route/v1/driving/` +
        `${from.longitude},${from.latitude};${to.longitude},${to.latitude}` +
        `?overview=full&geometries=geojson`;
      const res = await fetch(url, { signal });
      const data = await res.json();
      const route = data?.routes?.[0];
      if (!route) continue;
      const coords = route.geometry?.coordinates;
      if (!Array.isArray(coords) || coords.length < 2) continue;
      return {
        coords: coords.map(([lng, lat]) => ({ latitude: lat, longitude: lng })),
        distanceKm: route.distance / 1000,   // metres → km
      };
    } catch {
      if (signal?.aborted) return null;
      // try next server
    }
  }
  return null;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

const RequestCabStep1Screen = ({ navigation }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const user = useSelector((state) => state.auth.user);

  // Data
  const [workLocations, setWorkLocations] = useState([]);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);

  // Map
  const [mapRegion, setMapRegion] = useState(DEFAULT_REGION);
  const [currentLocation, setCurrentLocation] = useState(null); // GPS "you are here" dot
  const [reverseGeocoding, setReverseGeocoding] = useState(false);
  const [pickupRouteCoords, setPickupRouteCoords] = useState([]);
  const [dropRouteCoords, setDropRouteCoords] = useState([]);
  const [pickupRoadDistKm, setPickupRoadDistKm] = useState(null);
  const [dropRoadDistKm, setDropRoadDistKm] = useState(null);
  const pickupRouteAbortRef = useRef(null);
  const dropRouteAbortRef = useRef(null);

  // Form
  const [workLocation, setWorkLocation] = useState('');
  const [cabPreference, setCabPreference] = useState('both');
  const [homeLocation, setHomeLocation] = useState('');
  const [homeCoords, setHomeCoords] = useState(null);
  const [homeSuggestions, setHomeSuggestions] = useState([]);
  const [homeSearchLoading, setHomeSearchLoading] = useState(false);
  const skipHomeSearchRef = useRef(false);
  const homeSearchAbortRef = useRef(null);
  const reverseAbortRef = useRef(null);

  const [differentDrop, setDifferentDrop] = useState(false);
  const [pickupStop, setPickupStop] = useState(null);
  const [dropStop, setDropStop] = useState(null);
  const [pickupFilter, setPickupFilter] = useState('');
  const [dropFilter, setDropFilter] = useState('');
  const [showPickupDropdown, setShowPickupDropdown] = useState(false);
  const [showDropDropdown, setShowDropDropdown] = useState(false);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const userName = user?.name?.split(' ')[0] || user?.firstName || 'User';
  const initials = (user?.name || 'U').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase();

  // ── Reset stops / differentDrop when preference changes ───────────
  useEffect(() => {
    // When switching away from 'both', hide different-drop UI and clear drop stop
    if (cabPreference !== 'both') {
      setDifferentDrop(false);
      setShowDropDropdown(false);
    }
    // Clear stop selections and cached routes on preference switch
    setPickupStop(null);
    setDropStop(null);
    setPickupRouteCoords([]);
    setDropRouteCoords([]);
    setPickupRoadDistKm(null);
    setDropRoadDistKm(null);
    setShowPickupDropdown(false);
    setShowDropDropdown(false);
    setPickupFilter('');
    setDropFilter('');
  }, [cabPreference]);

  // ── Init: GPS + config data ────────────────────────────────────────

  useEffect(() => {
    const init = async () => {
      // Get GPS in background
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          const { latitude, longitude } = pos.coords;
          setCurrentLocation({ latitude, longitude });
          setMapRegion({ latitude, longitude, latitudeDelta: 0.04, longitudeDelta: 0.04 });
        }
      } catch (_) {}

      // Load config
      try {
        const [locRes, stopsRes] = await Promise.all([
          configService.getWorkLocations(),
          configService.getStops(),
        ]);
        const locs = unwrap(locRes);
        const stps = normalizeStopsList(unwrap(stopsRes));
        setWorkLocations(Array.isArray(locs) ? locs : []);
        setStops(stps);
        if (Array.isArray(locs) && locs.length > 0) {
          setWorkLocation(locs[0].name || locs[0].id);
        }
      } catch (err) {
        console.warn('Failed to load config:', err.message);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // ── Forward address search ─────────────────────────────────────────

  useEffect(() => {
    const q = homeLocation.trim();
    if (q.length < 3) { setHomeSuggestions([]); setHomeSearchLoading(false); return; }
    if (skipHomeSearchRef.current) { skipHomeSearchRef.current = false; setHomeSuggestions([]); return; }
    homeSearchAbortRef.current?.abort();
    const ac = new AbortController();
    homeSearchAbortRef.current = ac;
    const t = setTimeout(() => {
      setHomeSearchLoading(true);
      nominatimSearch(q, { signal: ac.signal, limit: 8 })
        .then((rows) => { if (!ac.signal.aborted) setHomeSuggestions(rows); })
        .finally(() => { if (!ac.signal.aborted) setHomeSearchLoading(false); });
    }, 450);
    return () => { clearTimeout(t); ac.abort(); };
  }, [homeLocation]);

  // ── Reverse geocode helper ─────────────────────────────────────────

  const applyCoords = useCallback(async (latitude, longitude) => {
    setHomeCoords({ latitude, longitude });
    setMapRegion({ latitude, longitude, latitudeDelta: 0.025, longitudeDelta: 0.025 });
    setHomeSuggestions([]);

    // Reverse geocode to fill address text
    reverseAbortRef.current?.abort();
    const ac = new AbortController();
    reverseAbortRef.current = ac;
    setReverseGeocoding(true);
    skipHomeSearchRef.current = true;
    try {
      const addr = await nominatimReverse(latitude, longitude, { signal: ac.signal });
      if (!ac.signal.aborted && addr) {
        skipHomeSearchRef.current = true;
        setHomeLocation(addr);
      }
    } finally {
      if (!ac.signal.aborted) setReverseGeocoding(false);
    }
  }, []);

  // ── "Use my location" button ───────────────────────────────────────

  const handleUseMyLocation = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      setReverseGeocoding(true);
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = pos.coords;
      setCurrentLocation({ latitude, longitude });
      await applyCoords(latitude, longitude);
    } catch (err) {
      console.warn('Location error:', err.message);
      setReverseGeocoding(false);
    }
  }, [applyCoords]);

  // ── Map tap handler ────────────────────────────────────────────────

  const handleMapPress = useCallback(({ latitude, longitude }) => {
    applyCoords(latitude, longitude);
  }, [applyCoords]);

  // ── Fetch pickup route (home → pickup stop) ────────────────────────

  useEffect(() => {
    const shouldFetch =
      homeCoords?.latitude && homeCoords?.longitude &&
      pickupStop?.latitude && pickupStop?.longitude &&
      (cabPreference === 'pickup' || cabPreference === 'both');

    if (!shouldFetch) {
      setPickupRouteCoords([]);
      setPickupRoadDistKm(null);
      return;
    }

    pickupRouteAbortRef.current?.abort();
    const ac = new AbortController();
    pickupRouteAbortRef.current = ac;

    fetchOsrmRoute(homeCoords, pickupStop, ac.signal).then((result) => {
      if (ac.signal.aborted) return;
      if (result) {
        setPickupRouteCoords(result.coords);
        setPickupRoadDistKm(result.distanceKm);
      } else {
        setPickupRouteCoords([]);
        setPickupRoadDistKm(null);
      }
    });

    return () => ac.abort();
  }, [homeCoords?.latitude, homeCoords?.longitude, pickupStop?.latitude, pickupStop?.longitude, cabPreference]);

  // ── Fetch drop route (home → drop stop) ───────────────────────────

  useEffect(() => {
    const shouldFetch =
      homeCoords?.latitude && homeCoords?.longitude &&
      dropStop?.latitude && dropStop?.longitude &&
      (cabPreference === 'dropoff' || (cabPreference === 'both' && differentDrop));

    if (!shouldFetch) {
      setDropRouteCoords([]);
      setDropRoadDistKm(null);
      return;
    }

    dropRouteAbortRef.current?.abort();
    const ac = new AbortController();
    dropRouteAbortRef.current = ac;

    fetchOsrmRoute(homeCoords, dropStop, ac.signal).then((result) => {
      if (ac.signal.aborted) return;
      if (result) {
        setDropRouteCoords(result.coords);
        setDropRoadDistKm(result.distanceKm);
      } else {
        setDropRouteCoords([]);
        setDropRoadDistKm(null);
      }
    });

    return () => ac.abort();
  }, [homeCoords?.latitude, homeCoords?.longitude, dropStop?.latitude, dropStop?.longitude, cabPreference, differentDrop]);

  // ── Select nominatim suggestion ────────────────────────────────────

  const selectHomeSuggestion = (item) => {
    skipHomeSearchRef.current = true;
    setHomeLocation(item.display_name || '');
    setHomeSuggestions([]);
    setHomeSearchLoading(false);
    if (item.lat && item.lon) {
      const lat = parseFloat(item.lat);
      const lon = parseFloat(item.lon);
      setHomeCoords({ latitude: lat, longitude: lon });
      setMapRegion({ latitude: lat, longitude: lon, latitudeDelta: 0.025, longitudeDelta: 0.025 });
    }
  };

  // ── Toggle different-drop ──────────────────────────────────────────

  const toggleDifferentDrop = () => {
    const next = !differentDrop;
    setDifferentDrop(next);
    if (!next) {
      // Turning off: clear drop stop, route, distance and close dropdown
      setDropStop(null);
      setDropRouteCoords([]);
      setDropRoadDistKm(null);
      setShowDropDropdown(false);
      setDropFilter('');
    }
  };

  // ── Stop dropdowns ─────────────────────────────────────────────────

  // Exclude already-selected drop stop from pickup list (and vice versa) when differentDrop
  const filteredPickupStops = useMemo(
    () => stops.filter((s) => {
      if (!stopMatchesQuery(s, pickupFilter)) return false;
      if (differentDrop && dropStop && String(s.id) === String(dropStop.id)) return false;
      return true;
    }),
    [stops, pickupFilter, differentDrop, dropStop],
  );

  const filteredDropStops = useMemo(
    () => stops.filter((s) => {
      if (!stopMatchesQuery(s, dropFilter)) return false;
      if (differentDrop && pickupStop && String(s.id) === String(pickupStop.id)) return false;
      return true;
    }),
    [stops, dropFilter, differentDrop, pickupStop],
  );

  const togglePickupDropdown = () => {
    const next = !showPickupDropdown;
    setShowPickupDropdown(next);
    setShowDropDropdown(false);
    if (next) setPickupFilter('');
  };
  const toggleDropDropdown = () => {
    const next = !showDropDropdown;
    setShowDropDropdown(next);
    setShowPickupDropdown(false);
    if (next) setDropFilter('');
  };

  // ── Map markers + distance ─────────────────────────────────────────

  const mapMarkers = useMemo(() => {
    const m = [];
    if (homeCoords) {
      m.push({ id: 'home', latitude: homeCoords.latitude, longitude: homeCoords.longitude, title: 'Home', label: 'H', color: '#2563EB' });
    }

    if (cabPreference === 'both') {
      if (!differentDrop) {
        // Single P&D marker — same stop for pickup and drop
        if (pickupStop?.latitude && pickupStop?.longitude) {
          m.push({ id: 'pd', latitude: pickupStop.latitude, longitude: pickupStop.longitude, title: pickupStop.name, label: 'P', color: '#643ee8' });
        }
      } else {
        // Separate P and D markers
        if (pickupStop?.latitude && pickupStop?.longitude) {
          m.push({ id: 'pickup', latitude: pickupStop.latitude, longitude: pickupStop.longitude, title: `Pickup: ${pickupStop.name}`, label: 'P', color: '#643ee8' });
        }
        if (dropStop?.latitude && dropStop?.longitude) {
          m.push({ id: 'drop', latitude: dropStop.latitude, longitude: dropStop.longitude, title: `Drop: ${dropStop.name}`, label: 'D', color: '#E84E3E' });
        }
      }
    } else if (cabPreference === 'pickup') {
      if (pickupStop?.latitude && pickupStop?.longitude) {
        m.push({ id: 'pickup', latitude: pickupStop.latitude, longitude: pickupStop.longitude, title: pickupStop.name, label: 'P', color: '#643ee8' });
      }
    } else if (cabPreference === 'dropoff') {
      if (dropStop?.latitude && dropStop?.longitude) {
        m.push({ id: 'drop', latitude: dropStop.latitude, longitude: dropStop.longitude, title: dropStop.name, label: 'D', color: '#E84E3E' });
      }
    }

    return m;
  }, [homeCoords, pickupStop, dropStop, cabPreference, differentDrop]);

  // Distance: home → pickup — road km from OSRM, haversine while loading
  const distancePickupKm = useMemo(() => {
    if (!homeCoords || !(cabPreference === 'pickup' || cabPreference === 'both')) return null;
    if (!pickupStop?.latitude || !pickupStop?.longitude) return null;
    // Prefer road distance once OSRM resolves; show haversine immediately as estimate
    return pickupRoadDistKm ??
      haversineKm(homeCoords.latitude, homeCoords.longitude, pickupStop.latitude, pickupStop.longitude);
  }, [homeCoords, pickupStop, cabPreference, pickupRoadDistKm]);

  // Distance: home → drop — road km from OSRM, haversine while loading
  const distanceDropKm = useMemo(() => {
    if (!homeCoords) return null;
    if (!(cabPreference === 'dropoff' || (cabPreference === 'both' && differentDrop))) return null;
    if (!dropStop?.latitude || !dropStop?.longitude) return null;
    return dropRoadDistKm ??
      haversineKm(homeCoords.latitude, homeCoords.longitude, dropStop.latitude, dropStop.longitude);
  }, [homeCoords, dropStop, cabPreference, differentDrop, dropRoadDistKm]);

  // ── Validation ─────────────────────────────────────────────────────

  const canContinue = (() => {
    if (!homeLocation.trim()) return false;
    if (cabPreference === 'pickup') return !!pickupStop?.id;
    if (cabPreference === 'dropoff') return !!dropStop?.id;
    // both
    if (!pickupStop?.id) return false;
    if (differentDrop) return !!dropStop?.id && String(pickupStop.id) !== String(dropStop.id);
    return true;
  })();

  // ── Continue ───────────────────────────────────────────────────────

  const handleContinue = () => {
    if (!canContinue) return;

    let resolvedPickup = null;
    let resolvedDrop = null;

    if (cabPreference === 'pickup') {
      resolvedPickup = { id: pickupStop.id, name: pickupStop.name };
      resolvedDrop = null;
    } else if (cabPreference === 'dropoff') {
      resolvedPickup = null;
      resolvedDrop = { id: dropStop.id, name: dropStop.name };
    } else {
      // both
      resolvedPickup = { id: pickupStop.id, name: pickupStop.name };
      resolvedDrop = differentDrop && dropStop
        ? { id: dropStop.id, name: dropStop.name }
        : { id: pickupStop.id, name: pickupStop.name }; // same stop when not differentDrop
    }

    navigation.navigate(SCREENS.REQUEST_CAB_STEP2, {
      workLocation,
      cabPreference,
      homeLocation: homeLocation.trim(),
      homeCoords,
      pickupStop: resolvedPickup,
      dropStop: resolvedDrop,
    });
  };

  // ── Loading ────────────────────────────────────────────────────────

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  // ── Section title helpers ──────────────────────────────────────────

  const stopSectionTitle = cabPreference === 'pickup'
    ? 'Pickup Point'
    : cabPreference === 'dropoff'
      ? 'Drop Point'
      : 'Pickup & Drop Point';

  // ── Render ────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <View style={{ marginLeft: spacing.md }}>
          <Text style={[styles.greetingTxt, { color: colors.textSecondary }]}>{greeting},</Text>
          <Text style={[styles.greetingName, { color: colors.text }]}>{userName}!</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* Title */}
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.text }]}>Ride Scheduling Setup</Text>
          <Text style={[styles.stepBadge, { color: colors.textSecondary }]}>1 of 2</Text>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: colors.border || '#E5E7EB' }]}>
          <View style={[styles.progressFill, { backgroundColor: colors.primary }]} />
        </View>

        {/* Work Location */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Work Location <Req c={colors.primary} /></Text>
          {workLocations.length > 0 ? (
            <View style={[styles.segmented, { borderColor: colors.primary }]}>
              {workLocations.map((loc, idx) => {
                const name = loc.name || loc.locationName || `Location ${idx + 1}`;
                const active = workLocation === name;
                return (
                  <TouchableOpacity
                    key={loc.id || idx}
                    style={[
                      styles.segTab,
                      idx === 0 && styles.segFirst,
                      idx === workLocations.length - 1 && styles.segLast,
                      { backgroundColor: active ? colors.primary : 'transparent' },
                    ]}
                    onPress={() => setWorkLocation(name)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.segText, { color: active ? '#FFF' : colors.primary }]}>{name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <Text style={{ color: colors.textSecondary, fontSize: 14 }}>No work locations configured</Text>
          )}
        </View>

        {/* Cab Usage Preference */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Cab Usage Preference <Req c={colors.primary} /></Text>
          <View style={styles.radioRow}>
            {[{ v: 'both', l: 'Both' }, { v: 'pickup', l: 'Pickup' }, { v: 'dropoff', l: 'Drop off' }].map((opt) => {
              const on = cabPreference === opt.v;
              return (
                <TouchableOpacity key={opt.v} style={styles.radioItem} onPress={() => setCabPreference(opt.v)} activeOpacity={0.7}>
                  <View style={[styles.radioOuter, { borderColor: on ? colors.primary : colors.border || '#D1D5DB' }]}>
                    {on && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                  </View>
                  <Text style={[styles.radioTxt, { color: on ? colors.primary : colors.text, fontWeight: on ? '600' : '400' }]}>{opt.l}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Home Location */}
        <View style={styles.section}>
          <Text style={[styles.label, { color: colors.text }]}>Home Location <Req c={colors.primary} /></Text>
          <Text style={[styles.hint, { color: colors.textSecondary }]}>
            Search an address, tap the map, or use your current location.
          </Text>

          {/* Input + locate button row */}
          <View style={styles.homeInputRow}>
            <View style={[
              styles.inputBox,
              {
                flex: 1,
                backgroundColor: '#FFF',
                borderColor: homeCoords ? colors.primary : (colors.border || '#E5E7EB'),
              },
            ]}>
              <Ionicons
                name={homeCoords ? 'location' : 'location-outline'}
                size={20}
                color={homeCoords ? colors.primary : colors.textSecondary}
                style={{ marginRight: spacing.sm }}
              />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                value={homeLocation}
                onChangeText={(v) => {
                  setHomeLocation(v);
                  if (homeCoords) setHomeCoords(null);
                }}
                placeholder="Search your home address"
                placeholderTextColor={colors.textTertiary || '#9CA3AF'}
                autoCorrect={false}
                autoCapitalize="words"
              />
              {(homeSearchLoading || reverseGeocoding)
                ? <ActivityIndicator size="small" color={colors.primary} />
                : homeCoords
                  ? <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
                  : null}
            </View>

            {/* "Use my location" button */}
            <TouchableOpacity
              style={[styles.locateBtn, { backgroundColor: colors.primary }]}
              onPress={handleUseMyLocation}
              activeOpacity={0.8}
              disabled={reverseGeocoding}
            >
              {reverseGeocoding
                ? <ActivityIndicator size="small" color="#FFF" />
                : <Ionicons name="navigate" size={20} color="#FFF" />}
            </TouchableOpacity>
          </View>

          {/* Suggestions */}
          {homeSuggestions.length > 0 && (
            <View style={[styles.suggestBox, { borderColor: colors.border || '#E5E7EB' }]}>
              <ScrollView style={{ maxHeight: 200 }} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
                {homeSuggestions.map((item, idx) => (
                  <TouchableOpacity
                    key={item.place_id ?? item.osm_id ?? idx}
                    style={[styles.suggestRow, { borderBottomColor: colors.border || '#F3F4F6' }]}
                    onPress={() => selectHomeSuggestion(item)}
                  >
                    <Ionicons name="location-outline" size={13} color={colors.textSecondary} style={{ marginRight: 6, marginTop: 2 }} />
                    <Text style={[styles.suggestTxt, { color: colors.text }]} numberOfLines={2}>{item.display_name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        {/* ── Pickup / Drop Point Section ───────────────────────────── */}
        <View style={styles.section}>

          {/* Section header */}
          <View style={styles.pickupHeader}>
            <Text style={[styles.label, { color: colors.text }]}>{stopSectionTitle} <Req c={colors.primary} /></Text>

            {/* "Different Drop" checkbox — only visible when cabPreference === 'both' */}
            {cabPreference === 'both' && (
              <TouchableOpacity style={styles.checkRow} onPress={toggleDifferentDrop} activeOpacity={0.7}>
                <View style={[styles.checkbox, {
                  borderColor: differentDrop ? colors.primary : colors.border || '#D1D5DB',
                  backgroundColor: differentDrop ? colors.primary : '#FFF',
                }]}>
                  {differentDrop && <Ionicons name="checkmark" size={11} color="#FFF" />}
                </View>
                <Text style={[styles.checkTxt, { color: colors.textSecondary }]}>Different Drop</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* ── Pickup dropdown ─────────────────────────────────── */}
          {/* Show for 'pickup' and 'both' preferences */}
          {(cabPreference === 'pickup' || cabPreference === 'both') && (
            <>
              {/* Sub-label only when both + differentDrop (to clarify which is which) */}
              {cabPreference === 'both' && differentDrop && (
                <Text style={[styles.subLabel, { color: colors.textSecondary }]}>Pickup Point</Text>
              )}

              <TouchableOpacity
                style={[styles.dropdown, {
                  backgroundColor: '#FFF',
                  borderColor: pickupStop ? colors.primary : (colors.border || '#E5E7EB'),
                }]}
                onPress={togglePickupDropdown}
                activeOpacity={0.8}
              >
                <Ionicons name="bus" size={18} color={pickupStop ? colors.primary : colors.textSecondary} style={{ marginRight: spacing.sm }} />
                <Text style={[styles.dropText, { color: pickupStop ? colors.text : colors.textTertiary || '#9CA3AF', flex: 1 }]}>
                  {pickupStop ? pickupStop.name : 'Select pickup point'}
                </Text>
                <Ionicons name={showPickupDropdown ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} />
              </TouchableOpacity>

              {showPickupDropdown && (
                <StopList
                  stops={filteredPickupStops}
                  filter={pickupFilter}
                  onFilterChange={setPickupFilter}
                  colors={colors}
                  onSelect={(stop, label) => {
                    const lat = stop.latitude ? parseFloat(stop.latitude) : null;
                    const lon = stop.longitude ? parseFloat(stop.longitude) : null;
                    setPickupStop({ id: stop.id, name: label, latitude: lat, longitude: lon });
                    setShowPickupDropdown(false);
                    setPickupFilter('');
                    if (!homeCoords && lat && lon) {
                      setMapRegion({ latitude: lat, longitude: lon, latitudeDelta: 0.03, longitudeDelta: 0.03 });
                    }
                  }}
                />
              )}
            </>
          )}

          {/* ── Drop dropdown ────────────────────────────────────── */}
          {/* Show for 'dropoff' preference, or for 'both' when differentDrop is checked */}
          {(cabPreference === 'dropoff' || (cabPreference === 'both' && differentDrop)) && (
            <>
              {/* Sub-label only when both + differentDrop */}
              {cabPreference === 'both' && differentDrop && (
                <Text style={[styles.subLabel, { color: colors.textSecondary, marginTop: spacing.md }]}>Drop Point</Text>
              )}

              <TouchableOpacity
                style={[styles.dropdown, {
                  backgroundColor: '#FFF',
                  borderColor: dropStop ? colors.primary : (colors.border || '#E5E7EB'),
                  marginTop: cabPreference === 'dropoff' ? 0 : undefined,
                }]}
                onPress={toggleDropDropdown}
                activeOpacity={0.8}
              >
                <Ionicons name="location" size={18} color={dropStop ? '#E84E3E' : colors.textSecondary} style={{ marginRight: spacing.sm }} />
                <Text style={[styles.dropText, { color: dropStop ? colors.text : colors.textTertiary || '#9CA3AF', flex: 1 }]}>
                  {dropStop ? dropStop.name : 'Select drop point'}
                </Text>
                <Ionicons name={showDropDropdown ? 'chevron-up' : 'chevron-down'} size={18} color={colors.textSecondary} />
              </TouchableOpacity>

              {showDropDropdown && (
                <StopList
                  stops={filteredDropStops}
                  filter={dropFilter}
                  onFilterChange={setDropFilter}
                  colors={colors}
                  onSelect={(stop, label) => {
                    const lat = stop.latitude ? parseFloat(stop.latitude) : null;
                    const lon = stop.longitude ? parseFloat(stop.longitude) : null;
                    setDropStop({ id: stop.id, name: label, latitude: lat, longitude: lon });
                    setShowDropDropdown(false);
                    setDropFilter('');
                  }}
                />
              )}
            </>
          )}
        </View>

        {/* ── Map (always visible) ──────────────────────────────────── */}
        <View style={styles.section}>
          <View style={styles.mapLabelRow}>
            <Text style={[styles.label, { color: colors.text }]}>Location Preview</Text>
            <Text style={[styles.mapTapHint, { color: colors.textSecondary }]}>
              Tap map to set home
            </Text>
          </View>

          <View style={styles.mapCard}>
            <CrossPlatformMap
              region={mapRegion}
              markers={mapMarkers}
              currentLocation={currentLocation}
              roadRoute={pickupRouteCoords}
              dropRoadRoute={dropRouteCoords}
              style={styles.mapStyle}
              onMapPress={handleMapPress}
            />

            {/* Distance badges — stacked, one per relevant stop */}
            <View style={styles.distBadgeStack}>
              {distancePickupKm !== null && (
                <View style={[styles.distBadge, { backgroundColor: colors.primary }]}>
                  <Ionicons name="navigate" size={12} color="#FFF" />
                  <Text style={styles.distBadgeTxt}>
                    {distancePickupKm < 1
                      ? `${Math.round(distancePickupKm * 1000)} m to pickup`
                      : `${distancePickupKm.toFixed(1)} km to pickup`}
                  </Text>
                </View>
              )}
              {distanceDropKm !== null && (
                <View style={[styles.distBadge, { backgroundColor: '#E84E3E' }]}>
                  <Ionicons name="navigate" size={12} color="#FFF" />
                  <Text style={styles.distBadgeTxt}>
                    {distanceDropKm < 1
                      ? `${Math.round(distanceDropKm * 1000)} m to drop`
                      : `${distanceDropKm.toFixed(1)} km to drop`}
                  </Text>
                </View>
              )}
            </View>

            {/* Empty state hint */}
            {mapMarkers.length === 0 && !reverseGeocoding && (
              <View style={styles.mapOverlayHint}>
                <Ionicons name="information-circle-outline" size={14} color="#FFF" />
                <Text style={styles.mapOverlayTxt}>Tap map or use locate button to set home</Text>
              </View>
            )}

            {/* Reverse geocoding overlay */}
            {reverseGeocoding && (
              <View style={[styles.mapOverlayHint, { backgroundColor: 'rgba(100,62,232,0.7)' }]}>
                <ActivityIndicator size="small" color="#FFF" />
                <Text style={styles.mapOverlayTxt}>Getting address…</Text>
              </View>
            )}

            {/* Legend */}
            {mapMarkers.length > 0 && (
              <View style={[styles.legend, { backgroundColor: 'rgba(255,255,255,0.92)' }]}>
                {homeCoords && (
                  <View style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: '#2563EB' }]} />
                    <Text style={styles.legendTxt}>Home</Text>
                  </View>
                )}
                {currentLocation && (
                  <View style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: '#2563EB', opacity: 0.4 }]} />
                    <Text style={styles.legendTxt}>You</Text>
                  </View>
                )}
                {/* Pickup marker legend */}
                {(cabPreference === 'pickup' || cabPreference === 'both') && pickupStop?.latitude && (
                  <View style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: '#643ee8' }]} />
                    <Text style={styles.legendTxt}>
                      {cabPreference === 'both' && !differentDrop ? 'P & D' : 'Pickup'}
                    </Text>
                  </View>
                )}
                {/* Drop marker legend */}
                {(cabPreference === 'dropoff' || (cabPreference === 'both' && differentDrop)) && dropStop?.latitude && (
                  <View style={styles.legendRow}>
                    <View style={[styles.legendDot, { backgroundColor: '#E84E3E' }]} />
                    <Text style={styles.legendTxt}>Drop</Text>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>

        <View style={{ height: spacing.xxxxl }} />
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: colors.background, borderTopColor: colors.border || '#F3F4F6' }]}>
        <TouchableOpacity
          style={[styles.continueBtn, { backgroundColor: canContinue ? colors.primary : (colors.border || '#D1D5DB') }]}
          onPress={handleContinue}
          activeOpacity={0.85}
          disabled={!canContinue}
        >
          <Text style={styles.continueBtnTxt}>Continue  →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ─── Helper mini-components ───────────────────────────────────────────────────

const Req = ({ c }) => <Text style={{ color: c }}>*</Text>;

const StopList = ({ stops, filter, onFilterChange, colors, onSelect }) => (
  <View style={[styles.dropList, { backgroundColor: '#FFF', borderColor: colors.border || '#E5E7EB' }]}>
    <View style={[styles.dropSearch, { borderBottomColor: colors.border || '#E5E7EB', backgroundColor: '#F9FAFB' }]}>
      <Ionicons name="search-outline" size={16} color={colors.textTertiary} style={{ marginRight: 6 }} />
      <TextInput
        style={[styles.dropSearchInput, { color: colors.text }]}
        value={filter}
        onChangeText={onFilterChange}
        placeholder="Search stops…"
        placeholderTextColor={colors.textTertiary}
        autoFocus={Platform.OS !== 'web'}
      />
    </View>
    <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled keyboardShouldPersistTaps="handled">
      {stops.length === 0
        ? <Text style={[styles.emptyTxt, { color: colors.textSecondary }]}>No matching stops</Text>
        : stops.map((stop) => {
            const label = stop.name || stop.stopName || `Stop ${stop.id}`;
            return (
              <TouchableOpacity key={stop.id} style={styles.dropItem} onPress={() => onSelect(stop, label)}>
                <Text style={[styles.dropItemTxt, { color: colors.text }]}>{label}</Text>
                {stop.area && stop.area !== '-' && (
                  <Text style={[styles.dropItemSub, { color: colors.textSecondary }]}>{stop.area}</Text>
                )}
              </TouchableOpacity>
            );
          })}
    </ScrollView>
  </View>
);

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.base, paddingTop: spacing.md, paddingBottom: spacing.sm },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  greetingTxt: { fontSize: 13, lineHeight: 18 },
  greetingName: { fontSize: 15, lineHeight: 20, fontWeight: '700' },

  scroll: { paddingHorizontal: spacing.base, paddingTop: spacing.md },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  title: { fontSize: 20, fontWeight: '700' },
  stepBadge: { fontSize: 13 },
  progressTrack: { height: 6, borderRadius: 99, overflow: 'hidden', marginBottom: spacing.xl },
  progressFill: { height: '100%', borderRadius: 99, width: '100%' },

  section: { marginBottom: spacing.xl },
  label: { fontSize: 15, fontWeight: '600', marginBottom: spacing.sm },
  subLabel: { fontSize: 13, fontWeight: '500', marginBottom: 6 },
  hint: { fontSize: 12, marginBottom: spacing.sm },

  // Segmented
  segmented: { flexDirection: 'row', borderWidth: 1.5, borderRadius: 99, overflow: 'hidden' },
  segTab: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', justifyContent: 'center' },
  segFirst: { borderTopLeftRadius: 99, borderBottomLeftRadius: 99 },
  segLast: { borderTopRightRadius: 99, borderBottomRightRadius: 99 },
  segText: { fontSize: 15, fontWeight: '500' },

  // Radio
  radioRow: { flexDirection: 'row', gap: spacing.lg },
  radioItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  radioTxt: { fontSize: 15 },

  // Home input
  homeInputRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  inputBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 10, minHeight: 50, paddingHorizontal: spacing.base },
  input: { flex: 1, fontSize: 15, paddingVertical: Platform.OS === 'ios' ? 12 : 8 },
  locateBtn: { width: 50, height: 50, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },

  // Suggestions
  suggestBox: { borderWidth: 1, borderRadius: 10, marginTop: 4, overflow: 'hidden', backgroundColor: '#FFF' },
  suggestRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 10, paddingHorizontal: spacing.base, borderBottomWidth: StyleSheet.hairlineWidth },
  suggestTxt: { flex: 1, fontSize: 13, lineHeight: 18 },

  // Pickup header
  pickupHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  checkTxt: { fontSize: 13 },

  // Dropdown
  dropdown: { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 10, height: 50, paddingHorizontal: spacing.base },
  dropText: { fontSize: 15 },
  dropList: { borderWidth: 1, borderRadius: 10, marginTop: 4, overflow: 'hidden' },
  dropSearch: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, paddingVertical: 8, borderBottomWidth: 1 },
  dropSearchInput: { flex: 1, fontSize: 14, paddingVertical: 4 },
  dropItem: { paddingVertical: 12, paddingHorizontal: spacing.base, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6' },
  dropItemTxt: { fontSize: 14, fontWeight: '500' },
  dropItemSub: { fontSize: 12, marginTop: 2 },
  emptyTxt: { padding: spacing.base, fontSize: 13, textAlign: 'center' },

  // Map
  mapLabelRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  mapTapHint: { fontSize: 12, fontStyle: 'italic' },
  mapCard: { height: 220, borderRadius: 14, overflow: 'hidden', position: 'relative' },
  mapStyle: { height: 220 },
  distBadgeStack: {
    position: 'absolute', bottom: 12, left: 12,
    gap: 5,
  },
  distBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingVertical: 6, paddingHorizontal: 12, borderRadius: 20,
    alignSelf: 'flex-start',
  },
  distBadgeTxt: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  mapOverlayHint: {
    position: 'absolute', bottom: 12, left: 12, right: 12,
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingVertical: 7, paddingHorizontal: 12,
    borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.45)',
  },
  mapOverlayTxt: { color: '#FFF', fontSize: 12, fontWeight: '500', flex: 1 },
  legend: { position: 'absolute', top: 10, right: 10, borderRadius: 8, paddingVertical: 6, paddingHorizontal: 10, gap: 4 },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendTxt: { fontSize: 11, fontWeight: '500', color: '#374151' },

  // Footer
  footer: { paddingHorizontal: spacing.base, paddingVertical: spacing.md, borderTopWidth: 1 },
  continueBtn: { height: 52, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  continueBtnTxt: { color: '#FFF', fontSize: 16, fontWeight: '700' },
});

export default RequestCabStep1Screen;
