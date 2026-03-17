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
import { SCREENS } from '../../constants';
import spacing from '../../theme/spacing.json';
import typography from '../../theme/typography.json';

const STOP_DATA = {
  stopName: 'BSR Mall',
  stopNumber: 3,
  employees: [
    { id: 'e1', name: 'James Parker', time: '8:45 AM', boarded: true },
    { id: 'e2', name: 'Miss Ian Bosco', time: '8:45 AM', boarded: true },
    { id: 'e3', name: 'Lana Mante', time: '8:45 AM', boarded: false },
  ],
};

const AVATAR_COLORS = ['#6C3AE1', '#4CAF50', '#E53935', '#FF9800', '#03A9F4', '#9C27B0'];

const getAvatarColor = (name) => {
  const index = name.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

const getInitials = (name) =>
  name
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase();

const Avatar = ({ name, size = 44 }) => (
  <View
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: getAvatarColor(name),
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <Text style={{ color: '#FFFFFF', fontSize: size * 0.36, fontWeight: '700' }}>
      {getInitials(name)}
    </Text>
  </View>
);

const EmployeeCard = ({ emp, primaryColor, onToggle }) => {
  const boarded = emp.boarded;

  return (
    <View style={styles.card}>
      <Avatar name={emp.name} size={46} />

      <View style={styles.cardInfo}>
        <View style={[styles.statusPill, { backgroundColor: boarded ? '#DCFCE7' : '#FEE2E2' }]}>
          <Text style={[styles.statusPillText, { color: boarded ? '#22C55E' : '#EF4444' }]}>
            {boarded ? 'Boarded' : 'No Show'}
          </Text>
        </View>
        <Text style={styles.cardName}>{emp.name}</Text>
        <View style={styles.cardTimeLine}>
          <Ionicons name="time-outline" size={12} color="#9E9E9E" />
          <Text style={styles.cardTime}>{emp.time}</Text>
        </View>
      </View>

      <Switch
        value={boarded}
        onValueChange={(val) => onToggle(emp.id, val)}
        trackColor={{ false: '#E0E0E0', true: primaryColor }}
        thumbColor="#FFFFFF"
        ios_backgroundColor="#E0E0E0"
      />
    </View>
  );
};

export default function AttendanceScreen({ navigation }) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [employees, setEmployees] = useState(STOP_DATA.employees);

  const boardedCount = employees.filter((e) => e.boarded).length;
  const total = employees.length;

  const toggleEmployee = (id, val) => {
    setEmployees((prev) =>
      prev.map((emp) => (emp.id === id ? { ...emp, boarded: val } : emp))
    );
  };

  const handleConfirm = () => {
    Alert.alert(
      'Attendance Confirmed',
      `${boardedCount} of ${total} employees boarded at ${STOP_DATA.stopName}.`,
      [
        {
          text: 'Next Stop',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerTitles}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Confirm Attendance</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary || '#6B7280' }]}>
            {STOP_DATA.stopName} ({STOP_DATA.stopNumber}
            {STOP_DATA.stopNumber === 1
              ? 'st'
              : STOP_DATA.stopNumber === 2
              ? 'nd'
              : STOP_DATA.stopNumber === 3
              ? 'rd'
              : 'th'}{' '}
            Stop)
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Donut progress ring */}
        <View style={styles.donutWrapper}>
          <View
            style={[
              styles.donutRing,
              {
                borderTopColor: colors.primary || '#6C3AE1',
                borderLeftColor: colors.primary || '#6C3AE1',
                borderBottomColor: '#E0E0E0',
                borderRightColor: '#E0E0E0',
              },
            ]}
          >
            <Text style={[styles.donutNum, { color: colors.text }]}>
              {boardedCount}/{total}
            </Text>
            <Text style={[styles.donutSub, { color: colors.textSecondary || '#6B7280' }]}>
              Boarded
            </Text>
          </View>
        </View>

        {/* Employee list */}
        <View style={styles.listContainer}>
          {employees.map((emp, idx) => (
            <View key={emp.id}>
              <EmployeeCard
                emp={emp}
                primaryColor={colors.primary || '#6C3AE1'}
                onToggle={toggleEmployee}
              />
              {idx < employees.length - 1 && <View style={styles.separator} />}
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Sticky bottom button */}
      <View style={[styles.stickyBottom, { backgroundColor: colors.background }]}>
        <TouchableOpacity
          style={[styles.confirmBtn, { backgroundColor: colors.primary || '#6C3AE1' }]}
          onPress={handleConfirm}
          activeOpacity={0.85}
        >
          <Text style={styles.confirmBtnText}>Confirm &amp; Continue</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    gap: 10,
  },
  backBtn: {
    padding: 4,
  },
  headerTitles: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '400',
    marginTop: 2,
  },

  // Scroll
  scrollContent: {
    paddingBottom: 120,
    paddingHorizontal: 16,
  },

  // Donut
  donutWrapper: {
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  donutRing: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  donutNum: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  donutSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },

  // Employee list container
  listContainer: {
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },

  // Employee card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
    backgroundColor: '#FFFFFF',
  },
  cardInfo: {
    flex: 1,
    gap: 3,
  },
  statusPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
    marginBottom: 2,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  cardName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A2E',
  },
  cardTimeLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 1,
  },
  cardTime: {
    fontSize: 12,
    fontWeight: '400',
    color: '#9E9E9E',
  },

  // Separator between cards
  separator: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginHorizontal: 16,
  },

  // Sticky bottom
  stickyBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 12,
  },
  confirmBtn: {
    height: 54,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6C3AE1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
