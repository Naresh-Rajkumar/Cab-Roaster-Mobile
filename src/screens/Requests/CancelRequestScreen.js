/**
 * Cancel Request Screen — screen 20/21
 * Employee selects a reason and cancels a scheduled trip.
 * "Submit Cancellation" navigates back to My Trips dashboard.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../theme/ThemeProvider';
import { submitRequest } from '../../redux/slices/appSlice';

const CANCEL_REASONS = [
  { id: 'wfh', label: 'Working from home', icon: 'home-outline' },
  { id: 'leave', label: 'On leave', icon: 'calendar-outline' },
  { id: 'own_vehicle', label: 'Using own vehicle', icon: 'car-outline' },
  { id: 'shift_change', label: 'Shift change', icon: 'time-outline' },
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' },
];

const CancelRequestScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const dispatch = useDispatch();
  const trip = route?.params?.trip;
  const isSubmitting = useSelector((state) => state.app.isSubmitting);

  const [selectedReason, setSelectedReason] = useState('');
  const [otherReason, setOtherReason] = useState('');

  const canSubmit =
    !isSubmitting &&
    selectedReason &&
    (selectedReason !== 'other' || otherReason.trim().length > 0);

  const handleSubmit = () => {
    const reason = selectedReason === 'other' ? otherReason.trim() : selectedReason;
    dispatch(submitRequest({
      requestType: 'cancellation',
      tripId: trip?.id,
      reason,
    })).unwrap().then(() => {
      navigation.popToTop();
    }).catch((err) => {
      Alert.alert('Error', err || 'Failed to submit cancellation');
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Cancel Ride</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Trip strip */}
        {trip && (
          <View style={[styles.tripStrip, { backgroundColor: colors.surface }]}>
            <View style={[styles.tripIconBox, { backgroundColor: trip.iconBg ?? '#fee2e2' }]}>
              <Ionicons name={trip.icon ?? 'car-outline'} size={18} color={trip.iconColor ?? '#dc2626'} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.tripTitle, { color: colors.text }]}>{trip.title}</Text>
              <Text style={[styles.tripDate, { color: colors.textSecondary }]}>{trip.date}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: '#fee2e2' }]}>
              <View style={[styles.badgeDot, { backgroundColor: '#dc2626' }]} />
              <Text style={[styles.badgeText, { color: '#dc2626' }]}>Scheduled</Text>
            </View>
          </View>
        )}

        {/* Warning */}
        <View style={[styles.warningBanner, { backgroundColor: '#fff7ed', borderColor: '#fed7aa' }]}>
          <Ionicons name="warning-outline" size={18} color="#ea580c" />
          <Text style={[styles.warningText, { color: '#ea580c' }]}>
            Cancelling within 2 hours of your ride may affect your cab usage score.
          </Text>
        </View>

        {/* Reason list */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Why do you want to cancel?</Text>
        <View style={[styles.reasonCard, { backgroundColor: colors.surface }]}>
          {CANCEL_REASONS.map((r, idx) => {
            const active = selectedReason === r.id;
            const isLast = idx === CANCEL_REASONS.length - 1;
            return (
              <TouchableOpacity
                key={r.id}
                style={[
                  styles.reasonRow,
                  !isLast && { borderBottomColor: colors.borderLight, borderBottomWidth: 1 },
                ]}
                onPress={() => setSelectedReason(r.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.reasonIconBox, {
                  backgroundColor: active ? '#fee2e2' : colors.background,
                }]}>
                  <Ionicons name={r.icon} size={18} color={active ? '#dc2626' : colors.textSecondary} />
                </View>
                <Text style={[styles.reasonText, {
                  color: active ? '#dc2626' : colors.text,
                  fontWeight: active ? '700' : '500',
                  flex: 1,
                }]}>
                  {r.label}
                </Text>
                <View style={[styles.radio, { borderColor: active ? '#dc2626' : colors.border }]}>
                  {active && <View style={[styles.radioInner, { backgroundColor: '#dc2626' }]} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedReason === 'other' && (
          <TextInput
            style={[styles.textArea, {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
            }]}
            placeholder="Please specify your reason..."
            placeholderTextColor={colors.textTertiary}
            value={otherReason}
            onChangeText={setOtherReason}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        )}

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, {
            backgroundColor: canSubmit ? '#dc2626' : colors.borderLight,
          }]}
          onPress={handleSubmit}
          disabled={!canSubmit}
          activeOpacity={0.85}
        >
          <Ionicons name="close-circle-outline" size={18} color={canSubmit ? '#fff' : colors.textTertiary} />
          <Text style={[styles.submitBtnText, { color: canSubmit ? '#fff' : colors.textTertiary }]}>
            Submit Cancellation
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.keepBtn} onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Text style={[styles.keepBtnText, { color: colors.textSecondary }]}>Keep my ride</Text>
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

  tripStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    gap: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  tripIconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tripTitle: { fontSize: 14, fontWeight: '700' },
  tripDate: { fontSize: 12, marginTop: 1 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, gap: 4 },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 11, fontWeight: '600' },

  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 10,
    marginBottom: 20,
  },
  warningText: { flex: 1, fontSize: 13, lineHeight: 18 },

  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10 },

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
  reasonIconBox: { width: 38, height: 38, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  reasonText: { fontSize: 15 },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: { width: 11, height: 11, borderRadius: 6 },

  textArea: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 14,
    fontSize: 14,
    minHeight: 80,
    marginBottom: 16,
  },

  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 14,
    gap: 8,
    marginTop: 4,
  },
  submitBtnText: { fontSize: 16, fontWeight: '700' },

  keepBtn: { alignItems: 'center', paddingVertical: 16 },
  keepBtnText: { fontSize: 15, fontWeight: '600' },
});

export default CancelRequestScreen;
