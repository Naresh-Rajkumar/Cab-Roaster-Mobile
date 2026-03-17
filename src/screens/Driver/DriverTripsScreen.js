import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../../theme/ThemeProvider';
import spacing from '../../theme/spacing.json';
import typography from '../../theme/typography.json';
import { fetchDriverDashboard } from '../../redux/slices/driverSlice';
import { tripService } from '../../services/api/tripService';

const TripCard = ({ item, isHistory, colors }) => {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <View style={[styles.tripCard, { backgroundColor: colors.card }]}>
      {/* Card header */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Text style={[styles.tripDate, { color: colors.textSecondary }]}>{item.date}</Text>
          <Text style={[styles.tripNumber, { color: colors.text }]}>| {item.tripNumber}</Text>
        </View>
        <View style={styles.cardHeaderRight}>
          {isHistory && (
            <View style={[styles.completedBadge, { backgroundColor: '#E8F5E9' }]}>
              <Text style={[styles.completedBadgeText, { color: '#4CAF50' }]}>
                {item.status}
              </Text>
            </View>
          )}
          <TouchableOpacity
            onPress={() => setMenuVisible(!menuVisible)}
            style={styles.menuButton}
            activeOpacity={0.7}
          >
            <Ionicons name="ellipsis-vertical" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Route */}
      <View style={styles.routeSection}>
        {/* Pickup stop */}
        <View style={styles.stopRow}>
          <Ionicons name="location" size={16} color="#4CAF50" />
          <View style={styles.stopTextBlock}>
            <Text style={[styles.stopLocationText, { color: colors.text }]}>
              {item.pickup?.name}
            </Text>
            <Text style={[styles.stopTimeText, { color: colors.textSecondary }]}>
              Starts @ {item.pickup?.time}
            </Text>
          </View>
        </View>

        {/* Dotted connector */}
        <View style={styles.connectorRow}>
          <View style={styles.dottedVertical} />
          <Text style={[styles.employeeCountText, { color: colors.textSecondary }]}>
            {item.pickup?.employeeCount ?? item.employeeCount ?? '—'} Employee to Pickup
          </Text>
        </View>

        {/* Destination stop */}
        <View style={styles.stopRow}>
          <Ionicons name="business" size={16} color="#6B4EFF" />
          <View style={styles.stopTextBlock}>
            <Text style={[styles.stopLocationText, { color: colors.text }]}>
              {item.destination?.name}
            </Text>
            <Text style={[styles.stopTimeText, { color: colors.textSecondary }]}>
              ETA @ {item.destination?.eta}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default function DriverTripsScreen({ navigation }) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const dispatch = useDispatch();
  const upcomingTrips = useSelector((state) => state.driver.upcomingTrips);
  const isLoading = useSelector((state) => state.driver.isLoading);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [historyTrips, setHistoryTrips] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (upcomingTrips.length === 0) {
      dispatch(fetchDriverDashboard());
    }
    setHistoryLoading(true);
    tripService.getTrips({ type: 'history', role: 'driver' })
      .then((res) => setHistoryTrips(res.data))
      .finally(() => setHistoryLoading(false));
  }, [dispatch]);

  const data = activeTab === 'upcoming' ? upcomingTrips : historyTrips;
  const loading = activeTab === 'upcoming' ? isLoading : historyLoading;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>My Trips</Text>
      </View>

      {/* Tab switcher */}
      <View style={[styles.tabSwitcher, { backgroundColor: colors.card }]}>
        <TouchableOpacity
          style={[
            styles.tabPill,
            activeTab === 'upcoming' && { backgroundColor: '#6B4EFF' },
          ]}
          onPress={() => setActiveTab('upcoming')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'upcoming'
                ? { color: '#FFFFFF' }
                : { color: colors.textSecondary },
            ]}
          >
            Upcoming
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabPill,
            activeTab === 'history' && { backgroundColor: '#6B4EFF' },
          ]}
          onPress={() => setActiveTab('history')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'history'
                ? { color: '#FFFFFF' }
                : { color: colors.textSecondary },
            ]}
          >
            History
          </Text>
        </TouchableOpacity>
      </View>

      {/* Trip list */}
      {loading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color="#6B4EFF" />
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <TripCard
              item={item}
              isHistory={activeTab === 'history'}
              colors={colors}
            />
          )}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="car-outline" size={52} color={colors.textSecondary} />
              <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                No trips found
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  tabSwitcher: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 30,
    padding: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  tabPill: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 26,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  tripCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
    gap: 4,
  },
  tripDate: {
    fontSize: 13,
    fontWeight: '500',
  },
  tripNumber: {
    fontSize: 13,
    fontWeight: '700',
  },
  cardHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  completedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  completedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  menuButton: {
    padding: 4,
  },
  routeSection: {},
  stopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  stopTextBlock: {
    flex: 1,
  },
  stopLocationText: {
    fontSize: 14,
    fontWeight: '600',
  },
  stopTimeText: {
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
  dottedVertical: {
    width: 2,
    height: 20,
    borderLeftWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#BDBDBD',
  },
  employeeCountText: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    fontWeight: '500',
  },
});
