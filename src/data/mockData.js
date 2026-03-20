/**
 * src/data/mockData.js
 * Single canonical source of all mock/static data.
 * Aligned exactly to the Figma "Cab Roster - Dev (Copy)" handoff.
 */

// ─── Users ────────────────────────────────────────────────────────────────────

export const MOCK_USERS = {
  employee: {
    id: 'EMP-VT216',
    name: 'Ragha Malliga',
    firstName: 'Raghavi',
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
    shift: '07:00 AM – 05:00 PM',
    avatar: null,
    rating: 4.8,
    totalTrips: 1240,
  },
};

// ─── Driver Daily Stats ──────────────────────────────────────────────────────

export const MOCK_DRIVER_DAILY_STATS = {
  totalTrips: 12,
  totalDistance: '200 km',
  shiftStarted: '08:00 AM',
  shiftEnded: '05:42 PM',
  totalDuration: '09h 42mins',
  date: '2026-02-10',
};

// ─── Driver – Next Trip ───────────────────────────────────────────────────────

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

// ─── Driver – Upcoming Trips ──────────────────────────────────────────────────

export const MOCK_UPCOMING_TRIPS_DRIVER = [
  {
    id: '234',
    tripNumber: 'Trip #234',
    vehicle: 'TN 14 CV 3755',
    vehicleType: 'Ertiga',
    date: 'Tue, Feb 06 · 08:00 AM',
    status: 'scheduled',
    pickup: { name: 'Aavin Bus Stop', time: '9:30 AM', employeeCount: 4 },
    destination: { name: 'vThink Global Technology', eta: '10:00 AM' },
  },
  {
    id: '235',
    tripNumber: 'Trip #235',
    vehicle: 'TN 14 CV 3755',
    vehicleType: 'Ertiga',
    date: 'Tue, Feb 06 · 11:00 AM',
    status: 'scheduled',
    pickup: { name: 'BSR Mall', time: '11:00 AM', employeeCount: 7 },
    destination: { name: 'vThink Global Technology', eta: '11:45 AM' },
  },
  {
    id: '238',
    tripNumber: 'Trip #238',
    vehicle: 'TN 14 CV 3755',
    vehicleType: 'Ertiga',
    date: 'Wed, Feb 07 · 08:00 AM',
    status: 'scheduled',
    pickup: { name: 'Sholinganallur Bus Stop', time: '8:30 PM', employeeCount: 6 },
    destination: { name: 'vThink Global Technology', eta: '7:00 PM' },
    employeeCount: 6,
  },
];

// ─── Driver – Trip History ────────────────────────────────────────────────────

export const MOCK_DRIVER_TRIP_HISTORY = [
  {
    id: 'dh-1',
    tripNumber: 'Trip #228',
    vehicle: 'TN 14 CV 3755',
    vehicleType: 'Ertiga',
    date: 'Tue, Feb 04 · 08:00 AM',
    status: 'completed',
    pickup: { name: 'Karapakkam Bus Stop', time: '8:30 AM', employeeCount: 6 },
    destination: { name: 'vThink Global Technology', eta: '9:00 AM' },
    employeeCount: 6,
  },
  {
    id: 'dh-2',
    tripNumber: 'Trip #229',
    vehicle: 'TN 14 CV 3755',
    vehicleType: 'Ertiga',
    date: 'Tue, Feb 04 · 06:00 PM',
    status: 'completed',
    pickup: { name: 'vThink Global Technology', time: '6:00 PM', employeeCount: 5 },
    destination: { name: 'Sholinganallur Bus Stop', eta: '6:30 PM' },
    employeeCount: 5,
  },
  {
    id: 'dh-3',
    tripNumber: 'Trip #226',
    vehicle: 'TN 14 CV 3755',
    vehicleType: 'Ertiga',
    date: 'Mon, Feb 03 · 08:00 AM',
    status: 'completed',
    pickup: { name: 'Madipakkam Bus Stop', time: '8:00 AM', employeeCount: 3 },
    destination: { name: 'vThink Global Technology', eta: '8:45 AM' },
    employeeCount: 3,
  },
];

// ─── Driver – Active Trip Route Stops ────────────────────────────────────────

