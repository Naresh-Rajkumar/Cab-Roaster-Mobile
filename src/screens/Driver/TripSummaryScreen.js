import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { Avatar, Button } from '../../components';
import spacing from '../../theme/spacing.json';
import typography from '../../theme/typography.json';
import { SCREENS } from '../../constants';

const ROUTE_STOPS = [
  {
    id: 's1',
    time: '9:30 AM',
    location: 'Madippakkam',
    employees: [
      { id: 'e1', name: 'Tommie Strosin', status: 'Picked Up', statusColor: '#4CAF50' },
    ],
  },
  {
    id: 's2',
    time: '9:45 AM',
    location: 'BSR Mall',
    employees: [
      { id: 'e2', name: 'James Parker', status: 'No Show', statusColor: '#E53935' },
      { id: 'e3', name: 'Miss Ian Bosco', status: 'Picked Up', statusColor: '#4CAF50' },
      { id: 'e4', name: 'Lana Mante', status: 'Picked Up', statusColor: '#4CAF50' },
    ],
  },
  {
    id: 's3',
    time: '10:15 AM',
    location: 'Aavin Bus Stop',
    employees: [
      { id: 'e5', name: 'Jim Dicki', status: 'Picked Up', statusColor: '#4CAF50' },
    ],
  },
  {
    id: 's4',
    time: '10:30 AM',
    location: 'vThink Office',
    employees: [],
  },
];

const EmployeeRow = ({ employee, colors, isLast }) => (
  <View
    style={[
      styles.employeeRow,
      !isLast && { borderBottomWidth: 1, borderBottomColor: colors.border || '#F0F0F0' },
    ]}
  >
    <Avatar size={32} name={employee.name} />
    <Text style={[styles.employeeName, { color: colors.text }]}>{employee.name}</Text>
    {employee.status && (
      <View style={[styles.statusPill, { backgroundColor: employee.statusColor + '1A' }]}>
        <Text style={[styles.statusPillText, { color: employee.statusColor }]}>
          {employee.status}
        </Text>
      </View>
    )}
  </View>
);

const RouteStopItem = ({ stop, isLast, colors }) => (
  <View style={styles.routeStopItem}>
    {/* Timeline */}
    <View style={styles.timelineCol}>
      <View
        style={[
          styles.stopDot,
          {
            backgroundColor: isLast ? '#6B4EFF' : '#4CAF50',
            borderColor: isLast ? '#6B4EFF' : '#4CAF50',
          },
        ]}
      />
      {!isLast && <View style={[styles.stopLine, { borderColor: '#E0E0E0' }]} />}
    </View>

    {/* Content */}
    <View style={styles.stopContent}>
      <View style={styles.stopHeaderRow}>
        <Text style={[styles.stopTime, { color: colors.textSecondary }]}>{stop.time}</Text>
        <Text style={[styles.stopLocation, { color: colors.text }]}>{stop.location}</Text>
      </View>

      {stop.employees.length > 0 && (
        <View style={[styles.employeeBlock, { backgroundColor: '#F8F8F8', borderRadius: 10, padding: 10, marginTop: 8 }]}>
          {stop.employees.map((emp, idx) => (
            <EmployeeRow
              key={emp.id}
              employee={emp}
              colors={colors}
              isLast={idx === stop.employees.length - 1}
            />
          ))}
        </View>
      )}
    </View>
  </View>
);

