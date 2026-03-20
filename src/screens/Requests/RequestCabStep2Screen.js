import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../theme/ThemeProvider';
import { setUser } from '../../redux/slices/authSlice';
import { fetchShifts, submitCabRequest, resetForm } from '../../redux/slices/requestSlice';
import spacing from '../../theme/spacing.json';
import typography from '../../theme/typography.json';

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const RequestCabStep2Screen = ({ navigation }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const dispatch = useDispatch();

  const { shifts, isLoadingShifts, isSubmitting, formData } = useSelector((state) => state.request);
  const user = useSelector((state) => state.auth.user);
  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'Ragha';

  const [selectedShiftId, setSelectedShiftId] = useState(null);
  const [selectedDays, setSelectedDays] = useState(['Mon', 'Wed', 'Thu', 'Fri']);
  const [showShiftPicker, setShowShiftPicker] = useState(false);

  // Fetch shifts on mount
  useEffect(() => {
    dispatch(fetchShifts());
  }, [dispatch]);

  // Auto-select first shift
  useEffect(() => {
    if (shifts.length > 0 && !selectedShiftId) {
      // Try to select "10:00AM - 7:00PM" shift, otherwise first
      const defaultShift = shifts.find((s) => s.timing?.includes('10:00'));
      setSelectedShiftId(defaultShift?.id || shifts[0].id);
    }
  }, [shifts, selectedShiftId]);

  const selectedShift = shifts.find((s) => s.id === selectedShiftId);
  const selectAll = selectedDays.length === ALL_DAYS.length;

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedDays([]);
    } else {
      setSelectedDays([...ALL_DAYS]);
    }
  };

  const handleDayToggle = (day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(selectedDays.filter((d) => d !== day));
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleSendRequest = async () => {
    if (!selectedShiftId) {
      Alert.alert('Missing Info', 'Please select a shift timing.');
      return;
    }
    if (selectedDays.length === 0) {
      Alert.alert('Missing Info', 'Please select at least one working day.');
      return;
    }

    try {
      // Build request payload matching backend POST /api/requests
      const payload = {
        employeeId: user?.employeeId || user?.id,
        requestType: 'new_cab',
        workLocationId: formData.workLocationId || 1,
        cabUsagePreference: formData.cabUsagePreference || 'both',
        homeLocationAddress: formData.homeLocationAddress || 'Chromepet',
        preferredPickupStopId: formData.preferredPickupStopId,
        preferredDropStopId: formData.preferredDropStopId || formData.preferredPickupStopId,
        shiftId: selectedShiftId,
        workingDays: selectedDays,
        reason: 'New cab request from mobile app',
      };

      await dispatch(submitCabRequest(payload)).unwrap();

      // Clear form data for next request
      dispatch(resetForm());

      // Set authenticated — triggers AppNavigator for first-time users
      dispatch(setUser({
        ...user,
        role: user?.roleName || user?.role || 'employee',
      }));

      // Non-blocking success alert
      Alert.alert('Success', 'Your cab request has been submitted!');

      // For repeat requests (already in AppNavigator), pop back to Home
      navigation.popToTop();
    } catch (error) {
      Alert.alert('Request Failed', error || 'Could not submit cab request. Please try again.');
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  // Split days into rows: first row 3 items, second row 2 items
  const row1 = ALL_DAYS.slice(0, 3);
  const row2 = ALL_DAYS.slice(3);

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
          <View
            style={[styles.avatarCircle, { backgroundColor: colors.primary }]}
          >
            <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
          </View>
          <View style={styles.greetingContainer}>
            <Text
              style={[
                styles.greetingText,
                {
                  color: colors.textSecondary,
                  fontFamily: typography.fontFamily.regular,
                },
              ]}
            >
              Good Morning,
            </Text>
            <Text
              style={[
                styles.greetingName,
                {
                  color: colors.text,
                  fontFamily: typography.fontFamily.semiBold,
                },
              ]}
            >
              {firstName}!
            </Text>
          </View>
        </View>

        {/* Title + Step Indicator */}
        <View style={styles.titleRow}>
          <Text
            style={[
              styles.titleText,
              {
                color: colors.text,
                fontFamily: typography.fontFamily.bold,
              },
            ]}
          >
            Ride Scheduling Setup
          </Text>
          <Text
            style={[
              styles.stepIndicator,
              {
                color: colors.textSecondary,
                fontFamily: typography.fontFamily.medium,
              },
            ]}
          >
            2 of 2
          </Text>
        </View>

        {/* Progress Bar */}
        <View
          style={[styles.progressBarTrack, { backgroundColor: colors.border }]}
        >
          <View
            style={[
              styles.progressBarFill,
              { backgroundColor: colors.primary, width: '50%' },
            ]}
          />
        </View>

        {/* Shift Timing Section */}
        <View style={styles.sectionContainer}>
          <Text
            style={[
              styles.sectionLabel,
              {
                color: colors.text,
                fontFamily: typography.fontFamily.semiBold,
              },
            ]}
          >
            Shift Timing{' '}
            <Text style={{ color: colors.primary }}>*</Text>
          </Text>
          <TouchableOpacity
            style={[
              styles.dropdownButton,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            activeOpacity={0.7}
            onPress={() => setShowShiftPicker(!showShiftPicker)}
          >
            <Text
              style={[
                styles.dropdownValue,
                {
                  color: colors.text,
                  fontFamily: typography.fontFamily.medium,
                },
              ]}
            >
              {isLoadingShifts ? 'Loading...' : (selectedShift?.timing || 'Select shift')}
            </Text>
            <Ionicons
              name="chevron-down"
              size={spacing.iconSize.md}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          {/* Shift picker dropdown */}
          {showShiftPicker && shifts.length > 0 && (
            <View style={[styles.pickerList, { backgroundColor: '#FFFFFF', borderColor: colors.border }]}>
              {shifts.map((shift) => (
                <TouchableOpacity
                  key={shift.id}
                  style={[
                    styles.pickerItem,
                    selectedShiftId === shift.id && { backgroundColor: '#f1ecff' },
                  ]}
                  onPress={() => {
                    setSelectedShiftId(shift.id);
                    setShowShiftPicker(false);
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.pickerItemText, { color: colors.text }]}>
                      {shift.timing}
                    </Text>
                    {shift.name && (
                      <Text style={[styles.pickerItemSub, { color: colors.textSecondary }]}>
                        {shift.name}
                      </Text>
                    )}
                  </View>
                  {selectedShiftId === shift.id && (
                    <Ionicons name="checkmark" size={18} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Working Days Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.workingDaysHeader}>
            <Text
              style={[
                styles.sectionLabel,
                {
                  color: colors.text,
                  fontFamily: typography.fontFamily.semiBold,
                },
              ]}
            >
              Working Days{' '}
              <Text style={{ color: colors.primary }}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.selectAllRow}
              onPress={handleSelectAll}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.selectAllText,
                  {
                    color: colors.textSecondary,
                    fontFamily: typography.fontFamily.medium,
                  },
                ]}
              >
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
                {selectAll && (
                  <Ionicons
                    name="checkmark"
                    size={12}
                    color="#FFFFFF"
                  />
                )}
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
                    <Ionicons
                      name="checkmark-circle"
                      size={spacing.iconSize.sm}
                      color={colors.primary}
                      style={styles.dayCheckmark}
                    />
                  )}
                  <Text
                    style={[
                      styles.dayLabel,
                      {
                        color: isSelected ? colors.primary : colors.text,
                        fontFamily: isSelected
                          ? typography.fontFamily.semiBold
                          : typography.fontFamily.medium,
                      },
                    ]}
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
                    <Ionicons
                      name="checkmark-circle"
                      size={spacing.iconSize.sm}
                      color={colors.primary}
                      style={styles.dayCheckmark}
                    />
                  )}
                  <Text
                    style={[
                      styles.dayLabel,
                      {
                        color: isSelected ? colors.primary : colors.text,
                        fontFamily: isSelected
                          ? typography.fontFamily.semiBold
                          : typography.fontFamily.medium,
                      },
                    ]}
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
      <View
        style={[
          styles.bottomButtons,
          { borderTopColor: colors.border, backgroundColor: colors.background },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.backButtonText,
              {
                color: colors.text,
                fontFamily: typography.fontFamily.semiBold,
              },
            ]}
          >
            ← Back
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: colors.primary, opacity: isSubmitting ? 0.7 : 1 },
          ]}
          onPress={handleSendRequest}
          activeOpacity={0.8}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text
              style={[
                styles.sendButtonText,
                { fontFamily: typography.fontFamily.semiBold },
              ]}
            >
              Send Request →
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: spacing.xl,
  },

  // Header
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.base,
    fontFamily: 'Inter-Bold',
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  greetingText: {
    fontSize: typography.fontSize.md,
  },
  greetingName: {
    fontSize: typography.fontSize.md,
  },

  // Title + Step
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  titleText: {
    fontSize: typography.fontSize.xl,
  },
  stepIndicator: {
    fontSize: typography.fontSize.sm,
  },

  // Progress bar
  progressBarTrack: {
    height: 8,
    borderRadius: spacing.borderRadius.full,
    marginBottom: spacing.xl,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: spacing.borderRadius.full,
  },

  // Section
  sectionContainer: {
    marginBottom: spacing.lg,
  },
  sectionLabel: {
    fontSize: typography.fontSize.md,
    marginBottom: spacing.sm,
  },

  // Dropdown
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: spacing.borderRadius.md,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  dropdownValue: {
    fontSize: typography.fontSize.md,
  },

  // Picker list
  pickerList: {
    marginTop: 4,
    borderWidth: 1,
    borderRadius: spacing.borderRadius.md,
    maxHeight: 240,
    overflow: 'hidden',
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F3F4F6',
  },
  pickerItemText: {
    fontSize: 14,
    fontWeight: '500',
  },
  pickerItemSub: {
    fontSize: 12,
    marginTop: 2,
  },

  // Working Days
  workingDaysHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  selectAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  selectAllText: {
    fontSize: typography.fontSize.sm,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: spacing.borderRadius.xs,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Day cards
  daysRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  dayCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1.5,
    position: 'relative',
    minHeight: 52,
  },
  dayCheckmark: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  dayLabel: {
    fontSize: typography.fontSize.sm,
  },

  // Bottom buttons
  bottomButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
  },
  backButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: typography.fontSize.md,
  },
  sendButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: spacing.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.md,
  },
});

export default RequestCabStep2Screen;