export const MOCK_ROUTE_STOPS = [
  {
    id: 'stop-1',
    time: '9:30 AM',
    actualTime: '9:30 AM',
    name: 'Madipakkam',
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

// ─── Driver – Trip Summary ────────────────────────────────────────────────────

export const MOCK_TRIP_SUMMARY = {
  tripNumber: 'Trip #231',
  vehicle: 'TN 14 CV 3755',
  vehicleType: 'Ertiga',
  startedAt: '9:30 AM',
  endedAt: '10:30 AM',
  totalPickups: 5,
  totalStops: 3,
  totalDistance: '18.2km',
  routeTracking: 'Trip path recorded successfully',
  routeStops: [
    {
      id: 'stop-1',
      time: '9:30 AM',
      actualTime: '9:30 AM',
      name: 'Madipakkam',
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

// ─── Driver – Attendance ──────────────────────────────────────────────────────

export const MOCK_ATTENDANCE_LIST = [
  { id: 'a1', name: 'James Parker', stopName: 'BSR Mall', stopNumber: 3, scheduledTime: '9:45 AM', boarded: true },
  { id: 'a2', name: 'Miss Ian Bosco', stopName: 'BSR Mall', stopNumber: 3, scheduledTime: '9:45 AM', boarded: true },
  { id: 'a3', name: 'Lana Mante', stopName: 'BSR Mall', stopNumber: 3, scheduledTime: '9:45 AM', boarded: false },
];

// ─── Employee – Current Ride ──────────────────────────────────────────────────

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

// ─── Employee – Schedule ──────────────────────────────────────────────────────

export const MOCK_EMPLOYEE_SCHEDULE = [
  { id: 's1', label: 'Ride to Office', time: '9:30 AM', status: 'completed' },
  { id: 's2', label: 'Ride to Home', time: '7:30 PM', status: 'scheduled' },
];

// ─── Employee – Upcoming Trips ────────────────────────────────────────────────

export const MOCK_UPCOMING_TRIPS_EMPLOYEE = [
  {
    id: 'et-1',
    tripNumber: 'Trip 342',
    date: 'Tue, Feb 06 · 08:00 AM',
    status: 'scheduled',
    type: 'pickup',
    pickup: { name: 'Karapakkam Bus Stop', time: '8:30 AM', employeeCount: 6 },
    destination: { name: 'vThink Global Technology', eta: '9:00 AM' },
  },
  {
    id: 'et-2',
    tripNumber: 'Trip 342',
    date: 'Wed, Feb 07 · 08:00 AM',
    status: 'scheduled',
    type: 'pickup',
    pickup: { name: 'Karapakkam Bus Stop', time: '8:30 AM', employeeCount: 6 },
    destination: { name: 'vThink Global Technology', eta: '9:00 AM' },
  },
  {
    id: 'et-3',
    tripNumber: 'Trip 344',
    date: 'Wed, Feb 07 · 08:00 AM',
    status: 'scheduled',
    type: 'drop',
    pickup: { name: 'vThink Global Technology', time: '8:30 AM', employeeCount: 6 },
    destination: { name: 'Sholinganallur Bus Stop', eta: '9:00 AM' },
  },
];

// ─── Employee – Trip History ──────────────────────────────────────────────────

export const MOCK_TRIP_HISTORY_EMPLOYEE = [
  {
    id: 'eh-1',
    tripNumber: 'Trip 330',
    date: 'Mon, Feb 05 · 08:00 AM',
    status: 'completed',
    type: 'pickup',
    pickup: { name: 'Karapakkam Bus Stop', time: '8:30 AM' },
    destination: { name: 'vThink Global Technology', eta: '9:00 AM' },
    vehicle: 'TN 14 CV 3755',
    vehicleType: 'Ertiga',
  },
  {
    id: 'eh-2',
    tripNumber: 'Trip 331',
    date: 'Mon, Feb 05 · 06:00 PM',
    status: 'cancelled',
    type: 'drop',
    pickup: { name: 'vThink Global Technology', time: '6:00 PM' },
    destination: { name: 'Karapakkam Bus Stop', eta: '6:30 PM' },
    vehicle: 'TN 14 CV 3755',
    vehicleType: 'Ertiga',
  },
  {
    id: 'eh-3',
    tripNumber: 'Trip 328',
    date: 'Fri, Jan 31 · 06:00 PM',
    status: 'not_used',
    type: 'drop',
    pickup: { name: 'vThink Global Technology', time: '6:00 PM' },
    destination: { name: 'Karapakkam Bus Stop', eta: '6:30 PM' },
    vehicle: 'TN 14 CV 3755',
    vehicleType: 'Ertiga',
  },
];

// ─── Employee – Recent Activity ───────────────────────────────────────────────

export const MOCK_RECENT_ACTIVITY = [
  {
    id: 'ra-1',
    icon: 'time-outline',
    iconBg: '#fef5e7',
    iconColor: '#f59e0b',
    title: 'Location Change Request',
    subtitle: 'Level 1 Request Approved',
    status: 'pending',
    time: '2 hours ago',
  },
  {
    id: 'ra-2',
    icon: 'checkmark-circle',
    iconBg: '#e8f6ed',
    iconColor: '#16a34a',
    title: 'Ride to Office',
    subtitle: '9:30 PM',
    status: 'completed',
    time: 'Yesterday',
  },
];

// ─── Notifications ────────────────────────────────────────────────────────────

export const MOCK_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'Trip starting soon',
    body: 'Morning Pickup starts in 15 minutes.',
    time: '2 mins ago',
    unread: true,
    iconName: 'car-outline',
    iconBg: '#f1ecff',
    iconColor: '#643ee8',
    category: 'today',
  },
  {
    id: 'n2',
    title: 'Cab assigned',
    body: 'Cab TN 14 CV 4214 assigned for today\'s trips.',
    time: '1 hour ago',
    unread: true,
    iconName: 'checkmark-circle-outline',
    iconBg: '#e8f6ed',
    iconColor: '#16a34a',
    category: 'today',
  },
  {
    id: 'n3',
    title: 'Trip completed',
    body: 'Morning Pickup completed successfully.',
    time: 'Yesterday',
    unread: false,
    iconName: 'flag-outline',
    iconBg: '#fef5e7',
    iconColor: '#f59e0b',
    category: 'yesterday',
  },
];