export default function TripSummaryScreen({ navigation, route }) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const handleSaveTripData = () => {
    navigation.navigate(SCREENS.DRIVER_HOME || 'DriverHome');
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border || '#F0F0F0' }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Trip Data Capture</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Trip number label */}
        <Text style={[styles.tripLabel, { color: colors.text }]}>Trip #231</Text>

        {/* Vehicle info card */}
        <View style={[styles.vehicleCard, { backgroundColor: colors.card }]}>
          <View style={[styles.vehicleIconContainer, { backgroundColor: '#EDE7FF' }]}>
            <Ionicons name="car" size={24} color="#6B4EFF" />
          </View>
          <View style={styles.vehicleInfo}>
            <Text style={[styles.vehiclePlate, { color: colors.text }]}>
              TN 14 CV 3755 • Ertiga
            </Text>
            <Text style={[styles.vehicleTiming, { color: colors.textSecondary }]}>
              Started @ 9:30 AM  ···  Ended @ 10:30 AM
            </Text>
          </View>
        </View>

        {/* Stats row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View style={[styles.statIconWrap, { backgroundColor: '#EDE7FF' }]}>
              <Ionicons name="people" size={20} color="#6B4EFF" />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>5</Text>
            <Text style={[styles.statKey, { color: colors.textSecondary }]}>Pickups</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <View style={[styles.statIconWrap, { backgroundColor: '#EDE7FF' }]}>
              <Ionicons name="location" size={20} color="#6B4EFF" />
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>3</Text>
            <Text style={[styles.statKey, { color: colors.textSecondary }]}>Stops</Text>
          </View>
        </View>

        {/* Total distance card */}
        <View style={[styles.distanceCard, { backgroundColor: colors.card }]}>
          <View style={[styles.statIconWrap, { backgroundColor: '#EDE7FF' }]}>
            <Ionicons name="git-branch" size={20} color="#6B4EFF" />
          </View>
          <Text style={[styles.distanceLabel, { color: colors.textSecondary }]}>
            Total Distance
          </Text>
          <Text style={[styles.distanceValue, { color: colors.text }]}>18.2 km</Text>
        </View>

        {/* Map thumbnail card */}
        <View style={[styles.mapCard, { backgroundColor: '#D8E8D0' }]}>
          {/* Map grid lines */}
          {[...Array(4)].map((_, i) => (
            <View
              key={`mh${i}`}
              style={[styles.mapGridH, { top: `${(i + 1) * 20}%`, backgroundColor: '#C5D9BC' }]}
            />
          ))}
          {[...Array(4)].map((_, i) => (
            <View
              key={`mv${i}`}
              style={[styles.mapGridV, { left: `${(i + 1) * 20}%`, backgroundColor: '#C5D9BC' }]}
            />
          ))}

          {/* Route path line */}
          <View style={[styles.mapRouteLine, { backgroundColor: '#6B4EFF' }]} />

          {/* Overlay text */}
          <View style={[styles.mapOverlay, { backgroundColor: 'rgba(107,78,255,0.85)' }]}>
            <Ionicons name="map" size={18} color="#FFFFFF" />
            <View style={styles.mapOverlayText}>
              <Text style={styles.mapOverlayTitle}>Route Tracking</Text>
              <Text style={styles.mapOverlaySubtitle}>Trip path recorded successfully</Text>
            </View>
          </View>
        </View>

        {/* Route Stops section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Route Stops</Text>
        <View style={[styles.stopsCard, { backgroundColor: colors.card }]}>
          {ROUTE_STOPS.map((stop, index) => (
            <RouteStopItem
              key={stop.id}
              stop={stop}
              isLast={index === ROUTE_STOPS.length - 1}
              colors={colors}
            />
          ))}
        </View>

        {/* Bottom padding for sticky button */}
        <View style={{ height: 90 }} />
      </ScrollView>

      {/* Sticky Save Button */}
      <View style={[styles.stickyBottom, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: '#6B4EFF' }]}
          onPress={handleSaveTripData}
          activeOpacity={0.85}
        >
          <Text style={styles.saveButtonText}>Save Trip Data</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
    width: 36,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 20,
  },
  tripLabel: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  vehicleIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  vehicleInfo: {
    flex: 1,
  },
  vehiclePlate: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  vehicleTiming: {
    fontSize: 12,
    fontWeight: '400',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 2,
  },
  statKey: {
    fontSize: 13,
    fontWeight: '500',
  },
  distanceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  distanceLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  distanceValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  mapCard: {
    height: 150,
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  mapGridH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    opacity: 0.5,
  },
  mapGridV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    opacity: 0.5,
  },
  mapRouteLine: {
    position: 'absolute',
    top: '40%',
    left: '15%',
    right: '15%',
    height: 4,
    borderRadius: 2,
    transform: [{ rotate: '-15deg' }],
    opacity: 0.7,
  },
  mapOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
    borderRadius: 0,
  },
  mapOverlayText: {},
  mapOverlayTitle: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  mapOverlaySubtitle: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '400',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  stopsCard: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  routeStopItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timelineCol: {
    alignItems: 'center',
    width: 20,
    marginRight: 14,
  },
  stopDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    marginTop: 2,
  },
  stopLine: {
    flex: 1,
    width: 2,
    borderLeftWidth: 2,
    borderStyle: 'dashed',
    minHeight: 24,
    marginTop: 4,
  },
  stopContent: {
    flex: 1,
    paddingBottom: 16,
  },
  stopHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stopTime: {
    fontSize: 12,
    fontWeight: '400',
  },
  stopLocation: {
    fontSize: 15,
    fontWeight: '600',
  },
  employeeBlock: {},
  employeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
  },
  employeeName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
  },
  statusPillText: {
    fontSize: 12,
    fontWeight: '600',
  },
  stickyBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    paddingBottom: 28,
    paddingTop: 12,
  },
  saveButton: {
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6B4EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
