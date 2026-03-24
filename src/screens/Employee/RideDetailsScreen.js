/**
 * Ride Details Screen
 * Shows full details of a specific ride — driver info, route, OTP, vehicle.
 * Navigated to from HomeScreen or TripsScreen.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { Avatar, StatusBadge } from '../../components';
import { SCREENS } from '../../constants';
import { useSelector } from 'react-redux';

const InfoRow = ({ icon, label, value, colors }) => (
  <View style={styles.infoRow}>
    <View style={[styles.infoIconBox, { backgroundColor: colors.primaryContainer }]}>
      <Ionicons name={icon} size={16} color={colors.primary} />
    </View>
    <View style={styles.infoTextBlock}>
      <Text style={[styles.infoLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.text }]}>{value}</Text>
    </View>
  </View>
);

const RideDetailsScreen = ({ navigation, route }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const currentRide = useSelector((state) => state.trip.currentRide);
  const ride = route?.params?.ride ?? currentRide ?? {};

  const handleCall = () => {
    if (ride?.driverPhone) {
      Linking.openURL(`tel:${ride.driverPhone}`);
    }
  };

  const handleTrack = () => {
    navigation.navigate(SCREENS.LIVE_TRACKING, { ride });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Ride Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Status banner */}
        <View style={[styles.statusBanner, { backgroundColor: colors.primaryContainer }]}>
          <View style={styles.statusBannerLeft}>
            <Text style={[styles.statusBannerLabel, { color: colors.textSecondary }]}>Trip ID</Text>
            <Text style={[styles.statusBannerValue, { color: colors.text }]}>{ride?.id ?? 'TR-1042'}</Text>
          </View>
          <StatusBadge status={ride?.status ?? 'in_progress'} />
        </View>

        {/* Route card */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Route</Text>

          <View style={styles.routeRow}>
            <View style={[styles.routeDot, { backgroundColor: '#16a34a' }]} />
            <View style={styles.routeTextBlock}>
              <Text style={[styles.routeStopLabel, { color: colors.textSecondary }]}>Pickup</Text>
              <Text style={[styles.routeStopName, { color: colors.text }]}>{ride?.pickup}</Text>
            </View>
            <Text style={[styles.routeTime, { color: colors.primary }]}>{ride?.scheduledTime}</Text>
          </View>

          <View style={styles.routeConnector}>
            <View style={[styles.connDash, { borderLeftColor: colors.border }]} />
            <Text style={[styles.connLabel, { color: colors.textSecondary }]}>{ride?.distance}</Text>
          </View>

          <View style={styles.routeRow}>
            <View style={[styles.routeDotOutline, { borderColor: '#dc2626' }]}>
              <Ionicons name="business-outline" size={8} color="#dc2626" />
            </View>
            <View style={styles.routeTextBlock}>
              <Text style={[styles.routeStopLabel, { color: colors.textSecondary }]}>Drop</Text>
              <Text style={[styles.routeStopName, { color: colors.text }]}>{ride?.dropoff}</Text>
            </View>
            <Text style={[styles.routeTime, { color: colors.textSecondary }]}>ETA {ride?.eta}</Text>
          </View>
        </View>

        {/* OTP card */}
        <View style={[styles.otpCard, { backgroundColor: '#f1ecff' }]}>
          <Ionicons name="key-outline" size={20} color="#643ee8" />
          <View style={{ flex: 1 }}>
            <Text style={[styles.otpLabel, { color: '#643ee8' }]}>Share this OTP with your driver</Text>
            <Text style={[styles.otpCode, { color: '#643ee8' }]}>{ride?.otp ?? '4521'}</Text>
          </View>
        </View>

        {/* Driver card */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Driver</Text>
          <View style={styles.driverRow}>
            <Avatar name={ride?.driverName ?? 'Driver'} size={52} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.driverName, { color: colors.text }]}>{ride?.driverName}</Text>
              <Text style={[styles.driverSub, { color: colors.textSecondary }]}>
                {ride?.vehicleNo} · {ride?.vehicleType}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.callBtn, { backgroundColor: '#e8f6ed' }]}
              onPress={handleCall}
            >
              <Ionicons name="call" size={20} color="#16a34a" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Ride info */}
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <Text style={[styles.cardTitle, { color: colors.text }]}>Details</Text>
          <InfoRow icon="time-outline" label="Scheduled Time" value={ride?.scheduledTime ?? '—'} colors={colors} />
          <View style={[styles.rowDivider, { backgroundColor: colors.borderLight }]} />
          <InfoRow icon="navigate-outline" label="Distance" value={ride?.distance ?? '—'} colors={colors} />
          <View style={[styles.rowDivider, { backgroundColor: colors.borderLight }]} />
          <InfoRow icon="car-outline" label="Vehicle" value={`${ride?.vehicleType} · ${ride?.vehicleNo}`} colors={colors} />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Footer */}
      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.borderLight }]}>
        <TouchableOpacity
          style={[styles.trackBtn, { backgroundColor: colors.primary }]}
          onPress={handleTrack}
          activeOpacity={0.85}
        >
          <Ionicons name="navigate-outline" size={20} color="#fff" />
          <Text style={styles.trackBtnText}>Track Ride</Text>
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
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center', fontSize: 17, fontWeight: '700' },
  scrollContent: { padding: 16 },

  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  statusBannerLabel: { fontSize: 12, marginBottom: 2 },
  statusBannerValue: { fontSize: 15, fontWeight: '700' },

  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  cardTitle: { fontSize: 13, fontWeight: '700', marginBottom: 14, textTransform: 'uppercase', letterSpacing: 0.5 },

  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  routeDot: { width: 10, height: 10, borderRadius: 5 },
  routeDotOutline: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  routeTextBlock: { flex: 1 },
  routeStopLabel: { fontSize: 11, marginBottom: 1 },
  routeStopName: { fontSize: 14, fontWeight: '600' },
  routeTime: { fontSize: 13, fontWeight: '600' },
  routeConnector: { flexDirection: 'row', alignItems: 'center', paddingLeft: 5, paddingVertical: 6, gap: 10 },
  connDash: { borderLeftWidth: 1.5, borderStyle: 'dashed', height: 16 },
  connLabel: { fontSize: 12 },

  otpCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 16,
    gap: 12,
    marginBottom: 14,
  },
  otpLabel: { fontSize: 12, marginBottom: 4 },
  otpCode: { fontSize: 28, fontWeight: '800', letterSpacing: 8 },

  driverRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  driverName: { fontSize: 15, fontWeight: '700', marginBottom: 3 },
  driverSub: { fontSize: 12 },
  callBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },

  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  infoIconBox: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  infoTextBlock: { flex: 1 },
  infoLabel: { fontSize: 11, marginBottom: 2 },
  infoValue: { fontSize: 14, fontWeight: '600' },
  rowDivider: { height: 1, marginVertical: 10 },

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
  trackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 54,
    borderRadius: 14,
    gap: 8,
  },
  trackBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});

export default RideDetailsScreen;
