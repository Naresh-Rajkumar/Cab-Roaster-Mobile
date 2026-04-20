import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../theme/ThemeProvider';
import { configService } from '../../services/api/configService';
import { profileService } from '../../services/api/profileService';
import { requestsService } from '../../services/api/requestsService';
import { completeOnboarding } from '../../redux/slices/authSlice';
import spacing from '../../theme/spacing.json';
import typography from '../../theme/typography.json';

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

// Convert "HH:MM:SS" or "HH:MM" (24-hour) to "h:MM AM/PM"
const formatTime12h = (timeStr) => {
  if (!timeStr) return '';
  const [hourStr, minuteStr] = timeStr.split(':');
  const hour = parseInt(hourStr, 10);
  const minute = minuteStr || '00';
  if (isNaN(hour)) return timeStr;
  const period = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minute} ${period}`;
};

const unwrap = (res) => {
  const body = res?.data;
  if (body?.data) return body.data;
  if (Array.isArray(body)) return body;
  return body ?? [];
};

const RequestCabStep2Screen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  // Data from Step 1
  const step1Data = route?.params || {};

  // API data
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedShift, setSelectedShift] = useState(null);
  const [showShiftDropdown, setShowShiftDropdown] = useState(false);
  const [selectedDays, setSelectedDays] = useState(['Mon', 'Tue', 'Wed', 'Thu', 'Fri']);
  const [gender, setGender] = useState('');

  // Greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';
  const userName = user?.name?.split(' ')[0] || user?.firstName || 'User';
  const initials = (user?.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();

  const selectAll = selectedDays.length === ALL_DAYS.length;

  useEffect(() => {
    const loadShifts = async () => {
      try {
        const res = await configService.getShifts('employee');
        const data = unwrap(res);
        const arr = Array.isArray(data) ? data : [];
        // Sort by shift order: Morning → Afternoon → Night, then by start time
        const SHIFT_ORDER = { morning: 0, afternoon: 1, night: 2 };
        const sorted = [...arr].sort((a, b) => {
          const nameA = (a.name || '').toLowerCase();
          const nameB = (b.name || '').toLowerCase();
          const orderA = Object.keys(SHIFT_ORDER).find(k => nameA.includes(k));
          const orderB = Object.keys(SHIFT_ORDER).find(k => nameB.includes(k));
          if (orderA !== undefined && orderB !== undefined) {
            return SHIFT_ORDER[orderA] - SHIFT_ORDER[orderB];
          }
          if (orderA !== undefined) return -1;
          if (orderB !== undefined) return 1;
          // Fallback: sort by start time
          const timeA = a.startTime || a.start_time || '';
          const timeB = b.startTime || b.start_time || '';
          return timeA.localeCompare(timeB);
        });
        setShifts(sorted);
        if (sorted.length > 0) setSelectedShift(sorted[0]);
      } catch (err) {
        console.warn('Failed to load shifts:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadShifts();
  }, []);

  const handleSelectAll = () => {
    setSelectedDays(selectAll ? [] : [...ALL_DAYS]);
  };

  const handleDayToggle = (day) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]
    );
  };

  const handleSendRequest = async () => {
    setSubmitting(true);
    try {
      const profilePayload = {
        homeAddress: step1Data.homeLocation,
        cabUsagePreference: step1Data.cabPreference || 'both',
        workingDays: selectedDays,
      };

      // Include home coordinates if available
      if (step1Data.homeCoords?.latitude != null) {
        profilePayload.homeLatitude = step1Data.homeCoords.latitude;
      }
      if (step1Data.homeCoords?.longitude != null) {
        profilePayload.homeLongitude = step1Data.homeCoords.longitude;
      }

      // If shift is selected, include shiftId
      if (selectedShift?.id) {
        profilePayload.shiftId = selectedShift.id;
      }

      // Gender (if selected)
      if (gender) {
        profilePayload.gender = gender;
      }

      await profileService.updateProfile(profilePayload);

      // Create a cab request so it appears in admin's pending list
      const requestPayload = {
        requestType: 'new_cab',
        cabUsagePreference: step1Data.cabPreference || 'both',
        homeLocationAddress: step1Data.homeLocation,
        workingDays: selectedDays,
        reason: 'New cab request from onboarding',
      };

      // Include home coordinates if available
      if (step1Data.homeCoords?.latitude != null) {
        requestPayload.homeLatitude = step1Data.homeCoords.latitude;
      }
      if (step1Data.homeCoords?.longitude != null) {
        requestPayload.homeLongitude = step1Data.homeCoords.longitude;
      }
      // Only include employeeId if available — backend resolves from JWT otherwise
      if (user?.employeeId) {
        requestPayload.employeeId = user.employeeId;
      }
      if (selectedShift?.id) {
        requestPayload.shiftId = selectedShift.id;
      }
      if (step1Data.pickupStop?.id) {
        requestPayload.pickupStopId = step1Data.pickupStop.id;
      }
      if (step1Data.dropStop?.id) {
        requestPayload.dropStopId = step1Data.dropStop.id;
      }

      await requestsService.createRequest(requestPayload);

      dispatch(completeOnboarding());
    } catch (err) {
      console.warn('Request submission failed:', err.message);
      // Complete onboarding anyway — user can retry later
      dispatch(completeOnboarding());
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const shiftLabel = selectedShift
    ? `${formatTime12h(selectedShift.startTime || selectedShift.start_time)} - ${formatTime12h(selectedShift.endTime || selectedShift.end_time)}`
    : 'Select shift timing';

  // Split days into rows: first row 3, second row 2
  const row1 = ALL_DAYS.slice(0, 3);
  const row2 = ALL_DAYS.slice(3);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['bottom']}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={[styles.avatarCircle, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <View style={styles.greetingContainer}>
            <Text style={[styles.greetingText, { color: colors.textSecondary }]}>
              {greeting},
            </Text>
            <Text style={[styles.greetingName, { color: colors.text }]}>
              {userName}!
            </Text>
          </View>
        </View>

        {/* Title + Step Indicator */}
        <View style={styles.titleRow}>
          <Text style={[styles.titleText, { color: colors.text }]}>
            Ride Scheduling Setup
          </Text>
          <Text style={[styles.stepIndicator, { color: colors.textSecondary }]}>
            2 of 2
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={[styles.progressBarTrack, { backgroundColor: colors.border }]}>
          <View style={[styles.progressBarFill, { backgroundColor: colors.primary, width: '50%' }]} />
        </View>

        {/* Shift Timing Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>
            Shift Timing <Text style={{ color: colors.primary }}>*</Text>
          </Text>
          <TouchableOpacity
            style={[styles.dropdownButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => setShowShiftDropdown(!showShiftDropdown)}
            activeOpacity={0.7}
          >
            <Text style={[styles.dropdownValue, { color: selectedShift ? colors.text : colors.textTertiary || '#9CA3AF' }]}>
              {shiftLabel}
            </Text>
            <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
          {showShiftDropdown && (
            <View style={[styles.dropdownList, { backgroundColor: '#FFFFFF', borderColor: colors.border }]}>
              {shifts.map((shift) => (
                <TouchableOpacity
                  key={shift.id}
                  style={styles.dropdownItem}
                  onPress={() => {
                    setSelectedShift(shift);
                    setShowShiftDropdown(false);
                  }}
                >
                  <Text style={[styles.dropdownItemText, { color: colors.text }]}>
                    {formatTime12h(shift.startTime || shift.start_time)} - {formatTime12h(shift.endTime || shift.end_time)}
                    {shift.name ? ` (${shift.name})` : ''}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Gender Section */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionLabel, { color: colors.text }]}>
            Gender
          </Text>
          <View style={styles.genderRow}>
            {[
              { value: 'male', label: 'Male' },
              { value: 'female', label: 'Female' },
              { value: 'other', label: 'Other' },
            ].map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.genderOption,
                  {
                    borderColor: gender === opt.value ? colors.primary : colors.border || '#E5E7EB',
                    backgroundColor: gender === opt.value ? '#EDE7FB' : colors.surface,
                  },
                ]}
                onPress={() => setGender(opt.value)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.radioOuter,
                    {
                      borderColor: gender === opt.value ? colors.primary : colors.border || '#D1D5DB',
                    },
                  ]}
                >
                  {gender === opt.value && (
                    <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />
                  )}
                </View>
                <Text
                  style={[
                    styles.radioLabel,
                    {
                      color: gender === opt.value ? colors.primary : colors.text,
                      fontWeight: gender === opt.value ? '600' : '400',
                    },
                  ]}
                >
                  {opt.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Working Days Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.workingDaysHeader}>
            <Text style={[styles.sectionLabel, { color: colors.text }]}>
              Working Days <Text style={{ color: colors.primary }}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.selectAllRow}
              onPress={handleSelectAll}
              activeOpacity={0.7}
            >
              <Text style={[styles.selectAllText, { color: colors.textSecondary }]}>
                Select All
              </Text>
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: selectAll ? colors.primary : '#E5E7EB',
                    backgroundColor: selectAll ? colors.primary : colors.surface,
                  },
                ]}
              >
                {selectAll && <Ionicons name="checkmark" size={12} color="#FFFFFF" />}
              </View>
            </TouchableOpacity>
          </View>

          {/* Day cards row 1 */}
          <View style={styles.daysRow}>
            {row1.map((day) => {
              const isSelected = selectedDays.includes(day);
              return (
                <TouchableOpacity
                  key={day}
                  onPress={() => handleDayToggle(day)}
                  activeOpacity={0.7}
                  style={[
                    styles.dayCard,
                    {
                      backgroundColor: isSelected ? '#EDE7FB' : colors.surface,
                      borderColor: isSelected ? colors.primary : '#E5E7EB',
                    },
                  ]}
                >
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={18} color={colors.primary} style={styles.dayCheckmark} />
                  )}
                  <Text
                    style={[styles.dayLabel, { color: isSelected ? colors.primary : colors.text, fontWeight: isSelected ? '600' : '500' }]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Day cards row 2 */}
          <View style={styles.daysRow}>
            {row2.map((day) => {
              const isSelected = selectedDays.includes(day);
              return (
                <TouchableOpacity
                  key={day}
                  onPress={() => handleDayToggle(day)}
                  activeOpacity={0.7}
                  style={[
                    styles.dayCard,
                    {
                      backgroundColor: isSelected ? '#EDE7FB' : colors.surface,
                      borderColor: isSelected ? colors.primary : '#E5E7EB',
                    },
                  ]}
                >
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={18} color={colors.primary} style={styles.dayCheckmark} />
                  )}
                  <Text
                    style={[styles.dayLabel, { color: isSelected ? colors.primary : colors.text, fontWeight: isSelected ? '600' : '500' }]}
                  >
                    {day}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Bottom Buttons — sticky footer */}
      <View style={[styles.bottomButtons, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={18} color={colors.text} style={{ marginRight: 4 }} />
          <Text style={[styles.backButtonText, { color: colors.text }]}>Back</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: colors.primary, opacity: submitting ? 0.7 : 1 }]}
          onPress={handleSendRequest}
          activeOpacity={0.8}
          disabled={submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={styles.sendButtonText}>Send Request  →</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrollContent: { padding: spacing.base, paddingBottom: spacing.xl },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg },
  avatarCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: spacing.sm },
  avatarText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  greetingContainer: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  greetingText: { fontSize: 15 },
  greetingName: { fontSize: 15, fontWeight: '600' },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  titleText: { fontSize: 20, fontWeight: '700' },
  stepIndicator: { fontSize: 13 },
  progressBarTrack: { height: 8, borderRadius: 99, marginBottom: spacing.xl, overflow: 'hidden' },
  progressBarFill: { height: '100%', borderRadius: 99 },
  sectionContainer: { marginBottom: spacing.lg },
  sectionLabel: { fontSize: 15, fontWeight: '600', marginBottom: spacing.sm },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: 8,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  dropdownValue: { fontSize: 15 },
  dropdownList: { borderWidth: 1, borderRadius: 8, marginTop: 4, overflow: 'hidden' },
  dropdownItem: { paddingVertical: 12, paddingHorizontal: spacing.base, borderBottomWidth: 0.5, borderBottomColor: '#F3F4F6' },
  dropdownItemText: { fontSize: 14 },
  genderRow: { flexDirection: 'row', gap: spacing.sm },
  genderOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderWidth: 1.5,
    borderRadius: 8,
  },
  radioOuter: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 9, height: 9, borderRadius: 5 },
  radioLabel: { fontSize: 14 },
  workingDaysHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  selectAllRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  selectAllText: { fontSize: 13 },
  checkbox: { width: 18, height: 18, borderRadius: 4, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  daysRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  dayCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: 8,
    borderWidth: 1.5,
    position: 'relative',
    minHeight: 52,
  },
  dayCheckmark: { position: 'absolute', top: 4, right: 4 },
  dayLabel: { fontSize: 13 },
  bottomButtons: { flexDirection: 'row', gap: 12, paddingHorizontal: spacing.base, paddingVertical: spacing.md, borderTopWidth: 1 },
  backButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md, paddingHorizontal: spacing.base },
  backButtonText: { fontSize: 15, fontWeight: '600' },
  sendButton: { flex: 1, paddingVertical: spacing.md, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  sendButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '600' },
});

export default RequestCabStep2Screen;
