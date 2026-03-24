/**
 * TRIP SERVICE
 *
 * TO SWITCH TO REAL BACKEND: set USE_MOCK = false in src/config/env.js
 */
import { USE_MOCK } from '../../config/env';
import { mockTripService } from '../mock/mockTripService';
import axiosInstance from '../axiosConfig';

const realTripService = {
  // BE QueryTripDto accepts: page, limit, search, status, date, driver, route
  // status values: 'On time', 'Delayed', 'Upcoming', 'Completed', 'Cancelled'
  getTrips: (params) => {
    // Strip 'type' param (not accepted by BE) and map status values
    const { type, ...beParams } = params || {};
    return axiosInstance.get('/trips', { params: beParams });
  },
  getTripDetails: (tripId) => axiosInstance.get(`/trips/${tripId}`),
  getTripStops: (tripId) => axiosInstance.get(`/trips/${tripId}/stops`),
  startTrip: (tripId) => axiosInstance.post(`/trips/${tripId}/start`),
  completeTrip: (tripId) => axiosInstance.post(`/trips/${tripId}/complete`),
  arriveAtStop: (tripId, stopId) => axiosInstance.post(`/trips/${tripId}/stops/${stopId}/arrive`),
  getNextTrip: () => axiosInstance.get('/trips', { params: { status: 'Upcoming', limit: 1 } }),
};

export const tripService = USE_MOCK ? mockTripService : realTripService;
