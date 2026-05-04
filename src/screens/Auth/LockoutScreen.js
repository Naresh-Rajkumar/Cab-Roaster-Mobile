/**
 * LockoutScreen — shown after 5 consecutive wrong passcode attempts.
 *
 * Displays a 15-minute countdown timer.
 * "Back to Login" is disabled while the timer runs.
 * Once it reaches 0:00 the button activates → navigates back to DriverLogin.
 *
 * If the driver closes and reopens the app during the lockout period the
 * backend will still return 423 on the next attempt, so the screen is shown
 * again via the DRIVER_LOCKOUT route with the remaining `lockedUntil` param.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SCREENS } from '../../constants';

const PRIMARY   = '#643ee8';
const BG        = '#F5F4F9';
const TEXT      = '#312E3A';
const TEXT_SEC  = '#5E5C66';
const WHITE     = '#ffffff';
const ERROR     = '#dc2626';
const BRAND_RED = '#EE001D';
const BRAND_GRY = '#4A4A4A';

const DEFAULT_LOCKOUT_SECONDS = 15 * 60; // 15 minutes

function secondsUntil(isoDatetime) {
  if (!isoDatetime) return DEFAULT_LOCKOUT_SECONDS;
  const diff = Math.floor((new Date(isoDatetime) - Date.now()) / 1000);
  return Math.max(diff, 0);
}

const LockoutScreen = ({ navigation, route }) => {
  const { lockedUntil } = route.params || {};

  const initialSeconds = secondsUntil(lockedUntil);
  const [remaining, setRemaining] = useState(initialSeconds);
  const timerRef = useRef(null);

  useEffect(() => {
    if (remaining <= 0) return;
    timerRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleBackToLogin = () => {
    navigation.navigate(SCREENS.DRIVER_LOGIN);
  };

  const isUnlocked = remaining === 0;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>

        {/* Brand */}
        <View style={styles.brandRow}>
          <Text style={styles.brandV}>v</Text>
          <Text style={styles.brandName}>Commute</Text>
        </View>

        {/* Lock icon */}
        <View style={styles.iconOuter}>
          <View style={styles.iconMiddle}>
            <View style={styles.iconCircle}>
              {/* Lock shape */}
              <View style={styles.lockShackle} />
              <View style={styles.lockBody} />
            </View>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title}>Too Many Attempts</Text>
        <Text style={styles.subtitle}>
          For security, your account has been{'\n'}temporarily locked.
        </Text>

        {/* Countdown */}
        <Text style={styles.timerLabel}>Try again in:</Text>
        <View style={styles.timerBox}>
          <Text style={[styles.timerText, isUnlocked && styles.timerUnlocked]}>
            {isUnlocked ? '00:00' : formatTime(remaining)}
          </Text>
        </View>

        {/* Back to login */}
        <TouchableOpacity
          style={[styles.btn, !isUnlocked && styles.btnDisabled]}
          onPress={handleBackToLogin}
          activeOpacity={0.85}
          disabled={!isUnlocked}
        >
          <Text style={styles.btnText}>Back to Login</Text>
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
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  iconMiddle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#FEE2E2',
    borderWidth: 1.5,
    borderColor: ERROR + '33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: ERROR,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockShackle: {
    width: 16,
    height: 10,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 3,
    borderColor: WHITE,
    borderBottomWidth: 0,
    marginBottom: -2,
  },
  lockBody: {
    width: 22,
    height: 16,
    backgroundColor: WHITE,
    borderRadius: 3,
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
    marginBottom: 28,
  },

  // Timer
  timerLabel: {
    fontSize: 13,
    color: TEXT_SEC,
    marginBottom: 8,
  },
  timerBox: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    backgroundColor: WHITE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E6F0',
    marginBottom: 32,
    minWidth: 120,
    alignItems: 'center',
  },
  timerText: {
    fontSize: 32,
    fontWeight: '700',
    color: ERROR,
    letterSpacing: 2,
    fontVariant: ['tabular-nums'],
  },
  timerUnlocked: {
    color: '#22c55e',
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
  btnDisabled: { backgroundColor: '#B9C0C9' },
  btnText: { color: WHITE, fontSize: 16, fontWeight: '700' },
});

export default LockoutScreen;
