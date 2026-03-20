/**
 * MOCK REQUEST SERVICE
 * Simulates ride request operations with realistic delays.
 */
import { MOCK_DELAY_MIN, MOCK_DELAY_MAX } from '../../config/env';

const delay = () =>
  new Promise((resolve) =>
    setTimeout(
      resolve,
      Math.random() * (MOCK_DELAY_MAX - MOCK_DELAY_MIN) + MOCK_DELAY_MIN
    )
  );

const MOCK_STOPS = [
  { id: 1, name: 'Medavakkam', area: 'Medavakkam', latitude: 12.9165, longitude: 80.1904, distance: '1.6km' },
  { id: 2, name: 'Chromepet', area: 'Chromepet', latitude: 12.9516, longitude: 80.1462, distance: '2.3km' },
  { id: 3, name: 'Karapakkam Bus Stop', area: 'Karapakkam', latitude: 12.9278, longitude: 80.2278, distance: '3.1km' },
  { id: 4, name: 'Sholinganallur', area: 'Sholinganallur', latitude: 12.9010, longitude: 80.2279, distance: '4.5km' },
  { id: 5, name: 'BSR Mall', area: 'OMR', latitude: 12.9600, longitude: 80.2030, distance: '5.2km' },
  { id: 6, name: 'Madippakkam Junction', area: 'Madippakkam', latitude: 12.9637, longitude: 80.1991, distance: '3.8km' },
  { id: 7, name: 'Aavin Bus Stop', area: 'Velachery', latitude: 12.9823, longitude: 80.2185, distance: '2.9km' },
  { id: 8, name: 'OMR Toll Gate', area: 'OMR', latitude: 12.9445, longitude: 80.2310, distance: '6.1km' },
];

const MOCK_SHIFTS = [
  { id: 1, name: 'Morning Shift', timing: '6:00AM - 3:00PM' },
  { id: 2, name: 'General Shift', timing: '9:00AM - 6:00PM' },
  { id: 3, name: 'Day Shift', timing: '10:00AM - 7:00PM' },
  { id: 4, name: 'Evening Shift', timing: '2:00PM - 11:00PM' },
  { id: 5, name: 'Night Shift', timing: '10:00PM - 7:00AM' },
];

const MOCK_WORK_LOCATIONS = [
  { id: 1, name: 'Chennai', address: 'vThink Global Technology, Sholinganallur' },
  { id: 2, name: 'Coimbatore', address: 'vThink Global Technology, Coimbatore' },
];

export const mockRequestService = {
  createRequest: async (data) => {
    await delay();
    return {
      data: {
        success: true,
        message: 'Cab request submitted successfully',
        request: {
          id: `REQ-${Date.now()}`,
          ...data,
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
      },
    };
  },

  getStops: async () => {
    await delay();
    return { data: { stops: MOCK_STOPS } };
  },

  getShifts: async () => {
    await delay();
    return { data: { shifts: MOCK_SHIFTS } };
  },

  getWorkLocations: async () => {
    await delay();
    return { data: { locations: MOCK_WORK_LOCATIONS } };
  },

  getMyRequests: async () => {
    await delay();
    return { data: { requests: [] } };
  },
};
