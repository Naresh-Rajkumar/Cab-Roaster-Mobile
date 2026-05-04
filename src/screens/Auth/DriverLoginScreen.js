/**
 * DriverLoginScreen — Figma: Onboarding-Driver / Login (553:12197)
 *
 * Screen 1 of 2 in the driver passcode login flow.
 * Driver enters their registered mobile number → POST /auth/driver-check
 * If valid and passcode is active → navigate to DriverPasscodeScreen.
 *
 * Replaces the previous OTP/SMS flow.
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { authService } from '../../services/api/authService';
import { SCREENS } from '../../constants';

// ─── Design tokens (exact from Figma) ─────────────────────────────────────────
const PRIMARY   = '#643ee8';
const BG        = '#F5F4F9';
const TEXT      = '#312E3A';
const TEXT_SEC  = '#5E5C66';
const WHITE     = '#ffffff';
const BORDER    = '#E8E6F0';
const ERROR     = '#dc2626';
const BRAND_RED = '#EE001D';
const BRAND_GRY = '#4A4A4A';

// Maps backend error codes to user-friendly messages
const ERROR_MESSAGES = {
  PHONE_NOT_FOUND:    'No driver account found with this number.',
  ACCOUNT_INACTIVE:   'Your account is inactive. Contact your admin.',
  PASSCODE_NOT_SET:   'No passcode has been set for your account. Contact your admin.',
  PASSCODE_EXPIRED:   'Your passcode has expired. Contact your admin to renew it.',
  NETWORK_ERROR:      'No internet connection. Please try again.',
};

const DriverLoginScreen = ({ navigation }) => {
  const [phone, setPhone]         = useState('');
  const [isChecking, setChecking] = useState(false);
  const [errorMsg, setErrorMsg]   = useState('');

  const digits = phone.replace(/\D/g, '');
  const isValid = digits.length === 10;

  const handleContinue = async () => {
    if (!isValid || isChecking) return;
    setErrorMsg('');
    setChecking(true);

    try {
      const fullPhone = `${digits}`;
      const res = await authService.driverCheck(fullPhone);
      const data = res.data?.data || res.data;
      // Navigate to passcode screen, pass driver info as params
      navigation.navigate(SCREENS.DRIVER_PASSCODE, {
        phone:      fullPhone,
        driverName: data?.driverName || '',
        orgName:    data?.orgName    || '',
      });
    } catch (error) {
      const status = error?.response?.status;
      const code   = error?.response?.data?.code;

      if (!error?.response) {
        setErrorMsg(ERROR_MESSAGES.NETWORK_ERROR);
      } else if (status === 404) {
        setErrorMsg(ERROR_MESSAGES.PHONE_NOT_FOUND);
      } else if (code === 'ACCOUNT_INACTIVE') {
        setErrorMsg(ERROR_MESSAGES.ACCOUNT_INACTIVE);
      } else if (code === 'PASSCODE_NOT_SET') {
        setErrorMsg(ERROR_MESSAGES.PASSCODE_NOT_SET);
      } else if (code === 'PASSCODE_EXPIRED') {
        setErrorMsg(ERROR_MESSAGES.PASSCODE_EXPIRED);
      } else {
        setErrorMsg(error?.response?.data?.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setChecking(false);
    }
  };

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

          {/* Illustration */}
          <View style={styles.illustrationOuter}>
            <View style={styles.illustrationMiddle}>
              <View style={styles.illustrationIcon}>
                <View style={styles.steerOuter}>
                  <View style={styles.steerInner} />
                  <View style={styles.steerSpoke1} />
                  <View style={styles.steerSpoke2} />
                  <View style={styles.steerSpoke3} />
                </View>
              </View>
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>Welcome to vCommute</Text>
          <Text style={styles.subtitle}>
            Enter your registered mobile number to continue.
          </Text>

          {/* Phone input */}
          <View style={[styles.inputContainer, errorMsg ? styles.inputError : null]}>
            <View style={styles.prefixBox}>
              <Text style={styles.prefixText}>+91</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter phone number"
              placeholderTextColor={TEXT_SEC}
              keyboardType="number-pad"
              maxLength={10}
              value={phone}
              onChangeText={(v) => { setPhone(v); setErrorMsg(''); }}
              returnKeyType="done"
              onSubmitEditing={handleContinue}
            />
          </View>

          {/* Inline error */}
          {errorMsg ? (
            <Text style={styles.errorText}>{errorMsg}</Text>
          ) : null}

          {/* Continue button */}
          <TouchableOpacity
            style={[styles.btn, !isValid && styles.btnDisabled]}
            onPress={handleContinue}
            activeOpacity={0.85}
            disabled={!isValid || isChecking}
          >
            {isChecking ? (
              <ActivityIndicator color={WHITE} />
            ) : (
              <Text style={styles.btnText}>Continue</Text>
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
    marginBottom: 32,
  },
  brandV:    { fontSize: 24, fontWeight: '800', color: BRAND_RED },
  brandName: { fontSize: 24, fontWeight: '700', color: BRAND_GRY },

  // Illustration
  illustrationOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f1ecff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  illustrationMiddle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#f1ecff',
    borderWidth: 1.5,
    borderColor: PRIMARY + '33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  illustrationIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
  },
  steerOuter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  steerInner:  { width: 8, height: 8, borderRadius: 4, backgroundColor: WHITE, position: 'absolute' },
  steerSpoke1: { position: 'absolute', width: 2, height: 12, backgroundColor: WHITE, top: 8 },
  steerSpoke2: { position: 'absolute', width: 12, height: 2, backgroundColor: WHITE, left: 8, bottom: 6 },
  steerSpoke3: { position: 'absolute', width: 12, height: 2, backgroundColor: WHITE, right: 8, bottom: 6 },

  // Title
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
    marginBottom: 32,
  },

  // Phone input
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 40,
    backgroundColor: WHITE,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 8,
    overflow: 'hidden',
  },
  inputError: {
    borderColor: ERROR,
  },
  prefixBox: {
    paddingHorizontal: 12,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: BORDER,
  },
  prefixText: { fontSize: 12, fontWeight: '600', color: TEXT },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    fontSize: 14,
    color: TEXT,
    height: '100%',
  },

  errorText: {
    color: ERROR,
    fontSize: 12,
    textAlign: 'left',
    width: '100%',
    marginBottom: 12,
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

export default DriverLoginScreen;
