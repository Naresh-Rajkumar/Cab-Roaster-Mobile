import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Dimensions,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../../theme/ThemeProvider';
import { Avatar, Card, StatusBadge } from '../../components';
import spacing from '../../theme/spacing.json';
import typography from '../../theme/typography.json';
import { SCREENS } from '../../constants';
import { getGreeting } from '../../utils';
import { fetchDriverDashboard, startTrip } from '../../redux/slices/driverSlice';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const UpcomingTripCard = ({ item, onStartTrip }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  return (
    <View style={[styles.upcomingCard, { backgroundColor: colors.card, width: SCREEN_WIDTH * 0.78 }]}>
      <View style={styles.upcomingCardHeader}>
        <View style={styles.vehicleRow}>
          <Text style={[styles.vehicleText, { color: colors.textSecondary, fontSize: 11 }]}>
            {item.vehicle} • {item.vehicleType}
          </Text>
        </View>
        <View style={[styles.startNowBadge, { backgroundColor: '#E8F5E9' }]}>
          <View style={[styles.dot, { backgroundColor: '#4CAF50' }]} />
          <Text style={[styles.startNowText, { color: '#4CAF50', fontSize: 10 }]}>Scheduled</Text>
        </View>
      </View>

      <Text style={[styles.tripNumberBold, { color: colors.text, fontSize: 14 }]}>
        {item.tripNumber}
      </Text>

      <View style={styles.routeSection}>
        <View style={styles.stopRow}>
          <Ionicons name="location" size={14} color="#4CAF50" />
          <View style={styles.stopTextContainer}>
            <Text style={[styles.stopName, { color: colors.text, fontSize: 12 }]}>
              {item.pickup?.name}
            </Text>
            <Text style={[styles.stopTime, { color: colors.textSecondary, fontSize: 11 }]}>
              Starts @ {item.pickup?.time}
            </Text>
          </View>
        </View>

        <View style={styles.connectorRow}>
          <View style={styles.dottedLineSmall} />
          <Text style={[styles.employeeCount, { color: colors.textSecondary, fontSize: 11 }]}>
            {item.pickup?.employeeCount} Employee to Pickup
          </Text>
        </View>

        <View style={styles.stopRow}>
          <Ionicons name="business" size={14} color="#643ee8" />
          <View style={styles.stopTextContainer}>
            <Text style={[styles.stopName, { color: colors.text, fontSize: 12 }]}>
              {item.destination?.name}
            </Text>
            <Text style={[styles.stopTime, { color: colors.textSecondary, fontSize: 11 }]}>
              ETA @ {item.destination?.eta}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.startTripButtonSmall, { backgroundColor: '#643ee8' }]}
        onPress={() => onStartTrip(item)}
        activeOpacity={0.8}
      >
        <Text style={styles.startTripButtonText}>Start Trip</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function DriverHomeScreen({ navigation }) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const driverName = useSelector((state) => state.auth?.user?.displayName || state.auth?.user?.firstName || 'Driver');
  const totalTrips = useSelector((state) => state.driver.totalTrips);
  const totalPickups = useSelector((state) => state.driver.totalPickups);
  const nextTrip = useSelector((state) => state.driver.nextTrip);
  const upcomingTrips = useSelector((state) => state.driver.upcomingTrips);
  const isLoading = useSelector((state) => state.driver.isLoading);

  const greeting = getGreeting ? getGreeting() : 'Good Morning';

  useEffect(() => {
    dispatch(fetchDriverDashboard());
  }, [dispatch]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    dispatch(fetchDriverDashboard()).finally(() => setRefreshing(false));
  }, [dispatch]);

  const handleStartTrip = (trip) => {
    navigation.navigate(SCREENS.DRIVER_ACTIVE_TRIP, { trip });
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: '#F5F4F9' }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#643ee8" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Avatar
            size={44}
            name={driverName}
            style={styles.avatar}
          />
          <View style={styles.headerCenter}>
            <Text style={[styles.greetingText, { color: colors.textSecondary, fontSize: 13 }]}>
              {greeting},
            </Text>
            <Text style={[styles.driverName, { color: colors.text }]}>{driverName}!</Text>
          </View>
          <TouchableOpacity style={styles.bellButton} activeOpacity={0.7}>
            <Ionicons name="notifications" size={24} color="#E53935" />
          </TouchableOpacity>
        </View>

        {/* Today's Status */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Today's Status</Text>
          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <View style={[styles.statIconContainer, { backgroundColor: '#EDE7FF' }]}>
                <Ionicons name="map" size={22} color="#643ee8" />
              </View>
              <Text style={[styles.statCount, { color: colors.text }]}>{totalTrips}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Total Trips</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: colors.card }]}>
              <View style={[styles.statIconContainer, { backgroundColor: '#EDE7FF' }]}>
                <Ionicons name="people" size={22} color="#643ee8" />
              </View>
              <Text style={[styles.statCount, { color: colors.text }]}>{totalPickups}</Text>
              <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pickups</Text>
            </View>
          </View>
        </View>

        {/* Next Trip */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Next Trip</Text>
          {isLoading && !nextTrip ? (
            <View style={[styles.nextTripCard, { backgroundColor: colors.card, alignItems: 'center', padding: 32 }]}>
              <ActivityIndicator size="large" color="#643ee8" />
            </View>
          ) : nextTrip ? (
            <View style={[styles.nextTripCard, { backgroundColor: colors.card }]}>
              {/* Vehicle row */}
              <View style={styles.vehicleRow}>
                <Text style={[styles.vehicleText, { color: colors.textSecondary }]}>
                  {nextTrip.vehicle} • {nextTrip.vehicleType}
                </Text>
                <View style={[styles.startNowBadge, { backgroundColor: '#E8F5E9' }]}>
                  <View style={[styles.dot, { backgroundColor: '#4CAF50' }]} />
                  <Text style={[styles.startNowText, { color: '#4CAF50' }]}>Start Now</Text>
                </View>
              </View>

              {/* Trip number */}
              <Text style={[styles.tripNumberBold, { color: colors.text }]}>{nextTrip.tripNumber}</Text>

              {/* Route */}
              <View style={styles.routeSection}>
                <View style={styles.stopRow}>
                  <Ionicons name="location" size={18} color="#4CAF50" />
                  <View style={styles.stopTextContainer}>
                    <Text style={[styles.stopName, { color: colors.text }]}>
                      {nextTrip.pickup?.name}
                    </Text>
                    <Text style={[styles.stopTime, { color: colors.textSecondary }]}>
                      Starts @ {nextTrip.pickup?.time}
                    </Text>
                  </View>
                </View>

                <View style={styles.connectorRow}>
                  <View style={styles.dottedLine} />
                  <Text style={[styles.employeeCount, { color: colors.textSecondary }]}>
                    {nextTrip.pickup?.employeeCount} Employee to Pickup
                  </Text>
                </View>

                <View style={styles.stopRow}>
                  <Ionicons name="business" size={18} color="#643ee8" />
                  <View style={styles.stopTextContainer}>
                    <Text style={[styles.stopName, { color: colors.text }]}>
                      {nextTrip.destination?.name}
                    </Text>
                    <Text style={[styles.stopTime, { color: colors.textSecondary }]}>
                      ETA @ {nextTrip.destination?.eta}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Bottom action row */}
              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={[styles.startTripButton, { backgroundColor: '#643ee8' }]}
                  onPress={() => handleStartTrip(nextTrip)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.startTripButtonText}>Start Trip</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.alertButton, { backgroundColor: '#FFEBEE', borderColor: '#E53935' }]}
                  activeOpacity={0.8}
                >
                  <Ionicons name="warning" size={20} color="#E53935" />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={[styles.nextTripCard, { backgroundColor: colors.card, alignItems: 'center', padding: 24 }]}>
              <Text style={{ color: colors.textSecondary }}>No upcoming trips</Text>
            </View>
          )}
        </View>

        {/* Upcoming Trips */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Upcoming Trips ({upcomingTrips.length})
          </Text>
          <FlatList
            data={upcomingTrips}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.upcomingListContent}
            renderItem={({ item }) => (
              <UpcomingTripCard item={item} onStartTrip={handleStartTrip} />
            )}
            ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
          />
        </View>

        {/* Bottom padding for tab bar */}
        <View style={{ height: 90 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  avatar: {
    marginRight: 12,
  },
  headerCenter: {
    flex: 1,
  },
  greetingText: {
    fontWeight: '400',
  },
  driverName: {
    fontSize: 18,
    fontWeight: '700',
  },
  bellButton: {
    padding: 4,
  },
  sectionContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statCount: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  nextTripCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  vehicleText: {
    fontSize: 13,
    fontWeight: '500',
  },
  startNowBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  startNowText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tripNumberBold: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 14,
  },
  routeSection: {
    marginBottom: 16,
  },
  stopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  stopTextContainer: {
    flex: 1,
  },
  stopName: {
    fontSize: 14,
    fontWeight: '600',
  },
  stopTime: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 1,
  },
  connectorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 7,
    paddingVertical: 6,
    gap: 10,
  },
  dottedLine: {
    width: 2,
    height: 24,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 1,
  },
  dottedLineSmall: {
    width: 2,
    height: 16,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 1,
  },
  employeeCount: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  startTripButton: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  startTripButtonSmall: {
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  startTripButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  alertButton: {
    width: 46,
    height: 46,
    borderRadius: 12,
    borderWidth: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  upcomingListContent: {
    paddingRight: 20,
  },
  upcomingCard: {
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  upcomingCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
});
