import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { Avatar } from '../../components';

const DEFAULT_STOP = {
  stopName: 'BSR Mall',
  stopNumber: 3,
  employees: [
    { id: 'e1', name: 'James Parker', time: '8:45 AM', boarded: true },
    { id: 'e2', name: 'Miss Ian Bosco', time: '8:45 AM', boarded: true },
    { id: 'e3', name: 'Lana Mante', time: '8:45 AM', boarded: false },
  ],
};

const EmployeeCard = ({ emp, primaryColor, colors, onToggle }) => (
  <View style={[styles.card, { borderBottomColor: colors.borderLight }]}>
    <Avatar name={emp.name} size={46} />
    <View style={styles.cardBody}>
      <View style={[styles.statusChip, { backgroundColor: emp.boarded ? '#e8f6ed' : '#fce8e8' }]}>
        <Text style={[styles.statusChipText, { color: emp.boarded ? '#16a34a' : '#dc2626' }]}>
          {emp.boarded ? 'Boarded' : 'No Show'}
        </Text>
      </View>
      <Text style={[styles.cardName, { color: colors.text }]}>{emp.name}</Text>
      <View style={styles.timeRow}>
        <Ionicons name="time-outline" size={12} color={colors.textTertiary} />
        <Text style={[styles.cardTime, { color: colors.textSecondary }]}>{emp.time}</Text>
      </View>
    </View>
    <Switch
      value={emp.boarded}
      onValueChange={(val) => onToggle(emp.id, val)}
      trackColor={{ false: colors.border, true: primaryColor }}
      thumbColor="#ffffff"
      ios_backgroundColor={colors.border}
    />
  </View>
);

const ordinalSuffix = (n) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
};

const AttendanceScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const stopData = route?.params?.stop ?? DEFAULT_STOP;

  const [employees, setEmployees] = useState(stopData.employees ?? DEFAULT_STOP.employees);

  const boardedCount = employees.filter((e) => e.boarded).length;
  const total = employees.length;
  const stopNo = stopData.stopNumber ?? DEFAULT_STOP.stopNumber;
  const stopName = stopData.stopName ?? DEFAULT_STOP.stopName;

  const toggle = (id, val) => {
    setEmployees((prev) => prev.map((e) => (e.id === id ? { ...e, boarded: val } : e)));
  };

  const handleConfirm = () => {
    Alert.alert(
      'Attendance Confirmed',
      `${boardedCount} of ${total} employees boarded at ${stopName}.`,
      [{ text: 'Continue', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Confirm Attendance</Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
            {stopName} ({stopNo}{ordinalSuffix(stopNo)} Stop)
          </Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Progress ring */}
        <View style={styles.ringWrapper}>
          <View style={[styles.ring, {
            borderTopColor: colors.primary,
            borderLeftColor: colors.primary,
            borderBottomColor: colors.border,
            borderRightColor: colors.border,
          }]}>
            <Text style={[styles.ringCount, { color: colors.text }]}>{boardedCount}/{total}</Text>
            <Text style={[styles.ringLabel, { color: colors.textSecondary }]}>Boarded</Text>
          </View>
        </View>

        {/* Employee list */}
        <View style={[styles.listCard, { backgroundColor: colors.surface }]}>
          {employees.map((emp, idx) => (
            <View key={emp.id}>
              <EmployeeCard emp={emp} primaryColor={colors.primary} colors={colors} onToggle={toggle} />
              {idx < employees.length - 1 && (
                <View style={[styles.sep, { backgroundColor: colors.borderLight }]} />
              )}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.borderLight }]}>
        <TouchableOpacity
          style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
          onPress={handleConfirm}
          activeOpacity={0.85}
        >
          <Text style={styles.confirmBtnText}>Confirm & Continue</Text>
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
    gap: 10,
  },
  backBtn: { padding: 4 },
  headerText: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: '700' },
  headerSub: { fontSize: 14, marginTop: 2 },
  scrollContent: { paddingBottom: 120, paddingHorizontal: 16 },
  ringWrapper: { alignItems: 'center', marginVertical: 28 },
  ring: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCount: { fontSize: 26, fontWeight: '800' },
  ringLabel: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  listCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    backgroundColor: '#ffffff',
  },
  cardBody: { flex: 1, gap: 3 },
  statusChip: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
  statusChipText: { fontSize: 11, fontWeight: '700' },
  cardName: { fontSize: 15, fontWeight: '700' },
  timeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  cardTime: { fontSize: 12 },
  sep: { height: 1, marginHorizontal: 16 },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  confirmBtn: {
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: { color: '#ffffff', fontSize: 16, fontWeight: '700' },
});

export default AttendanceScreen;
