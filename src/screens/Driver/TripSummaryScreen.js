import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../theme/ThemeProvider';
import { StatusBadge, Avatar } from '../../components';
import { saveTripData } from '../../redux/slices/driverSlice';

const MetaStat = ({ label, value, colors }) => (
  <View style={styles.metaStat}>
    <Text style={[styles.metaValue, { color: colors.text }]}>{value}</Text>
    <Text style={[styles.metaLabel, { color: colors.textSecondary }]}>{label}</Text>
  </View>
);

const SummaryStopItem = ({ stop, isLast, colors }) => (
  <View style={styles.stopRow}>
    <View style={styles.stopTimeline}>
      <View style={[styles.stopDot, { backgroundColor: '#16a34a' }]} />
      {!isLast && <View style={[styles.stopLine, { borderLeftColor: colors.border }]} />}
    </View>
    <View style={[styles.stopCard, { backgroundColor: colors.surface }]}>
      <View style={styles.stopCardHeader}>
        <View style={styles.stopCardLeft}>
          <Text style={[styles.stopTime, { color: colors.textSecondary }]}>{stop.actualTime ?? stop.time}</Text>
          <Text style={[styles.stopName, { color: colors.text }]}>{stop.name}</Text>
        </View>
        {!stop.isDestination && (
          <StatusBadge status="completed" />
        )}
      </View>
      {stop.employees && stop.employees.length > 0 && (
        <View style={styles.empList}>
          {stop.employees.map((emp) => (
            <View key={emp.id} style={styles.empRow}>
              <Avatar name={emp.name} size={28} />
              <Text style={[styles.empName, { color: colors.text }]}>{emp.name}</Text>
              <View style={[styles.empStatus, {
                backgroundColor: emp.status === 'picked_up' ? '#e8f6ed' : '#fce8e8',
              }]}>
                <Text style={[styles.empStatusText, {
                  color: emp.status === 'picked_up' ? '#16a34a' : '#dc2626',
                }]}>
                  {emp.status === 'picked_up' ? 'Picked Up' : 'No Show'}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
      {stop.isDestination && (
        <Text style={[styles.destinationLabel, { color: colors.textSecondary }]}>Destination reached</Text>
      )}
    </View>
  </View>
);

const TripSummaryScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const dispatch = useDispatch();

  const tripSummary = useSelector((state) => state.driver.tripSummary);
  const routeStops = useSelector((state) => state.trip.tripStops);

  // Build summary from Redux state or route params fallback
  const summaryBase = route?.params?.summary ?? tripSummary ?? {};
  const summary = {
    tripNumber: summaryBase.tripNumber ?? summaryBase.tripId ?? 'Trip',
    vehicle: summaryBase.vehicle ?? summaryBase.cabNumber ?? '',
    vehicleType: summaryBase.vehicleType ?? '',
    startedAt: summaryBase.startedAt ?? '',
    endedAt: summaryBase.endedAt ?? summaryBase.completedAt ?? '',
    totalPickups: summaryBase.totalPickups ?? routeStops.reduce((n, s) => n + (s.employees?.filter((e) => e.status === 'picked_up').length ?? 0), 0),
    totalStops: summaryBase.totalStops ?? routeStops.length,
    totalDistance: summaryBase.totalDistance ?? summaryBase.distance ?? '',
    routeStops: summaryBase.routeStops ?? routeStops,
  };

  const handleSaveTripData = () => {
    dispatch(saveTripData()).finally(() => {
      Alert.alert('Trip Saved', 'Trip data has been saved successfully!', [
        { text: 'OK', onPress: () => navigation.popToTop() },
      ]);
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Trip Data Capture</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Trip ID banner */}
        <View style={[styles.tripBanner, { backgroundColor: colors.primaryContainer }]}>
          <Text style={[styles.tripNumber, { color: colors.primary }]}>{summary.tripNumber}</Text>
          <View style={styles.tripMeta}>
            <View style={styles.tripMetaRow}>
              <Ionicons name="car-outline" size={14} color={colors.primary} />
              <Text style={[styles.tripMetaText, { color: colors.primary }]}>
                {summary.vehicle} • {summary.vehicleType}
              </Text>
            </View>
            <View style={styles.tripMetaRow}>
              <Ionicons name="time-outline" size={14} color={colors.primary} />
              <Text style={[styles.tripMetaText, { color: colors.primary }]}>
                {summary.startedAt} – {summary.endedAt}
              </Text>
            </View>
          </View>
        </View>

        {/* Stats row */}
        <View style={[styles.statsCard, { backgroundColor: colors.surface }]}>
          <MetaStat label="Pickups" value={summary.totalPickups} colors={colors} />
          <View style={[styles.statSep, { backgroundColor: colors.borderLight }]} />
          <MetaStat label="Stops" value={summary.totalStops} colors={colors} />
          <View style={[styles.statSep, { backgroundColor: colors.borderLight }]} />
          <MetaStat label="Distance" value={summary.totalDistance} colors={colors} />
          <View style={[styles.statSep, { backgroundColor: colors.borderLight }]} />
          <MetaStat label="Route" value="✓ Tracked" colors={colors} />
        </View>

        {/* Route stops */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Route Stops</Text>
        <View style={styles.stopsList}>
          {summary.routeStops.map((stop, idx) => (
            <SummaryStopItem
              key={stop.id}
              stop={stop}
              isLast={idx === summary.routeStops.length - 1}
              colors={colors}
            />
          ))}
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Save button */}
      <View style={[styles.saveBtnContainer, { backgroundColor: colors.surface, borderTopColor: colors.borderLight }]}>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          onPress={handleSaveTripData}
          activeOpacity={0.85}
        >
          <Text style={styles.saveBtnText}>Save Trip Data</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 4, marginRight: 12 },
  headerTitle: { flex: 1, fontSize: 20, fontWeight: '700', textAlign: 'center' },
  scrollContent: { padding: 16 },

  tripBanner: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
  },
  tripNumber: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  tripMeta: { gap: 4 },
  tripMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  tripMetaText: { fontSize: 13 },

  statsCard: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  metaStat: { flex: 1, alignItems: 'center' },
  metaValue: { fontSize: 16, fontWeight: '700' },
  metaLabel: { fontSize: 11, marginTop: 2 },
  statSep: { width: 1, height: 36 },

  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 14 },
  stopsList: {},

  stopRow: { flexDirection: 'row', gap: 12 },
  stopTimeline: { alignItems: 'center', width: 20 },
  stopDot: { width: 12, height: 12, borderRadius: 6, marginTop: 16 },
  stopLine: { flex: 1, borderLeftWidth: 2, borderStyle: 'dashed', marginTop: 4, minHeight: 24 },
  stopCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  stopCardHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  stopCardLeft: {},
  stopTime: { fontSize: 11, marginBottom: 2 },
  stopName: { fontSize: 15, fontWeight: '700' },
  empList: { marginTop: 10, gap: 8 },
  empRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  empName: { flex: 1, fontSize: 13, fontWeight: '500' },
  empStatus: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  empStatusText: { fontSize: 11, fontWeight: '600' },
  destinationLabel: { fontSize: 13, marginTop: 4 },

  saveBtnContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  saveBtn: {
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#643ee8',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default TripSummaryScreen;
