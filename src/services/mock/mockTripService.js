/**
 * MOCK TRIP SERVICE
 * Returns mock trip data with realistic delays.
 */
import { MOCK_DELAY_MIN, MOCK_DELAY_MAX } from '../../config/env';
import {
  MOCK_UPCOMING_TRIPS_EMPLOYEE,
  MOCK_TRIP_HISTORY_EMPLOYEE,
  MOCK_CURRENT_RIDE,
  MOCK_ROUTE_STOPS,
  MOCK_UPCOMING_TRIPS_DRIVER,
  MOCK_DRIVER_TRIP_HISTORY,
  MOCK_TRIP_SUMMARY,
  MOCK_NEXT_TRIP,
} from './mockData';

const delay = () =>
  new Promise((resolve) =>
    setTimeout(
      resolve,
      Math.random() * (MOCK_DELAY_MAX - MOCK_DELAY_MIN) + MOCK_DELAY_MIN
    )
  );

export const mockTripService = {
  getTrips: async (params) => {
    await delay();
    const { type = 'upcoming', role = 'employee' } = params || {};
    if (role === 'driver') {
      return {
        data: type === 'history' ? MOCK_DRIVER_TRIP_HISTORY : MOCK_UPCOMING_TRIPS_DRIVER,
      };
    }
    return {
      data: type === 'history' ? MOCK_TRIP_HISTORY_EMPLOYEE : MOCK_UPCOMING_TRIPS_EMPLOYEE,
    };
  },

  getTripDetails: async (tripId) => {
    await delay();
    return {
      data: {
        trip: MOCK_CURRENT_RIDE,
        driver: {
          name: MOCK_CURRENT_RIDE.driverName,
          vehicleNo: MOCK_CURRENT_RIDE.vehicleNo,
          vehicleType: MOCK_CURRENT_RIDE.vehicleType,
          phone: MOCK_CURRENT_RIDE.driverPhone,
        },
      },
    };
  },

  getTripStops: async (tripId) => {
    await delay();
    return { data: MOCK_ROUTE_STOPS };
  },

  getDriverInfo: async (tripId) => {
    await delay();
    return {
      data: {
        name: MOCK_CURRENT_RIDE.driverName,
        vehicleNo: MOCK_CURRENT_RIDE.vehicleNo,
        vehicleType: MOCK_CURRENT_RIDE.vehicleType,
        phone: MOCK_CURRENT_RIDE.driverPhone,
        rating: 4.8,
      },
    };
  },

  updateTripStatus: async (tripId, status) => {
    await delay();
    return { data: { tripId, status, updatedAt: new Date().toISOString() } };
  },

  getTripRoute: async (tripId) => {
    await delay();
    return {
      data: {
        polyline: [],
        stops: MOCK_ROUTE_STOPS,
      },
    };
  },

  getNextTrip: async () => {
    await delay();
    return { data: MOCK_CURRENT_RIDE };
  },

  // Returns a mock in-progress ride (simulates driver having started the trip)
  getMyCurrentRide: async () => {
    await delay();
    return { data: { ...MOCK_CURRENT_RIDE, status: 'in_progress' } };
  },

  getTripSummary: async (tripId) => {
    await delay();
    return { data: MOCK_TRIP_SUMMARY };
  },
};
