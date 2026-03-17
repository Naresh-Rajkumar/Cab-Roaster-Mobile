import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { useTheme } from '../../theme/ThemeProvider';
import { loginUser } from '../../redux/slices/authSlice';
import spacing from '../../theme/spacing.json';
import typography from '../../theme/typography.json';

// ─── Sub-components ───────────────────────────────────────────────────────────

const PreviewTripCard = ({ colors }) => (
  <View style={[styles.previewCard, { backgroundColor: colors.surface }]}>
    <View style={styles.previewCardRow}>
      <View style={[styles.previewIcon, { backgroundColor: '#DCFCE7' }]}>
        <Ionicons name="business" size={16} color="#22C55E" />
      </View>
      <View style={styles.previewCardContent}>
        <Text style={[styles.previewCardTitle, { color: colors.text, fontFamily: typography.fontFamily.semiBold }]}>
          Tomorrow Morning
        </Text>
        <Text style={[styles.previewCardSub, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
          Tue, Feb 06 · 08:00 AM
        </Text>
      </View>
      <Ionicons name="ellipsis-vertical" size={16} color={colors.textTertiary} />
    </View>
    <View style={styles.previewRouteRow}>
      <Text style={{ color: colors.textSecondary, fontFamily: typography.fontFamily.regular, fontSize: 12 }}>
        Home
      </Text>
      <Text style={{ color: colors.textTertiary, fontSize: 12, letterSpacing: 1 }}>{' - - - '}</Text>
      <Text style={{ color: colors.text, fontFamily: typography.fontFamily.semiBold, fontSize: 12 }}>
        Office
      </Text>
      <View style={{ flex: 1 }} />
      <View style={[styles.badge, { backgroundColor: colors.primaryContainer }]}>
        <View style={[styles.badgeDot, { backgroundColor: colors.primary }]} />
        <Text style={[styles.badgeText, { color: colors.primary, fontFamily: typography.fontFamily.medium }]}>
          Scheduled
        </Text>
      </View>
    </View>
  </View>
);

const PreviewRouteCard = ({ colors }) => (
  <View style={[styles.previewCard, { backgroundColor: colors.surface }]}>
    <View style={styles.routeStopRow}>
      <View style={[styles.routeGreenDot]} />
      <Text style={{ color: colors.text, fontFamily: typography.fontFamily.medium, fontSize: 14 }}>
        Karapakkam
      </Text>
    </View>
    <View style={{ paddingLeft: 4, marginVertical: 4, flexDirection: 'row', alignItems: 'center' }}>
      <View style={[styles.routeDash, { borderLeftColor: colors.border }]} />
      <Text style={{ color: colors.textSecondary, fontFamily: typography.fontFamily.regular, fontSize: 12, marginLeft: spacing.md }}>
        8km away
      </Text>
    </View>
    <View style={styles.routeStopRow}>
      <View style={[styles.routePersonDot, { borderColor: colors.primary }]}>
        <Ionicons name="person-outline" size={8} color={colors.primary} />
      </View>
      <Text style={{ color: colors.text, fontFamily: typography.fontFamily.medium, fontSize: 14 }}>
        Sholinganallur
      </Text>
      <View style={{ flex: 1 }} />
      <View style={[styles.badge, { backgroundColor: colors.primaryContainer }]}>
        <View style={[styles.badgeDot, { backgroundColor: colors.primary }]} />
        <Text style={[styles.badgeText, { color: colors.primary, fontFamily: typography.fontFamily.medium }]}>
          15 mins
        </Text>
      </View>
    </View>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────

const WelcomeScreen = () => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const dispatch = useDispatch();

  const [loadingRole, setLoadingRole] = useState(null); // 'employee' | 'driver' | null

  /**
   * handleLogin — dispatches loginUser thunk with the selected role.
   * The mock auth service returns a user object with the role,
   * which Redux stores and RootNavigator uses to route automatically.
   *
   * TO USE REAL BACKEND: set USE_MOCK=false in src/config/env.js.
   * Then update credentials to { email, password } and remove role field.
   */
  const handleLogin = async (role) => {
    if (loadingRole) return; // prevent double-tap
    setLoadingRole(role);
    try {
      await dispatch(loginUser({ role })).unwrap();
      // Navigation happens automatically via RootNavigator watching auth.isAuthenticated + auth.role
    } catch (err) {
      Alert.alert('Login Failed', err || 'Something went wrong. Please try again.');
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <View style={styles.root}>
      {/* Gradient blobs */}
      <View style={[styles.bgBase, { backgroundColor: '#F0EBFF' }]} />
      <View style={[styles.blob1, { backgroundColor: 'rgba(108,58,225,0.12)' }]} />
      <View style={[styles.blob2, { backgroundColor: 'rgba(108,58,225,0.07)' }]} />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoSection}>
            <Text>
              <Text style={styles.logoV}>v</Text>
              <Text style={[styles.logoCommute, { color: colors.text }]}>Commute</Text>
            </Text>
          </View>

          {/* Hero */}
          <Text style={[styles.heroTitle, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
            Your Ride Starts Here
          </Text>
          <Text style={[styles.heroSubtitle, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
            View your assigned trips and pickup details instantly.
          </Text>

          {/* Preview cards */}
          <PreviewTripCard colors={colors} />

          <Text style={[styles.midText, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
            Get real-time updates on your pickup and arrival time.
          </Text>

          <PreviewRouteCard colors={colors} />

          {/* ── Login Section ── */}
          <View style={styles.loginSection}>
            <Text style={[styles.loginTitle, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
              Welcome to vCommute
            </Text>
            <Text style={[styles.loginSubtitle, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
              Use your work account to access cab services
            </Text>

            {/* Employee Login — Microsoft SSO style */}
            <TouchableOpacity
              style={[
                styles.msButton,
                { borderColor: colors.primary },
                loadingRole === 'employee' && styles.buttonLoading,
              ]}
              onPress={() => handleLogin('employee')}
              activeOpacity={0.8}
              disabled={loadingRole !== null}
            >
              {loadingRole === 'employee' ? (
                <ActivityIndicator color={colors.primary} size="small" />
              ) : (
                <>
                  {/* Microsoft 4-square icon */}
                  <View style={styles.msGrid}>
                    <View style={styles.msRow}>
                      <View style={[styles.msSquare, { backgroundColor: '#F25022' }]} />
                      <View style={[styles.msSquare, { backgroundColor: '#7FBA00' }]} />
                    </View>
                    <View style={styles.msRow}>
                      <View style={[styles.msSquare, { backgroundColor: '#00A4EF' }]} />
                      <View style={[styles.msSquare, { backgroundColor: '#FFB900' }]} />
                    </View>
                  </View>
                  <Text style={[styles.msButtonText, { color: colors.primary, fontFamily: typography.fontFamily.semiBold }]}>
                    Sign In With Microsoft
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Driver Login */}
            <TouchableOpacity
              style={[
                styles.driverButton,
                { borderColor: colors.border, backgroundColor: colors.surface },
                loadingRole === 'driver' && styles.buttonLoading,
              ]}
              onPress={() => handleLogin('driver')}
              activeOpacity={0.8}
              disabled={loadingRole !== null}
            >
              {loadingRole === 'driver' ? (
                <ActivityIndicator color={colors.textSecondary} size="small" />
              ) : (
                <>
                  <Ionicons name="car-outline" size={20} color={colors.textSecondary} />
                  <Text style={[styles.driverButtonText, { color: colors.textSecondary, fontFamily: typography.fontFamily.medium }]}>
                    Continue as Driver
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Terms */}
            <Text style={[styles.terms, { color: colors.textTertiary, fontFamily: typography.fontFamily.regular }]}>
              By signing in, you agree to our{' '}
              <Text style={{ color: colors.primary }}>Terms & Conditions</Text>
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1 },
  bgBase: { ...StyleSheet.absoluteFillObject, zIndex: -3 },
  blob1: { position: 'absolute', width: 300, height: 300, borderRadius: 150, top: -80, right: -60, zIndex: -2 },
  blob2: { position: 'absolute', width: 200, height: 200, borderRadius: 100, top: 100, left: -60, zIndex: -2 },
  safeArea: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingHorizontal: spacing.xl, paddingBottom: spacing.xxxl },

  logoSection: { alignItems: 'center', paddingTop: spacing.xl, marginBottom: spacing.lg },
  logoV: { color: '#EF4444', fontWeight: '700', fontSize: 32 },
  logoCommute: { fontWeight: '700', fontSize: 32 },

  heroTitle: { fontSize: 24, textAlign: 'center', marginBottom: spacing.sm },
  heroSubtitle: { fontSize: 14, textAlign: 'center', marginBottom: spacing.xl, lineHeight: 22 },

  previewCard: {
    borderRadius: 16,
    padding: spacing.base,
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  previewCardRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  previewIcon: { width: 36, height: 36, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  previewCardContent: { flex: 1 },
  previewCardTitle: { fontSize: 14 },
  previewCardSub: { fontSize: 12, marginTop: 2 },
  previewRouteRow: { flexDirection: 'row', alignItems: 'center' },

  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: 999 },
  badgeDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  badgeText: { fontSize: 12 },

  routeStopRow: { flexDirection: 'row', alignItems: 'center' },
  routeGreenDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#22C55E', marginRight: spacing.md },
  routePersonDot: { width: 14, height: 14, borderRadius: 7, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  routeDash: { borderLeftWidth: 1.5, borderStyle: 'dashed', height: 16 },

  midText: { fontSize: 14, textAlign: 'center', marginVertical: spacing.md, lineHeight: 22 },

  loginSection: { marginTop: spacing.xl, alignItems: 'center' },
  loginTitle: { fontSize: 18, marginBottom: spacing.xs, textAlign: 'center' },
  loginSubtitle: { fontSize: 14, textAlign: 'center', marginBottom: spacing.xl },

  msButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: spacing.base,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: spacing.md,
    marginBottom: spacing.md,
    minHeight: 52,
  },
  msGrid: { gap: 1 },
  msRow: { flexDirection: 'row', gap: 1 },
  msSquare: { width: 8, height: 8 },
  msButtonText: { fontSize: 16 },

  driverButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: spacing.base,
    borderRadius: 12,
    borderWidth: 1,
    gap: spacing.md,
    marginBottom: spacing.lg,
    minHeight: 52,
  },
  driverButtonText: { fontSize: 15 },

  buttonLoading: { opacity: 0.7 },

  terms: { fontSize: 12, textAlign: 'center' },
});

export default WelcomeScreen;
