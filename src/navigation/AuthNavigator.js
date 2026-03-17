import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import OnboardingScreen from '../screens/Onboarding/OnboardingScreen';
import WelcomeScreen from '../screens/Onboarding/WelcomeScreen';
import { SCREENS } from '../constants';

const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
        cardStyleInterpolator: ({ current }) => ({
          cardStyle: { opacity: current.progress },
        }),
      }}
    >
      <Stack.Screen name={SCREENS.ONBOARDING} component={OnboardingScreen} />
      <Stack.Screen name={SCREENS.WELCOME} component={WelcomeScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
