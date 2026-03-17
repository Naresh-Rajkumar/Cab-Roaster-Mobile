/**
 * MOCK DATA LAYER
 * Central source of all fake data used while USE_MOCK = true.
 * Replace individual sections with real API responses when backend is ready.
 */

// ─── USERS ────────────────────────────────────────────────────────────────────
export const MOCK_USERS = {
  employee: {
    id: 'EMP-VT216',
    name: 'Ragha Malliga',
    firstName: 'Ragha',
    employeeId: 'VT216',
    email: 'ragha.malliga@vthink.com',
    phone: '+91 98765 43210',
    role: 'employee',
    department: 'Engineering',
    shift: '09:00 AM – 06:00 PM',
    avatar: null,
    pickupLocation: 'Karapakkam Bus Stop',
    dropLocation: 'vThink Global Technology, Sholinganallur',
  },
  driver: {
    id: 'DRV-001',
    name: 'Celia Hagenes',
    firstName: 'Celia',
    employeeId: 'DRV-001',
    email: 'celia.hagenes@vthink.com',
    phone: '+91 98765 00001',
    role: 'driver',
    vehicleNo: 'TN 14 CV 3755',
    vehicleType: 'Ertiga',
    licenseNo: 'TN-0120110012345',
    shift: '07:00 AM – 04:00 PM',
    avatar: null,
    rating: 4.8,
    totalTrips: 1240,
  },
};

// ─── DRIVER ───────────────────────────────────────────────────────────────────
export const MOCK_DRIVER_DAILY_STATS = {
  totalTrips: 12,
  totalPickups: 32,
  date: '2026-02-09',
};

export const MOCK_NEXT_TRIP = {
  id: '231',
  tripNumber: 'Trip #231',
  vehicle: 'TN 14 CV 3755',
  vehicleType: 'Ertiga',
  status: 'start_now',
  pickup: {
    name: 'Karapakkam Bus Stop',
    time: '8:30 AM',
    employeeCount: 6,
  },
  destination: {
    name: 'vThink Global Technology',
    eta: '9:00 AM',
  },
};

export const MOCK_UPCOMING_TRIPS_DRIVER = [
  {
    id: '234',
    tripNumber: 'Trip #234',
    vehicle: 'TN 14 CV 3755',
    vehicleType: 'Ertiga',
    status: 'scheduled',
    pickup: { name: 'Aavin Bus Stop', time: '9:30 AM', employeeCount: 4 },
    destination: { name: 'vThink Global Technology', eta: '10:00 AM' },
  },
  {
    id: '235',
    tripNumber: 'Trip #235',
    vehicle: 'TN 14 CV 3755',
    vehicleType: 'Ertiga',
    status: 'scheduled',
    pickup: { name: 'BSR Mall', time: '11:00 AM', employeeCount: 7 },
    destination: { name: 'vThink Global Technology', eta: '11:45 AM' },
  },
  {
    id: '236',
    tripNumber: 'Trip #236',
    vehicle: 'TN 14 CV 3755',
    vehicleType: 'Ertiga',
    status: 'scheduled',
    pickup: { name: 'Madippakkam Junction', time: '3:00 PM', employeeCount: 5 },
    destination: { name: 'Sholinganallur Bus Stop', eta: '3:30 PM' },
  },
  {
    id: '237',
    tripNumber: 'Trip #237',
    vehicle: 'TN 14 CV 3755',
    vehicleType: 'Ertiga',
    status: 'scheduled',
    pickup: { name: 'OMR Toll Gate', time: '6:00 PM', employeeCount: 8 },
    destination: { name: 'Perungudi', eta: '6:45 PM' },
  },
];

export const MOCK_ROUTE_STOPS = [
  {
    id: 'stop-1',
    time: '9:30 AM',
    actualTime: '9:30 AM',
    name: 'Madippakkam',
    status: 'completed',
    employees: [
      { id: 'e1', name: 'Tommie Strosin', phone: '+91 98001 11111', status: 'picked_up', avatar: null },
    ],
  },
  {
    id: 'stop-2',
    time: '9:45 AM',
    actualTime: '9:45 AM',
    name: 'BSR Mall',
    status: 'next_stop',
    employees: [
      { id: 'e2', name: 'James Parker', phone: '+91 98002 22222', status: 'pending', avatar: null },
      { id: 'e3', name: 'Miss Ian Bosco', phone: '+91 98003 33333', status: 'pending', avatar: null },
      { id: 'e4', name: 'Lana Mante', phone: '+91 98004 44444', status: 'pending', avatar: null },
    ],
  },
  {
    id: 'stop-3',
    time: '10:15 AM',
    actualTime: null,
    name: 'Aavin Bus Stop',
    status: 'pending',
    employees: [
      { id: 'e5', name: 'Jim Dicki', phone: '+91 98005 55555', status: 'pending', avatar: null },
    ],
  },
  {
    id: 'stop-4',
    time: '10:30 AM',
    actualTime: null,
    name: 'vThink Office',
    status: 'pending',
    employees: [],
    isDestination: true,
  },
];

