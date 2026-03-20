/**
 * REQUEST SERVICE
 *
 * Handles ride request operations: creating cab requests, fetching stops, shifts, etc.
 * TO SWITCH TO REAL BACKEND: set USE_MOCK = false in src/config/env.js
 */
import { USE_MOCK } from '../../config/env';
import { mockRequestService } from '../mock/mockRequestService';
import axiosInstance from '../axiosConfig';

const realRequestService = {
  // Create a new cab request
  createRequest: (data) => axiosInstance.post('/requests', data),

  // Get available pickup/drop stops
  getStops: (params) => axiosInstance.get('/stops', { params }),

  // Get available shifts
  getShifts: () => axiosInstance.get('/shifts'),

  // Get work locations
  getWorkLocations: () => axiosInstance.get('/work-locations'),

  // Get request status
  getMyRequests: () => axiosInstance.get('/requests/my'),
};

export const requestService = USE_MOCK ? mockRequestService : realRequestService;
