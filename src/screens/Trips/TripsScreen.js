/**
 * Employee Trips Screen — Figma: Employee Handoff 09/02/2026 "My Trips"
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../theme/ThemeProvider';
import { Avatar } from '../../components';
import { SCREENS } from '../../constants';
import { fetchTrips, fetchCurrentRide } from '../../redux/slices/tripSlice';

// ─── Status Badge ─────────────────────────────────────────────────────────────
const STATUS_MAP = {
  scheduled:  { label: 'Scheduled',  bg: '#ede9fe', color: '#6d28d9' },
  completed:  { label: 'Completed',  bg: '#dcfce7', color: '#16a34a' },
  cancelled:  { label: 'Cancelled',  bg: '#fee2e2', color: '#dc2626' },
  not_used:   { label: 'Not Used',   bg: '#fee2e2', color: '#dc2626' },
};

const TripBadge = ({ status }) => {
  const s = STATUS_MAP[status] ?? { label: status, bg: '#f3f4f6', color: '#6b7280' };
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <View style={[styles.badgeDot, { backgroundColor: s.color }]} />
      <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
    </View>
  );
};

// ─── Current Ride Card ────────────────────────────────────────────────────────
const CurrentRideCard = ({ ride, colors, onTrack }) => (
  <View style={[styles.currentCard, { backgroundColor: colors.surface }]}>
    {/* Pickup */}
    <View style={styles.routeStop}>
      <View style={[styles.checkBox, { backgroundColor: '#e8f6ed' }]}>
        <Ionicons name="checkmark" size={13} color="#16a34a" />
      </View>
      <Text style={[styles.stopName, { color: colors.text }]}>{ride.pickup}</Text>
    </View>

    {/* Distance */}
    <View style={styles.connectorRow}>
      <View style={[styles.vertDash, { borderColor: colors.border }]} />
      <Text style={[styles.distLabel, { color: colors.textSecondary }]}>{ride.distance}</Text>
    </View>

    {/* Dropoff */}
    <View style={styles.routeStop}>
      <View style={[styles.destCircle, { borderColor: colors.primary, backgroundColor: colors.primaryContainer }]}>
        <Ionicons name="person" size={11} color={colors.primary} />
      </View>
      <Text style={[styles.stopName, { color: colors.text }]}>{ride.dropoff}</Text>
      <View style={[styles.etaBadge, { backgroundColor: colors.primaryContainer }]}>
        <View style={[styles.etaDot, { backgroundColor: colors.primary }]} />
        <Text style={[styles.etaText, { color: colors.primary }]}>{ride.eta}</Text>
      </View>
    </View>

    <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

    {/* Driver */}
    <View style={styles.driverRow}>
      <Avatar name={ride.driverName} size={42} />
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

    <TouchableOpacity
      style={[styles.trackBtn, { backgroundColor: colors.primary }]}
      onPress={onTrack}
      activeOpacity={0.85}
    >
      <Ionicons name="navigate-outline" size={18} color="#fff" />
      <Text style={styles.trackBtnText}>Track Ride</Text>
    </TouchableOpacity>
  </View>
);

