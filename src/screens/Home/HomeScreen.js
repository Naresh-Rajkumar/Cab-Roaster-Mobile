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
import { fetchCurrentRide } from '../../redux/slices/tripSlice';
import { Avatar, StatusBadge, Button } from '../../components';
import spacing from '../../theme/spacing.json';
import typography from '../../theme/typography.json';
import { SCREENS } from '../../constants';
import { getGreeting } from '../../utils';

const SCHEDULE = [
  { id: '1', label: 'Ride to Office', time: '9:30 AM', status: 'completed', icon: 'checkmark-circle' },
  { id: '2', label: 'Ride to Home', time: '7:30 PM', status: 'scheduled', icon: 'time-outline' },
];

const QUICK_ACTIONS = [
  { id: 'cancel', label: 'Request Cancellation', iconName: 'car', badgeIcon: 'close-circle', badgeColor: '#EF4444' },
  { id: 'report', label: 'Report Issue', iconName: 'car', badgeIcon: 'alert-circle', badgeColor: '#F59E0B' },
];

const RECENT_ACTIVITY = [
  { id: '1', icon: 'time-outline', iconBg: '#FEF3C7', iconColor: '#F59E0B', title: 'Location Change Request', subtitle: 'Level 1 Request Approved', status: 'pending' },
  { id: '2', icon: 'checkmark-circle', iconBg: '#DCFCE7', iconColor: '#22C55E', title: 'Ride to Office', subtitle: '9:30 PM', status: 'completed' },
];

const HomeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const currentRide = useSelector((state) => state.trip.currentRide);
  const [refreshing, setRefreshing] = useState(false);

  const firstName = user?.name?.split(' ')[0] || 'Raghavi';

  useEffect(() => {
    dispatch(fetchCurrentRide());
  }, [dispatch]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(fetchCurrentRide()).finally(() => setRefreshing(false));
  }, [dispatch]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <Avatar name={firstName} size={44} />
          <View style={styles.headerCenter}>
            <Text style={[styles.greeting, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
              {getGreeting()}, {firstName}!
            </Text>
          </View>
          <TouchableOpacity style={[styles.notifBtn]}>
            <Ionicons name="alarm" size={26} color="#EF4444" />
          </TouchableOpacity>
        </View>

        {/* Today's Ride */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
            Today's Ride
          </Text>

          {/* Map placeholder */}
          <View style={[styles.mapPlaceholder, { backgroundColor: '#E8EAF0' }]}>
            <Ionicons name="map" size={32} color="#9CA3AF" />
            <Text style={[styles.mapText, { color: '#9CA3AF', fontFamily: typography.fontFamily.regular }]}>
              Live Map — integrate react-native-maps
            </Text>
          </View>

          {/* Ride card */}
          <View style={[styles.rideCard, { backgroundColor: colors.surface }]}>
            {/* Route stops */}
            <View style={styles.routeContainer}>
              <View style={styles.stopRow}>
                <View style={[styles.stopIcon, { backgroundColor: '#DCFCE7' }]}>
                  <Ionicons name="checkmark" size={14} color="#22C55E" />
                </View>
                <Text style={[styles.stopName, { color: colors.text, fontFamily: typography.fontFamily.semiBold }]}>
                  {currentRide?.pickup || '—'}
                </Text>
              </View>

              <View style={styles.midRow}>
                <View style={styles.dotLineContainer}>
                  <View style={[styles.vertDot, { backgroundColor: colors.primary }]} />
                  <View style={[styles.vertDash, { borderLeftColor: colors.border }]} />
                </View>
                <Text style={[styles.distanceText, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
                  {currentRide?.distance || '—'}
                </Text>
              </View>

              <View style={styles.stopRow}>
                <View style={[styles.stopIconPurple, { borderColor: colors.primary }]}>
                  <Ionicons name="person-outline" size={12} color={colors.primary} />
                </View>
                <Text style={[styles.stopName, { color: colors.text, fontFamily: typography.fontFamily.semiBold }]}>
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
            </View>

            {/* Divider */}
            <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />

            {/* Driver row */}
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

            {/* Track Ride button */}
            <Button
              title="Track Ride"
              onPress={() => navigation.navigate(SCREENS.LIVE_TRACKING)}
              fullWidth
              size="lg"
              icon={<Ionicons name="navigate-outline" size={18} color="#FFFFFF" />}
              style={styles.trackBtn}
            />
          </View>
        </View>

        {/* Schedule */}
        <View style={[styles.scheduleCard, { backgroundColor: colors.surface }]}>
          {SCHEDULE.map((item, idx) => (
            <View key={item.id}>
              <View style={styles.scheduleRow}>
                <Ionicons
                  name={item.icon}
                  size={20}
                  color={item.status === 'completed' ? '#22C55E' : colors.textSecondary}
                />
                <Text style={[styles.scheduleLabel, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
                  {item.label}
                </Text>
                <Text style={[styles.scheduleTime, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
                  {item.time}
                </Text>
                <StatusBadge status={item.status} />
              </View>
              {idx < SCHEDULE.length - 1 && (
                <View style={[styles.scheduleLine, { borderLeftColor: colors.border }]} />
              )}
            </View>
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
            Quick Actions
          </Text>
          <View style={styles.quickActionsRow}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.id}
                style={[styles.quickActionCard, { backgroundColor: colors.surface }]}
                onPress={() => {
                  if (action.id === 'cancel') navigation.navigate(SCREENS.CANCEL_REQUEST);
                  else navigation.navigate(SCREENS.REPORT_ISSUE);
                }}
              >
                <Text style={[styles.quickActionLabel, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
                  {action.label}
                </Text>
                <View style={styles.quickActionIconWrapper}>
                  <Ionicons name={action.iconName} size={24} color={colors.primary} />
                  <Ionicons
                    name={action.badgeIcon}
                    size={14}
                    color={action.badgeColor}
                    style={styles.quickActionBadge}
                  />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
            Recent Activity
          </Text>
          {RECENT_ACTIVITY.map((item) => (
            <View key={item.id} style={[styles.activityCard, { backgroundColor: colors.surface }]}>
              <View style={[styles.activityIconBox, { backgroundColor: item.iconBg }]}>
                <Ionicons name={item.icon} size={20} color={item.iconColor} />
              </View>
              <View style={styles.activityContent}>
                <Text style={[styles.activityTitle, { color: colors.text, fontFamily: typography.fontFamily.medium }]}>
                  {item.title}
                </Text>
                <Text style={[styles.activitySub, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
                  {item.subtitle}
                </Text>
              </View>
              <StatusBadge status={item.status} />
            </View>
          ))}
        </View>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.base,
    gap: spacing.md,
  },
  headerCenter: { flex: 1 },
  greeting: { fontSize: 17 },
  notifBtn: { padding: 4 },
  section: { paddingHorizontal: spacing.base, marginBottom: spacing.lg },
  sectionTitle: { fontSize: 18, marginBottom: spacing.md },
  mapPlaceholder: {
    height: 180,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  mapText: { fontSize: 12 },
  rideCard: {
    borderRadius: 16,
    padding: spacing.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  routeContainer: { marginBottom: spacing.md },
  stopRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  stopIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopIconPurple: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopName: { fontSize: 15 },
  midRow: { flexDirection: 'row', alignItems: 'center', paddingLeft: 6, marginVertical: 2 },
  dotLineContainer: { alignItems: 'center', width: 28, marginRight: spacing.md },
  vertDot: { width: 8, height: 8, borderRadius: 4 },
  vertDash: { borderLeftWidth: 1.5, borderStyle: 'dashed', height: 12 },
  distanceText: { fontSize: 13 },
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
  scheduleCard: {
    marginHorizontal: spacing.base,
    marginBottom: spacing.lg,
    borderRadius: 16,
    padding: spacing.base,
  },
  scheduleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm },
  scheduleLabel: { flex: 1, fontSize: 14 },
  scheduleTime: { fontSize: 12 },
  scheduleLine: { borderLeftWidth: 2, borderStyle: 'dashed', height: 12, marginLeft: 10 },
  quickActionsRow: { flexDirection: 'row', gap: spacing.md },
  quickActionCard: {
    flex: 1,
    borderRadius: 12,
    padding: spacing.base,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  quickActionLabel: { fontSize: 13, flex: 1 },
  quickActionIconWrapper: { position: 'relative' },
  quickActionBadge: { position: 'absolute', bottom: -4, right: -4 },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: spacing.base,
    marginBottom: spacing.sm,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  activityIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  activityContent: { flex: 1 },
  activityTitle: { fontSize: 14 },
  activitySub: { fontSize: 12, marginTop: 2 },
});

export default HomeScreen;
