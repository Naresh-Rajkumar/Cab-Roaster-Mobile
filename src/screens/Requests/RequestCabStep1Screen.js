import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../theme/ThemeProvider';
import { SCREENS } from '../../constants';
import spacing from '../../theme/spacing.json';
import typography from '../../theme/typography.json';
import { fetchStops, fetchWorkLocations, setFormData } from '../../redux/slices/requestSlice';
import CabMapView from '../../components/CabMapView';

const RequestCabStep1Screen = ({ navigation }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const dispatch = useDispatch();

  const { stops, isLoadingStops, formData } = useSelector((state) => state.request);
  const user = useSelector((state) => state.auth.user);

  const [workLocation, setWorkLocation] = useState(formData.workLocationName || 'Chennai');
  const [cabPreference, setCabPreference] = useState(formData.cabUsagePreference || 'both');
  const [homeLocation, setHomeLocation] = useState(formData.homeLocationAddress || 'Chromepet');
  const [differentDrop, setDifferentDrop] = useState(formData.differentDrop || false);
  const [selectedStopId, setSelectedStopId] = useState(formData.preferredPickupStopId || null);
  const [showStopPicker, setShowStopPicker] = useState(false);

  // Fetch stops on mount
  useEffect(() => {
    dispatch(fetchStops());
    dispatch(fetchWorkLocations());
  }, [dispatch]);

  // Auto-select first stop as suggested
  useEffect(() => {
    if (stops.length > 0 && !selectedStopId) {
      setSelectedStopId(stops[0].id);
    }
  }, [stops, selectedStopId]);

  const selectedStop = stops.find((s) => s.id === selectedStopId);
  const firstName = user?.firstName || user?.name?.split(' ')[0] || 'Ragha';

  // Build map markers
  const mapMarkers = [];
  if (selectedStop?.latitude && selectedStop?.longitude) {
    mapMarkers.push({
      id: 'pickup',
      coordinate: { latitude: selectedStop.latitude, longitude: selectedStop.longitude },
      title: selectedStop.name,
      description: 'Pickup Point',
      type: 'pickup',
    });
  }
  // Office destination marker (Chennai office)
  mapMarkers.push({
    id: 'office',
    coordinate: { latitude: 12.9010, longitude: 80.2279 },
    title: 'vThink Office',
    description: 'Sholinganallur',
    type: 'drop',
  });

  // Polyline between pickup and office
  const polylineCoords = [];
  if (selectedStop?.latitude && selectedStop?.longitude) {
    polylineCoords.push(
      { latitude: selectedStop.latitude, longitude: selectedStop.longitude },
      { latitude: 12.9010, longitude: 80.2279 }
    );
  }

  const handleContinue = () => {
    // Persist form data to redux
    dispatch(setFormData({
      workLocationName: workLocation,
      cabUsagePreference: cabPreference,
      homeLocationAddress: homeLocation,
      preferredPickupStopId: selectedStopId,
      differentDrop,
    }));
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
            <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
          </View>
        </View>
        <View style={styles.headerTextWrapper}>
          <Text style={[styles.greetingText, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
            Good Morning,
          </Text>
          <Text style={[styles.greetingName, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
            {firstName}!
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
          <View style={[styles.progressBarFill, { backgroundColor: colors.primary, width: '100%' }]} />
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
              { value: 'drop', label: 'Drop off' },
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
              placeholder="Enter your home location"
              placeholderTextColor={colors.textTertiary || '#9CA3AF'}
            />
          </View>
        </View>

        {/* Pickup & Drop Point */}
        <View style={styles.section}>
          <View style={styles.pickupHeaderRow}>
            <Text style={[styles.sectionLabel, { color: colors.text, fontFamily: typography.fontFamily.semiBold }]}>
              Pickup & Drop Point <Text style={{ color: colors.primary }}>*</Text>
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

          {/* Stop Dropdown */}
          <TouchableOpacity
            style={[
              styles.dropdownContainer,
              {
                backgroundColor: '#FFFFFF',
                borderColor: colors.border || '#E5E7EB',
              },
            ]}
            activeOpacity={0.8}
            onPress={() => setShowStopPicker(!showStopPicker)}
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
              {isLoadingStops ? 'Loading stops...' : (selectedStop ? `${selectedStop.name} - Suggested` : 'Select pickup point')}
            </Text>
            <Ionicons
              name="chevron-down"
              size={20}
              color={colors.textSecondary || '#6B7280'}
            />
          </TouchableOpacity>

          {/* Stop picker dropdown */}
          {showStopPicker && stops.length > 0 && (
            <View style={[styles.stopPickerList, { backgroundColor: '#FFFFFF', borderColor: colors.border }]}>
              {stops.map((stop) => (
                <TouchableOpacity
                  key={stop.id}
                  style={[
                    styles.stopPickerItem,
                    selectedStopId === stop.id && { backgroundColor: '#f1ecff' },
                  ]}
                  onPress={() => {
                    setSelectedStopId(stop.id);
                    setShowStopPicker(false);
                  }}
                >
                  <Ionicons
                    name="location"
                    size={16}
                    color={selectedStopId === stop.id ? colors.primary : '#9CA3AF'}
                    style={{ marginRight: 8 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.stopPickerName, { color: colors.text }]}>{stop.name}</Text>
                    {stop.distance && (
                      <Text style={[styles.stopPickerDist, { color: colors.textSecondary }]}>
                        {stop.distance} from your location
                      </Text>
                    )}
                  </View>
                  {selectedStopId === stop.id && (
                    <Ionicons name="checkmark" size={18} color={colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Distance subtext */}
          {selectedStop?.distance && (
            <Text
              style={[
                styles.distanceSubtext,
                {
                  color: colors.textSecondary || '#6B7280',
                  fontFamily: typography.fontFamily.regular,
                },
              ]}
            >
              {selectedStop.distance} from your location
            </Text>
          )}
        </View>

        {/* Map View */}
        <View style={styles.mapContainer}>
          <CabMapView
            markers={mapMarkers}
            polylineCoords={polylineCoords}
            initialRegion={{
              latitude: selectedStop?.latitude || 12.9278,
              longitude: selectedStop?.longitude || 80.2278,
              latitudeDelta: 0.06,
              longitudeDelta: 0.06,
            }}
            style={styles.mapView}
            fitToMarkers={mapMarkers.length > 1}
          />
          {/* Distance badge overlay */}
          {selectedStop?.distance && (
            <View style={[styles.distanceBadge, { backgroundColor: colors.primary }]}>
              <Ionicons name="navigate" size={12} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={[styles.distanceBadgeText, { fontFamily: typography.fontFamily.semiBold }]}>
                {selectedStop.distance}
              </Text>
            </View>
          )}
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

  // Stop picker
  stopPickerList: {
    marginTop: 4,
    borderWidth: 1,
    borderRadius: spacing.borderRadius.md,
    maxHeight: 240,
    overflow: 'hidden',
  },
  stopPickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F3F4F6',
  },
  stopPickerName: {
    fontSize: 14,
    fontWeight: '500',
  },
  stopPickerDist: {
    fontSize: 12,
    marginTop: 2,
  },

  // Map
  mapContainer: {
    height: 180,
    borderRadius: spacing.borderRadius.lg,
    overflow: 'hidden',
    marginBottom: spacing.md,
    position: 'relative',
  },
  mapView: {
    height: 180,
    borderRadius: spacing.borderRadius.lg,
  },
  distanceBadge: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
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
