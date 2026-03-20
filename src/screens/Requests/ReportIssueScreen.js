/**
 * Report Issue Screen — screen 21/21
 * Employee reports an issue related to a trip, driver, vehicle or safety.
 * Navigated from: HomeScreen Quick Actions OR TripsScreen 3-dot menu.
 * Design follows the Figma app design language — card rows with icon badges.
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

const ISSUE_CATEGORIES = [
  { id: 'driver', label: 'Driver Behaviour', icon: 'person-outline', color: '#6d28d9', bg: '#ede9fe' },
  { id: 'vehicle', label: 'Vehicle Issue', icon: 'car-outline', color: '#0369a1', bg: '#e0f2fe' },
  { id: 'route', label: 'Route Problem', icon: 'navigate-outline', color: '#047857', bg: '#d1fae5' },
  { id: 'safety', label: 'Safety Concern', icon: 'shield-outline', color: '#b91c1c', bg: '#fee2e2' },
  { id: 'delay', label: 'Excessive Delay', icon: 'time-outline', color: '#b45309', bg: '#fef3c7' },
  { id: 'other', label: 'Other Issue', icon: 'ellipsis-horizontal-outline', color: '#6b7280', bg: '#f3f4f6' },
];

const ReportIssueScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const trip = route?.params?.trip;

  const [selectedCategory, setSelectedCategory] = useState('');
  const [description, setDescription] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const canSubmit = selectedCategory && description.trim().length >= 10;

  if (submitted) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <View style={styles.successWrap}>
          <View style={[styles.successIconOuter, { backgroundColor: colors.primaryContainer }]}>
            <View style={[styles.successIconInner, { backgroundColor: colors.primary }]}>
              <Ionicons name="checkmark" size={32} color="#fff" />
            </View>
          </View>
          <Text style={[styles.successTitle, { color: colors.text }]}>Report Submitted</Text>
          <Text style={[styles.successSub, { color: colors.textSecondary }]}>
            Our team will review your issue within 24 hours and get back to you.
          </Text>
          <TouchableOpacity
            style={[styles.doneBtn, { backgroundColor: colors.primary }]}
            onPress={() => navigation.popToTop()}
            activeOpacity={0.85}
          >
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Report Issue</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Trip context strip */}
        {trip && (
          <View style={[styles.tripStrip, { backgroundColor: colors.surface }]}>
            <View style={[styles.tripIconBox, { backgroundColor: trip.iconBg ?? colors.primaryContainer }]}>
              <Ionicons name={trip.icon ?? 'car-outline'} size={18} color={trip.iconColor ?? colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.tripTitle, { color: colors.text }]}>{trip.title}</Text>
              <Text style={[styles.tripDate, { color: colors.textSecondary }]}>{trip.date}</Text>
            </View>
          </View>
        )}

        {/* Category section */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>What's the issue?</Text>
        <View style={[styles.categoryCard, { backgroundColor: colors.surface }]}>
          {ISSUE_CATEGORIES.map((cat, idx) => {
            const active = selectedCategory === cat.id;
            const isLast = idx === ISSUE_CATEGORIES.length - 1;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryRow,
                  !isLast && { borderBottomColor: colors.borderLight, borderBottomWidth: 1 },
                  active && { backgroundColor: cat.bg + '60' },
                ]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.catIconBox, { backgroundColor: active ? cat.bg : colors.background }]}>
                  <Ionicons name={cat.icon} size={20} color={active ? cat.color : colors.textSecondary} />
                </View>
                <Text style={[styles.catLabel, { color: active ? cat.color : colors.text, fontWeight: active ? '700' : '500' }]}>
                  {cat.label}
                </Text>
                <View style={[
                  styles.radio,
                  { borderColor: active ? cat.color : colors.border },
                ]}>
                  {active && <View style={[styles.radioInner, { backgroundColor: cat.color }]} />}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Description */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Describe the issue</Text>
        <TextInput
          style={[
            styles.textArea,
            {
              backgroundColor: colors.surface,
              borderColor: description.length >= 10 ? colors.primary : colors.border,
              color: colors.text,
            },
          ]}
          placeholder="Please describe in detail — the more specific, the faster we can resolve it..."
          placeholderTextColor={colors.textTertiary}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={5}
          textAlignVertical="top"
        />
        {description.length > 0 && description.length < 10 && (
          <Text style={[styles.charHint, { color: '#f59e0b' }]}>
            {10 - description.length} more characters needed
          </Text>
        )}

        {/* Submit */}
        <TouchableOpacity
          style={[
            styles.submitBtn,
            { backgroundColor: canSubmit ? colors.primary : colors.borderLight },
          ]}
          onPress={() => setSubmitted(true)}
          disabled={!canSubmit}
          activeOpacity={0.85}
        >
          <Ionicons name="send-outline" size={18} color={canSubmit ? '#fff' : colors.textTertiary} />
          <Text style={[styles.submitBtnText, { color: canSubmit ? '#fff' : colors.textTertiary }]}>
            Submit Report
          </Text>
        </TouchableOpacity>

        <Text style={[styles.footerNote, { color: colors.textTertiary }]}>
          Issues are reviewed within 24 hours. For emergencies, contact security directly.
        </Text>
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
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  tripIconBox: { width: 40, height: 40, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tripTitle: { fontSize: 14, fontWeight: '700' },
  tripDate: { fontSize: 12, marginTop: 1 },

  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10, marginTop: 4 },

  categoryCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  catIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  catLabel: { flex: 1, fontSize: 15 },
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
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    fontSize: 14,
    minHeight: 130,
    lineHeight: 22,
  },
  charHint: { fontSize: 12, marginTop: 6 },

  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 14,
    gap: 8,
    marginTop: 20,
  },
  submitBtnText: { fontSize: 16, fontWeight: '700' },
  footerNote: { fontSize: 12, textAlign: 'center', marginTop: 14, lineHeight: 18 },

  // Success state
  successWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 0 },
  successIconOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  successIconInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successTitle: { fontSize: 22, fontWeight: '800', marginBottom: 10 },
  successSub: { fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  doneBtn: {
    width: '100%',
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default ReportIssueScreen;
