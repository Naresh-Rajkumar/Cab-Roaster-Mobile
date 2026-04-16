import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../../theme/ThemeProvider';
import { StatusBadge, EmptyState } from '../../components';
import { fetchDriverTrips } from '../../redux/slices/driverSlice';
import { SCREENS } from '../../constants';

const TABS = ['Upcoming', 'History'];

const TripCard = ({ trip, colors, onPress }) => (
  <TouchableOpacity
    style={[styles.tripCard, { backgroundColor: colors.surface }]}
    onPress={() => onPress(trip)}
    activeOpacity={0.8}
  >
    {/* Header row */}
    <View style={styles.cardHeader}>
      <View style={styles.cardHeaderLeft}>
        <Text style={[styles.cardDate, { color: colors.textSecondary }]}>{trip.date}</Text>
        <Text style={[styles.cardTrip, { color: colors.text }]}>{trip.tripNumber}</Text>
      </View>
      <StatusBadge status={trip.status} />
    </View>

    <View style={[styles.cardDivider, { backgroundColor: colors.borderLight }]} />

    {/* Vehicle row */}
    <View style={styles.vehicleRow}>
      <View style={[styles.vehicleIcon, { backgroundColor: colors.primaryContainer }]}>
        <Ionicons name="car-outline" size={16} color={colors.primary} />
      </View>
      <Text style={[styles.vehicleText, { color: colors.textSecondary }]}>
        {trip.vehicle} • {trip.vehicleType}
      </Text>
    </View>

    {/* Route */}
    <View style={styles.routeBlock}>
      <View style={styles.routeRow}>
        <View style={[styles.routeDot, { backgroundColor: '#16a34a' }]} />
        <View style={styles.routeTextBlock}>
          <Text style={[styles.routeStop, { color: colors.text }]}>{trip.pickup?.name}</Text>
          <Text style={[styles.routeMeta, { color: colors.textSecondary }]}>
            Starts @ {trip.pickup?.time}
          </Text>
        </View>
      </View>
      <View style={styles.routeConnector}>
        <View style={[styles.connDash, { borderLeftColor: colors.border }]} />
        <Text style={[styles.empCount, { color: colors.textSecondary }]}>
          {trip.employeeCount ?? trip.pickup?.employeeCount} Employee to{' '}
          {trip.status === 'completed' ? 'Pickup' : 'Pickup'}
        </Text>
      </View>
      <View style={styles.routeRow}>
        <View style={[styles.routeDotOutline, { borderColor: colors.primary }]}>
          <Ionicons name="business-outline" size={8} color={colors.primary} />
        </View>
        <View style={styles.routeTextBlock}>
          <Text style={[styles.routeStop, { color: colors.text }]}>{trip.destination?.name}</Text>
          <Text style={[styles.routeMeta, { color: colors.textSecondary }]}>
            ETA @ {trip.destination?.eta}
          </Text>
        </View>
      </View>
    </View>
  </TouchableOpacity>
);

const DriverTripsScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const upcomingTrips = useSelector((state) => state.driver.upcomingTrips ?? []);
  const tripHistory = useSelector((state) => state.driver.tripHistory ?? []);
  const isLoading = useSelector((state) => state.driver.isLoading);

  useEffect(() => {
    dispatch(fetchDriverTrips());
  }, [dispatch]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(fetchDriverTrips()).finally(() => setRefreshing(false));
  }, [dispatch]);

  const data = activeTab === 0 ? upcomingTrips : tripHistory;

  const handleTripPress = (trip) => {
    const status = (trip.status ?? '').toLowerCase();
    const isCompleted = status === 'completed' || status === 'cancelled';

    if (isCompleted) {
      // Map the trip list shape → the summary shape TripSummaryScreen expects
      navigation.navigate(SCREENS.TRIP_SUMMARY, {
        summary: {
          tripNumber:   trip.tripNumber ?? trip.id,
          vehicle:      trip.vehicle ?? '',
          vehicleType:  trip.vehicleType ?? '',
          startedAt:    trip.pickup?.time ?? '',
          endedAt:      trip.destination?.eta ?? '',
          totalPickups: trip.employeeCount ?? trip.pickup?.employeeCount ?? 0,
          totalStops:   0,
          totalDistance: trip.distance ?? '',
          routeStops:   [],
        },
      });
    } else {
      navigation.navigate(SCREENS.DRIVER_ACTIVE_TRIP, { trip });
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Page header */}
      <View style={styles.pageHeader}>
        <Text style={[styles.pageTitle, { color: colors.text }]}>My Trips</Text>
      </View>

      {/* Tabs */}
      <View style={[styles.tabRow, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]}>
        {TABS.map((tab, idx) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === idx && [styles.tabActive, { borderBottomColor: colors.primary }]]}
            onPress={() => setActiveTab(idx)}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.tabText,
              { color: activeTab === idx ? colors.primary : colors.textSecondary },
              activeTab === idx && { fontWeight: '700' },
            ]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading && data.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : data.length === 0 ? (
        <EmptyState
          icon="car-outline"
          title={activeTab === 0 ? 'No Upcoming Trips' : 'No Trip History'}
          subtitle={activeTab === 0 ? 'You have no upcoming trips scheduled.' : 'Your completed trips will appear here.'}
        />
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TripCard trip={item} colors={colors} onPress={handleTripPress} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
          ListHeaderComponent={() => (
            <Text style={[styles.weekLabel, { color: colors.text }]}>
              {activeTab === 0 ? 'This week' : 'Recent'} ·{' '}
              <Text style={[styles.weekCount, { color: colors.textSecondary }]}>
                {data.length} {activeTab === 0 ? 'Scheduled' : 'Completed'} Trips
              </Text>
            </Text>
          )}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  pageHeader: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  pageTitle: { fontSize: 20, fontWeight: '700' },

  tabRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 12,
    marginRight: 24,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {},
  tabText: { fontSize: 14 },

  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  listContent: { padding: 16 },
  weekLabel: { fontSize: 15, fontWeight: '600', marginBottom: 14 },
  weekCount: { fontWeight: '400' },

  tripCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 },
  cardHeaderLeft: {},
  cardDate: { fontSize: 12, marginBottom: 2 },
  cardTrip: { fontSize: 15, fontWeight: '700' },
  cardDivider: { height: 1, marginBottom: 10 },
  vehicleRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  vehicleIcon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  vehicleText: { fontSize: 13 },
  routeBlock: {},
  routeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  routeDot: { width: 10, height: 10, borderRadius: 5, marginTop: 4 },
  routeDotOutline: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  routeTextBlock: { flex: 1 },
  routeStop: { fontSize: 14, fontWeight: '600' },
  routeMeta: { fontSize: 10, marginTop: 1 },
  routeConnector: { flexDirection: 'row', alignItems: 'center', paddingLeft: 5, paddingVertical: 4, gap: 10 },
  connDash: { borderLeftWidth: 1.5, borderStyle: 'dashed', height: 14 },
  empCount: { fontSize: 11 },
});

export default DriverTripsScreen;
