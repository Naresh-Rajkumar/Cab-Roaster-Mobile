/**
 * REQUESTS SERVICE
 *
 * TO SWITCH TO REAL BACKEND: set USE_MOCK = false in src/config/env.js
 */
import { USE_MOCK } from '../../config/env';
import axiosInstance from '../axiosConfig';

const realRequestsService = {
  createRequest: (payload) => axiosInstance.post('/requests', payload),
  getRequests: (params) => axiosInstance.get('/requests', { params }),
  getNotifications: (params) => axiosInstance.get('/notifications', { params }),
  markNotificationsRead: () => axiosInstance.patch('/notifications/read-all'),
};

// Minimal mock for requests so the app doesn't break when USE_MOCK=true
const mockRequestsService = {
  createRequest: (payload) =>
    Promise.resolve({ data: { success: true, message: 'Request submitted', data: { id: Date.now(), ...payload } } }),
  getRequests: () =>
    Promise.resolve({ data: { success: true, data: [], meta: {} } }),
  getNotifications: () =>
    Promise.resolve({ data: { success: true, data: [] } }),
  markNotificationsRead: () =>
    Promise.resolve({ data: { success: true } }),
};

export const requestsService = USE_MOCK ? mockRequestsService : realRequestsService;
