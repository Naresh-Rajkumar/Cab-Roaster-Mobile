import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../../theme/ThemeProvider';
import { fetchCurrentRide, fetchTrips } from '../../redux/slices/tripSlice';
import { Avatar, StatusBadge } from '../../components';
import { SCREENS } from '../../constants';
import { getGreeting } from '../../utils';

const QUICK_ACTIONS = [
  {
    id: 'cancel',
    label: 'Request\nCancellation',
    iconName: 'car',
    badgeIcon: 'close-circle',
    badgeColor: '#dc2626',
    iconBg: '#fce8e8',
    screen: SCREENS.CANCEL_REQUEST,
  },
  {
    id: 'report',
    label: 'Report\nIssue',
    iconName: 'car',
    badgeIcon: 'warning',
    badgeColor: '#f59e0b',
    iconBg: '#fef5e7',
    screen: SCREENS.REPORT_ISSUE,
  },
];


// ─── Map Placeholder ──────────────────────────────────────────────────────────
const MapPlaceholder = ({ colors }) => (
  <View style={[styles.mapPlaceholder, { backgroundColor: '#e8eaed' }]}>
    {/* Simulated map roads */}
    <View style={styles.mapRoadH} />
    <View style={styles.mapRoadV} />
    {/* Route line */}
    <View style={styles.mapRouteLine} />
    {/* Pickup dot */}
    <View style={[styles.mapDotPickup, { backgroundColor: '#16a34a', borderColor: '#fff' }]} />
    {/* Car icon */}
    <View style={[styles.mapCarBox, { backgroundColor: colors.primaryContainer, borderColor: colors.primary }]}>
      <Ionicons name="car" size={14} color={colors.primary} />
    </View>
    {/* Destination dot */}
    <View style={[styles.mapDotDest, { backgroundColor: colors.primary, borderColor: '#fff' }]} />
    {/* Location label */}
    <View style={[styles.mapLabel, { backgroundColor: '#fff' }]}>
      <Text style={styles.mapLabelText}>Karapakkam</Text>
    </View>
  </View>
);

