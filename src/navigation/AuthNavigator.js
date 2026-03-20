/**
 * Auth Navigator
 * Complete pre-auth flow:
 * Splash → RoleSelection → Onboarding → Login → OTPVerification
 *
 * After OTP verification, isAuthenticated = true and RootNavigator
 * switches to the appropriate tab navigator.
 */
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../screens/splash/SplashScreen';
import RoleSelectionScreen from '../screens/role-selection/RoleSelectionScreen';
import OnboardingScreen from '../screens/Onboarding/OnboardingScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import OTPVerificationScreen from '../screens/Auth/OTPVerificationScreen';
import RequestCabStep1Screen from '../screens/Requests/RequestCabStep1Screen';
import RequestCabStep2Screen from '../screens/Requests/RequestCabStep2Screen';
import { SCREENS } from '../constants';

const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        cardStyleInterpolator: ({ current }) => ({
          cardStyle: { opacity: current.progress },
        }),
      }}
    >
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
        name={SCREENS.LOGIN}
        component={LoginScreen}
        options={{ gestureEnabled: true }}
      />
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
