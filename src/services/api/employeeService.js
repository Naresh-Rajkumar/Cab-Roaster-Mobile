/**
 * EMPLOYEE SERVICE
 *
 * TO SWITCH TO REAL BACKEND: set USE_MOCK = false in src/config/env.js
 */
import { USE_MOCK } from '../../config/env';
import { mockEmployeeService } from '../mock/mockEmployeeService';
import axiosInstance from '../axiosConfig';

const realEmployeeService = {
  getEmployees: (params) => axiosInstance.get('/employees', { params }),
  getEmployeeById: (id) => axiosInstance.get(`/employees/${id}`),
  getHandoffList: (date, tripId) => axiosInstance.get('/employees/handoff', { params: { date, tripId } }),
  updateHandoffStatus: (employeeId, status) => axiosInstance.patch(`/employees/${employeeId}/handoff`, { status }),
  searchEmployees: (query) => axiosInstance.get('/employees/search', { params: { q: query } }),
};

export const employeeService = USE_MOCK ? mockEmployeeService : realEmployeeService;
