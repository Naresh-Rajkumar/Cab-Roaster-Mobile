/**
 * Location Change Screen — screen 19/21
 * Shows a summary of the selected new pickup location + reason picker.
 * "Send Request" submits and navigates back to the My Trips dashboard.
 * Receives: trip (trip object), newLocation (selected location object) via route params.
 */
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

const CHANGE_REASONS = [
  'Moved to new area',
  'Temporary address change',
  'More convenient spot',
  'Route issue',
  'Other',
];

const LocationChangeScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const trip = route?.params?.trip;
  const newLocation = route?.params?.newLocation;
  const currentPickup = trip?.pickupName ?? trip?.from ?? 'Current Pickup';

  const [selectedReason, setSelectedReason] = useState('');
  const [otherReason, setOtherReason] = useState('');

  const canSubmit =
    selectedReason && (selectedReason !== 'Other' || otherReason.trim().length > 0);

  const handleSendRequest = () => {
    // Navigate to My Trips dashboard (pop all the way back)
    navigation.popToTop();
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Change Location</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Step indicator */}
        <View style={styles.stepRow}>
          <View style={[styles.stepDot, { backgroundColor: colors.border }]} />
          <View style={[styles.stepLine, { backgroundColor: colors.border }]} />
          <View style={[styles.stepDot, { backgroundColor: colors.primary }]}>
            <View style={styles.stepDotInner} />
          </View>
        </View>
        <View style={styles.stepLabels}>
          <Text style={[styles.stepLabel, { color: colors.textTertiary }]}>Select Location</Text>
          <Text style={[styles.stepLabel, { color: colors.primary, fontWeight: '700' }]}>Confirm Request</Text>
        </View>

        {/* Route change card */}
        <View style={[styles.routeCard, { backgroundColor: colors.surface }]}>
          {/* Current */}
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: colors.border }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.routeStopLabel, { color: colors.textTertiary }]}>Current Pickup</Text>
              <Text style={[styles.routeStopValue, { color: colors.textSecondary }]}>{currentPickup}</Text>
            </View>
          </View>

          {/* Arrow */}
          <View style={styles.routeArrowRow}>
            <View style={[styles.routeArrowLine, { backgroundColor: colors.borderLight }]} />
            <View style={[styles.routeArrowIcon, { backgroundColor: colors.primaryContainer }]}>
              <Ionicons name="arrow-down" size={12} color={colors.primary} />
            </View>
            <View style={[styles.routeArrowLine, { backgroundColor: colors.borderLight }]} />
          </View>

          {/* New */}
          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: colors.primary }]} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.routeStopLabel, { color: colors.textTertiary }]}>New Pickup</Text>
              <Text style={[styles.routeStopValue, { color: colors.text, fontWeight: '700' }]}>
                {newLocation?.name ?? '—'}
              </Text>
              {newLocation?.address ? (
                <Text style={[styles.routeStopAddr, { color: colors.textSecondary }]}>{newLocation.address}</Text>
              ) : null}
            </View>
            <View style={[styles.newBadge, { backgroundColor: colors.primaryContainer }]}>
              <Text style={[styles.newBadgeText, { color: colors.primary }]}>New</Text>
            </View>
          </View>
        </View>

        {/* Trip context */}
        {trip && (
          <View style={[styles.tripStrip, { backgroundColor: colors.surface }]}>
            <Ionicons name="calendar-outline" size={16} color={colors.textTertiary} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.tripTitle, { color: colors.text }]}>{trip.title}</Text>
              <Text style={[styles.tripDate, { color: colors.textSecondary }]}>{trip.date}</Text>
            </View>
          </View>
        )}

        {/* Reason */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Reason for Change</Text>
        <View style={[styles.reasonCard, { backgroundColor: colors.surface }]}>
          {CHANGE_REASONS.map((r, idx) => {
            const active = selectedReason === r;
            const isLast = idx === CHANGE_REASONS.length - 1;
            return (
              <TouchableOpacity
                key={r}
                style={[
                  styles.reasonRow,
                  !isLast && { borderBottomColor: colors.borderLight, borderBottomWidth: 1 },
                ]}
                onPress={() => setSelectedReason(r)}
                activeOpacity={0.7}
              >
                <View style={[styles.radio, { borderColor: active ? colors.primary : colors.border }]}>
                  {active && <View style={[styles.radioInner, { backgroundColor: colors.primary }]} />}
                </View>
                <Text style={[styles.reasonText, { color: active ? colors.primary : colors.text, fontWeight: active ? '700' : '500' }]}>
                  {r}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedReason === 'Other' && (
          <TextInput
            style={[styles.textArea, {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
            }]}
            placeholder="Describe your reason..."
            placeholderTextColor={colors.textTertiary}
            value={otherReason}
            onChangeText={setOtherReason}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        )}

        {/* Info banner */}
        <View style={[styles.infoBanner, { backgroundColor: colors.primaryContainer }]}>
          <Ionicons name="time-outline" size={15} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.primary }]}>
            Your current schedule stays unchanged until the request is approved (within 24 hrs).
          </Text>
        </View>

        {/* Send Request */}
        <TouchableOpacity
          style={[styles.sendBtn, { backgroundColor: canSubmit ? colors.primary : colors.borderLight }]}
          onPress={handleSendRequest}
          disabled={!canSubmit}
          activeOpacity={0.85}
        >
          <Ionicons name="send-outline" size={18} color={canSubmit ? '#fff' : colors.textTertiary} />
          <Text style={[styles.sendBtnText, { color: canSubmit ? '#fff' : colors.textTertiary }]}>
            Send Request
          </Text>
        </TouchableOpacity>
      </ScrollView>
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
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700' },
  scrollContent: { padding: 16, paddingBottom: 40 },

  // Step indicator
  stepRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  stepDot: { width: 12, height: 12, borderRadius: 6 },
  stepDotInner: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#fff', alignSelf: 'center' },
  stepLine: { flex: 1, height: 2, marginHorizontal: 4 },
  stepLabels: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  stepLabel: { fontSize: 12 },

  // Route card
  routeCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  routeRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  routeDot: { width: 12, height: 12, borderRadius: 6, marginTop: 4 },
  routeStopLabel: { fontSize: 11, marginBottom: 2 },
  routeStopValue: { fontSize: 14 },
  routeStopAddr: { fontSize: 11, marginTop: 2 },
  routeArrowRow: { flexDirection: 'row', alignItems: 'center', paddingLeft: 5, paddingVertical: 6, gap: 6 },
  routeArrowLine: { flex: 1, height: 1 },
  routeArrowIcon: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  newBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  newBadgeText: { fontSize: 11, fontWeight: '700' },

  // Trip strip
  tripStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 14,
    gap: 12,
    marginBottom: 20,
  },
  tripTitle: { fontSize: 14, fontWeight: '700' },
  tripDate: { fontSize: 12, marginTop: 1 },

  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10 },

  // Reason card
  reasonCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  reasonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: { width: 11, height: 11, borderRadius: 6 },
  reasonText: { fontSize: 15 },

  textArea: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 14,
    fontSize: 14,
    minHeight: 80,
    marginBottom: 16,
  },

  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: 12,
    gap: 10,
    marginBottom: 20,
  },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18 },

  sendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 14,
    gap: 8,
  },
  sendBtnText: { fontSize: 16, fontWeight: '700' },
});

export default LocationChangeScreen;
