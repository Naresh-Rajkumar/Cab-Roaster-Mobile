/**
 * TRIP SERVICE
 *
 * TO SWITCH TO REAL BACKEND: set USE_MOCK = false in src/config/env.js
 */
import { USE_MOCK } from '../../config/env';
import { mockTripService } from '../mock/mockTripService';
import axiosInstance from '../axiosConfig';

const realTripService = {
  // Employee/Driver: uses /trips/my-trips (scoped to logged-in user)
  // status values: 'On time', 'Delayed', 'Upcoming', 'Completed', 'Cancelled'
  getTrips: (params) => {
    const { type, ...beParams } = params || {};
    return axiosInstance.get('/trips/my-trips', { params: beParams });
  },
  getTripDetails: (tripId) => axiosInstance.get(`/trips/${tripId}`),
  getTripStops: (tripId) => axiosInstance.get(`/trips/${tripId}/stops`),
  startTrip: (tripId) => axiosInstance.post(`/trips/${tripId}/start`),
  completeTrip: (tripId) => axiosInstance.post(`/trips/${tripId}/complete`),
  arriveAtStop: (tripId, stopId) => axiosInstance.post(`/trips/${tripId}/stops/${stopId}/arrive`),
  getNextTrip: () => axiosInstance.get('/trips/my-trips', { params: { status: 'Upcoming', limit: 1 } }),
  // Returns the employee's currently active trip (driver has started it)
  getMyCurrentRide: () => axiosInstance.get('/trips/my-trips', { params: { status: 'in_progress', limit: 1 } }),
  // Driver: save per-employee boarding status after arriving at a stop
  // employees: [{ employeeId, status: 'picked_up' | 'no_show' }]
  updateEmployeeBoarding: (tripId, stopId, employees) =>
    axiosInstance.post(`/trips/${tripId}/stops/${stopId}/boarding`, { employees }),
  // Employee: confirm they boarded the cab at their stop
  confirmBoarding: (tripId, stopId) =>
    axiosInstance.post(`/trips/${tripId}/stops/${stopId}/confirm-boarding`),
};

export const tripService = USE_MOCK ? mockTripService : realTripService;
