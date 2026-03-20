/**
 * Location Change Success Screen — screen 19/21
 * Shown after the employee sends a pickup location change request.
 * Confirms the request was submitted and shows what happens next.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';

const LocationChangeSuccessScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const trip = route?.params?.trip;
  const newLocation = route?.params?.newLocation;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Success icon */}
        <View style={[styles.iconCircle, { backgroundColor: colors.primaryContainer }]}>
          <View style={[styles.iconInner, { backgroundColor: colors.primary }]}>
            <Ionicons name="checkmark" size={36} color="#fff" />
          </View>
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: colors.text }]}>Request Submitted!</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Your pickup location change request has been submitted for approval.
        </Text>

        {/* Details card */}
        <View style={[styles.detailsCard, { backgroundColor: colors.surface }]}>
          {trip && (
            <View style={[styles.detailRow, { borderBottomColor: colors.borderLight }]}>
              <Ionicons name="calendar-outline" size={16} color={colors.textTertiary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.detailLabel, { color: colors.textTertiary }]}>Trip</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{trip.title}</Text>
                <Text style={[styles.detailSub, { color: colors.textSecondary }]}>{trip.date}</Text>
              </View>
            </View>
          )}

          {newLocation && (
            <View style={styles.detailRow}>
              <Ionicons name="location" size={16} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.detailLabel, { color: colors.textTertiary }]}>New Pickup Location</Text>
                <Text style={[styles.detailValue, { color: colors.text }]}>{newLocation.name}</Text>
                <Text style={[styles.detailSub, { color: colors.textSecondary }]}>{newLocation.address}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Info row */}
        <View style={[styles.infoBanner, { backgroundColor: colors.primaryContainer }]}>
          <Ionicons name="time-outline" size={16} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.primary }]}>
            Your current schedule remains unchanged until your request is approved (within 24 hrs).
          </Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.doneBtn, { backgroundColor: colors.primary }]}
          onPress={() => navigation.popToTop()}
          activeOpacity={0.85}
        >
          <Text style={styles.doneBtnText}>Back to My Trips</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 60 },

  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  iconInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },

  title: { fontSize: 24, fontWeight: '800', marginBottom: 10, textAlign: 'center' },
  subtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 32 },

  detailsCard: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
  },
  detailLabel: { fontSize: 11, marginBottom: 3 },
  detailValue: { fontSize: 14, fontWeight: '700' },
  detailSub: { fontSize: 12, marginTop: 2 },

  infoBanner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  infoText: { flex: 1, fontSize: 13, lineHeight: 18 },

  footer: { paddingHorizontal: 24, paddingBottom: 24 },
  doneBtn: {
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default LocationChangeSuccessScreen;
