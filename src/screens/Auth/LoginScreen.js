import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../theme/ThemeProvider';
import { loginUser } from '../../redux/slices/authSlice';
import { Button, Input } from '../../components';
import spacing from '../../theme/spacing.json';
import typography from '../../theme/typography.json';
import { SCREENS } from '../../constants';

const LoginScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');

  const validatePhone = () => {
    if (!phone.trim()) {
      setPhoneError('Phone number is required');
      return false;
    }
    if (phone.trim().length < 10) {
      setPhoneError('Enter a valid phone number');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const handleLogin = () => {
    if (!validatePhone()) return;
    dispatch(loginUser({ phone: phone.trim() }))
      .unwrap()
      .then(() => {
        navigation.navigate(SCREENS.OTP_VERIFICATION, { phone: phone.trim() });
      })
      .catch(() => {});
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.logoContainer}>
            <View
              style={[
                styles.logoPlaceholder,
                { backgroundColor: colors.primaryContainer },
              ]}
            >
              <Text
                style={[
                  styles.logoText,
                  {
                    color: colors.primary,
                    fontFamily: typography.fontFamily.bold,
                  },
                ]}
              >
                CAB
              </Text>
            </View>
            <Text
              style={[
                styles.appName,
                {
                  color: colors.text,
                  fontFamily: typography.fontFamily.bold,
                },
              ]}
            >
              CAB Roster
            </Text>
            <Text
              style={[
                styles.tagline,
                {
                  color: colors.textSecondary,
                  fontFamily: typography.fontFamily.regular,
                },
              ]}
            >
              Employee Transport Management
            </Text>
          </View>

          <View style={styles.formContainer}>
            <Text
              style={[
                styles.formTitle,
                {
                  color: colors.text,
                  fontFamily: typography.fontFamily.semiBold,
                },
              ]}
            >
              Sign In
            </Text>
            <Text
              style={[
                styles.formSubtitle,
                {
                  color: colors.textSecondary,
                  fontFamily: typography.fontFamily.regular,
                },
              ]}
            >
              Enter your phone number to continue
            </Text>

            <Input
              label="Phone Number"
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                if (phoneError) setPhoneError('');
              }}
              placeholder="Enter your phone number"
              keyboardType="phone-pad"
              error={phoneError || error}
              maxLength={15}
            />

            <Button
              title="Continue"
              onPress={handleLogin}
              loading={isLoading}
              fullWidth
              size="lg"
              style={styles.loginButton}
            />
          </View>
        </ScrollView>
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
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  logoPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: spacing.borderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.base,
  },
  logoText: {
    fontSize: typography.fontSize.xxl,
  },
  appName: {
    fontSize: typography.fontSize.xxl,
    marginBottom: spacing.xs,
  },
  tagline: {
    fontSize: typography.fontSize.md,
  },
  formContainer: {
    width: '100%',
  },
  formTitle: {
    fontSize: typography.fontSize.xl,
    marginBottom: spacing.xs,
  },
  formSubtitle: {
    fontSize: typography.fontSize.md,
    marginBottom: spacing.xl,
  },
  loginButton: {
    marginTop: spacing.sm,
  },
});

export default LoginScreen;
