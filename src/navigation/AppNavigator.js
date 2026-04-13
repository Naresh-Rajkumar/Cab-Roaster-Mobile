import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import HomeNavigator from './HomeNavigator';
import TripsScreen from '../screens/Trips/TripsScreen';
import NotificationsScreen from '../screens/Trips/NotificationsScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import EditProfileScreen from '../screens/Profile/EditProfileScreen';
import TripDetailsScreen from '../screens/Employee/TripDetailsScreen';
import RideDetailsScreen from '../screens/Employee/RideDetailsScreen';
import LiveTrackingScreen from '../screens/Tracking/LiveTrackingScreen';
import CabArrivedScreen from '../screens/Tracking/CabArrivedScreen';
import SelectPickupScreen from '../screens/Requests/SelectPickupScreen';
import LocationChangeScreen from '../screens/Requests/LocationChangeScreen';
import LocationChangeSuccessScreen from '../screens/Requests/LocationChangeSuccessScreen';
import CancelRequestScreen from '../screens/Requests/CancelRequestScreen';
import ReportIssueScreen from '../screens/Requests/ReportIssueScreen';
import RequestCabStep1Screen from '../screens/Requests/RequestCabStep1Screen';
import RequestCabStep2Screen from '../screens/Requests/RequestCabStep2Screen';
import { useTheme } from '../theme/ThemeProvider';
import { SCREENS } from '../constants';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TAB_ICONS = {
  [SCREENS.HOME_TAB]: { active: 'home', inactive: 'home-outline' },
  [SCREENS.TRIPS_TAB]: { active: 'car', inactive: 'car-outline' },
  [SCREENS.NOTIFICATIONS_TAB]: { active: 'notifications', inactive: 'notifications-outline' },
  [SCREENS.MORE_TAB]: { active: 'menu', inactive: 'menu-outline' },
};

// Trips tab: TripsScreen → TripDetails / LiveTracking
const TripsNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={SCREENS.MY_TRIPS} component={TripsScreen} />
    <Stack.Screen name={SCREENS.TRIP_DETAILS} component={TripDetailsScreen} />
    <Stack.Screen name={SCREENS.RIDE_DETAILS} component={RideDetailsScreen} />
    <Stack.Screen name={SCREENS.LIVE_TRACKING} component={LiveTrackingScreen} />
    <Stack.Screen name={SCREENS.CAB_ARRIVED} component={CabArrivedScreen} />
    <Stack.Screen name={SCREENS.SELECT_PICKUP} component={SelectPickupScreen} />
    <Stack.Screen name={SCREENS.LOCATION_CHANGE} component={LocationChangeScreen} />
    <Stack.Screen name={SCREENS.LOCATION_CHANGE_SUCCESS} component={LocationChangeSuccessScreen} />
    <Stack.Screen name={SCREENS.CANCEL_REQUEST} component={CancelRequestScreen} />
    <Stack.Screen name={SCREENS.REPORT_ISSUE} component={ReportIssueScreen} />
  </Stack.Navigator>
);

// More tab: ProfileScreen → RequestCab flows
const MoreNavigator = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name={SCREENS.MORE_DETAILS} component={ProfileScreen} />
    <Stack.Screen name={SCREENS.EDIT_PROFILE} component={EditProfileScreen} />
    <Stack.Screen name={SCREENS.REQUEST_CAB_STEP1} component={RequestCabStep1Screen} />
    <Stack.Screen name={SCREENS.REQUEST_CAB_STEP2} component={RequestCabStep2Screen} />
  </Stack.Navigator>
);

const AppNavigator = () => {
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
        component={HomeNavigator}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name={SCREENS.TRIPS_TAB}
        component={TripsNavigator}
        options={{ tabBarLabel: 'My Trips' }}
      />
      <Tab.Screen
        name={SCREENS.NOTIFICATIONS_TAB}
        component={NotificationsScreen}
        options={{ tabBarLabel: 'Notifications' }}
      />
      <Tab.Screen
        name={SCREENS.MORE_TAB}
        component={MoreNavigator}
        options={{ tabBarLabel: 'More' }}
      />
    </Tab.Navigator>
  );
};

export default AppNavigator;
