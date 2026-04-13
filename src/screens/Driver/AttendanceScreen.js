/**
 * AttendanceScreen — Figma Driver Handoff "Attendance"
 *
 * Layout:
 *   • Header: "Confirm Attendance" + "StopName (Nth Stop)"
 *   • Arc progress ring: X/Y Boarded
 *   • Employee cards: Avatar | Boarded/No-Show chip | Name | time | toggle
 *   • "Confirm & Continue" sticky footer button
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { useTheme } from '../../theme/ThemeProvider';
import { Avatar } from '../../components';
import { fetchTripStops } from '../../redux/slices/tripSlice';
import { useTrackingSocket } from '../../hooks/useTrackingSocket';
import { tripService } from '../../services/api/tripService';

// ─── Arc progress ring (no SVG needed) ───────────────────────────────────────
// Uses the "two-clipped-halves" technique: right clip shows 0–180°, left shows 180–360°
const ArcRing = ({ count, total, color = '#643ee8', size = 120, sw = 11 }) => {
  const pct   = total > 0 ? Math.min(1, count / total) : 0;
  const half  = size / 2;
  const inner = size - sw * 2;
  const track = '#ede9fe';

  // Right half: rotates from -90° (12 o'clock) to +90° (6 o'clock) = 0–50%
  const rDeg  = Math.min(pct, 0.5) * 360;         // 0–180
  // Left half: rotates from -90° further = 50–100%
  const lDeg  = pct > 0.5 ? (pct - 0.5) * 360 : 0; // 0–180

  return (
    <View style={{ width: size, height: size }}>
      {/* Background track */}
      <View style={{
        position: 'absolute', width: size, height: size,
        borderRadius: half, borderWidth: sw, borderColor: track,
      }} />

      {/* Right arc (0–50%) — clips right half, rotates the full ring inside */}
      {pct > 0 && (
        <View style={{
          position: 'absolute', overflow: 'hidden',
          width: half, height: size, right: 0, top: 0,
        }}>
          <View style={{
            position: 'absolute', width: size, height: size, right: 0,
            borderRadius: half, borderWidth: sw, borderColor: color,
            transform: [{ rotate: `${rDeg}deg` }],
          }} />
        </View>
      )}

      {/* Left arc (50–100%) — clips left half */}
      {lDeg > 0 && (
        <View style={{
          position: 'absolute', overflow: 'hidden',
          width: half, height: size, left: 0, top: 0,
        }}>
          <View style={{
            position: 'absolute', width: size, height: size, left: 0,
            borderRadius: half, borderWidth: sw, borderColor: color,
            transform: [{ rotate: `${lDeg}deg` }],
          }} />
        </View>
      )}

      {/* White inner circle — creates the donut hole */}
      <View style={{
        position: 'absolute',
        top: sw, left: sw,
        width: inner, height: inner,
        borderRadius: inner / 2,
        backgroundColor: '#fff',
        alignItems: 'center', justifyContent: 'center',
      }}>
        <Text style={{ fontSize: size * 0.20, fontWeight: '800', color: '#1a1a2e' }}>
          {count}/{total}
        </Text>
        <Text style={{ fontSize: size * 0.095, color: '#6b7280', marginTop: 2 }}>
          Boarded
        </Text>
      </View>
    </View>
  );
};

// ─── Employee card ────────────────────────────────────────────────────────────
const EmployeeCard = ({ emp, primaryColor, colors, onToggle }) => (
  <View style={[styles.card, { borderBottomColor: colors.borderLight }]}>
    <Avatar name={emp.name} size={48} />
    <View style={styles.cardBody}>
      <View style={[
        styles.chip,
        { backgroundColor: emp.boarded ? '#dcfce7' : '#fee2e2' },
      ]}>
        <Text style={[styles.chipTxt, { color: emp.boarded ? '#16a34a' : '#dc2626' }]}>
          {emp.boarded ? 'Boarded' : 'No Show'}
        </Text>
      </View>
      <Text style={[styles.cardName, { color: colors.text }]}>{emp.name}</Text>
      {emp.time ? (
        <View style={styles.timeRow}>
          <Ionicons name="time-outline" size={11} color={colors.textTertiary} />
          <Text style={[styles.cardTime, { color: colors.textSecondary }]}>{emp.time}</Text>
        </View>
      ) : null}
    </View>
    <Switch
      value={emp.boarded}
      onValueChange={(v) => onToggle(emp.id, v)}
      trackColor={{ false: colors.border, true: primaryColor }}
      thumbColor="#fff"
      ios_backgroundColor={colors.border}
    />
  </View>
);

// ─── Ordinal helper ───────────────────────────────────────────────────────────
const ordinal = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return (s[(v - 20) % 10] || s[v] || s[0]);
};

