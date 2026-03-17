import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import {
  Header,
  Card,
  StatusBadge,
  Avatar,
  Button,
} from '../../components';
import StopItem from '../../components/items/StopItem/StopItem';
import EmployeeListItem from '../../components/items/EmployeeListItem/EmployeeListItem';
import spacing from '../../theme/spacing.json';
import typography from '../../theme/typography.json';
import { SCREENS, HANDOFF_STATUS } from '../../constants';

const MOCK_STOPS = [
  {
    id: '1',
    name: 'Marathahalli Bridge',
    address: 'Outer Ring Road, Marathahalli, Bengaluru 560037',
    time: '08:30 AM',
    employeeCount: 1,
    distance: '2.3 km',
    isCompleted: true,
    isCurrent: false,
  },
  {
    id: '2',
    name: 'Kundalahalli Gate',
    address: 'Kundalahalli Main Rd, Brookefield, Bengaluru 560037',
    time: '08:40 AM',
    employeeCount: 1,
    distance: '1.5 km',
    isCompleted: false,
    isCurrent: true,
  },
  {
    id: '3',
    name: 'ITPL Main Road',
    address: 'ITPL Main Road, Whitefield, Bengaluru 560066',
    time: '08:50 AM',
    employeeCount: 1,
    distance: '3.1 km',
    isCompleted: false,
    isCurrent: false,
  },
  {
    id: '4',
    name: 'Hoodi Junction',
    address: 'Hoodi Village, Whitefield, Bengaluru 560048',
    time: '09:00 AM',
    employeeCount: 1,
    distance: '1.8 km',
    isCompleted: false,
    isCurrent: false,
  },
];

const MOCK_TRIP_EMPLOYEES = [
  {
    id: '1',
    name: 'Priya Sharma',
    employeeId: 'EMP-2045',
    pickupPoint: 'Marathahalli Bridge',
    scheduledTime: '08:30 AM',
    handoffStatus: HANDOFF_STATUS.PICKED_UP,
  },
  {
    id: '2',
    name: 'Amit Patel',
    employeeId: 'EMP-2078',
    pickupPoint: 'Kundalahalli Gate',
    scheduledTime: '08:40 AM',
    handoffStatus: HANDOFF_STATUS.PENDING,
  },
  {
    id: '3',
    name: 'Sneha Reddy',
    employeeId: 'EMP-3012',
    pickupPoint: 'ITPL Main Road',
    scheduledTime: '08:50 AM',
    handoffStatus: HANDOFF_STATUS.PENDING,
  },
  {
    id: '4',
    name: 'Vikram Singh',
    employeeId: 'EMP-3089',
    pickupPoint: 'Hoodi Junction',
    scheduledTime: '09:00 AM',
    handoffStatus: HANDOFF_STATUS.NO_SHOW,
  },
];

