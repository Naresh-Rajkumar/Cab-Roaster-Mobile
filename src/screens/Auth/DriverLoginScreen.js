/**
 * DriverLoginScreen — Figma: Onboarding-Driver / Login (553:12197)
 *
 * Phone entry → Send OTP → navigates to OTPVerificationScreen.
 * Sets pendingRole = 'driver' so verifyOTP thunk knows the role.
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
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { setPendingRole, sendOtp } from '../../redux/slices/authSlice';
import { SCREENS } from '../../constants';

// ─── Design tokens (exact from Figma) ─────────────────────────────────────────
const PRIMARY   = '#643ee8';   // rgb(100,62,232)
const BG        = '#F5F4F9';   // rgb(245,244,249)
const TEXT      = '#312E3A';   // rgb(49,46,58)
const TEXT_SEC  = '#5E5C66';   // rgb(94,92,102)
const WHITE     = '#ffffff';
const BORDER    = '#E8E6F0';
const BRAND_RED = '#EE001D';   // rgb(238,0,29)
const BRAND_GRY = '#4A4A4A';   // rgb(74,74,74)

const DriverLoginScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);
  const [phone, setPhone] = useState('');

  const isValid = phone.replace(/\D/g, '').length === 10;

  const handleSendOTP = async () => {
    if (!isValid) return;
    const fullPhone = `+91-${phone.replace(/\D/g, '')}`;
    dispatch(setPendingRole('driver'));
    const result = await dispatch(sendOtp(fullPhone));
    if (sendOtp.rejected.match(result)) {
      Alert.alert('Error', result.payload || 'Failed to send OTP');
      return;
    }
    // Show OTP in Alert when backend returns devOtp (only in NODE_ENV=development)
    // Remove __DEV__ guard — some Expo build modes set __DEV__=false even in dev
    const devOtp = result.payload?.devOtp ?? null;
    console.log('[DriverLogin] devOtp:', devOtp);
    navigation.navigate(SCREENS.OTP_VERIFICATION, { phone: fullPhone, devOtp });
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
            Log in to start your shift and access today's trips.
          </Text>

          {/* Phone input */}
          <View style={styles.inputContainer}>
            <View style={styles.prefixBox}>
              <Text style={styles.prefixText}>+91</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter Phone number"
              placeholderTextColor={TEXT_SEC}
              keyboardType="number-pad"
              maxLength={10}
              value={phone}
              onChangeText={setPhone}
              returnKeyType="done"
              onSubmitEditing={handleSendOTP}
            />
          </View>

          {/* Send OTP button */}
          <TouchableOpacity
            style={[styles.btn, !isValid && styles.btnDisabled]}
            onPress={handleSendOTP}
            activeOpacity={0.85}
            disabled={!isValid || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={WHITE} />
            ) : (
              <Text style={styles.btnText}>Send OTP</Text>
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

  // Phone input — Figma: h=40, radius=4, white bg
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 40,
    backgroundColor: WHITE,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: BORDER,
    marginBottom: 16,
    overflow: 'hidden',
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

  // Button — Figma: h=44, radius=8, #643ee8
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

export default DriverLoginScreen;
