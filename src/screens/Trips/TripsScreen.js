import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../../theme/ThemeProvider';
import { Avatar, StatusBadge, Button } from '../../components';
import spacing from '../../theme/spacing.json';
import typography from '../../theme/typography.json';
import { SCREENS } from '../../constants';
import { fetchCurrentRide, fetchTrips } from '../../redux/slices/tripSlice';


const STATUS_BADGE_MAP = {
  completed: { label: 'Completed', color: '#22C55E', bg: '#DCFCE7' },
  cancelled: { label: 'Cancelled', color: '#EF4444', bg: '#FEE2E2' },
  not_used: { label: 'Not Used', color: '#EF4444', bg: '#FEE2E2' },
  scheduled: { label: 'Scheduled', color: '#6C3AE1', bg: '#EDE7FB' },
};

const InlineBadge = ({ status, colors }) => {
  const badge = STATUS_BADGE_MAP[status] || STATUS_BADGE_MAP.scheduled;
  return (
    <View style={[styles.inlineBadge, { backgroundColor: badge.bg }]}>
      <View style={[styles.inlineBadgeDot, { backgroundColor: badge.color }]} />
      <Text style={[styles.inlineBadgeText, { color: badge.color, fontFamily: typography.fontFamily.medium }]}>
        {badge.label}
      </Text>
    </View>
  );
};

const TripsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const dispatch = useDispatch();
  const currentRide = useSelector((state) => state.trip.currentRide);
  const upcomingTrips = useSelector((state) => state.trip.upcomingTrips);
  const historyTrips = useSelector((state) => state.trip.historyTrips);
  const isLoading = useSelector((state) => state.trip.isLoading);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    dispatch(fetchCurrentRide());
    dispatch(fetchTrips({ type: 'upcoming' }));
    dispatch(fetchTrips({ type: 'history' }));
  }, [dispatch]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([
      dispatch(fetchCurrentRide()),
      dispatch(fetchTrips({ type: 'upcoming' })),
      dispatch(fetchTrips({ type: 'history' })),
    ]).finally(() => setRefreshing(false));
  }, [dispatch]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <Text style={[styles.screenTitle, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
        My Trips
      </Text>

      {/* Pill tabs */}
      <View style={[styles.tabContainer, { backgroundColor: colors.surface }]}>
        {['upcoming', 'history'].map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setActiveTab(tab)}
            style={[
              styles.tab,
              activeTab === tab && [styles.activeTab, { backgroundColor: colors.primaryContainer }],
            ]}
          >
            <Text style={[
              styles.tabText,
              {
                color: activeTab === tab ? colors.primary : colors.textSecondary,
                fontFamily: activeTab === tab ? typography.fontFamily.semiBold : typography.fontFamily.regular,
              },
            ]}>
              {tab === 'upcoming' ? 'Upcoming' : 'History'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
      >
        {activeTab === 'upcoming' ? (
          <>
            {/* Current Ride */}
            <Text style={[styles.sectionHeader, { color: colors.text, fontFamily: typography.fontFamily.semiBold }]}>
              Current Ride
            </Text>
            <View style={[styles.currentRideCard, { backgroundColor: colors.surface }]}>
              {/* Route */}
              <View style={styles.routeRow}>
                <View style={[styles.stopDotGreen]} />
                <Text style={[styles.stopLabel, { color: colors.text, fontFamily: typography.fontFamily.semiBold }]}>
                  {currentRide?.pickup || '—'}
                </Text>
              </View>
              <View style={styles.midRow}>
                <View style={styles.leftDots}>
                  <View style={[styles.midDot, { backgroundColor: colors.primary }]} />
                  <View style={[styles.midDash, { borderLeftColor: colors.border }]} />
                </View>
                <Text style={[styles.distText, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
                  {currentRide?.distance || '—'}
                </Text>
              </View>
              <View style={styles.routeRow}>
                <View style={[styles.stopIconBorder, { borderColor: colors.primary }]}>
                  <Ionicons name="person-outline" size={11} color={colors.primary} />
                </View>
                <Text style={[styles.stopLabel, { color: colors.text, fontFamily: typography.fontFamily.semiBold }]}>
                  {currentRide?.dropoff || '—'}
                </Text>
                <View style={{ flex: 1 }} />
                <View style={[styles.etaBadge, { backgroundColor: colors.primaryContainer }]}>
                  <View style={[styles.etaDot, { backgroundColor: colors.primary }]} />
                  <Text style={[styles.etaText, { color: colors.primary, fontFamily: typography.fontFamily.medium }]}>
                    {currentRide?.eta || '—'}
                  </Text>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

              {/* Driver */}
              <View style={styles.driverRow}>
                <Avatar name={currentRide?.driverName || 'Driver'} size={40} />
                <View style={styles.driverInfo}>
                  <Text style={[styles.driverName, { color: colors.text, fontFamily: typography.fontFamily.semiBold }]}>
                    {currentRide?.driverName || '—'}
                  </Text>
                  <Text style={[styles.vehicleInfo, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
                    {currentRide?.vehicleNo} • {currentRide?.vehicleType}
                  </Text>
                </View>
                <TouchableOpacity style={[styles.callBtn, { borderColor: colors.border, borderWidth: 1 }]}>
                  <Ionicons name="call-outline" size={20} color={colors.text} />
                </TouchableOpacity>
              </View>

              <Button
                title="Track Ride"
                onPress={() => navigation.navigate(SCREENS.LIVE_TRACKING)}
                fullWidth
                size="lg"
                icon={<Ionicons name="navigate-outline" size={18} color="#FFFFFF" />}
                style={styles.trackBtn}
              />
            </View>

            {/* This week */}
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionHeader, { color: colors.text, fontFamily: typography.fontFamily.semiBold }]}>
                This week
              </Text>
              <Text style={[styles.tripCount, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
                {upcomingTrips.length} Scheduled Trips
              </Text>
            </View>

            {upcomingTrips.map((trip) => (
              <TouchableOpacity key={trip.id} style={[styles.tripCard, { backgroundColor: colors.surface }]} onPress={() => navigation.navigate(SCREENS.TRIP_DETAILS, { trip })} activeOpacity={0.75}>
                <View style={styles.tripCardHeader}>
                  <View style={[styles.tripIcon, { backgroundColor: trip.iconBg }]}>
                    <Ionicons name={trip.icon} size={18} color={trip.iconColor} />
                  </View>
                  <View style={styles.tripTitleBlock}>
                    <Text style={[styles.tripTitle, { color: colors.text, fontFamily: typography.fontFamily.semiBold }]}>
                      {trip.title}
                    </Text>
                    <Text style={[styles.tripDate, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
                      {trip.date}
                    </Text>
                  </View>
                  <TouchableOpacity>
                    <Ionicons name="ellipsis-vertical" size={18} color={colors.textTertiary} />
                  </TouchableOpacity>
                </View>
                <View style={styles.tripRouteRow}>
                  <Text style={[styles.tripRouteText, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
                    {trip.from}
                  </Text>
                  <Text style={[styles.tripRouteDash, { color: colors.textTertiary }]}>{' - - - '}</Text>
                  <Text style={[styles.tripRouteText, { color: colors.text, fontFamily: typography.fontFamily.semiBold }]}>
                    {trip.to}
                  </Text>
                  <View style={{ flex: 1 }} />
                  <InlineBadge status={trip.status} colors={colors} />
                </View>
              </TouchableOpacity>
            ))}
          </>
        ) : (
          <>
            {/* Date filter */}
            <TouchableOpacity style={[styles.dateFilter, { backgroundColor: colors.surface }]}>
              <Text style={[styles.dateFilterText, { color: colors.text, fontFamily: typography.fontFamily.regular }]}>
                Last Week
              </Text>
              <Ionicons name="calendar-outline" size={20} color={colors.textSecondary} />
            </TouchableOpacity>

            {historyTrips.length > 0 && (
              <Text style={[styles.dateSectionLabel, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
                {historyTrips[0]?.dateLabel || 'Recent'}
              </Text>
            )}

            {historyTrips.map((trip) => (
              <TouchableOpacity key={trip.id} style={[styles.historyCard, { backgroundColor: colors.surface }]} onPress={() => navigation.navigate(SCREENS.TRIP_DETAILS, { trip })} activeOpacity={0.75}>
                <View style={styles.historyTop}>
                  <Text style={[styles.historyRoute, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
                    {trip.from}
                  </Text>
                  <Text style={{ color: colors.textTertiary }}> - - - </Text>
                  <Text style={[styles.historyRoute, { color: colors.text, fontFamily: typography.fontFamily.semiBold }]}>
                    {trip.to}
                  </Text>
                  <View style={{ flex: 1 }} />
                  <InlineBadge status={trip.status} colors={colors} />
                </View>
                <View style={styles.historyBottom}>
                  <View style={[styles.tripIcon, { backgroundColor: trip.iconBg }]}>
                    <Ionicons name={trip.icon} size={16} color={trip.iconColor} />
                  </View>
                  <View style={styles.historyVehicleInfo}>
                    <Text style={[styles.historyVehicle, { color: colors.text, fontFamily: typography.fontFamily.semiBold }]}>
                      {trip.vehicleNo} • {trip.vehicleType}
                    </Text>
                    <Text style={[styles.historyTime, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
                      {trip.time}
                    </Text>
                  </View>
                  <TouchableOpacity>
                    <Ionicons name="ellipsis-vertical" size={18} color={colors.textTertiary} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  screenTitle: { fontSize: 22, paddingHorizontal: spacing.base, paddingTop: spacing.base, marginBottom: spacing.md },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: spacing.base,
    borderRadius: 12,
    padding: 4,
    marginBottom: spacing.lg,
  },
  tab: { flex: 1, paddingVertical: spacing.sm, borderRadius: 10, alignItems: 'center' },
  activeTab: {},
  tabText: { fontSize: 14 },
  scrollContent: { paddingHorizontal: spacing.base, paddingBottom: spacing.xxxl },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  sectionHeader: { fontSize: 16, marginBottom: spacing.md },
  tripCount: { fontSize: 13 },
  currentRideCard: { borderRadius: 16, padding: spacing.base, marginBottom: spacing.xl, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stopDotGreen: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#DCFCE7', alignItems: 'center', justifyContent: 'center' },
  stopLabel: { fontSize: 15 },
  midRow: { flexDirection: 'row', alignItems: 'center', paddingLeft: 6, marginVertical: 2 },
  leftDots: { alignItems: 'center', width: 28, marginRight: spacing.md },
  midDot: { width: 8, height: 8, borderRadius: 4 },
  midDash: { borderLeftWidth: 1.5, borderStyle: 'dashed', height: 12 },
  distText: { fontSize: 13 },
  stopIconBorder: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  etaBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 999 },
  etaDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  etaText: { fontSize: 12 },
  divider: { height: 1, marginVertical: spacing.md },
  driverRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  driverInfo: { flex: 1 },
  driverName: { fontSize: 15 },
  vehicleInfo: { fontSize: 12, marginTop: 2 },
  callBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  trackBtn: { borderRadius: 12 },
  tripCard: { borderRadius: 16, padding: spacing.base, marginBottom: spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  tripCardHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  tripIcon: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tripTitleBlock: { flex: 1 },
  tripTitle: { fontSize: 15 },
  tripDate: { fontSize: 12, marginTop: 2 },
  tripRouteRow: { flexDirection: 'row', alignItems: 'center' },
  tripRouteText: { fontSize: 13 },
  tripRouteDash: { fontSize: 13 },
  inlineBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: 999 },
  inlineBadgeDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  inlineBadgeText: { fontSize: 12 },
  dateFilter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.base, borderRadius: 12, marginBottom: spacing.md },
  dateFilterText: { fontSize: 15 },
  dateSectionLabel: { fontSize: 17, marginBottom: spacing.md },
  historyCard: { borderRadius: 16, padding: spacing.base, marginBottom: spacing.md, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  historyTop: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  historyRoute: { fontSize: 14 },
  historyBottom: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  historyVehicleInfo: { flex: 1 },
  historyVehicle: { fontSize: 14 },
  historyTime: { fontSize: 12, marginTop: 2 },
});

export default TripsScreen;