export const MOCK_DRIVER_TRIP_HISTORY = [
  {
    id: 'dh-1',
    tripNumber: 'Trip #228',
    date: 'Tue, Feb 04 · 08:00 AM',
    pickup: { name: 'Karapakkam Bus Stop', time: '8:30 AM' },
    destination: { name: 'vThink Global Technology', eta: '9:00 AM' },
    vehicle: 'TN 14 CV 3755',
    vehicleType: 'Ertiga',
    employeeCount: 6,
    status: 'completed',
  },
  {
    id: 'dh-2',
    tripNumber: 'Trip #229',
    date: 'Tue, Feb 04 · 06:00 PM',
    pickup: { name: 'vThink Global Technology', time: '6:00 PM' },
    destination: { name: 'Sholinganallur Bus Stop', eta: '6:30 PM' },
    vehicle: 'TN 14 CV 3755',
    vehicleType: 'Ertiga',
    employeeCount: 5,
    status: 'completed',
  },
];

export const MOCK_TRIP_SUMMARY = {
  tripNumber: 'Trip #231',
  vehicle: 'TN 14 CV 3755',
  vehicleType: 'Ertiga',
  startedAt: '9:30 AM',
  endedAt: '10:30 AM',
  totalPickups: 5,
  totalStops: 3,
  totalDistance: '18.2km',
  routeStops: [
    {
      id: 'stop-1',
      time: '9:30 AM',
      actualTime: '9:30 AM',
      name: 'Madippakkam',
      employees: [
        { id: 'e1', name: 'Tommie Strosin', status: 'picked_up' },
      ],
    },
    {
      id: 'stop-2',
      time: '9:45 AM',
      actualTime: '9:45 AM',
      name: 'BSR Mall',
      employees: [
        { id: 'e2', name: 'James Parker', status: 'no_show' },
        { id: 'e3', name: 'Miss Ian Bosco', status: 'picked_up' },
        { id: 'e4', name: 'Lana Mante', status: 'picked_up' },
      ],
    },
    {
      id: 'stop-3',
      time: '10:15 AM',
      actualTime: '10:15 AM',
      name: 'Aavin Bus Stop',
      employees: [
        { id: 'e5', name: 'Jim Dicki', status: 'picked_up' },
      ],
    },
    {
      id: 'stop-4',
      time: '10:30 AM',
      actualTime: '10:30 AM',
      name: 'vThink Office',
      employees: [],
      isDestination: true,
    },
  ],
};

// ─── EMPLOYEE ─────────────────────────────────────────────────────────────────
export const MOCK_CURRENT_RIDE = {
  id: 'TR-1042',
  tripId: '231',
  type: 'pickup',
  status: 'in_progress',
  pickup: 'Karapakkam',
  dropoff: 'Sholinganallur',
  distance: '8km away',
  eta: '15 mins',
  scheduledTime: '8:30 AM',
  driverName: 'Marvin McKinney',
  vehicleNo: 'TN 14 CV 3755',
  vehicleType: 'Ertiga',
  driverPhone: '+91 98765 00001',
  otp: '4521',
};

export const MOCK_EMPLOYEE_SCHEDULE = [
  { id: 's1', label: 'Ride to Office', time: '9:30 AM', status: 'completed' },
  { id: 's2', label: 'Ride to Home', time: '7:30 PM', status: 'scheduled' },
];

export const MOCK_RECENT_ACTIVITY = [
  {
    id: 'a1',
    icon: 'time-outline',
    iconBg: '#FEF3C7',
    iconColor: '#F59E0B',
    title: 'Location Change Request',
    subtitle: 'Level 1 Request Approved',
    status: 'pending',
    time: '2 hours ago',
  },
  {
    id: 'a2',
    icon: 'checkmark-circle',
    iconBg: '#DCFCE7',
    iconColor: '#22C55E',
    title: 'Ride to Office',
    subtitle: '9:30 PM',
    status: 'completed',
    time: 'Yesterday',
  },
];

