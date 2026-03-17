import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { SCREENS } from '../../constants';
import spacing from '../../theme/spacing.json';
import typography from '../../theme/typography.json';

const RequestCabStep1Screen = ({ navigation }) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const [workLocation, setWorkLocation] = useState('Chennai');
  const [cabPreference, setCabPreference] = useState('both');
  const [homeLocation, setHomeLocation] = useState('Chromepet');
  const [differentDrop, setDifferentDrop] = useState(false);
  const [pickupPoint, setPickupPoint] = useState('Medavakkam - Suggested');

  const handleContinue = () => {
    navigation.navigate(SCREENS.REQUEST_CAB_STEP2);
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top', 'bottom']}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View style={styles.avatarWrapper}>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>R</Text>
          </View>
        </View>
        <View style={styles.headerTextWrapper}>
          <Text style={[styles.greetingText, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
            Good Morning,
          </Text>
          <Text style={[styles.greetingName, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
            Ragha!
          </Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Title Row */}
        <View style={styles.titleRow}>
          <Text style={[styles.screenTitle, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
            Ride Scheduling Setup
          </Text>
          <Text style={[styles.stepIndicator, { color: colors.textSecondary, fontFamily: typography.fontFamily.medium }]}>
            1 of 2
          </Text>
        </View>

        {/* Progress Bar */}
        <View style={[styles.progressBarTrack, { backgroundColor: colors.border || '#E5E7EB' }]}>
          <View style={[styles.progressBarFill, { backgroundColor: colors.primary, width: '50%' }]} />
        </View>

        {/* Work Location */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text, fontFamily: typography.fontFamily.semiBold }]}>
            Work Location <Text style={{ color: colors.primary }}>*</Text>
          </Text>
          <View style={[styles.segmentedControl, { borderColor: colors.primary }]}>
            <TouchableOpacity
              style={[
                styles.segmentTab,
                styles.segmentTabLeft,
                workLocation === 'Chennai'
                  ? { backgroundColor: colors.primary }
                  : { backgroundColor: 'transparent' },
              ]}
              onPress={() => setWorkLocation('Chennai')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.segmentTabText,
                  {
                    color: workLocation === 'Chennai' ? '#FFFFFF' : colors.primary,
                    fontFamily: typography.fontFamily.medium,
                  },
                ]}
              >
                Chennai
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.segmentTab,
                styles.segmentTabRight,
                workLocation === 'Coimbatore'
                  ? { backgroundColor: colors.primary }
                  : { backgroundColor: 'transparent' },
              ]}
              onPress={() => setWorkLocation('Coimbatore')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.segmentTabText,
                  {
                    color: workLocation === 'Coimbatore' ? '#FFFFFF' : colors.primary,
                    fontFamily: typography.fontFamily.medium,
                  },
                ]}
              >
                Coimbatore
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Cab Usage Preference */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text, fontFamily: typography.fontFamily.semiBold }]}>
            Cab Usage Preference <Text style={{ color: colors.primary }}>*</Text>
          </Text>
          <View style={styles.radioGroup}>
            {[
              { value: 'both', label: 'Both' },
              { value: 'pickup', label: 'Pickup' },
              { value: 'dropoff', label: 'Drop off' },
            ].map((option) => (
              <TouchableOpacity
                key={option.value}
                style={styles.radioOption}
                onPress={() => setCabPreference(option.value)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.radioOuter,
                    {
                      borderColor:
                        cabPreference === option.value
                          ? colors.primary
                          : colors.border || '#D1D5DB',
                    },
                  ]}
                >
                  {cabPreference === option.value && (
                    <View
                      style={[styles.radioInner, { backgroundColor: colors.primary }]}
                    />
                  )}
                </View>
                <Text
                  style={[
                    styles.radioLabel,
                    {
                      color:
                        cabPreference === option.value
                          ? colors.primary
                          : colors.text,
                      fontFamily:
                        cabPreference === option.value
                          ? typography.fontFamily.semiBold
                          : typography.fontFamily.regular,
                    },
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Home Location */}
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: colors.text, fontFamily: typography.fontFamily.semiBold }]}>
            Home Location <Text style={{ color: colors.primary }}>*</Text>
          </Text>
          <View
            style={[
              styles.inputContainer,
              {
                backgroundColor: '#FFFFFF',
                borderColor: colors.border || '#E5E7EB',
              },
            ]}
          >
            <Ionicons
              name="location-outline"
              size={20}
              color={colors.primary}
              style={styles.inputIcon}
            />
            <TextInput
              style={[
                styles.textInput,
                {
                  color: colors.text,
                  fontFamily: typography.fontFamily.regular,
                },
              ]}
              value={homeLocation}
              onChangeText={setHomeLocation}
              placeholder="Chromepet"
              placeholderTextColor={colors.textTertiary || '#9CA3AF'}
            />
          </View>
        </View>

        {/* Pickup & Drop Point */}
        <View style={styles.section}>
          <View style={styles.pickupHeaderRow}>
            <Text style={[styles.sectionLabel, { color: colors.text, fontFamily: typography.fontFamily.semiBold }]}>
              Pickup &amp; Drop Point <Text style={{ color: colors.primary }}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => setDifferentDrop(!differentDrop)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  {
                    borderColor: differentDrop
                      ? colors.primary
                      : colors.border || '#D1D5DB',
                    backgroundColor: differentDrop ? colors.primary : '#FFFFFF',
                  },
                ]}
              >
                {differentDrop && (
                  <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                )}
              </View>
              <Text
                style={[
                  styles.checkboxLabel,
                  {
                    color: colors.textSecondary,
                    fontFamily: typography.fontFamily.regular,
                  },
                ]}
              >
                Different Drop Point
              </Text>
            </TouchableOpacity>
          </View>

          {/* Dropdown */}
          <TouchableOpacity
            style={[
              styles.dropdownContainer,
              {
                backgroundColor: '#FFFFFF',
                borderColor: colors.border || '#E5E7EB',
              },
            ]}
            activeOpacity={0.8}
          >
            <Ionicons
              name="location"
              size={20}
              color={colors.primary}
              style={styles.inputIcon}
            />
            <Text
              style={[
                styles.dropdownText,
                {
                  color: colors.text,
                  fontFamily: typography.fontFamily.medium,
                  flex: 1,
                },
              ]}
            >
              {pickupPoint}
            </Text>
            <Ionicons
              name="chevron-down"
              size={20}
              color={colors.textSecondary || '#6B7280'}
            />
          </TouchableOpacity>

          {/* Subtext */}
          <Text
            style={[
              styles.distanceSubtext,
              {
                color: colors.textSecondary || '#6B7280',
                fontFamily: typography.fontFamily.regular,
              },
            ]}
          >
            1.6kms from your location
          </Text>
        </View>

        {/* Map Placeholder */}
        <View style={styles.mapPlaceholder}>
          <View style={styles.mapInner}>
            <Text
              style={[
                styles.mapLabel,
                {
                  color: '#4B7A3E',
                  fontFamily: typography.fontFamily.medium,
                },
              ]}
            >
              Map View
            </Text>
            <View style={[styles.distanceBadge, { backgroundColor: colors.primary }]}>
              <Ionicons name="navigate" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text
                style={[
                  styles.distanceBadgeText,
                  { fontFamily: typography.fontFamily.semiBold },
                ]}
              >
                1.6kms
              </Text>
            </View>
          </View>
        </View>

        {/* Bottom padding for sticky button */}
        <View style={{ height: spacing.xxxxl }} />
      </ScrollView>

      {/* Sticky Continue Button */}
      <View
        style={[
          styles.stickyFooter,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border || '#F3F4F6',
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: colors.primary }]}
          onPress={handleContinue}
          activeOpacity={0.85}
        >
          <Text
            style={[
              styles.continueButtonText,
              { fontFamily: typography.fontFamily.bold },
            ]}
          >
            Continue →
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  avatarWrapper: {
    marginRight: spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: spacing.borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.lg,
    fontFamily: 'Inter-Bold',
  },
  headerTextWrapper: {
    flexDirection: 'column',
  },
  greetingText: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
  },
  greetingName: {
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.base,
  },
  scrollContent: {
    paddingHorizontal: spacing.base,
    paddingTop: spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  screenTitle: {
    fontSize: typography.fontSize.xl,
    lineHeight: typography.lineHeight.xl,
  },
  stepIndicator: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: spacing.borderRadius.full,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: spacing.borderRadius.full,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionLabel: {
    fontSize: typography.fontSize.md,
    lineHeight: typography.lineHeight.md,
    marginBottom: spacing.sm,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderWidth: 1.5,
    borderRadius: spacing.borderRadius.full,
    overflow: 'hidden',
    alignSelf: 'stretch',
  },
  segmentTab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentTabLeft: {
    borderTopLeftRadius: spacing.borderRadius.full,
    borderBottomLeftRadius: spacing.borderRadius.full,
  },
  segmentTabRight: {
    borderTopRightRadius: spacing.borderRadius.full,
    borderBottomRightRadius: spacing.borderRadius.full,
  },
  segmentTabText: {
    fontSize: typography.fontSize.md,
    lineHeight: typography.lineHeight.md,
  },
  radioGroup: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  radioOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: spacing.borderRadius.full,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: spacing.borderRadius.full,
  },
  radioLabel: {
    fontSize: typography.fontSize.md,
    lineHeight: typography.lineHeight.md,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: spacing.borderRadius.md,
    height: 50,
    paddingHorizontal: spacing.base,
  },
  inputIcon: {
    marginRight: spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: typography.fontSize.md,
    lineHeight: typography.lineHeight.md,
    height: '100%',
  },
  pickupHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: spacing.borderRadius.xs,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
  },
  dropdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: spacing.borderRadius.md,
    height: 50,
    paddingHorizontal: spacing.base,
  },
  dropdownText: {
    fontSize: typography.fontSize.md,
    lineHeight: typography.lineHeight.md,
  },
  distanceSubtext: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    marginTop: spacing.xs,
    marginLeft: spacing.xs,
  },
  mapPlaceholder: {
    backgroundColor: '#E8F0E4',
    borderRadius: spacing.borderRadius.lg,
    height: 180,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  mapInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
  },
  mapLabel: {
    fontSize: typography.fontSize.lg,
    lineHeight: typography.lineHeight.lg,
  },
  distanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: spacing.borderRadius.full,
  },
  distanceBadgeText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
  },
  stickyFooter: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderTopWidth: 1,
  },
  continueButton: {
    height: 52,
    borderRadius: spacing.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueButtonText: {
    color: '#FFFFFF',
    fontSize: typography.fontSize.base,
    lineHeight: typography.lineHeight.base,
  },
});

export default RequestCabStep1Screen;
