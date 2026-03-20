/**
 * Login Screen — Figma: Onboarding-Employee "Login"
 * vCommute branding, preview cards, Sign In With Microsoft.
 */
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { SCREENS } from '../../constants';

const PRIMARY = '#643ee8';
const PRIMARY_LIGHT = '#f1ecff';
const BG = '#f5f4f9';

// ─── Preview Cards ────────────────────────────────────────────────────────────
const TripPreviewCard = ({ colors }) => (
  <View style={[styles.previewCard, { backgroundColor: colors.surface }]}>
    <View style={styles.previewCardRow}>
      <View style={[styles.previewIconBox, { backgroundColor: '#DCFCE7' }]}>
        <Ionicons name="business" size={20} color="#22C55E" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.previewCardTitle, { color: colors.text }]}>Tomorrow Morning</Text>
        <Text style={[styles.previewCardSub, { color: colors.textSecondary }]}>Tue, Feb 06 · 08:00 AM</Text>
      </View>
      <Ionicons name="ellipsis-vertical" size={16} color={colors.textTertiary} />
    </View>
    <View style={styles.previewRouteRow}>
      <Text style={[styles.previewRouteFrom, { color: colors.textSecondary }]}>Home</Text>
      <View style={styles.previewDashes}>
        {[...Array(5)].map((_, i) => (
          <View key={i} style={[styles.previewDash, { backgroundColor: colors.border }]} />
        ))}
      </View>
      <Text style={[styles.previewRouteTo, { color: colors.text }]}>Office</Text>
      <View style={[styles.scheduledBadge, { backgroundColor: PRIMARY_LIGHT }]}>
        <View style={[styles.badgeDot, { backgroundColor: PRIMARY }]} />
        <Text style={[styles.badgeText, { color: PRIMARY }]}>Scheduled</Text>
      </View>
    </View>
  </View>
);

const RoutePreviewCard = ({ colors }) => (
  <View style={[styles.previewCard, { backgroundColor: colors.surface }]}>
    {/* Pickup */}
    <View style={styles.routePreviewStop}>
      <View style={[styles.routeCheckBox, { backgroundColor: '#e8f6ed' }]}>
        <Ionicons name="checkmark" size={11} color="#16a34a" />
      </View>
      <Text style={[styles.routePreviewName, { color: colors.text }]}>Karapakkam</Text>
    </View>
    <View style={styles.routePreviewConnector}>
      <View style={[styles.routePreviewDash, { borderColor: colors.border }]} />
      <Text style={[styles.routePreviewDist, { color: colors.textSecondary }]}>8km away</Text>
    </View>
    {/* Destination */}
    <View style={styles.routePreviewStop}>
      <View style={[styles.routeDestDot, { borderColor: PRIMARY, backgroundColor: PRIMARY_LIGHT }]}>
        <Ionicons name="person" size={10} color={PRIMARY} />
      </View>
      <Text style={[styles.routePreviewName, { color: colors.text }]}>Sholinganallur</Text>
      <View style={[styles.etaBadge, { backgroundColor: PRIMARY_LIGHT }]}>
        <View style={[styles.etaDot, { backgroundColor: PRIMARY }]} />
        <Text style={[styles.etaText, { color: PRIMARY }]}>15 mins</Text>
      </View>
    </View>
  </View>
);

