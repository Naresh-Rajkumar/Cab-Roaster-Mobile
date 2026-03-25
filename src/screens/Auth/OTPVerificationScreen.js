/**
 * OTPVerificationScreen — Figma: Onboarding-Driver / Login (553:12387)
 *
 * Unified 6-digit OTP verification for both driver and employee flows.
 * For driver role: verifyOTP thunk calls POST /auth/verify-otp (OTP-based).
 * For employee role: verifyOTP thunk calls POST /auth/employee-login (password-based).
 */

import React, { useState, useRef } from 'react';
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
import { useDispatch, useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';
import { verifyOTP, sendOtp } from '../../redux/slices/authSlice';

// ─── Design tokens (exact from Figma 553:12387) ───────────────────────────────
const PRIMARY    = '#643ee8';
const BG         = '#F5F4F9';
const TEXT       = '#312E3A';
const TEXT_SEC   = '#5E5C66';
const WHITE      = '#ffffff';
const BOX_BORDER = '#D2C5FF';
const BRAND_RED  = '#EE001D';
const BRAND_GRY  = '#4A4A4A';
const ERROR      = '#dc2626';

const OTP_LENGTH = 6;

const OTPVerificationScreen = ({ navigation, route }) => {
  const { phone } = route.params || {};
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const inputRefs = useRef([]);

  const handleOtpChange = (value, index) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    const next = [...otp];
    next[index] = cleaned;
    setOtp(next);
    if (cleaned && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const code = otp.join('');
    if (code.length !== OTP_LENGTH) return;
    dispatch(verifyOTP({ phone, otp: code }));
  };

  const handleResend = () => {
    if (phone) {
      dispatch(sendOtp(phone));
    }
  };

  const isComplete = otp.every((d) => d !== '');

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

          {/* Title */}
          <Text style={styles.title}>Verification Code</Text>
          <Text style={styles.subtitle}>
            {"We've sent a code to your phone. Enter it below."}
          </Text>

          {/* Phone + edit */}
          <View style={styles.phoneRow}>
            <Text style={styles.phoneText}>{phone}</Text>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.editBtn}>
              <Ionicons name="pencil-outline" size={18} color={TEXT} />
            </TouchableOpacity>
          </View>

          {/* 6 OTP boxes */}
          <View style={styles.otpRow}>
            {otp.map((digit, i) => (
              <TextInput
                key={i}
                ref={(r) => (inputRefs.current[i] = r)}
                value={digit}
                onChangeText={(v) => handleOtpChange(v, i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
                keyboardType="number-pad"
                maxLength={1}
                style={[
                  styles.otpBox,
                  digit ? styles.otpBoxFilled : null,
                ]}
                textAlign="center"
              />
            ))}
          </View>

          {/* Error */}
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          {/* Verify button */}
          <TouchableOpacity
            style={[styles.btn, !isComplete && styles.btnDisabled]}
            onPress={handleVerify}
            activeOpacity={0.85}
            disabled={!isComplete || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={WHITE} />
            ) : (
              <Text style={styles.btnText}>Verify</Text>
            )}
          </TouchableOpacity>

          {/* Resend */}
          <View style={styles.resendRow}>
            <Text style={styles.resendText}>Didn't receive code? </Text>
            <TouchableOpacity onPress={handleResend} disabled={isLoading}>
              <Text style={styles.resendLink}>Resend</Text>
            </TouchableOpacity>
          </View>

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
    marginBottom: 28,
  },
  brandV:    { fontSize: 24, fontWeight: '800', color: BRAND_RED },
  brandName: { fontSize: 24, fontWeight: '700', color: BRAND_GRY },

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
    marginBottom: 20,
  },

  // Phone row
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  phoneText: { fontSize: 16, fontWeight: '500', color: TEXT },
  editBtn: { padding: 4 },

  // OTP boxes — Figma: 47×50, radius=8, border #D2C5FF
  otpRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  otpBox: {
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
  otpBoxFilled: {
    borderColor: PRIMARY,
  },

  errorText: {
    color: ERROR,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 12,
  },

  // Verify button — Figma: h=44, radius=8, #643ee8
  btn: {
    width: '100%',
    height: 44,
    backgroundColor: PRIMARY,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  btnDisabled: { backgroundColor: '#B9C0C9' },
  btnText: { color: WHITE, fontSize: 16, fontWeight: '700' },

  // Resend
  resendRow: { flexDirection: 'row', alignItems: 'center' },
  resendText: { fontSize: 14, color: TEXT_SEC },
  resendLink: { fontSize: 14, fontWeight: '600', color: PRIMARY },
});

export default OTPVerificationScreen;
