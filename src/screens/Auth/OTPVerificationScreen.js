import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../theme/ThemeProvider';
import { verifyOTP } from '../../redux/slices/authSlice';
import { Header, Button } from '../../components';
import spacing from '../../theme/spacing.json';
import typography from '../../theme/typography.json';

const OTP_LENGTH = 4;

const OTPVerificationScreen = ({ navigation, route }) => {
  const { phone } = route.params || {};
  const { theme } = useTheme();
  const colors = theme.colors;
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const inputRefs = useRef([]);

  const handleOTPChange = (value, index) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const otpString = otp.join('');
    if (otpString.length !== OTP_LENGTH) return;
    dispatch(verifyOTP({ phone, otp: otpString }));
  };

  const isOTPComplete = otp.every((digit) => digit !== '');

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={['bottom']}
    >
      <Header
        title="Verify OTP"
        showBack
        onBackPress={() => navigation.goBack()}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <Text
            style={[
              styles.title,
              {
                color: colors.text,
                fontFamily: typography.fontFamily.semiBold,
              },
            ]}
          >
            Enter verification code
          </Text>
          <Text
            style={[
              styles.subtitle,
              {
                color: colors.textSecondary,
                fontFamily: typography.fontFamily.regular,
              },
            ]}
          >
            We've sent a 4-digit code to {phone}
          </Text>

          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                value={digit}
                onChangeText={(value) =>
                  handleOTPChange(value.replace(/[^0-9]/g, ''), index)
                }
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                style={[
                  styles.otpInput,
                  {
                    backgroundColor: colors.inputBackground,
                    borderColor: digit
                      ? colors.primary
                      : colors.inputBorder,
                    color: colors.text,
                    fontFamily: typography.fontFamily.bold,
                  },
                ]}
              />
            ))}
          </View>

          {error && (
            <Text
              style={[
                styles.errorText,
                {
                  color: colors.error,
                  fontFamily: typography.fontFamily.regular,
                },
              ]}
            >
              {error}
            </Text>
          )}

          <Button
            title="Verify"
            onPress={handleVerify}
            loading={isLoading}
            disabled={!isOTPComplete}
            fullWidth
            size="lg"
            style={styles.verifyButton}
          />

          <TouchableOpacity style={styles.resendContainer}>
            <Text
              style={[
                styles.resendText,
                {
                  color: colors.textSecondary,
                  fontFamily: typography.fontFamily.regular,
                },
              ]}
            >
              Didn't receive code?{' '}
            </Text>
            <Text
              style={[
                styles.resendLink,
                {
                  color: colors.primary,
                  fontFamily: typography.fontFamily.semiBold,
                },
              ]}
            >
              Resend
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: spacing.xl,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize.xl,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    textAlign: 'center',
    marginBottom: spacing.xxl,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  otpInput: {
    width: 56,
    height: 56,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1.5,
    textAlign: 'center',
    fontSize: typography.fontSize.xxl,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.base,
    textAlign: 'center',
  },
  verifyButton: {
    marginTop: spacing.base,
  },
  resendContainer: {
    flexDirection: 'row',
    marginTop: spacing.xl,
  },
  resendText: {
    fontSize: typography.fontSize.md,
  },
  resendLink: {
    fontSize: typography.fontSize.md,
  },
});

export default OTPVerificationScreen;
