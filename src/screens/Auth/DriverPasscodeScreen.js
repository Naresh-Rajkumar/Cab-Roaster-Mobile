/**
 * DriverPasscodeScreen — Figma: Onboarding-Driver / Login (553:12387)
 *
 * Screen 2 of 2 in the driver passcode login flow.
 * Shows the driver's name, then 6 individual masked digit boxes.
 * On correct passcode → authenticated → RootNavigator switches to DriverNavigator.
 * On wrong passcode → shake animation + attempts remaining message.
 * On 5th failure (423) → navigate to DriverLockoutScreen.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { driverLogin } from '../../redux/slices/authSlice';
import { SCREENS } from '../../constants';

// ─── Design tokens ─────────────────────────────────────────────────────────────
const PRIMARY    = '#643ee8';
const BG         = '#F5F4F9';
const TEXT       = '#312E3A';
const TEXT_SEC   = '#5E5C66';
const WHITE      = '#ffffff';
const BOX_BORDER = '#D2C5FF';
const BOX_FILLED = PRIMARY;
const BOX_ERROR  = '#dc2626';
const ERROR      = '#dc2626';
const BRAND_RED  = '#EE001D';
const BRAND_GRY  = '#4A4A4A';

const PASSCODE_LENGTH = 6;

const DriverPasscodeScreen = ({ navigation, route }) => {
  const { phone = '', driverName = '', orgName = '' } = route.params || {};
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);

  const [digits, setDigits]       = useState(Array(PASSCODE_LENGTH).fill(''));
  const [errorMsg, setErrorMsg]   = useState('');
  const [hasError, setHasError]   = useState(false);
  const [isVerifying, setVerifying] = useState(false);

  const inputRefs  = useRef([]);
  const shakeAnim  = useRef(new Animated.Value(0)).current;

  // Focus first box on mount
  useEffect(() => {
    const t = setTimeout(() => inputRefs.current[0]?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  // Shake animation — horizontal vibrate
  const triggerShake = () => {
    shakeAnim.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10,  duration: 50,  useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50,  useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 8,   duration: 50,  useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8,  duration: 50,  useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 5,   duration: 50,  useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0,   duration: 50,  useNativeDriver: true }),
    ]).start();
  };

  const clearBoxes = () => {
    setDigits(Array(PASSCODE_LENGTH).fill(''));
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  };

  const handleChange = (value, index) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    const next = [...digits];
    next[index] = cleaned;
    setDigits(next);
    setHasError(false);
    setErrorMsg('');

    // Auto-advance
    if (cleaned && index < PASSCODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when last digit filled
    if (cleaned && index === PASSCODE_LENGTH - 1) {
      const passcode = [...digits.slice(0, PASSCODE_LENGTH - 1), cleaned].join('');
      if (passcode.length === PASSCODE_LENGTH) {
        submitPasscode(passcode);
      }
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const submitPasscode = async (passcodeStr) => {
    const code = passcodeStr ?? digits.join('');
    if (code.length !== PASSCODE_LENGTH || isVerifying) return;
    setVerifying(true);
    setErrorMsg('');
    setHasError(false);

    const result = await dispatch(driverLogin({ phone, passcode: code }));
    setVerifying(false);

    if (driverLogin.fulfilled.match(result)) {
      // Success — RootNavigator will switch to DriverNavigator automatically
      return;
    }

    // Error handling
    const err = result.payload || {};
    if (err.code === 'LOCKED') {
      navigation.replace(SCREENS.DRIVER_LOCKOUT, { lockedUntil: err.lockedUntil });
      return;
    }

    triggerShake();
    setHasError(true);
    clearBoxes();

    if (err.code === 'WRONG_PASSCODE') {
      const remaining = err.attemptsRemaining;
      if (remaining != null) {
        setErrorMsg(`Incorrect passcode. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`);
      } else {
        setErrorMsg('Incorrect passcode. Please try again.');
      }
    } else {
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    }
  };

  const handleLoginPress = () => submitPasscode();

  const isComplete = digits.every((d) => d !== '');

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.inner}>

          {/* Brand */}
          <View style={styles.brandRow}>
            <Text style={styles.brandV}>v</Text>
            <Text style={styles.brandName}>Commute</Text>
          </View>

          {/* Wrong number link */}
          <TouchableOpacity
            style={styles.backLink}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backLinkText}>← Wrong number?</Text>
          </TouchableOpacity>

          {/* Greeting */}
          <Text style={styles.greeting}>
            Hi, {driverName || 'Driver'} 👋
          </Text>
          {orgName ? <Text style={styles.orgName}>{orgName}</Text> : null}

          <Text style={styles.subtitle}>Enter your 6-digit passcode</Text>

          {/* 6 passcode boxes */}
          <Animated.View
            style={[styles.boxRow, { transform: [{ translateX: shakeAnim }] }]}
          >
            {digits.map((digit, i) => (
              <TextInput
                key={i}
                ref={(r) => (inputRefs.current[i] = r)}
                value={digit}
                onChangeText={(v) => handleChange(v, i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
                keyboardType="number-pad"
                maxLength={1}
                secureTextEntry
                style={[
                  styles.box,
                  digit      ? styles.boxFilled : null,
                  hasError   ? styles.boxError  : null,
                ]}
                textAlign="center"
              />
            ))}
          </Animated.View>

          {/* Error message */}
          {errorMsg ? (
            <Text style={styles.errorText}>{errorMsg}</Text>
          ) : null}

          {/* Log In button */}
          <TouchableOpacity
            style={[styles.btn, !isComplete && styles.btnDisabled]}
            onPress={handleLoginPress}
            activeOpacity={0.85}
            disabled={!isComplete || isVerifying || isLoading}
          >
            {isVerifying || isLoading ? (
              <ActivityIndicator color={WHITE} />
            ) : (
              <Text style={styles.btnText}>Log In</Text>
            )}
          </TouchableOpacity>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  flex: { flex: 1 },
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
    marginBottom: 24,
  },
  brandV:    { fontSize: 24, fontWeight: '800', color: BRAND_RED },
  brandName: { fontSize: 24, fontWeight: '700', color: BRAND_GRY },

  // Back link
  backLink: {
    alignSelf: 'flex-start',
    marginBottom: 20,
  },
  backLinkText: {
    fontSize: 13,
    color: PRIMARY,
    fontWeight: '500',
  },

  // Greeting
  greeting: {
    fontSize: 22,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 4,
    textAlign: 'center',
  },
  orgName: {
    fontSize: 13,
    color: TEXT_SEC,
    marginBottom: 4,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: TEXT_SEC,
    textAlign: 'center',
    marginBottom: 28,
    marginTop: 8,
  },

  // Passcode boxes — Figma: 47×50, radius=8
  boxRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  box: {
    width: 47,
    height: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: BOX_BORDER,
    backgroundColor: WHITE,
    fontSize: 20,
    fontWeight: '700',
    color: TEXT,
  },
  boxFilled: {
    borderColor: BOX_FILLED,
    borderWidth: 2,
  },
  boxError: {
    borderColor: BOX_ERROR,
    backgroundColor: '#FEF2F2',
  },

  errorText: {
    color: ERROR,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 16,
  },

  // Button
  btn: {
    width: '100%',
    height: 44,
    backgroundColor: PRIMARY,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  btnDisabled: { backgroundColor: '#B9C0C9' },
  btnText: { color: WHITE, fontSize: 16, fontWeight: '700' },
});

export default DriverPasscodeScreen;