const TripDetailsScreen = ({ navigation, route }) => {
  const { trip } = route.params || {};
  const { theme } = useTheme();
  const colors = theme.colors;

  const driverInfo = {
    name: trip?.driverName || 'Rajesh Kumar',
    phone: '+91 98765 00001',
    vehicleNo: trip?.vehicleNo || 'KA-01-AB-1234',
    vehicleType: 'Toyota Innova',
    rating: 4.8,
  };

  const handleCallDriver = () => {
    Linking.openURL(`tel:${driverInfo.phone}`);
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={['bottom']}
    >
      <Header
        title={`Trip #${trip?.id || 'TR-1042'}`}
        subtitle={trip?.scheduledTime || '08:30 AM'}
        showBack
        onBackPress={() => navigation.goBack()}
        rightIcon={
          <Ionicons
            name="ellipsis-vertical"
            size={22}
            color={colors.headerText}
          />
        }
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Trip Status Card */}
        <Card elevated style={styles.statusCard}>
          <View style={styles.statusRow}>
            <StatusBadge status={trip?.status || 'in_progress'} size="md" />
            <Text
              style={[
                styles.tripType,
                {
                  color: colors.textSecondary,
                  fontFamily: typography.fontFamily.medium,
                },
              ]}
            >
              {trip?.type === 'drop' ? 'Drop Trip' : 'Pickup Trip'}
            </Text>
          </View>

          {/* Route Summary */}
          <View style={styles.routeSummary}>
            <View style={styles.routeEndpoint}>
              <View
                style={[styles.routeDot, { backgroundColor: colors.success }]}
              />
              <View style={styles.routeEndpointText}>
                <Text
                  style={[
                    styles.routeLabel,
                    {
                      color: colors.textTertiary,
                      fontFamily: typography.fontFamily.regular,
                    },
                  ]}
                >
                  FROM
                </Text>
                <Text
                  style={[
                    styles.routeValue,
                    {
                      color: colors.text,
                      fontFamily: typography.fontFamily.medium,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {trip?.pickupLocation || 'Tech Park, Whitefield'}
                </Text>
              </View>
            </View>
            <View
              style={[
                styles.routeConnector,
                { borderLeftColor: colors.border },
              ]}
            />
            <View style={styles.routeEndpoint}>
              <View
                style={[styles.routeDot, { backgroundColor: colors.error }]}
              />
              <View style={styles.routeEndpointText}>
                <Text
                  style={[
                    styles.routeLabel,
                    {
                      color: colors.textTertiary,
                      fontFamily: typography.fontFamily.regular,
                    },
                  ]}
                >
                  TO
                </Text>
                <Text
                  style={[
                    styles.routeValue,
                    {
                      color: colors.text,
                      fontFamily: typography.fontFamily.medium,
                    },
                  ]}
                  numberOfLines={1}
                >
                  {trip?.dropLocation || 'Manyata Tech Park'}
                </Text>
              </View>
            </View>
          </View>

          {/* Trip Meta */}
          <View
            style={[styles.tripMeta, { borderTopColor: colors.divider }]}
          >
            <View style={styles.metaItem}>
              <Ionicons
                name="people-outline"
                size={16}
                color={colors.textSecondary}
              />
              <Text
                style={[
                  styles.metaValue,
                  {
                    color: colors.text,
                    fontFamily: typography.fontFamily.medium,
                  },
                ]}
              >
                {trip?.employeeCount || 4}
              </Text>
              <Text
                style={[
                  styles.metaLabel,
                  {
                    color: colors.textSecondary,
                    fontFamily: typography.fontFamily.regular,
                  },
                ]}
              >
                Employees
              </Text>
            </View>
            <View
              style={[styles.metaDivider, { backgroundColor: colors.divider }]}
            />
            <View style={styles.metaItem}>
              <Ionicons
                name="navigate-outline"
                size={16}
                color={colors.textSecondary}
              />
              <Text
                style={[
                  styles.metaValue,
                  {
                    color: colors.text,
                    fontFamily: typography.fontFamily.medium,
                  },
                ]}
              >
                {trip?.stops || 4}
              </Text>
              <Text
                style={[
                  styles.metaLabel,
                  {
                    color: colors.textSecondary,
                    fontFamily: typography.fontFamily.regular,
                  },
                ]}
              >
                Stops
              </Text>
            </View>
            <View
              style={[styles.metaDivider, { backgroundColor: colors.divider }]}
            />
            <View style={styles.metaItem}>
              <Ionicons
                name="time-outline"
                size={16}
                color={colors.textSecondary}
              />
              <Text
                style={[
                  styles.metaValue,
                  {
                    color: colors.text,
                    fontFamily: typography.fontFamily.medium,
                  },
                ]}
              >
                35
              </Text>
              <Text
                style={[
                  styles.metaLabel,
                  {
                    color: colors.textSecondary,
                    fontFamily: typography.fontFamily.regular,
                  },
                ]}
              >
                Min ETA
              </Text>
            </View>
          </View>
        </Card>

        {/* Driver Info Card */}
        <Card
          elevated
          style={styles.driverCard}
          onPress={() =>
            navigation.navigate(SCREENS.DRIVER_INFO, { driver: driverInfo })
          }
        >
          <View style={styles.sectionHeader}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: colors.text,
                  fontFamily: typography.fontFamily.semiBold,
                },
              ]}
            >
              Driver Details
            </Text>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={colors.textTertiary}
            />
          </View>
          <View style={styles.driverRow}>
            <Avatar name={driverInfo.name} size={48} />
            <View style={styles.driverDetails}>
              <Text
                style={[
                  styles.driverName,
                  {
                    color: colors.text,
                    fontFamily: typography.fontFamily.semiBold,
                  },
                ]}
              >
                {driverInfo.name}
              </Text>
              <View style={styles.vehicleRow}>
                <Ionicons
                  name="car-sport-outline"
                  size={14}
                  color={colors.textSecondary}
                />
                <Text
                  style={[
                    styles.vehicleText,
                    {
                      color: colors.textSecondary,
                      fontFamily: typography.fontFamily.regular,
                    },
                  ]}
                >
                  {driverInfo.vehicleType} | {driverInfo.vehicleNo}
                </Text>
              </View>
              <View style={styles.ratingRow}>
                <Ionicons name="star" size={14} color={colors.warning} />
                <Text
                  style={[
                    styles.ratingText,
                    {
                      color: colors.textSecondary,
                      fontFamily: typography.fontFamily.medium,
                    },
                  ]}
                >
                  {driverInfo.rating}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={handleCallDriver}
              style={[
                styles.callDriverButton,
                { backgroundColor: colors.successBackground },
              ]}
            >
              <Ionicons name="call" size={20} color={colors.success} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Stops Timeline */}
        <Card elevated style={styles.stopsCard}>
          <View style={styles.sectionHeader}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: colors.text,
                  fontFamily: typography.fontFamily.semiBold,
                },
              ]}
            >
              Route Stops
            </Text>
            <Text
              style={[
                styles.stopsCount,
                {
                  color: colors.primary,
                  fontFamily: typography.fontFamily.medium,
                },
              ]}
            >
              1/{MOCK_STOPS.length} completed
            </Text>
          </View>
          {MOCK_STOPS.map((stop, index) => (
            <StopItem
              key={stop.id}
              stop={stop}
              index={index}
              isLast={index === MOCK_STOPS.length - 1}
            />
          ))}
        </Card>

        {/* Employees List */}
        <Card elevated style={styles.employeesCard}>
          <View style={styles.sectionHeader}>
            <Text
              style={[
                styles.sectionTitle,
                {
                  color: colors.text,
                  fontFamily: typography.fontFamily.semiBold,
                },
              ]}
            >
              Employees
            </Text>
          </View>
          {MOCK_TRIP_EMPLOYEES.map((employee) => (
            <EmployeeListItem
              key={employee.id}
              employee={employee}
              onPress={(emp) =>
                navigation.navigate(SCREENS.STOP_DETAILS, { employee: emp })
              }
              showActions={false}
            />
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: spacing.xxxl,
  },
  statusCard: {
    marginBottom: spacing.md,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  tripType: {
    fontSize: typography.fontSize.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  routeSummary: {
    marginBottom: spacing.base,
  },
  routeEndpoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
    marginRight: spacing.md,
  },
  routeEndpointText: {
    flex: 1,
  },
  routeLabel: {
    fontSize: typography.fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  routeValue: {
    fontSize: typography.fontSize.md,
    marginTop: 2,
  },
  routeConnector: {
    borderLeftWidth: 1.5,
    borderStyle: 'dashed',
    height: 20,
    marginLeft: 4,
    marginVertical: 2,
  },
  tripMeta: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingTop: spacing.md,
  },
  metaItem: {
    alignItems: 'center',
  },
  metaValue: {
    fontSize: typography.fontSize.lg,
    marginTop: spacing.xs,
  },
  metaLabel: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
  metaDivider: {
    width: 1,
    height: '100%',
  },
  driverCard: {
    marginBottom: spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  driverDetails: {
    flex: 1,
    marginLeft: spacing.md,
  },
  driverName: {
    fontSize: typography.fontSize.md,
    marginBottom: 2,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  vehicleText: {
    fontSize: typography.fontSize.sm,
    marginLeft: spacing.xs,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: typography.fontSize.sm,
    marginLeft: spacing.xs,
  },
  callDriverButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopsCard: {
    marginBottom: spacing.md,
  },
  stopsCount: {
    fontSize: typography.fontSize.sm,
  },
  employeesCard: {
    marginBottom: spacing.md,
    padding: 0,
    overflow: 'hidden',
  },
});

export default TripDetailsScreen;