// ─── Trip Action Sheet (screen 17/21) ─────────────────────────────────────────
const TripActionSheet = ({ trip, colors, visible, onClose, onChangeLocation, onCancel, onReport }) => (
  <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
    <Pressable style={styles.sheetBackdrop} onPress={onClose} />
    <View style={[styles.sheetContainer, { backgroundColor: colors.surface }]}>
      {/* Handle */}
      <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />

      {/* Trip header */}
      <View style={styles.sheetTripHeader}>
        <View style={[styles.tripIconBox, { backgroundColor: trip?.iconBg ?? '#e8f6ed' }]}>
          <Ionicons name={trip?.icon ?? 'business-outline'} size={20} color={trip?.iconColor ?? '#16a34a'} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.sheetTripTitle, { color: colors.text }]}>{trip?.title}</Text>
          <Text style={[styles.sheetTripDate, { color: colors.textSecondary }]}>{trip?.date}</Text>
        </View>
        <TripBadge status={trip?.status ?? 'scheduled'} />
      </View>

      {/* Pickup / Drop */}
      <View style={[styles.sheetRouteCard, { backgroundColor: colors.background }]}>
        <View style={styles.sheetRouteRow}>
          <Ionicons name="location" size={14} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.sheetRouteLabel, { color: colors.textTertiary }]}>Pickup</Text>
            <Text style={[styles.sheetRouteValue, { color: colors.text }]}>{trip?.pickupName ?? trip?.from}</Text>
          </View>
        </View>
        <View style={[styles.sheetRouteDivider, { backgroundColor: colors.borderLight }]} />
        <View style={styles.sheetRouteRow}>
          <Ionicons name="business-outline" size={14} color="#dc2626" />
          <View style={{ flex: 1 }}>
            <Text style={[styles.sheetRouteLabel, { color: colors.textTertiary }]}>Drop</Text>
            <Text style={[styles.sheetRouteValue, { color: colors.text }]}>{trip?.dropName ?? trip?.to}</Text>
          </View>
        </View>
      </View>

      {/* Actions */}
      <TouchableOpacity style={[styles.sheetAction, { borderBottomColor: colors.borderLight }]} onPress={onChangeLocation} activeOpacity={0.7}>
        <View style={[styles.sheetActionIcon, { backgroundColor: colors.primaryContainer }]}>
          <Ionicons name="location-outline" size={18} color={colors.primary} />
        </View>
        <Text style={[styles.sheetActionText, { color: colors.text }]}>Change Location</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.sheetAction, { borderBottomColor: colors.borderLight }]} onPress={onReport} activeOpacity={0.7}>
        <View style={[styles.sheetActionIcon, { backgroundColor: '#fef3c7' }]}>
          <Ionicons name="alert-circle-outline" size={18} color="#f59e0b" />
        </View>
        <Text style={[styles.sheetActionText, { color: colors.text }]}>Report Issue</Text>
        <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.sheetAction} onPress={onCancel} activeOpacity={0.7}>
        <View style={[styles.sheetActionIcon, { backgroundColor: '#fee2e2' }]}>
          <Ionicons name="close-circle-outline" size={18} color="#dc2626" />
        </View>
        <Text style={[styles.sheetActionText, { color: '#dc2626' }]}>Cancel Ride</Text>
        <Ionicons name="chevron-forward" size={16} color="#dc2626" />
      </TouchableOpacity>

      <TouchableOpacity style={[styles.sheetDismissBtn, { borderColor: colors.border }]} onPress={onClose} activeOpacity={0.8}>
        <Text style={[styles.sheetDismissText, { color: colors.textSecondary }]}>Dismiss</Text>
      </TouchableOpacity>
    </View>
  </Modal>
);

// ─── Upcoming Trip Card ───────────────────────────────────────────────────────
const UpcomingTripCard = ({ trip, colors, onMenuPress }) => (
  <View style={[styles.tripCard, { backgroundColor: colors.surface }]}>
    <View style={styles.tripCardTop}>
      <View style={[styles.tripIconBox, { backgroundColor: trip.iconBg }]}>
        <Ionicons name={trip.icon} size={20} color={trip.iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.tripTitle, { color: colors.text }]}>{trip.title}</Text>
        <Text style={[styles.tripDate, { color: colors.textSecondary }]}>{trip.date}</Text>
      </View>
      <TouchableOpacity onPress={() => onMenuPress(trip)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Ionicons name="ellipsis-vertical" size={18} color={colors.textTertiary} />
      </TouchableOpacity>
    </View>
    <View style={styles.tripRoute}>
      <Text style={[styles.routeFrom, { color: colors.textSecondary }]}>{trip.from}</Text>
      <View style={styles.routeDashes}>
        {[...Array(5)].map((_, i) => (
          <View key={i} style={[styles.dash, { backgroundColor: colors.border }]} />
        ))}
      </View>
      <Text style={[styles.routeTo, { color: colors.text }]}>{trip.to}</Text>
      <TripBadge status={trip.status} />
    </View>
  </View>
);