// ─── Today's Ride Card ────────────────────────────────────────────────────────
const TodayRideCard = ({ currentRide, colors, onTrack }) => (
  <View style={[styles.rideCard, { backgroundColor: colors.surface }]}>
    {/* Map thumbnail */}
    <MapPlaceholder colors={colors} />

    {/* Route */}
    <View style={styles.routeBlock}>
      <View style={styles.routeStop}>
        <View style={[styles.checkBox, { backgroundColor: '#e8f6ed' }]}>
          <Ionicons name="checkmark" size={13} color="#16a34a" />
        </View>
        <Text style={[styles.stopName, { color: colors.text }]}>
          {currentRide?.pickup ?? 'Karapakkam'}
        </Text>
      </View>

      <View style={styles.routeConnectorRow}>
        <View style={[styles.vertDash, { borderColor: colors.border }]} />
        <Text style={[styles.distanceLabel, { color: colors.textSecondary }]}>
          {currentRide?.distance ?? '8km away'}
        </Text>
      </View>

      <View style={styles.routeStop}>
        <View style={[styles.destDot, { borderColor: colors.primary, backgroundColor: colors.primaryContainer }]}>
          <Ionicons name="person" size={11} color={colors.primary} />
        </View>
        <Text style={[styles.stopName, { color: colors.text }]}>
          {currentRide?.dropoff ?? 'Sholinganallur'}
        </Text>
        <View style={[styles.etaBadge, { backgroundColor: colors.primaryContainer }]}>
          <View style={[styles.etaDot, { backgroundColor: colors.primary }]} />
          <Text style={[styles.etaText, { color: colors.primary }]}>
            {currentRide?.eta ?? '15 mins'}
          </Text>
        </View>
      </View>
    </View>

    <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

    {/* Driver */}
    <View style={styles.driverRow}>
      <Avatar name={currentRide?.driverName ?? 'Marvin McKinney'} size={42} />
      <View style={styles.driverMeta}>
        <Text style={[styles.driverName, { color: colors.text }]}>
          {currentRide?.driverName ?? 'Marvin McKinney'}
        </Text>
        <Text style={[styles.vehicleInfo, { color: colors.textSecondary }]}>
          {currentRide?.vehicleNo ?? 'TN 14 CV 3755'}{' '}
          <Text style={{ color: colors.textTertiary }}>•</Text>{' '}
          {currentRide?.vehicleType ?? 'Ertiga'}
        </Text>
      </View>
      <TouchableOpacity style={[styles.callBtn, { borderColor: colors.borderLight }]}>
        <Ionicons name="call-outline" size={18} color={colors.text} />
      </TouchableOpacity>
    </View>

    {/* Track Ride */}
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

// ─── Schedule Card ────────────────────────────────────────────────────────────
const ScheduleCard = ({ schedule, colors }) => (
  <View style={[styles.scheduleCard, { backgroundColor: colors.surface }]}>
    {schedule.length === 0 ? (
      <Text style={[styles.scheduleLabel, { color: colors.textSecondary, textAlign: 'center' }]}>
        No rides scheduled today
      </Text>
    ) : (
      schedule.map((item, idx) => (
        <View key={item.id}>
          <View style={styles.scheduleRow}>
            <Ionicons
              name={item.status === 'completed' ? 'checkmark-circle' : 'time-outline'}
              size={20}
              color={item.status === 'completed' ? '#16a34a' : colors.textSecondary}
            />
            <Text style={[styles.scheduleLabel, { color: colors.text }]}>{item.title ?? item.label}</Text>
            <Text style={[styles.scheduleTime, { color: colors.textSecondary }]}>{item.date ?? item.time}</Text>
            <StatusBadge status={item.status} />
          </View>
          {idx < schedule.length - 1 && (
            <View style={[styles.scheduleDash, { borderLeftColor: colors.border }]} />
          )}
        </View>
      ))
    )}
  </View>
);

// ─── Quick Actions ────────────────────────────────────────────────────────────
const QuickActionsRow = ({ colors, onPress }) => (
  <View style={styles.quickActionsRow}>
    {QUICK_ACTIONS.map((action) => (
      <TouchableOpacity
        key={action.id}
        style={[styles.quickActionCard, { backgroundColor: colors.surface }]}
        onPress={() => onPress(action.screen)}
        activeOpacity={0.8}
      >
        <Text style={[styles.quickActionLabel, { color: colors.text }]}>{action.label}</Text>
        <View style={[styles.quickActionIconBox, { backgroundColor: action.iconBg }]}>
          <Ionicons name={action.iconName} size={22} color={action.badgeColor} />
          <View style={[styles.quickBadge, { backgroundColor: action.iconBg }]}>
            <Ionicons name={action.badgeIcon} size={13} color={action.badgeColor} />
          </View>
        </View>
      </TouchableOpacity>
    ))}
  </View>
);

// ─── Activity Item ────────────────────────────────────────────────────────────
const ActivityItem = ({ item, colors }) => (
  <View style={[styles.activityCard, { backgroundColor: colors.surface }]}>
    <View style={[styles.activityIconBox, { backgroundColor: item.iconBg }]}>
      <Ionicons name={item.icon} size={20} color={item.iconColor} />
    </View>
    <View style={styles.activityText}>
      <Text style={[styles.activityTitle, { color: colors.text }]}>{item.title}</Text>
      <Text style={[styles.activitySub, { color: colors.textSecondary }]}>{item.subtitle}</Text>
    </View>
    <StatusBadge status={item.status} />
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const currentRide = useSelector((state) => state.trip.currentRide);
  const upcomingTrips = useSelector((state) => state.trip.upcomingTrips);
  const historyTrips = useSelector((state) => state.trip.historyTrips);
  const [refreshing, setRefreshing] = useState(false);

  const firstName = user?.name?.split(' ')[0] ?? 'Raghavi';

  useEffect(() => {
    dispatch(fetchCurrentRide());
    dispatch(fetchTrips({ type: 'upcoming', status: 'Upcoming' }));
    dispatch(fetchTrips({ type: 'history', status: 'Completed' }));
  }, [dispatch]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([
      dispatch(fetchCurrentRide()),
      dispatch(fetchTrips({ type: 'upcoming', status: 'Upcoming' })),
      dispatch(fetchTrips({ type: 'history', status: 'Completed' })),
    ]).finally(() => setRefreshing(false));
  }, [dispatch]);

  // Build schedule from upcoming trips (today's rides)
  const schedule = upcomingTrips.slice(0, 3);

  // Recent activity from the last few completed trips
  const recentActivity = historyTrips.slice(0, 3).map((trip) => ({
    id: trip.id,
    icon: 'checkmark-circle',
    iconBg: '#DCFCE7',
    iconColor: '#22C55E',
    title: trip.title ?? trip.tripNumber ?? 'Completed Ride',
    subtitle: trip.date ?? '',
    status: trip.status,
  }));

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Avatar name={firstName} size={44} />
          <View style={styles.headerCenter}>
            <Text style={[styles.greeting, { color: colors.text }]}>
              {getGreeting()}, {firstName}!
            </Text>
          </View>
          <TouchableOpacity style={styles.alertBtn} activeOpacity={0.7}>
            <Ionicons name="alert-circle" size={28} color="#dc2626" />
          </TouchableOpacity>
        </View>

        {/* Today's Ride */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Ride</Text>
          <TodayRideCard
            currentRide={currentRide}
            colors={colors}
            onTrack={() => navigation.navigate(SCREENS.LIVE_TRACKING)}
          />
        </View>

        {/* Today's Schedule (inside a card) */}
        <View style={styles.section}>
          <ScheduleCard schedule={schedule} colors={colors} />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Quick Actions</Text>
          <QuickActionsRow
            colors={colors}
            onPress={(screen) => navigation.navigate(screen)}
          />
        </View>

        {/* Recent Activity */}
        {recentActivity.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Activity</Text>
            {recentActivity.map((item) => (
              <ActivityItem key={item.id} item={item} colors={colors} />
            ))}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 16 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  headerCenter: { flex: 1 },
  greeting: { fontSize: 18, fontWeight: '700' },
  alertBtn: { padding: 2 },

  section: { paddingHorizontal: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },

  // Map placeholder
  mapPlaceholder: {
    height: 160,
    borderRadius: 12,
    marginBottom: 14,
    overflow: 'hidden',
    position: 'relative',
  },
  mapRoadH: {
    position: 'absolute',
    height: 8,
    top: '50%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    opacity: 0.6,
  },
  mapRoadV: {
    position: 'absolute',
    width: 8,
    left: '45%',
    top: 0,
    bottom: 0,
    backgroundColor: '#fff',
    opacity: 0.6,
  },
  mapRouteLine: {
    position: 'absolute',
    width: 3,
    left: '38%',
    top: '10%',
    bottom: '25%',
    backgroundColor: '#4f46e5',
    borderRadius: 2,
    borderStyle: 'dashed',
  },
  mapDotPickup: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    top: '10%',
    left: '37%',
  },
  mapCarBox: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    top: '35%',
    left: '34%',
  },
  mapDotDest: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    bottom: '25%',
    left: '37%',
  },
  mapLabel: {
    position: 'absolute',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    bottom: '30%',
    left: '43%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 2,
  },
  mapLabelText: { fontSize: 10, fontWeight: '600', color: '#1a1a2e' },

  // Ride card
  rideCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  routeBlock: { marginBottom: 14 },
  routeStop: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkBox: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  destDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopName: { flex: 1, fontSize: 15, fontWeight: '600' },
  routeConnectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 11,
    paddingVertical: 4,
    gap: 12,
  },
  vertDash: {
    borderLeftWidth: 1.5,
    borderStyle: 'dashed',
    height: 16,
  },
  distanceLabel: { fontSize: 13 },
  etaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    gap: 4,
  },
  etaDot: { width: 6, height: 6, borderRadius: 3 },
  etaText: { fontSize: 11, fontWeight: '600' },
  divider: { height: 1, marginVertical: 12 },
  driverRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  driverMeta: { flex: 1 },
  driverName: { fontSize: 14, fontWeight: '600' },
  vehicleInfo: { fontSize: 12, marginTop: 1 },
  callBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    borderRadius: 14,
    gap: 8,
  },
  trackBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  // Schedule
  scheduleCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  scheduleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 6 },
  scheduleLabel: { flex: 1, fontSize: 14, fontWeight: '500' },
  scheduleTime: { fontSize: 11, marginRight: 8, color: '#888' },
  scheduleDash: {
    borderLeftWidth: 1.5,
    borderStyle: 'dashed',
    height: 12,
    marginLeft: 9,
  },

  // Quick Actions
  quickActionsRow: { flexDirection: 'row', gap: 12 },
  quickActionCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  quickActionLabel: { fontSize: 13, fontWeight: '500', flex: 1, marginRight: 8 },
  quickActionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  quickBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Activity
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  activityIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityText: { flex: 1 },
  activityTitle: { fontSize: 14, fontWeight: '600' },
  activitySub: { fontSize: 12, marginTop: 2 },
});

export default HomeScreen;