export const MOCK_UPCOMING_TRIPS_EMPLOYEE = [
  {
    id: 'et-1',
    title: 'Tomorrow Morning',
    date: 'Tue, Feb 06 · 08:00 AM',
    from: 'Home',
    to: 'Office',
    icon: 'business',
    iconBg: '#DCFCE7',
    iconColor: '#22C55E',
    status: 'scheduled',
  },
  {
    id: 'et-2',
    title: 'Tomorrow Evening',
    date: 'Tue, Feb 06 · 06:00 PM',
    from: 'Office',
    to: 'Home',
    icon: 'home',
    iconBg: '#EDE7FB',
    iconColor: '#6C3AE1',
    status: 'scheduled',
  },
  {
    id: 'et-3',
    title: 'Wednesday Morning',
    date: 'Wed, Feb 07 · 08:00 AM',
    from: 'Home',
    to: 'Office',
    icon: 'business',
    iconBg: '#DCFCE7',
    iconColor: '#22C55E',
    status: 'scheduled',
  },
];

export const MOCK_TRIP_HISTORY_EMPLOYEE = [
  {
    id: 'eh-1',
    dateLabel: 'Monday, Jan 5',
    from: 'Home',
    to: 'Office',
    vehicleNo: 'TN 14 CV 3755',
    vehicleType: 'Ertiga',
    time: 'Tue, Feb 06 · 08:00 AM',
    icon: 'business',
    iconBg: '#DCFCE7',
    iconColor: '#22C55E',
    status: 'completed',
  },
  {
    id: 'eh-2',
    dateLabel: 'Monday, Jan 5',
    from: 'Office',
    to: 'Home',
    vehicleNo: 'TN 14 CV 3755',
    vehicleType: 'Ertiga',
    time: 'Tue, Feb 06 · 06:00 PM',
    icon: 'home',
    iconBg: '#EDE7FB',
    iconColor: '#6C3AE1',
    status: 'cancelled',
  },
  {
    id: 'eh-3',
    dateLabel: 'Monday, Jan 5',
    from: 'Office',
    to: 'Home',
    vehicleNo: 'TN 14 CV 3755',
    vehicleType: 'Ertiga',
    time: 'Mon, Feb 05 · 06:00 PM',
    icon: 'home',
    iconBg: '#EDE7FB',
    iconColor: '#6C3AE1',
    status: 'not_used',
  },
];

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────
export const MOCK_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'Shift Timing Updated',
    body: 'Your shift for next week is changed to 10:00 AM to 7:00 PM',
    time: '2 mins ago',
    unread: true,
    iconName: 'calendar',
    iconBg: '#FEF3C7',
    iconColor: '#F59E0B',
    category: 'today',
  },
  {
    id: 'n2',
    title: 'Office closed for Holiday',
    body: 'Reminder: The office will remain closed tomorrow for the public holiday.',
    time: '1 hour ago',
    unread: true,
    iconName: 'business',
    iconBg: '#DCFCE7',
    iconColor: '#22C55E',
    category: 'today',
  },
  {
    id: 'n3',
    title: 'Route Deviation Alert',
    body: 'Your cab took a different route due to heavy traffic on the highway.',
    time: 'Yesterday',
    unread: false,
    iconName: 'map',
    iconBg: '#FEE2E2',
    iconColor: '#EF4444',
    category: 'yesterday',
  },
];

// ─── ATTENDANCE ───────────────────────────────────────────────────────────────
export const MOCK_ATTENDANCE_LIST = [
  { id: 'a1', name: 'James Parker', stopName: 'BSR Mall', scheduledTime: '9:45 AM', status: 'pending' },
  { id: 'a2', name: 'Miss Ian Bosco', stopName: 'BSR Mall', scheduledTime: '9:45 AM', status: 'pending' },
  { id: 'a3', name: 'Lana Mante', stopName: 'BSR Mall', scheduledTime: '9:45 AM', status: 'pending' },
  { id: 'a4', name: 'Tommie Strosin', stopName: 'Madippakkam', scheduledTime: '9:30 AM', status: 'picked_up' },
  { id: 'a5', name: 'Jim Dicki', stopName: 'Aavin Bus Stop', scheduledTime: '10:15 AM', status: 'pending' },
];
