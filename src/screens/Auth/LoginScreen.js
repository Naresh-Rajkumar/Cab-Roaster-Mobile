/**
 * Login Screen — Figma: Onboarding-Employee "Login"
 * vCommute branding, preview cards, Sign In With Microsoft.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../theme/ThemeProvider';
import { SCREENS } from '../../constants';
import { loginUser } from '../../redux/slices/authSlice';
import { setAuthToken } from '../../services/axiosConfig';
import axiosInstance from '../../services/axiosConfig';
import { makeRedirectUri } from 'expo-auth-session';

// Azure AD config
const AZURE_TENANT_ID = '3bc90aa9-088f-4447-9eb2-ff13839e19dd';
const AZURE_CLIENT_ID = '264d0ea6-fba2-4d90-aa74-bceeee062c44';
const MS_AUTH_URL = `https://login.microsoftonline.com/${AZURE_TENANT_ID}/oauth2/v2.0/authorize`;

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
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [msLoading, setMsLoading] = useState(false);

  const isValid = phone.replace(/\D/g, '').length >= 10 && password.length >= 8;

  const handleLogin = async () => {
    const fullPhone = `+91-${phone.replace(/\D/g, '')}`;
    const result = await dispatch(loginUser({ phone: fullPhone, password }));
    if (loginUser.rejected.match(result)) {
      Alert.alert('Login Failed', result.payload || 'Invalid credentials');
    }
  };

  const handleMicrosoftSignIn = async () => {
    try {
      setMsLoading(true);
      const redirectUri = Platform.OS === 'web'
        ? window.location.origin
        : makeRedirectUri({ scheme: 'vcommute', path: 'auth' });
      console.log('[MS Auth] Redirect URI:', redirectUri);
      const nonce = Math.random().toString(36).substring(2);
      const authUrl =
        `${MS_AUTH_URL}?client_id=${AZURE_CLIENT_ID}` +
        `&response_type=id_token` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=${encodeURIComponent('openid profile email')}` +
        `&response_mode=fragment` +
        `&nonce=${nonce}` +
        `&prompt=select_account`;

      if (Platform.OS === 'web') {
        // Open popup for web
        const popup = window.open(authUrl, 'ms-login', 'width=500,height=700');
        // Listen for the redirect back with id_token in hash
        const checkPopup = setInterval(() => {
          try {
            if (!popup || popup.closed) {
              clearInterval(checkPopup);
              setMsLoading(false);
              return;
            }
            const hash = popup.location.hash;
            if (hash && hash.includes('id_token=')) {
              clearInterval(checkPopup);
              popup.close();
              const params = new URLSearchParams(hash.substring(1));
              const idToken = params.get('id_token');
              if (idToken) {
                exchangeMicrosoftToken(idToken);
              } else {
                setMsLoading(false);
              }
            }
          } catch {
            // Cross-origin — popup hasn't redirected back yet, keep waiting
          }
        }, 500);
      } else {
        // Native: use expo-web-browser
        const WebBrowser = require('expo-web-browser');
        const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);
        if (result.type === 'success' && result.url) {
          const hash = result.url.split('#')[1] || '';
          const params = new URLSearchParams(hash);
          const idToken = params.get('id_token');
          if (idToken) {
            await exchangeMicrosoftToken(idToken);
            return;
          }
        }
        setMsLoading(false);
      }
    } catch (err) {
      Alert.alert('Login Failed', err.message || 'Microsoft login failed');
      setMsLoading(false);
    }
  };

  const exchangeMicrosoftToken = async (idToken) => {
    try {
      const res = await axiosInstance.post('/auth/microsoft', { idToken });
      const data = res.data?.data ?? res.data;
      if (data?.accessToken) {
        setAuthToken(data.accessToken);
        dispatch({
          type: 'auth/loginUser/fulfilled',
          payload: res.data,
        });
      } else {
        Alert.alert('Login Failed', 'No access token received');
      }
    } catch (err) {
      Alert.alert('Login Failed', err.response?.data?.message || err.message || 'Microsoft login failed');
    } finally {
      setMsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: BG }]}>
      {/* Blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
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

        {/* Login section */}
        <View style={styles.welcomeSection}>
          <Text style={[styles.welcomeTitle, { color: colors.text }]}>Welcome to vCommute</Text>
          <Text style={[styles.welcomeSub, { color: colors.textSecondary }]}>
            Sign in with your phone number
          </Text>

          {/* Phone input */}
          <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: '#fff' }]}>
            <Text style={styles.countryCode}>+91</Text>
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Phone number"
              placeholderTextColor={colors.textTertiary}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>

          {/* Password input */}
          <View style={[styles.inputRow, { borderColor: colors.border, backgroundColor: '#fff', marginTop: 12 }]}>
            <Ionicons name="lock-closed-outline" size={18} color={colors.textTertiary} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Password"
              placeholderTextColor={colors.textTertiary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>

          {/* Login button */}
          <TouchableOpacity
            style={[styles.loginBtn, { backgroundColor: isValid ? PRIMARY : '#c4b5fd', opacity: isLoading ? 0.7 : 1 }]}
            onPress={handleLogin}
            disabled={!isValid || isLoading}
            activeOpacity={0.85}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginBtnText}>Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            <Text style={[styles.dividerText, { color: colors.textTertiary }]}>or</Text>
            <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          </View>

          {/* Sign In With Microsoft */}
          <TouchableOpacity
            style={[styles.msButton, { borderColor: PRIMARY, opacity: msLoading ? 0.7 : 1 }]}
            onPress={handleMicrosoftSignIn}
            activeOpacity={0.85}
            disabled={msLoading}
          >
            {msLoading ? (
              <ActivityIndicator color={PRIMARY} size="small" />
            ) : (
              <>
                <MicrosoftIcon />
                <Text style={[styles.msButtonText, { color: PRIMARY }]}>Sign In With Microsoft</Text>
              </>
            )}
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

  // Login inputs
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 16,
  },
  countryCode: { fontSize: 15, fontWeight: '600', color: '#312e3a', marginRight: 8 },
  input: { flex: 1, fontSize: 15, height: '100%' },
  loginBtn: {
    width: '100%',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  loginBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', width: '100%', marginVertical: 16 },
  dividerLine: { flex: 1, height: 1 },
  dividerText: { marginHorizontal: 12, fontSize: 13 },

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
