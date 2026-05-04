/**
 * Auth Navigator
 * Complete pre-auth flow:
 * Splash → RoleSelection → Onboarding → Login → OTPVerification
 *         → DriverLogin → DriverPasscode → (DriverLockout on 5th fail)
 *
 * After passcode/OTP verification, isAuthenticated = true and RootNavigator
 * switches to the appropriate tab navigator.
 *
 * Session expired flow (admin passcode reset):
 * When sessionExpiredSource is non-null, the initial route is set to
 * SessionExpired so the driver sees the expiry message before re-logging in.
 * Tapping "Log In" dispatches clearSessionExpired() which returns the
 * initial route to Splash on the next cold launch.
 */
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import SplashScreen from '../screens/splash/SplashScreen';
import RoleSelectionScreen from '../screens/role-selection/RoleSelectionScreen';
import OnboardingScreen from '../screens/Onboarding/OnboardingScreen';
import DriverOnboardingScreen from '../screens/Onboarding/DriverOnboardingScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import DriverLoginScreen from '../screens/Auth/DriverLoginScreen';
import DriverPasscodeScreen from '../screens/Auth/DriverPasscodeScreen';
import LockoutScreen from '../screens/Auth/LockoutScreen';
import SessionExpiredScreen from '../screens/Auth/SessionExpiredScreen';
import OTPVerificationScreen from '../screens/Auth/OTPVerificationScreen';
import RequestCabStep1Screen from '../screens/Requests/RequestCabStep1Screen';
import RequestCabStep2Screen from '../screens/Requests/RequestCabStep2Screen';
import { SCREENS } from '../constants';

const Stack = createStackNavigator();

const AuthNavigator = () => {
  const sessionExpiredSource = useSelector((state) => state.auth.sessionExpiredSource);

  // When the admin resets the passcode the interceptor sets sessionExpiredSource.
  // Use SESSION_EXPIRED as the initial route so it's the first screen the driver
  // sees. All other screens remain registered so navigation still works normally.
  const initialRoute = sessionExpiredSource ? SCREENS.SESSION_EXPIRED : SCREENS.SPLASH;

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        cardStyleInterpolator: ({ current }) => ({
          cardStyle: { opacity: current.progress },
        }),
      }}
    >
      {/* ── Core pre-auth screens ──────────────────────────────────── */}
      <Stack.Screen
        name={SCREENS.SPLASH}
        component={SplashScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name={SCREENS.ROLE_SELECTION}
        component={RoleSelectionScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name={SCREENS.ONBOARDING}
        component={OnboardingScreen}
        options={{ gestureEnabled: true }}
      />
      <Stack.Screen
        name={SCREENS.DRIVER_ONBOARDING}
        component={DriverOnboardingScreen}
        options={{ gestureEnabled: true }}
      />
      <Stack.Screen
        name={SCREENS.LOGIN}
        component={LoginScreen}
        options={{ gestureEnabled: true }}
      />

      {/* ── Driver passcode login flow ─────────────────────────────── */}
      <Stack.Screen
        name={SCREENS.DRIVER_LOGIN}
        component={DriverLoginScreen}
        options={{ gestureEnabled: true }}
      />
      <Stack.Screen
        name={SCREENS.DRIVER_PASSCODE}
        component={DriverPasscodeScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name={SCREENS.DRIVER_LOCKOUT}
        component={LockoutScreen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name={SCREENS.SESSION_EXPIRED}
        component={SessionExpiredScreen}
        options={{ gestureEnabled: false }}
      />

      {/* ── Employee OTP flow ─────────────────────────────────────── */}
      <Stack.Screen
        name={SCREENS.OTP_VERIFICATION}
        component={OTPVerificationScreen}
        options={{ gestureEnabled: true }}
      />
      <Stack.Screen
        name={SCREENS.REQUEST_CAB_STEP1}
        component={RequestCabStep1Screen}
        options={{ gestureEnabled: false }}
      />
      <Stack.Screen
        name={SCREENS.REQUEST_CAB_STEP2}
        component={RequestCabStep2Screen}
        options={{ gestureEnabled: true }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
