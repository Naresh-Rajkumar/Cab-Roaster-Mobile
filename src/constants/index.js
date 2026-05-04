export const APP_NAME = 'Cab Roster';
export const APP_TAGLINE = 'Employee Transport Management';
export const API_TIMEOUT = 30000;

export const USER_ROLES = {
  EMPLOYEE: 'employee',
  DRIVER: 'driver',
};

export const TRIP_STATUS = {
  SCHEDULED: 'scheduled',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DELAYED: 'delayed',
  NOT_USED: 'not_used',
};

export const HANDOFF_STATUS = {
  PENDING: 'pending',
  PICKED_UP: 'picked_up',
  DROPPED_OFF: 'dropped_off',
  NO_SHOW: 'no_show',
  CANCELLED: 'cancelled',
};

export const RIDE_STATUS = {
  UPCOMING: 'upcoming',
  ON_THE_WAY: 'on_the_way',
  ARRIVED: 'arrived',
  IN_RIDE: 'in_ride',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

export const EMPLOYEE_STATUS = {
  ACTIVE: 'active',
  ON_LEAVE: 'on_leave',
  INACTIVE: 'inactive',
};

export const TRIP_TYPE = {
  PICKUP: 'pickup',
  DROP: 'drop',
};

export const SCREENS = {
  // Pre-auth
  SPLASH: 'Splash',
  ROLE_SELECTION: 'RoleSelection',

  // Onboarding
  ONBOARDING: 'Onboarding',
  DRIVER_ONBOARDING: 'DriverOnboarding',
  WELCOME: 'Welcome',

  // Auth
  LOGIN: 'Login',
  DRIVER_LOGIN: 'DriverLogin',
  OTP_VERIFICATION: 'OTPVerification',
  DRIVER_PASSCODE: 'DriverPasscode',
  DRIVER_LOCKOUT: 'DriverLockout',
  SESSION_EXPIRED: 'SessionExpired',

  // Tabs (shared)
  HOME_TAB: 'HomeTab',
  TRIPS_TAB: 'TripsTab',
  NOTIFICATIONS_TAB: 'NotificationsTab',
  MORE_TAB: 'MoreTab',

  // Employee Screens
  HOME: 'Home',
  LIVE_TRACKING: 'LiveTracking',
  RIDE_DETAILS: 'RideDetails',
  CAB_ARRIVED: 'CabArrived',
  MY_TRIPS: 'MyTrips',
  TRIP_DETAILS: 'TripDetails',
  LOCATION_CHANGE: 'LocationChange',
  SELECT_PICKUP: 'SelectPickup',
  LOCATION_CHANGE_SUCCESS: 'LocationChangeSuccess',
  CANCEL_REQUEST: 'CancelRequest',
  REPORT_ISSUE: 'ReportIssue',
  NOTIFICATIONS: 'Notifications',
  MORE: 'More',
  MORE_DETAILS: 'MoreDetails',
  PROFILE: 'Profile',

  // Employee Cab Scheduling Setup
  REQUEST_CAB_STEP1: 'RequestCabStep1',
  REQUEST_CAB_STEP2: 'RequestCabStep2',

  // Employee Handoff (legacy)
  HANDOFF_LIST: 'HandoffList',
  STOP_DETAILS: 'StopDetails',
  DRIVER_INFO: 'DriverInfo',

  // Driver Screens
  DRIVER_HOME: 'DriverHome',
  DRIVER_ACTIVE_TRIP: 'DriverActiveTrip',
  DRIVER_TRIPS: 'DriverTrips',
  DRIVER_NOTIFICATIONS: 'DriverNotifications',
  DRIVER_MORE: 'DriverMore',
  TRIP_SUMMARY: 'TripSummary',
  ATTENDANCE: 'Attendance',
  EDIT_PROFILE: 'EditProfile',
};

export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  API: 'YYYY-MM-DD',
  TIME: 'hh:mm A',
  FULL: 'DD MMM YYYY, hh:mm A',
};

export const QUICK_ACTIONS = [
  {
    id: 'cancel',
    label: 'Request Cancellation',
    icon: 'close-circle-outline',
    color: '#EF4444',
    bgColor: '#FEE2E2',
  },
  {
    id: 'report',
    label: 'Report Issue',
    icon: 'alert-circle-outline',
    color: '#F59E0B',
    bgColor: '#FEF3C7',
  },
];
