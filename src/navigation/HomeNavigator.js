import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/Home/HomeScreen';
import LiveTrackingScreen from '../screens/Tracking/LiveTrackingScreen';
import CabArrivedScreen from '../screens/Tracking/CabArrivedScreen';
import LocationChangeScreen from '../screens/Requests/LocationChangeScreen';
import LocationChangeSuccessScreen from '../screens/Requests/LocationChangeSuccessScreen';
import CancelRequestScreen from '../screens/Requests/CancelRequestScreen';
import ReportIssueScreen from '../screens/Requests/ReportIssueScreen';
import RequestCabStep1Screen from '../screens/Requests/RequestCabStep1Screen';
import RequestCabStep2Screen from '../screens/Requests/RequestCabStep2Screen';
import SelectPickupScreen from '../screens/Requests/SelectPickupScreen';
import RideDetailsScreen from '../screens/Employee/RideDetailsScreen';
import { SCREENS } from '../constants';

const Stack = createStackNavigator();

const HomeNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={SCREENS.HOME} component={HomeScreen} />
      <Stack.Screen name={SCREENS.LIVE_TRACKING} component={LiveTrackingScreen} />
      <Stack.Screen name={SCREENS.CAB_ARRIVED} component={CabArrivedScreen} />
      <Stack.Screen name={SCREENS.LOCATION_CHANGE} component={LocationChangeScreen} />
      <Stack.Screen name={SCREENS.LOCATION_CHANGE_SUCCESS} component={LocationChangeSuccessScreen} />
      <Stack.Screen name={SCREENS.CANCEL_REQUEST} component={CancelRequestScreen} />
      <Stack.Screen name={SCREENS.REPORT_ISSUE} component={ReportIssueScreen} />
      <Stack.Screen name={SCREENS.REQUEST_CAB_STEP1} component={RequestCabStep1Screen} />
      <Stack.Screen name={SCREENS.REQUEST_CAB_STEP2} component={RequestCabStep2Screen} />
      <Stack.Screen name={SCREENS.SELECT_PICKUP} component={SelectPickupScreen} />
      <Stack.Screen name={SCREENS.RIDE_DETAILS} component={RideDetailsScreen} />
    </Stack.Navigator>
  );
};

export default HomeNavigator;
