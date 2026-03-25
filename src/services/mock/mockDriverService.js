/**
 * MOCK DRIVER SERVICE
 */
import { MOCK_DELAY_MIN, MOCK_DELAY_MAX } from '../../config/env';
import {
  MOCK_DRIVER_DAILY_STATS,
  MOCK_NEXT_TRIP,
  MOCK_UPCOMING_TRIPS_DRIVER,
  MOCK_DRIVER_TRIP_HISTORY,
  MOCK_ROUTE_STOPS,
  MOCK_TRIP_SUMMARY,
} from './mockData';

const delay = () =>
  new Promise((resolve) =>
    setTimeout(
      resolve,
      Math.random() * (MOCK_DELAY_MAX - MOCK_DELAY_MIN) + MOCK_DELAY_MIN
    )
  );

export const mockDriverService = {
  getDailyStats: async () => {
    await delay();
    return { data: MOCK_DRIVER_DAILY_STATS };
  },

  getNextTrip: async () => {
    await delay();
    return { data: MOCK_NEXT_TRIP };
  },

  getUpcomingTrips: async () => {
    await delay();
    return { data: MOCK_UPCOMING_TRIPS_DRIVER };
  },

  startTrip: async (tripId) => {
    await delay();
    return {
      data: {
        tripId,
        status: 'in_progress',
        startedAt: new Date().toISOString(),
        routeStops: MOCK_ROUTE_STOPS,
      },
    };
  },

  endTrip: async (tripId, summary) => {
    await delay();
    return {
      data: {
        tripId,
        status: 'completed',
        endedAt: new Date().toISOString(),
        summary: MOCK_TRIP_SUMMARY,
      },
    };
  },

  updateStopHandoff: async (stopId, employeeId, status) => {
    await delay();
    return {
      data: { stopId, employeeId, status, updatedAt: new Date().toISOString() },
    };
  },

  getTripHistory: async () => {
    await delay();
    return { data: MOCK_DRIVER_TRIP_HISTORY };
  },

  saveTripData: async (tripId, data) => {
    await delay();
    return { data: { success: true, tripId, savedAt: new Date().toISOString() } };
  },

  // Returns the currently active trip if driver already started one
  getActiveTrip: async () => {
    await delay();
    return { data: [] }; // mock: no active trip by default
  },

  arriveAtStop: async (tripId, stopId) => {
    await delay();
    return { data: { tripId, stopId, arrivedAt: new Date().toISOString() } };
  },
};
