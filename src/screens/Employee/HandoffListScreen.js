import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../../theme/ThemeProvider';
import {
  Header,
  Card,
  StatusBadge,
  EmptyState,
  Loader,
  Input,
  Avatar,
} from '../../components';
import TripItem from '../../components/items/TripItem/TripItem';
import EmployeeListItem from '../../components/items/EmployeeListItem/EmployeeListItem';
import spacing from '../../theme/spacing.json';
import typography from '../../theme/typography.json';
import { SCREENS, HANDOFF_STATUS, TRIP_STATUS } from '../../constants';
import { formatDate, getGreeting } from '../../utils';

// Mock data for Employee Handoff
const MOCK_HANDOFF_DATE = '09/02/2026';

const MOCK_TRIPS = [
  {
    id: 'TR-1042',
    status: TRIP_STATUS.IN_PROGRESS,
    pickupLocation: 'Tech Park, Whitefield',
    dropLocation: 'Manyata Tech Park',
    scheduledTime: '08:30 AM',
    employeeCount: 4,
    stops: 4,
    type: 'pickup',
    vehicleNo: 'KA-01-AB-1234',
    driverName: 'Rajesh Kumar',
  },
  {
    id: 'TR-1043',
    status: TRIP_STATUS.SCHEDULED,
    pickupLocation: 'Electronic City Phase 1',
    dropLocation: 'Bagmane Tech Park',
    scheduledTime: '09:00 AM',
    employeeCount: 3,
    stops: 3,
    type: 'pickup',
    vehicleNo: 'KA-01-CD-5678',
    driverName: 'Suresh Babu',
  },
  {
    id: 'TR-1044',
    status: TRIP_STATUS.COMPLETED,
    pickupLocation: 'Koramangala 5th Block',
    dropLocation: 'Embassy Golf Links',
    scheduledTime: '07:30 AM',
    employeeCount: 5,
    stops: 5,
    type: 'drop',
    vehicleNo: 'KA-01-EF-9012',
    driverName: 'Anil Sharma',
  },
];

const MOCK_EMPLOYEES = [
  {
    id: '1',
    name: 'Priya Sharma',
    employeeId: 'EMP-2045',
    avatar: null,
    pickupPoint: 'Stop 1 - Marathahalli Bridge',
    scheduledTime: '08:30 AM',
    handoffStatus: HANDOFF_STATUS.PICKED_UP,
    phone: '+91 98765 43210',
    tripId: 'TR-1042',
  },
  {
    id: '2',
    name: 'Amit Patel',
    employeeId: 'EMP-2078',
    avatar: null,
    pickupPoint: 'Stop 2 - Kundalahalli Gate',
    scheduledTime: '08:40 AM',
    handoffStatus: HANDOFF_STATUS.PENDING,
    phone: '+91 98765 43211',
    tripId: 'TR-1042',
  },
  {
    id: '3',
    name: 'Sneha Reddy',
    employeeId: 'EMP-3012',
    avatar: null,
    pickupPoint: 'Stop 3 - ITPL Main Road',
    scheduledTime: '08:50 AM',
    handoffStatus: HANDOFF_STATUS.PENDING,
    phone: '+91 98765 43212',
    tripId: 'TR-1042',
  },
  {
    id: '4',
    name: 'Vikram Singh',
    employeeId: 'EMP-3089',
    avatar: null,
    pickupPoint: 'Stop 4 - Hoodi Junction',
    scheduledTime: '09:00 AM',
    handoffStatus: HANDOFF_STATUS.NO_SHOW,
    phone: '+91 98765 43213',
    tripId: 'TR-1042',
  },
  {
    id: '5',
    name: 'Kavitha Nair',
    employeeId: 'EMP-4015',
    avatar: null,
    pickupPoint: 'Stop 1 - Silk Board',
    scheduledTime: '09:00 AM',
    handoffStatus: HANDOFF_STATUS.PENDING,
    phone: '+91 98765 43214',
    tripId: 'TR-1043',
  },
];

const HandoffListScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('trips');

  const stats = useMemo(() => {
    const total = MOCK_EMPLOYEES.length;
    const pickedUp = MOCK_EMPLOYEES.filter(
      (e) => e.handoffStatus === HANDOFF_STATUS.PICKED_UP
    ).length;
    const pending = MOCK_EMPLOYEES.filter(
      (e) => e.handoffStatus === HANDOFF_STATUS.PENDING
    ).length;
    const noShow = MOCK_EMPLOYEES.filter(
      (e) => e.handoffStatus === HANDOFF_STATUS.NO_SHOW
    ).length;
    return { total, pickedUp, pending, noShow };
  }, []);

  const filteredEmployees = useMemo(() => {
    if (!searchQuery) return MOCK_EMPLOYEES;
    const query = searchQuery.toLowerCase();
    return MOCK_EMPLOYEES.filter(
      (e) =>
        e.name.toLowerCase().includes(query) ||
        e.employeeId.toLowerCase().includes(query) ||
        e.pickupPoint.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  }, []);

  const handleTripPress = useCallback(
    (trip) => {
      navigation.navigate(SCREENS.TRIP_DETAILS, { trip });
    },
    [navigation]
  );

  const handleEmployeePress = useCallback(
    (employee) => {
      navigation.navigate(SCREENS.STOP_DETAILS, { employee });
    },
    [navigation]
  );

  const renderStatCard = (label, value, color, bgColor) => (
    <View style={[styles.statCard, { backgroundColor: bgColor }]}>
      <Text
        style={[
          styles.statValue,
          { color, fontFamily: typography.fontFamily.bold },
        ]}
      >
        {value}
      </Text>
      <Text
        style={[
          styles.statLabel,
          {
            color: colors.textSecondary,
            fontFamily: typography.fontFamily.regular,
          },
        ]}
      >
        {label}
      </Text>
    </View>
  );

  const renderHeader = () => (
    <View>
      {/* Date & Greeting */}
      <View style={styles.greetingSection}>
        <View>
          <Text
            style={[
              styles.greeting,
              {
                color: colors.text,
                fontFamily: typography.fontFamily.bold,
              },
            ]}
          >
            {getGreeting()}
          </Text>
          <Text
            style={[
              styles.dateText,
              {
                color: colors.textSecondary,
                fontFamily: typography.fontFamily.regular,
              },
            ]}
          >
            Employee Handoff - {MOCK_HANDOFF_DATE}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.datePickerButton,
            { backgroundColor: colors.primaryContainer },
          ]}
        >
          <Ionicons name="calendar-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        {renderStatCard(
          'Total',
          stats.total,
          colors.primary,
          colors.primaryContainer
        )}
        {renderStatCard(
          'Picked Up',
          stats.pickedUp,
          colors.success,
          colors.successBackground
        )}
        {renderStatCard(
          'Pending',
          stats.pending,
          colors.warning,
          colors.warningBackground
        )}
        {renderStatCard(
          'No Show',
          stats.noShow,
          colors.error,
          colors.errorBackground
        )}
      </View>

      {/* Tabs */}
      <View
        style={[styles.tabContainer, { borderBottomColor: colors.divider }]}
      >
        <TouchableOpacity
          onPress={() => setActiveTab('trips')}
          style={[
            styles.tab,
            activeTab === 'trips' && {
              borderBottomColor: colors.primary,
              borderBottomWidth: 2,
            },
          ]}
        >
          <Ionicons
            name="car-outline"
            size={16}
            color={
              activeTab === 'trips' ? colors.primary : colors.textTertiary
            }
          />
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === 'trips' ? colors.primary : colors.textTertiary,
                fontFamily:
                  activeTab === 'trips'
                    ? typography.fontFamily.semiBold
                    : typography.fontFamily.regular,
              },
            ]}
          >
            Trips ({MOCK_TRIPS.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('employees')}
          style={[
            styles.tab,
            activeTab === 'employees' && {
              borderBottomColor: colors.primary,
              borderBottomWidth: 2,
            },
          ]}
        >
          <Ionicons
            name="people-outline"
            size={16}
            color={
              activeTab === 'employees'
                ? colors.primary
                : colors.textTertiary
            }
          />
          <Text
            style={[
              styles.tabText,
              {
                color:
                  activeTab === 'employees'
                    ? colors.primary
                    : colors.textTertiary,
                fontFamily:
                  activeTab === 'employees'
                    ? typography.fontFamily.semiBold
                    : typography.fontFamily.regular,
              },
            ]}
          >
            Employees ({MOCK_EMPLOYEES.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      {activeTab === 'employees' && (
        <View style={styles.searchContainer}>
          <Input
            placeholder="Search employees..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            leftIcon={
              <Ionicons
                name="search-outline"
                size={18}
                color={colors.textTertiary}
              />
            }
            containerStyle={styles.searchInput}
          />
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      <Header
        title="Employee Handoff"
        subtitle={MOCK_HANDOFF_DATE}
        rightIcon={
          <Ionicons
            name="filter-outline"
            size={22}
            color={colors.headerText}
          />
        }
        onRightPress={() => {}}
      />

      <FlatList
        data={activeTab === 'trips' ? MOCK_TRIPS : filteredEmployees}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        renderItem={({ item }) =>
          activeTab === 'trips' ? (
            <View style={styles.listPadding}>
              <TripItem trip={item} onPress={handleTripPress} />
            </View>
          ) : (
            <EmployeeListItem
              employee={item}
              onPress={handleEmployeePress}
              onCallPress={() => {}}
            />
          )
        }
        ListEmptyComponent={
          <EmptyState
            icon="people-outline"
            title="No Records Found"
            message={
              activeTab === 'trips'
                ? 'No trips scheduled for this date.'
                : 'No employees match your search.'
            }
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  greetingSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.base,
    paddingBottom: spacing.md,
  },
  greeting: {
    fontSize: typography.fontSize.xl,
    marginBottom: 2,
  },
  dateText: {
    fontSize: typography.fontSize.md,
  },
  datePickerButton: {
    width: 44,
    height: 44,
    borderRadius: spacing.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.base,
    gap: spacing.sm,
    marginBottom: spacing.base,
  },
  statCard: {
    flex: 1,
    padding: spacing.md,
    borderRadius: spacing.borderRadius.md,
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.xl,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginHorizontal: spacing.base,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  tabText: {
    fontSize: typography.fontSize.md,
  },
  searchContainer: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
  },
  searchInput: {
    marginBottom: spacing.sm,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: spacing.xxl,
  },
  listPadding: {
    paddingHorizontal: spacing.base,
  },
});

export default HandoffListScreen;
