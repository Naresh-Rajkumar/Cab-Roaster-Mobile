/**
 * DRIVER SERVICE
 *
 * TO SWITCH TO REAL BACKEND: set USE_MOCK = false in src/config/env.js
 */
import { USE_MOCK } from '../../config/env';
import { mockDriverService } from '../mock/mockDriverService';
import axiosInstance from '../axiosConfig';

const realDriverService = {
  getDailyStats: () => axiosInstance.get('/dashboard/stats'),
  getNextTrip: () => axiosInstance.get('/trips/my-trips', { params: { status: 'Upcoming', limit: 1 } }),
  getActiveTrip: () => axiosInstance.get('/trips/my-trips', { params: { status: 'in_progress', limit: 1 } }),
  getUpcomingTrips: () => axiosInstance.get('/trips/my-trips', { params: { status: 'Upcoming' } }),
  startTrip: (tripId) => axiosInstance.post(`/trips/${tripId}/start`),
  endTrip: (tripId) => axiosInstance.post(`/trips/${tripId}/complete`),
  arriveAtStop: (tripId, stopId) => axiosInstance.post(`/trips/${tripId}/stops/${stopId}/arrive`),
  updateStopHandoff: (tripId, stopId) => axiosInstance.post(`/trips/${tripId}/stops/${stopId}/arrive`),
  getTripHistory: () => axiosInstance.get('/trips/my-trips', { params: { status: 'Completed' } }),
  saveTripData: () => Promise.resolve({ data: { success: true } }),
};

export const driverService = USE_MOCK ? mockDriverService : realDriverService;
