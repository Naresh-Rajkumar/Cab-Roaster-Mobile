/**
 * DriverLoginScreen — Figma Driver Handoff 4/17
 *
 * Phone number entry + Send OTP.
 * After dispatching loginUser → navigate to OTPVerificationScreen (5/17).
 * Any OTP works in mock mode (USE_MOCK = true).
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
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../redux/slices/authSlice';
import { SCREENS } from '../../constants';

// ─── Design tokens ────────────────────────────────────────────────────────────
const PRIMARY = '#643ee8';
const PRIMARY_LIGHT = '#f1ecff';
const BG = '#F5F4F9';
const TEXT = '#312e3a';
const TEXT_SEC = '#5e5c66';
const WHITE = '#ffffff';
const BORDER = '#E8E6F0';
const INPUT_BG = '#ffffff';
const ERROR = '#dc2626';

const DriverLoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);
  const [phone, setPhone] = useState('');

  const isValid = phone.replace(/\D/g, '').length === 10;

  const handleSendOTP = async () => {
    if (!isValid) return;
    const fullPhone = `+91${phone.replace(/\D/g, '')}`;
    const result = await dispatch(loginUser({ phone: fullPhone }));
    if (loginUser.fulfilled.match(result)) {
      navigation.navigate(SCREENS.OTP_VERIFICATION, { phone: fullPhone });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />

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

          {/* Illustration circle */}
          <View style={styles.illustrationOuter}>
            <View style={styles.illustrationMiddle}>
              <View style={styles.illustrationIcon}>
                {/* Steering wheel icon using nested views */}
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
            Log in to start your shift and access today's trips.
          </Text>

          {/* Phone input */}
          <View style={styles.inputWrapper}>
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
              onChangeText={setPhone}
              returnKeyType="done"
              onSubmitEditing={handleSendOTP}
            />
          </View>

          {/* Error */}
          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          {/* Send OTP button */}
          <TouchableOpacity
            style={[styles.sendBtn, !isValid && styles.sendBtnDisabled]}
            onPress={handleSendOTP}
            activeOpacity={0.85}
            disabled={!isValid || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={WHITE} />
            ) : (
              <Text style={styles.sendBtnText}>Send OTP</Text>
            )}
          </TouchableOpacity>

          {/* Helper text */}
          <Text style={styles.helperText}>
            We'll send a 4-digit code to verify your number.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  flex: { flex: 1 },

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

  inner: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Brand
  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 28,
  },
  brandV: { fontSize: 26, fontWeight: '800', color: '#dc2626' },
  brandName: { fontSize: 26, fontWeight: '700', color: TEXT },

  // Illustration
  illustrationOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: PRIMARY_LIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 28,
  },
  illustrationMiddle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: PRIMARY_LIGHT,
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

  // Steering wheel (drawn with views)
  steerOuter: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
    borderColor: WHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  steerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: WHITE,
    position: 'absolute',
  },
  steerSpoke1: {
    position: 'absolute',
    width: 2,
    height: 12,
    backgroundColor: WHITE,
    top: 8,
  },
  steerSpoke2: {
    position: 'absolute',
    width: 12,
    height: 2,
    backgroundColor: WHITE,
    left: 8,
    bottom: 6,
  },
  steerSpoke3: {
    position: 'absolute',
    width: 12,
    height: 2,
    backgroundColor: WHITE,
    right: 8,
    bottom: 6,
  },

  // Title
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: TEXT,
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: TEXT_SEC,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },

  // Phone input
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    backgroundColor: INPUT_BG,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BORDER,
    marginBottom: 12,
    height: 54,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  prefixBox: {
    paddingHorizontal: 14,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1.5,
    borderRightColor: BORDER,
    backgroundColor: '#F8F7FD',
  },
  prefixText: { fontSize: 15, fontWeight: '600', color: TEXT },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    fontSize: 16,
    color: TEXT,
    height: '100%',
  },

  errorText: {
    color: ERROR,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 8,
  },

  // Send OTP button
  sendBtn: {
    width: '100%',
    height: 54,
    backgroundColor: PRIMARY,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    marginBottom: 16,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  sendBtnDisabled: {
    backgroundColor: '#B9C0C9',
    shadowOpacity: 0,
    elevation: 0,
  },
  sendBtnText: { color: WHITE, fontSize: 16, fontWeight: '700', letterSpacing: 0.2 },

  helperText: {
    fontSize: 12,
    color: TEXT_SEC,
    textAlign: 'center',
  },
});

export default DriverLoginScreen;
