import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/ThemeProvider';
import { SCREENS } from '../constants';

// Driver Screens
import DriverHomeScreen from '../screens/Driver/DriverHomeScreen';
import DriverActiveTripScreen from '../screens/Driver/DriverActiveTripScreen';
import DriverTripsScreen from '../screens/Driver/DriverTripsScreen';
import NotificationsScreen from '../screens/Trips/NotificationsScreen';
import TripSummaryScreen from '../screens/Driver/TripSummaryScreen';
import AttendanceScreen from '../screens/Driver/AttendanceScreen';
import DriverProfileScreen from '../screens/Driver/DriverProfileScreen';
import RequestCabStep1Screen from '../screens/Requests/RequestCabStep1Screen';
import RequestCabStep2Screen from '../screens/Requests/RequestCabStep2Screen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const DriverHomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={SCREENS.DRIVER_HOME} component={DriverHomeScreen} />
    <Stack.Screen name={SCREENS.DRIVER_ACTIVE_TRIP} component={DriverActiveTripScreen} />
    <Stack.Screen name={SCREENS.TRIP_SUMMARY} component={TripSummaryScreen} />
    <Stack.Screen name={SCREENS.ATTENDANCE} component={AttendanceScreen} />
  </Stack.Navigator>
);

const DriverMoreStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={SCREENS.DRIVER_MORE} component={DriverProfileScreen} />
    <Stack.Screen name={SCREENS.REQUEST_CAB_STEP1} component={RequestCabStep1Screen} />
    <Stack.Screen name={SCREENS.REQUEST_CAB_STEP2} component={RequestCabStep2Screen} />
  </Stack.Navigator>
);

const DriverTripsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={SCREENS.DRIVER_TRIPS} component={DriverTripsScreen} />
  </Stack.Navigator>
);

const TAB_ICONS = {
  [SCREENS.HOME_TAB]: { active: 'home', inactive: 'home-outline' },
  [SCREENS.TRIPS_TAB]: { active: 'car', inactive: 'car-outline' },
  [SCREENS.NOTIFICATIONS_TAB]: { active: 'notifications', inactive: 'notifications-outline' },
  [SCREENS.MORE_TAB]: { active: 'menu', inactive: 'menu-outline' },
};

const DriverNavigator = () => {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name] ?? { active: 'ellipse', inactive: 'ellipse-outline' };
          const iconName = focused ? icons.active : icons.inactive;
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.tabBarActive,
        tabBarInactiveTintColor: colors.tabBarInactive,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: colors.borderLight,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
        },
      })}
    >
      <Tab.Screen
        name={SCREENS.HOME_TAB}
        component={DriverHomeStack}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name={SCREENS.TRIPS_TAB}
        component={DriverTripsStack}
        options={{ tabBarLabel: 'My Trips' }}
      />
      <Tab.Screen
        name={SCREENS.NOTIFICATIONS_TAB}
        component={NotificationsScreen}
        options={{ tabBarLabel: 'Notifications' }}
      />
      <Tab.Screen
        name={SCREENS.MORE_TAB}
        component={DriverMoreStack}
        options={{ tabBarLabel: 'More' }}
      />
    </Tab.Navigator>
  );
};

export default DriverNavigator;
