import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HandoffListScreen from '../screens/Employee/HandoffListScreen';
import TripDetailsScreen from '../screens/Employee/TripDetailsScreen';
import StopDetailsScreen from '../screens/Employee/StopDetailsScreen';
import DriverInfoScreen from '../screens/Employee/DriverInfoScreen';
import { SCREENS } from '../constants';

const Stack = createStackNavigator();

const EmployeeNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        gestureEnabled: true,
      }}
    >
      <Stack.Screen
        name={SCREENS.HANDOFF_LIST}
        component={HandoffListScreen}
      />
      <Stack.Screen
        name={SCREENS.TRIP_DETAILS}
        component={TripDetailsScreen}
      />
      <Stack.Screen
        name={SCREENS.STOP_DETAILS}
        component={StopDetailsScreen}
      />
      <Stack.Screen
        name={SCREENS.DRIVER_INFO}
        component={DriverInfoScreen}
      />
    </Stack.Navigator>
  );
};

export default EmployeeNavigator;
