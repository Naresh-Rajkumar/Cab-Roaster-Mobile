/**
 * SessionExpiredScreen — shown when the admin resets the driver's passcode.
 *
 * Triggered by a 401 + code: 'SESSION_EXPIRED' response from the backend.
 * The Axios interceptor dispatches setSessionExpired(), which sets
 * sessionExpiredSource in Redux and clears isAuthenticated.
 * RootNavigator then renders AuthNavigator; AuthNavigator reads
 * sessionExpiredSource and uses this screen as the initial route.
 *
 * "Log In" clears sessionExpiredSource (via clearSessionExpired) and
 * navigates to DriverLoginScreen so the driver can re-authenticate.
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
import { clearSessionExpired } from '../../redux/slices/authSlice';
import { SCREENS } from '../../constants';

// ─── Design tokens ────────────────────────────────────────────────────────────
const PRIMARY   = '#643ee8';
const BG        = '#F5F4F9';
const TEXT      = '#312E3A';
const TEXT_SEC  = '#5E5C66';
const WHITE     = '#ffffff';
const AMBER     = '#f59e0b';
const AMBER_BG  = '#FEF3C7';
const BRAND_RED = '#EE001D';
const BRAND_GRY = '#4A4A4A';

const SessionExpiredScreen = ({ navigation }) => {
  const dispatch = useDispatch();

  const handleLogIn = () => {
    dispatch(clearSessionExpired());
    navigation.navigate(SCREENS.DRIVER_LOGIN);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>

        {/* Brand */}
        <View style={styles.brandRow}>
          <Text style={styles.brandV}>v</Text>
          <Text style={styles.brandName}>Commute</Text>
        </View>

        {/* Icon */}
        <View style={styles.iconOuter}>
          <View style={styles.iconMiddle}>
            <View style={styles.iconCircle}>
              {/* Key icon — shackle + body */}
              <View style={styles.keyHead} />
              <View style={styles.keyShaft} />
              <View style={styles.keyTeeth1} />
              <View style={styles.keyTeeth2} />
            </View>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Session Expired</Text>
        <Text style={styles.subtitle}>
          Your admin has updated your login credentials.{'\n'}
          Please log in again with your new passcode.
        </Text>

        {/* Info banner */}
        <View style={styles.infoBanner}>
          <Text style={styles.infoText}>
            Contact your admin if you don't have your new passcode.
          </Text>
        </View>

        {/* Log In button */}
        <TouchableOpacity
          style={styles.btn}
          onPress={handleLogIn}
          activeOpacity={0.85}
        >
          <Text style={styles.btnText}>Log In</Text>
        </TouchableOpacity>

      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  inner: {
    flex: 1,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Brand
  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 36,
  },
  brandV:    { fontSize: 24, fontWeight: '800', color: BRAND_RED },
  brandName: { fontSize: 24, fontWeight: '700', color: BRAND_GRY },

  // Icon
  iconOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: AMBER_BG,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  iconMiddle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: AMBER_BG,
    borderWidth: 1.5,
    borderColor: AMBER + '55',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: AMBER,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Key icon — round head on left, shaft going right
  keyHead: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: WHITE,
    left: 8,
    top: 19,
  },
  keyShaft: {
    position: 'absolute',
    width: 20,
    height: 4,
    backgroundColor: WHITE,
    borderRadius: 2,
    right: 5,
    top: 26,
  },
  keyTeeth1: {
    position: 'absolute',
    width: 4,
    height: 7,
    backgroundColor: WHITE,
    borderRadius: 1,
    right: 12,
    top: 30,
  },
  keyTeeth2: {
    position: 'absolute',
    width: 4,
    height: 5,
    backgroundColor: WHITE,
    borderRadius: 1,
    right: 7,
    top: 30,
  },

  // Text
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: TEXT_SEC,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },

  // Info banner
  infoBanner: {
    width: '100%',
    backgroundColor: AMBER_BG,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: AMBER + '88',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 32,
  },
  infoText: {
    fontSize: 13,
    color: '#92400e',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Button
  btn: {
    width: '100%',
    height: 44,
    backgroundColor: PRIMARY,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: { color: WHITE, fontSize: 16, fontWeight: '700' },
});

export default SessionExpiredScreen;