// ─── Microsoft Icon ───────────────────────────────────────────────────────────
const MicrosoftIcon = () => (
  <View style={styles.msIcon}>
    <View style={styles.msTopLeft} />
    <View style={styles.msTopRight} />
    <View style={styles.msBottomLeft} />
    <View style={styles.msBottomRight} />
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const LoginScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const handleMicrosoftSignIn = () => {
    navigation.navigate(SCREENS.REQUEST_CAB_STEP1);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: BG }]}>
      {/* Blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* App name */}
        <View style={styles.brandRow}>
          <Text style={styles.brandV}>v</Text>
          <Text style={[styles.brandName, { color: colors.text }]}>Commute</Text>
        </View>

        {/* Hero */}
        <Text style={[styles.heroTitle, { color: colors.text }]}>Your Ride Starts Here</Text>
        <Text style={[styles.heroSub, { color: colors.textSecondary }]}>
          View your assigned trips and pickup details instantly.
        </Text>

        {/* Preview cards */}
        <View style={styles.previewStack}>
          <TripPreviewCard colors={colors} />
          <RoutePreviewCard colors={colors} />
        </View>

        {/* Welcome section */}
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeTitle, { color: colors.text }]}>Welcome to vCommute</Text>
          <Text style={[styles.welcomeSub, { color: colors.textSecondary }]}>
            Use your work account to access cab services
          </Text>

          {/* Sign In With Microsoft */}
          <TouchableOpacity
            style={[styles.msButton, { borderColor: PRIMARY }]}
            onPress={handleMicrosoftSignIn}
            activeOpacity={0.85}
          >
            <MicrosoftIcon />
            <Text style={[styles.msButtonText, { color: PRIMARY }]}>Sign In With Microsoft</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  scrollContent: { flexGrow: 1, paddingHorizontal: 24 },

  // Blobs
  blob1: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: PRIMARY_LIGHT,
    top: -80,
    right: -60,
    opacity: 0.5,
  },
  blob2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: PRIMARY_LIGHT,
    bottom: 80,
    left: -60,
    opacity: 0.4,
  },

  // Brand
  brandRow: { flexDirection: 'row', alignItems: 'baseline', paddingTop: 32, marginBottom: 20 },
  brandV: { fontSize: 28, fontWeight: '800', color: '#dc2626' },
  brandName: { fontSize: 28, fontWeight: '700' },

  // Hero
  heroTitle: { fontSize: 24, fontWeight: '700', marginBottom: 8 },
  heroSub: { fontSize: 14, lineHeight: 22, marginBottom: 24 },

  // Preview cards
  previewStack: { gap: 12, marginBottom: 28 },
  previewCard: {
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  previewCardRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  previewIconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  previewCardTitle: { fontSize: 14, fontWeight: '600' },
  previewCardSub: { fontSize: 12, marginTop: 1 },
  previewRouteRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  previewRouteFrom: { fontSize: 13 },
  previewDashes: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 4 },
  previewDash: { width: 6, height: 2, borderRadius: 1 },
  previewRouteTo: { fontSize: 13, fontWeight: '600', marginRight: 6 },
  scheduledBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, gap: 4 },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 11, fontWeight: '600' },

  // Route preview card
  routeCheckBox: { width: 24, height: 24, borderRadius: 7, alignItems: 'center', justifyContent: 'center' },
  routeDestDot: { width: 24, height: 24, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  routePreviewStop: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  routePreviewName: { flex: 1, fontSize: 14, fontWeight: '600' },
  routePreviewConnector: { flexDirection: 'row', alignItems: 'center', paddingLeft: 10, paddingVertical: 4, gap: 8 },
  routePreviewDash: { borderLeftWidth: 1.5, borderStyle: 'dashed', height: 16 },
  routePreviewDist: { fontSize: 12 },
  etaBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, gap: 4 },
  etaDot: { width: 6, height: 6, borderRadius: 3 },
  etaText: { fontSize: 11, fontWeight: '600' },

  // Welcome section
  welcomeSection: { alignItems: 'center' },
  welcomeTitle: { fontSize: 20, fontWeight: '700', marginBottom: 6, textAlign: 'center' },
  welcomeSub: { fontSize: 13, textAlign: 'center', marginBottom: 20 },

  // Microsoft button
  msButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 12,
  },
  msButtonText: { fontSize: 16, fontWeight: '600' },

  // Microsoft icon (4 coloured squares)
  msIcon: { width: 20, height: 20, flexDirection: 'row', flexWrap: 'wrap', gap: 2 },
  msTopLeft: { width: 9, height: 9, backgroundColor: '#F35325' },
  msTopRight: { width: 9, height: 9, backgroundColor: '#81BC06' },
  msBottomLeft: { width: 9, height: 9, backgroundColor: '#05A6F0' },
  msBottomRight: { width: 9, height: 9, backgroundColor: '#FFBA08' },
});

export default LoginScreen;
