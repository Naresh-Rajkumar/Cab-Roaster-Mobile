import React, { useState, useCallback, useMemo, useEffect } from 'react';
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
import { fetchTrips } from '../../redux/slices/tripSlice';
import { fetchHandoffList } from '../../redux/slices/employeeSlice';

const HandoffListScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const dispatch = useDispatch();
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('trips');

  const selectedDate = useSelector((state) => state.app.selectedDate);
  const upcomingTrips = useSelector((state) => state.trip.upcomingTrips);
  const handoffList = useSelector((state) => state.employee.handoffList ?? []);

  // Flatten employees from handoff list (array of stops with employees)
  const employees = useMemo(() => {
    if (Array.isArray(handoffList) && handoffList.length > 0 && handoffList[0]?.employees) {
      // handoffList is stops array
      return handoffList.flatMap((stop) =>
        (stop.employees ?? []).map((emp) => ({
          ...emp,
          pickupPoint: stop.name ?? stop.stopName ?? '',
          scheduledTime: stop.time ?? '',
          handoffStatus: emp.status ?? emp.handoffStatus ?? HANDOFF_STATUS.PENDING,
        }))
      );
    }
    // handoffList is already a flat employee list
    return handoffList;
  }, [handoffList]);

  useEffect(() => {
    dispatch(fetchTrips({ type: 'upcoming', status: 'Upcoming' }));
    dispatch(fetchHandoffList({ date: selectedDate }));
  }, [dispatch, selectedDate]);

  const stats = useMemo(() => {
    const total = employees.length;
    const pickedUp = employees.filter((e) => e.handoffStatus === HANDOFF_STATUS.PICKED_UP).length;
    const pending = employees.filter((e) => e.handoffStatus === HANDOFF_STATUS.PENDING).length;
    const noShow = employees.filter((e) => e.handoffStatus === HANDOFF_STATUS.NO_SHOW).length;
    return { total, pickedUp, pending, noShow };
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    if (!searchQuery) return employees;
    const query = searchQuery.toLowerCase();
    return employees.filter(
      (e) =>
        (e.name ?? '').toLowerCase().includes(query) ||
        (e.employeeId ?? e.id ?? '').toLowerCase().includes(query) ||
        (e.pickupPoint ?? '').toLowerCase().includes(query)
    );
  }, [searchQuery, employees]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    Promise.all([
      dispatch(fetchTrips({ type: 'upcoming', status: 'Upcoming' })),
      dispatch(fetchHandoffList({ date: selectedDate })),
    ]).finally(() => setRefreshing(false));
  }, [dispatch, selectedDate]);

  const todayLabel = new Date(selectedDate).toLocaleDateString('en-GB');

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
            Employee Handoff - {todayLabel}
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
            Trips ({upcomingTrips.length})
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
            Employees ({employees.length})
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
        subtitle={todayLabel}
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
        data={activeTab === 'trips' ? upcomingTrips : filteredEmployees}
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
