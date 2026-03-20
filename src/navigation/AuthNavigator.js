/**
 * Auth Navigator
 * Simplified flow: Login → RequestCabStep1 → RequestCabStep2
 *
 * After submitting cab request, isAuthenticated = true and RootNavigator
 * switches to the appropriate tab navigator.
 */
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/Auth/LoginScreen';
import RequestCabStep1Screen from '../screens/Requests/RequestCabStep1Screen';
import RequestCabStep2Screen from '../screens/Requests/RequestCabStep2Screen';
import { SCREENS } from '../constants';

const Stack = createStackNavigator();

const AuthNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName={SCREENS.LOGIN}
      screenOptions={{
        headerShown: false,
        gestureEnabled: false,
        cardStyleInterpolator: ({ current }) => ({
          cardStyle: { opacity: current.progress },
        }),
      }}
    >
      <Stack.Screen
        name={SCREENS.LOGIN}
        component={LoginScreen}
        options={{ gestureEnabled: false }}
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
