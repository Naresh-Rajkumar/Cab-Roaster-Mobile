/**
 * DRIVER SERVICE
 *
 * TO SWITCH TO REAL BACKEND: set USE_MOCK = false in src/config/env.js
 */
import { USE_MOCK } from '../../config/env';
import { mockDriverService } from '../mock/mockDriverService';
import axiosInstance from '../axiosConfig';

const realDriverService = {
  getDailyStats: () => axiosInstance.get('/driver/stats/daily'),
  getNextTrip: () => axiosInstance.get('/driver/trips/next'),
  getUpcomingTrips: () => axiosInstance.get('/driver/trips/upcoming'),
  startTrip: (tripId) => axiosInstance.post(`/driver/trips/${tripId}/start`),
  endTrip: (tripId, summary) => axiosInstance.post(`/driver/trips/${tripId}/end`, { summary }),
  updateStopHandoff: (stopId, employeeId, status) =>
    axiosInstance.patch(`/driver/stops/${stopId}/handoff`, { employeeId, status }),
  saveTripData: (tripId, data) => axiosInstance.post(`/driver/trips/${tripId}/save`, data),
};

export const driverService = USE_MOCK ? mockDriverService : realDriverService;