// ─── Screen ───────────────────────────────────────────────────────────────────
const AttendanceScreen = ({ navigation, route }) => {
  const { theme }  = useTheme();
  const colors     = theme.colors;
  const dispatch   = useDispatch();

  const stopData = route?.params?.stop ?? {};
  const tripId   = route?.params?.tripId ?? null;

  const { emitStopArrival } = useTrackingSocket();

  const [employees, setEmployees] = useState(
    (stopData.employees ?? []).map((e) => ({
      ...e,
      boarded: e.boarded ?? e.status === 'picked_up',
    }))
  );
  const [confirming, setConfirming] = useState(false);

  const boardedCount = employees.filter((e) => e.boarded).length;
  const total        = employees.length;
  const stopId       = stopData.id ?? stopData.stopId;
  const stopNo       = stopData.stopNumber ?? stopData.number ?? 1;
  const stopName     = stopData.stopName ?? stopData.name ?? 'Stop';

  const toggle = (id, val) =>
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, boarded: val } : e)));

  const handleConfirm = async () => {
    if (!tripId || !stopId) {
      Alert.alert('Error', 'Trip or stop information is missing.');
      return;
    }
    setConfirming(true);
    try {
      // 1. Record stop arrival on backend
      await tripService.arriveAtStop(tripId, stopId);

      // 2. Save boarding status per employee
      const statuses = employees.map((e) => ({
        employeeId: e.id,
        status: e.boarded ? 'picked_up' : 'no_show',
      }));
      await tripService.updateEmployeeBoarding(tripId, stopId, statuses).catch(() => {
        console.warn('[Attendance] updateEmployeeBoarding not yet on BE — skipped');
      });

      // 3. Emit socket so employees get real-time notification
      emitStopArrival({ tripId, stopId, cabId: null, driverId: null });

      // 4. Refresh Redux stops → DriverActiveTripScreen goes green for this stop
      dispatch(fetchTripStops(tripId));

      // 5. Go back — focus listener on DriverActiveTripScreen re-fetches stops
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to confirm. Please try again.');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.text }]}>Confirm Attendance</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {stopName} ({stopNo}{ordinal(stopNo)} Stop)
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Arc ring */}
        <View style={styles.ringWrap}>
          <ArcRing count={boardedCount} total={total} color={colors.primary} />
        </View>

        {/* Employee cards */}
        {total === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="people-outline" size={46} color={colors.textTertiary} />
            <Text style={[styles.emptyTxt, { color: colors.textSecondary }]}>
              No employees at this stop
            </Text>
          </View>
        ) : (
          <View style={[styles.listCard, { backgroundColor: colors.surface }]}>
            {employees.map((emp, i) => (
              <View key={emp.id}>
                <EmployeeCard
                  emp={emp}
                  primaryColor={colors.primary}
                  colors={colors}
                  onToggle={toggle}
                />
                {i < employees.length - 1 && (
                  <View style={[styles.sep, { backgroundColor: colors.borderLight }]} />
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.borderLight }]}>
        <TouchableOpacity
          style={[styles.confirmBtn, { backgroundColor: confirming ? colors.textTertiary : colors.primary }]}
          onPress={handleConfirm}
          disabled={confirming}
          activeOpacity={0.85}
        >
          {confirming ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmTxt}>Confirm &amp; Continue</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 14,
    borderBottomWidth: 1, gap: 10,
  },
  backBtn: { padding: 4 },
  title:    { fontSize: 20, fontWeight: '700' },
  subtitle: { fontSize: 13, marginTop: 2 },

  scroll:  { paddingBottom: 120, paddingHorizontal: 16 },
  ringWrap: { alignItems: 'center', marginVertical: 28 },

  empty:    { alignItems: 'center', paddingVertical: 40, gap: 12 },
  emptyTxt: { fontSize: 14 },

  listCard: {
    borderRadius: 16, overflow: 'hidden',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 2,
  },
  card: {
    flexDirection: 'row', alignItems: 'center',
    padding: 16, gap: 12, backgroundColor: '#fff',
  },
  cardBody: { flex: 1, gap: 3 },
  chip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8, paddingVertical: 2,
    borderRadius: 999,
  },
  chipTxt:  { fontSize: 11, fontWeight: '700' },
  cardName: { fontSize: 15, fontWeight: '700' },
  timeRow:  { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardTime: { fontSize: 12 },
  sep:      { height: 1, marginHorizontal: 16 },

  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    paddingHorizontal: 16, paddingBottom: 32, paddingTop: 12,
    borderTopWidth: 1,
  },
  confirmBtn: {
    height: 54, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  confirmTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default AttendanceScreen;