// ─── History Trip Card ────────────────────────────────────────────────────────
const HistoryTripCard = ({ trip, colors }) => (
  <View style={[styles.tripCard, { backgroundColor: colors.surface }]}>
    <View style={styles.tripRoute}>
      <Text style={[styles.routeFrom, { color: colors.textSecondary }]}>{trip.from}</Text>
      <View style={styles.routeDashes}>
        {[...Array(5)].map((_, i) => (
          <View key={i} style={[styles.dash, { backgroundColor: colors.border }]} />
        ))}
      </View>
      <Text style={[styles.routeTo, { color: colors.text }]}>{trip.to}</Text>
      <TripBadge status={trip.status} />
    </View>
    <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
    <View style={styles.tripCardTop}>
      <View style={[styles.tripIconBox, { backgroundColor: trip.iconBg }]}>
        <Ionicons name={trip.icon} size={20} color={trip.iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.vehicleText, { color: colors.text }]}>
          {trip.vehicleNo}{' '}
          <Text style={{ color: colors.textTertiary }}>•</Text>{' '}
          {trip.vehicleType}
        </Text>
        <Text style={[styles.tripDate, { color: colors.textSecondary }]}>{trip.date}</Text>
      </View>
      <TouchableOpacity>
        <Ionicons name="ellipsis-vertical" size={18} color={colors.textTertiary} />
      </TouchableOpacity>
    </View>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const TripsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(0);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const currentRide = useSelector((state) => state.trip.currentRide);
  const upcomingTrips = useSelector((state) => state.trip.upcomingTrips);
  const historyTrips = useSelector((state) => state.trip.historyTrips);
  const isLoading = useSelector((state) => state.trip.isLoading);

  useEffect(() => {
    dispatch(fetchCurrentRide());
    dispatch(fetchTrips({ type: 'upcoming', status: 'Upcoming' }));
    dispatch(fetchTrips({ type: 'history', status: 'Completed' }));
  }, [dispatch]);

  const onRefresh = () => {
    setRefreshing(true);
    Promise.all([
      dispatch(fetchCurrentRide()),
      dispatch(fetchTrips({ type: 'upcoming', status: 'Upcoming' })),
      dispatch(fetchTrips({ type: 'history', status: 'Completed' })),
    ]).finally(() => setRefreshing(false));
  };

  const openSheet = (trip) => {
    setSelectedTrip(trip);
    setSheetVisible(true);
  };
  const closeSheet = () => setSheetVisible(false);

  const handleChangeLocation = () => {
    closeSheet();
    navigation.navigate(SCREENS.SELECT_PICKUP, { trip: selectedTrip, mode: 'change_location' });
  };
  const handleCancelRide = () => {
    closeSheet();
    navigation.navigate(SCREENS.CANCEL_REQUEST, { trip: selectedTrip });
  };
  const handleReportIssue = () => {
    closeSheet();
    navigation.navigate(SCREENS.REPORT_ISSUE, { trip: selectedTrip });
  };

  // Group history by date
  const historyGroups = historyTrips.reduce((acc, trip) => {
    const key = trip.date || 'Earlier';
    if (!acc[key]) acc[key] = [];
    acc[key].push(trip);
    return acc;
  }, {});

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <TripActionSheet
        trip={selectedTrip}
        colors={colors}
        visible={sheetVisible}
        onClose={closeSheet}
        onChangeLocation={handleChangeLocation}
        onCancel={handleCancelRide}
        onReport={handleReportIssue}
      />
      {/* Page title */}
      <View style={styles.pageHeader}>
        <Text style={[styles.pageTitle, { color: colors.text }]}>My Trips</Text>
      </View>

      {/* Segment control */}
      <View style={styles.segmentWrapper}>
        <View style={[styles.segmentControl, { backgroundColor: colors.primaryContainer }]}>
          {['Upcoming', 'History'].map((tab, idx) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.segmentTab,
                activeTab === idx && [styles.segmentTabActive, { backgroundColor: colors.surface }],
              ]}
              onPress={() => setActiveTab(idx)}
              activeOpacity={0.8}
            >
              <Text style={[
                styles.segmentText,
                { color: activeTab === idx ? colors.text : colors.textSecondary },
                activeTab === idx && { fontWeight: '700' },
              ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
        }
      >
        {isLoading && !refreshing ? (
          <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : activeTab === 0 ? (
          <>
            {/* Current Ride */}
            {currentRide && (
              <>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Current Ride</Text>
                <CurrentRideCard
                  ride={currentRide}
                  colors={colors}
                  onTrack={() => navigation.navigate(SCREENS.LIVE_TRACKING)}
                />
              </>
            )}

            {/* This Week */}
            <View style={styles.weekHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>This week</Text>
              <Text style={[styles.weekCount, { color: colors.textSecondary }]}>
                {upcomingTrips.length} Scheduled Trips
              </Text>
            </View>
            {upcomingTrips.map((trip) => (
              <UpcomingTripCard key={trip.id} trip={trip} colors={colors} onMenuPress={openSheet} />
            ))}
            {upcomingTrips.length === 0 && (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No upcoming trips</Text>
            )}
          </>
        ) : (
          <>
            {/* Date filter */}
            <View style={[styles.dateFilterRow, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.dateFilterText, { color: colors.text }]}>Last Week</Text>
              <Ionicons name="calendar-outline" size={18} color={colors.textSecondary} />
            </View>

            {/* Grouped history */}
            {Object.entries(historyGroups).map(([dateLabel, trips]) => (
              <View key={dateLabel}>
                <Text style={[styles.dateSectionLabel, { color: colors.text }]}>{dateLabel}</Text>
                {trips.map((trip) => (
                  <HistoryTripCard key={trip.id} trip={trip} colors={colors} />
                ))}
              </View>
            ))}
            {historyTrips.length === 0 && (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No trip history</Text>
            )}
          </>
        )}
        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  pageHeader: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  pageTitle: { fontSize: 22, fontWeight: '700' },
  listContent: { padding: 16 },

  // Segment
  segmentWrapper: { paddingHorizontal: 16, marginBottom: 16 },
  segmentControl: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 4,
  },
  segmentTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
  },
  segmentTabActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  segmentText: { fontSize: 14 },

  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 12,
  },
  weekCount: { fontSize: 13 },

  // Current ride card
  currentCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  routeStop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkBox: { width: 28, height: 28, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  destCircle: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  stopName: { flex: 1, fontSize: 15, fontWeight: '600' },
  connectorRow: { flexDirection: 'row', alignItems: 'center', paddingLeft: 10, paddingVertical: 4, gap: 12 },
  vertDash: { borderLeftWidth: 1.5, borderStyle: 'dashed', height: 18 },
  distLabel: { fontSize: 13 },
  etaBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, gap: 4 },
  etaDot: { width: 6, height: 6, borderRadius: 3 },
  etaText: { fontSize: 11, fontWeight: '600' },
  divider: { height: 1, marginVertical: 12 },
  driverRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  driverName: { fontSize: 14, fontWeight: '600' },
  vehicleText: { fontSize: 13, marginTop: 1 },
  callBtn: { width: 42, height: 42, borderRadius: 12, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  trackBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 50, borderRadius: 14, gap: 8 },
  trackBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Trip cards
  tripCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tripCardTop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  tripIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  tripTitle: { fontSize: 15, fontWeight: '600' },
  tripDate: { fontSize: 12, marginTop: 2 },
  tripRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    gap: 4,
  },
  routeFrom: { fontSize: 14 },
  routeDashes: { flexDirection: 'row', alignItems: 'center', gap: 3, flex: 1, paddingHorizontal: 4 },
  dash: { width: 6, height: 2, borderRadius: 1 },
  routeTo: { fontSize: 14, fontWeight: '600', marginRight: 8 },

  // Action Sheet
  sheetBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheetContainer: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  sheetHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 20 },
  sheetTripHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  sheetTripTitle: { fontSize: 15, fontWeight: '700' },
  sheetTripDate: { fontSize: 12, marginTop: 2 },
  sheetRouteCard: { borderRadius: 12, padding: 14, marginBottom: 20 },
  sheetRouteRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  sheetRouteLabel: { fontSize: 11, marginBottom: 2 },
  sheetRouteValue: { fontSize: 13, fontWeight: '600' },
  sheetRouteDivider: { height: 1, marginVertical: 10 },
  sheetAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 14,
    borderBottomWidth: 1,
  },
  sheetActionIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  sheetActionText: { flex: 1, fontSize: 15, fontWeight: '600' },
  sheetDismissBtn: {
    marginTop: 16,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    paddingVertical: 14,
  },
  sheetDismissText: { fontSize: 15, fontWeight: '600' },

  // Badge
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, gap: 4 },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 11, fontWeight: '600' },

  // History
  dateFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  dateFilterText: { fontSize: 14, fontWeight: '500' },
  dateSectionLabel: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  emptyText: { textAlign: 'center', marginTop: 32, fontSize: 14 },
});

export default TripsScreen;
