import React, { useState, useEffect, useRef, useMemo } from 'react';
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
import { useSelector } from 'react-redux';
import { useTheme } from '../../theme/ThemeProvider';
import { configService } from '../../services/api/configService';
import { SCREENS } from '../../constants';
import spacing from '../../theme/spacing.json';
import { nominatimSearch } from '../../utils/nominatimSearch';

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

const RequestCabStep1Screen = ({ navigation }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const user = useSelector((state) => state.auth.user);

  const [workLocations, setWorkLocations] = useState([]);
  const [stops, setStops] = useState([]);
  const [loading, setLoading] = useState(true);

  const [workLocation, setWorkLocation] = useState('');
  const [cabPreference, setCabPreference] = useState('both');
  const [homeLocation, setHomeLocation] = useState('');
  const [homeSuggestions, setHomeSuggestions] = useState([]);
  const [homeSearchLoading, setHomeSearchLoading] = useState(false);
  const skipHomeSearchRef = useRef(false);
  const homeSearchAbortRef = useRef(null);

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
  const initials = (user?.name || 'U')
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  useEffect(() => {
    const loadData = async () => {
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
        console.warn('Failed to load config data:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    const q = homeLocation.trim();
    if (q.length < 3) {
      setHomeSuggestions([]);
      setHomeSearchLoading(false);
      return;
    }
    if (skipHomeSearchRef.current) {
      skipHomeSearchRef.current = false;
      setHomeSuggestions([]);
      return;
    }
    homeSearchAbortRef.current?.abort();
    const ac = new AbortController();
    homeSearchAbortRef.current = ac;

    const t = setTimeout(() => {
      setHomeSearchLoading(true);
      nominatimSearch(q, { signal: ac.signal, limit: 8 })
        .then((rows) => {
          if (!ac.signal.aborted) setHomeSuggestions(rows);
        })
        .finally(() => {
          if (!ac.signal.aborted) setHomeSearchLoading(false);
        });
    }, 450);

    return () => {
      clearTimeout(t);
      ac.abort();
    };
  }, [homeLocation]);

  const filteredPickupStops = useMemo(
    () => stops.filter((s) => stopMatchesQuery(s, pickupFilter)),
    [stops, pickupFilter],
  );
  const filteredDropStops = useMemo(
    () => stops.filter((s) => stopMatchesQuery(s, dropFilter)),
    [stops, dropFilter],
  );

  const selectHomeSuggestion = (item) => {
    skipHomeSearchRef.current = true;
    setHomeLocation(item.display_name || '');
    setHomeSuggestions([]);
    setHomeSearchLoading(false);
  };

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

  const handleContinue = () => {
    if (!homeLocation.trim() || !pickupStop?.id) return;
    const drop = differentDrop && dropStop ? dropStop : pickupStop;
    navigation.navigate(SCREENS.REQUEST_CAB_STEP2, {
      workLocation,
      cabPreference,
      homeLocation: homeLocation.trim(),
      pickupStop: { id: pickupStop.id, name: pickupStop.name },
      dropStop: { id: drop.id, name: drop.name },
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View style={styles.avatarWrapper}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
        </View>
        <View style={styles.headerTextWrapper}>
          <Text style={[styles.greetingText, { color: colors.textSecondary }]}>{greeting},</Text>
          <Text style={[styles.greetingName, { color: colors.text }]}>{userName}!</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.titleRow}>
          <Text style={[styles.screenTitle, { color: colors.text }]}>Ride Scheduling Setup</Text>
          <Text style={[styles.stepIndicator, { color: colors.textSecondary }]}>1 of 2</Text>
        </View>

        <View style={[styles.progressBarTrack, { backgroundColor: colors.border || '#E5E7EB' }]}>
          <View style={[styles.progressBarFill, { backgroundColor: colors.primary, width: '100%' }]} />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>
            Work Location <Text style={{ color: colors.primary }}>*</Text>
          </Text>
          {workLocations.length > 0 ? (
            <View style={[styles.segmentedControl, { borderColor: colors.primary }]}>
              {workLocations.map((loc, idx) => {
                const locName = loc.name || loc.locationName || `Location ${idx + 1}`;
                const isActive = workLocation === locName;
                return (
                  <TouchableOpacity
                    key={loc.id || idx}
                    style={[
                      styles.segmentTab,
                      idx === 0 && styles.segmentTabLeft,
                      idx === workLocations.length - 1 && styles.segmentTabRight,
                      { backgroundColor: isActive ? colors.primary : 'transparent' },
                    ]}
                    onPress={() => setWorkLocation(locName)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.segmentTabText, { color: isActive ? '#FFFFFF' : colors.primary }]}>
                      {locName}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ) : (
            <Text style={{ color: colors.textSecondary }}>No work locations available</Text>
          )}
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>
            Cab Usage Preference <Text style={{ color: colors.primary }}>*</Text>
          </Text>
          <View style={styles.radioGroup}>
            {[
              { value: 'both', label: 'Both' },
              { value: 'pickup', label: 'Pickup' },
              { value: 'dropoff', label: 'Drop off' },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.radioOption}
                onPress={() => setCabPreference(option.value)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.radioOuter,
                    {
                      borderColor:
                        cabPreference === option.value ? colors.primary : colors.border || '#D1D5DB',
                    },
                  ]}
                >
                  {cabPreference === option.value && (
                    <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                  )}
                </View>
                <Text
                  style={[
                    styles.radioLabel,
                    {
                      color: cabPreference === option.value ? colors.primary : colors.text,
                      fontWeight: cabPreference === option.value ? '600' : '400',
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>
            Home Location <Text style={{ color: colors.primary }}>*</Text>
          </Text>
          <Text style={[styles.fieldHint, { color: colors.textSecondary }]}>
            Type at least 3 characters to search addresses (OpenStreetMap).
          </Text>
          <View
            style={[styles.inputContainer, { backgroundColor: '#FFFFFF', borderColor: colors.border || '#E5E7EB' }]}
          >
            <Ionicons name="location-outline" size={20} color={colors.primary} style={styles.inputIcon} />
            <TextInput
              style={[styles.textInput, { color: colors.text }]}
              value={homeLocation}
              onChangeText={setHomeLocation}
              placeholder="Search your home address"
              placeholderTextColor={colors.textTertiary || '#9CA3AF'}
              autoCorrect={false}
              autoCapitalize="words"
            />
            {homeSearchLoading ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : null}
          </View>
          {homeSuggestions.length > 0 && (
            <View style={[styles.suggestList, { borderColor: colors.border || '#E5E7EB' }]}>
              <ScrollView style={{ maxHeight: 200 }} keyboardShouldPersistTaps="handled" nestedScrollEnabled>
                {homeSuggestions.map((item, idx) => (
                  <TouchableOpacity
                    key={`${item.place_id ?? item.osm_id ?? idx}`}
                    style={[styles.suggestItem, { borderBottomColor: colors.border || '#F3F4F6' }]}
                    onPress={() => selectHomeSuggestion(item)}
                  >
                    <Text style={[styles.suggestText, { color: colors.text }]} numberOfLines={3}>
                      {item.display_name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.pickupHeaderRow}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>
              Pickup &amp; Drop Point <Text style={{ color: colors.primary }}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setDifferentDrop(!differentDrop)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: differentDrop ? colors.primary : colors.border || '#D1D5DB',
                    backgroundColor: differentDrop ? colors.primary : '#FFFFFF',
                  },
                ]}
              >
                {differentDrop && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
              </View>
              <Text style={[styles.checkboxLabel, { color: colors.textSecondary }]}>Different Drop Point</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.dropdownContainer, { backgroundColor: '#FFFFFF', borderColor: colors.border || '#E5E7EB' }]}
            onPress={togglePickupDropdown}
            activeOpacity={0.8}
          >
            <Ionicons name="location" size={20} color={colors.primary} style={styles.inputIcon} />
            <Text
              style={[
                styles.dropdownText,
                {
                  color: pickupStop ? colors.text : colors.textTertiary || '#9CA3AF',
                  flex: 1,
                },
              ]}
            >
              {pickupStop ? pickupStop.name : 'Select pickup point'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.textSecondary || '#6B7280'} />
          </TouchableOpacity>
          {showPickupDropdown && (
            <View style={[styles.dropdownList, { backgroundColor: '#FFFFFF', borderColor: colors.border }]}>
              <View
                style={[
                  styles.dropdownSearchRow,
                  { borderColor: colors.border || '#E5E7EB', backgroundColor: '#F9FAFB' },
                ]}
              >
                <Ionicons name="search-outline" size={18} color={colors.textTertiary} style={{ marginRight: 8 }} />
                <TextInput
                  style={[styles.dropdownSearchInput, { color: colors.text }]}
                  value={pickupFilter}
                  onChangeText={setPickupFilter}
                  placeholder="Search stops…"
                  placeholderTextColor={colors.textTertiary}
                  autoFocus={Platform.OS !== 'web'}
                />
              </View>
              <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled keyboardShouldPersistTaps="handled">
                {filteredPickupStops.length === 0 ? (
                  <Text style={[styles.emptyFilterText, { color: colors.textSecondary }]}>No matching stops</Text>
                ) : (
                  filteredPickupStops.map((stop) => {
                    const label = stop.name || stop.stopName || `Stop ${stop.id}`;
                    return (
                      <TouchableOpacity
                        key={stop.id}
                        style={styles.dropdownItem}
                        onPress={() => {
                          setPickupStop({ id: stop.id, name: label });
                          setShowPickupDropdown(false);
                          setPickupFilter('');
                        }}
                      >
                        <Text style={[styles.dropdownItemText, { color: colors.text }]}>{label}</Text>
                        {stop.area && stop.area !== '-' ? (
                          <Text style={[styles.dropdownItemSub, { color: colors.textSecondary }]}>{stop.area}</Text>
                        ) : null}
                      </TouchableOpacity>
                    );
                  })
                )}
              </ScrollView>
            </View>
          )}

          {differentDrop && (
            <>
              <Text style={[styles.sectionLabel, { color: colors.text, marginTop: spacing.md }]}>
                Drop Point <Text style={{ color: colors.primary }}>*</Text>
              </Text>
              <TouchableOpacity
                style={[styles.dropdownContainer, { backgroundColor: '#FFFFFF', borderColor: colors.border || '#E5E7EB' }]}
                onPress={toggleDropDropdown}
                activeOpacity={0.8}
              >
                <Ionicons name="location" size={20} color={colors.primary} style={styles.inputIcon} />
                <Text
                  style={[
                    styles.dropdownText,
                    {
                      color: dropStop ? colors.text : colors.textTertiary || '#9CA3AF',
                      flex: 1,
                    },
                  ]}
                >
                  {dropStop ? dropStop.name : 'Select drop point'}
                </Text>
                <Ionicons name="chevron-down" size={20} color={colors.textSecondary || '#6B7280'} />
              </TouchableOpacity>
              {showDropDropdown && (
                <View style={[styles.dropdownList, { backgroundColor: '#FFFFFF', borderColor: colors.border }]}>
                  <View
                    style={[
                      styles.dropdownSearchRow,
                      { borderColor: colors.border || '#E5E7EB', backgroundColor: '#F9FAFB' },
                    ]}
                  >
                    <Ionicons name="search-outline" size={18} color={colors.textTertiary} style={{ marginRight: 8 }} />
                    <TextInput
                      style={[styles.dropdownSearchInput, { color: colors.text }]}
                      value={dropFilter}
                      onChangeText={setDropFilter}
                      placeholder="Search stops…"
                      placeholderTextColor={colors.textTertiary}
                      autoFocus={Platform.OS !== 'web'}
                    />
                  </View>
                  <ScrollView style={{ maxHeight: 180 }} nestedScrollEnabled keyboardShouldPersistTaps="handled">
                    {filteredDropStops.length === 0 ? (
                      <Text style={[styles.emptyFilterText, { color: colors.textSecondary }]}>No matching stops</Text>
                    ) : (
                      filteredDropStops.map((stop) => {
                        const label = stop.name || stop.stopName || `Stop ${stop.id}`;
                        return (
                          <TouchableOpacity
                            key={stop.id}
                            style={styles.dropdownItem}
                            onPress={() => {
                              setDropStop({ id: stop.id, name: label });
                              setShowDropDropdown(false);
                              setDropFilter('');
                            }}
                          >
                            <Text style={[styles.dropdownItemText, { color: colors.text }]}>{label}</Text>
                            {stop.area && stop.area !== '-' ? (
                              <Text style={[styles.dropdownItemSub, { color: colors.textSecondary }]}>{stop.area}</Text>
                            ) : null}
                          </TouchableOpacity>
                        );
                      })
                    )}
                  </ScrollView>
                </View>
              )}
            </>
          )}
        </View>

        <View style={{ height: spacing.xxxxl }} />
      </ScrollView>

      <View
        style={[styles.stickyFooter, { backgroundColor: colors.background, borderTopColor: colors.border || '#F3F4F6' }]}
      >
        <TouchableOpacity
          style={[
            styles.continueButton,
            {
              backgroundColor:
                homeLocation.trim() && pickupStop?.id && (!differentDrop || dropStop?.id)
                  ? colors.primary
                  : colors.border || '#D1D5DB',
            },
          ]}
          onPress={handleContinue}
          activeOpacity={0.85}
          disabled={!homeLocation.trim() || !pickupStop?.id || (differentDrop && !dropStop?.id)}
        >
          <Text style={[styles.continueButtonText]}>Continue  →</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  avatarWrapper: { marginRight: spacing.md },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  headerTextWrapper: { flexDirection: 'column' },
  greetingText: { fontSize: 13, lineHeight: 18 },
  greetingName: { fontSize: 15, lineHeight: 20, fontWeight: '700' },
  scrollContent: { paddingHorizontal: spacing.base, paddingTop: spacing.md },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  screenTitle: { fontSize: 20, fontWeight: '700' },
  stepIndicator: { fontSize: 13 },
  progressBarTrack: { height: 6, borderRadius: 99, overflow: 'hidden', marginBottom: spacing.xl },
  progressBarFill: { height: '100%', borderRadius: 99 },
  section: { marginBottom: spacing.xl },
  sectionLabel: { fontSize: 15, fontWeight: '600', marginBottom: spacing.sm },
  fieldHint: { fontSize: 12, marginBottom: spacing.xs, marginTop: -spacing.xs },
  segmentedControl: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderRadius: 99,
    overflow: 'hidden',
  },
  segmentTab: { flex: 1, paddingVertical: spacing.sm, alignItems: 'center', justifyContent: 'center' },
  segmentTabLeft: { borderTopLeftRadius: 99, borderBottomLeftRadius: 99 },
  segmentTabRight: { borderTopRightRadius: 99, borderBottomRightRadius: 99 },
  segmentTabText: { fontSize: 15, fontWeight: '500' },
  radioGroup: { flexDirection: 'row', gap: spacing.lg },
  radioOption: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  radioOuter: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 5 },
  radioLabel: { fontSize: 15 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 50,
    paddingHorizontal: spacing.base,
  },
  inputIcon: { marginRight: spacing.sm },
  textInput: { flex: 1, fontSize: 15, paddingVertical: Platform.OS === 'ios' ? 12 : 8 },
  suggestList: {
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  suggestItem: { paddingVertical: 10, paddingHorizontal: spacing.base, borderBottomWidth: StyleSheet.hairlineWidth },
  suggestText: { fontSize: 13, lineHeight: 18 },
  pickupHeaderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  checkboxLabel: { fontSize: 13 },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    height: 50,
    paddingHorizontal: spacing.base,
  },
  dropdownText: { fontSize: 15 },
  dropdownList: {
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  dropdownSearchInput: { flex: 1, fontSize: 14, paddingVertical: 4 },
  dropdownItem: { paddingVertical: 12, paddingHorizontal: spacing.base, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6' },
  dropdownItemText: { fontSize: 14, fontWeight: '500' },
  dropdownItemSub: { fontSize: 12, marginTop: 2 },
  emptyFilterText: { padding: spacing.base, fontSize: 13, textAlign: 'center' },
  stickyFooter: { paddingHorizontal: spacing.base, paddingVertical: spacing.md, borderTopWidth: 1 },
  continueButton: { height: 52, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  continueButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});

export default RequestCabStep1Screen;
