/**
 * TRIP SERVICE
 *
 * TO SWITCH TO REAL BACKEND: set USE_MOCK = false in src/config/env.js
 */
import { USE_MOCK } from '../../config/env';
import { mockTripService } from '../mock/mockTripService';
import axiosInstance from '../axiosConfig';

const realTripService = {
  getTrips: (params) => axiosInstance.get('/trips', { params }),
  getTripDetails: (tripId) => axiosInstance.get(`/trips/${tripId}`),
  getTripStops: (tripId) => axiosInstance.get(`/trips/${tripId}/stops`),
  getDriverInfo: (tripId) => axiosInstance.get(`/trips/${tripId}/driver`),
  updateTripStatus: (tripId, status) => axiosInstance.patch(`/trips/${tripId}/status`, { status }),
  getTripRoute: (tripId) => axiosInstance.get(`/trips/${tripId}/route`),
  getNextTrip: () => axiosInstance.get('/trips/next'),
  getTripSummary: (tripId) => axiosInstance.get(`/trips/${tripId}/summary`),
};

export const tripService = USE_MOCK ? mockTripService : realTripService;
