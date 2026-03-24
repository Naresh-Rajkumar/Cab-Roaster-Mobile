import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useSelector } from 'react-redux';
import AuthNavigator from './AuthNavigator';
import AppNavigator from './AppNavigator';
import DriverNavigator from './DriverNavigator';
import RequestCabStep1Screen from '../screens/Requests/RequestCabStep1Screen';
import RequestCabStep2Screen from '../screens/Requests/RequestCabStep2Screen';
import { useTheme } from '../theme/ThemeProvider';
import { USER_ROLES, SCREENS } from '../constants';

const Stack = createStackNavigator();

/**
 * Static fonts object — avoids relying on DefaultTheme.fonts which uses
 * Platform.select() and can resolve to undefined in Expo Web webpack builds.
 * react-navigation's BottomTabItem accesses fonts.medium directly from the
 * NavigationContainer theme context, so this must always be defined.
 */
const NAV_FONTS = {
  regular: { fontFamily: 'System', fontWeight: '400' },
  medium:  { fontFamily: 'System', fontWeight: '500' },
  bold:    { fontFamily: 'System', fontWeight: '600' },
  heavy:   { fontFamily: 'System', fontWeight: '700' },
};

const RootNavigator = () => {
  const { isAuthenticated, role, needsOnboarding } = useSelector((state) => state.auth);
  const { theme } = useTheme();
  const colors = theme.colors;

  const navigationTheme = {
    dark: theme.dark ?? false,
    fonts: NAV_FONTS,
    colors: {
      primary:      colors.primary,
      background:   colors.background,
      card:         colors.card,
      text:         colors.text,
      border:       colors.border,
      notification: colors.error,
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          role === USER_ROLES.DRIVER ? (
            <Stack.Screen name="DriverApp" component={DriverNavigator} />
          ) : needsOnboarding ? (
            <>
              <Stack.Screen name={SCREENS.REQUEST_CAB_STEP1} component={RequestCabStep1Screen} />
              <Stack.Screen name={SCREENS.REQUEST_CAB_STEP2} component={RequestCabStep2Screen} />
            </>
          ) : (
            <Stack.Screen name="EmployeeApp" component={AppNavigator} />
          )
        ) : (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default RootNavigator;
