/**
 * MOCK EMPLOYEE SERVICE
 */
import { MOCK_DELAY_MIN, MOCK_DELAY_MAX } from '../../config/env';
import { MOCK_ATTENDANCE_LIST, MOCK_ROUTE_STOPS } from './mockData';

const delay = () =>
  new Promise((resolve) =>
    setTimeout(
      resolve,
      Math.random() * (MOCK_DELAY_MAX - MOCK_DELAY_MIN) + MOCK_DELAY_MIN
    )
  );

const MOCK_EMPLOYEES = MOCK_ROUTE_STOPS.flatMap((stop) =>
  stop.employees.map((e) => ({ ...e, stopName: stop.name }))
);

export const mockEmployeeService = {
  getEmployees: async (params) => {
    await delay();
    return { data: MOCK_EMPLOYEES };
  },

  getEmployeeById: async (id) => {
    await delay();
    const emp = MOCK_EMPLOYEES.find((e) => e.id === id);
    return { data: emp || null };
  },

  getHandoffList: async (date, tripId) => {
    await delay();
    return { data: MOCK_ATTENDANCE_LIST };
  },

  updateHandoffStatus: async (employeeId, status) => {
    await delay();
    return { data: { employeeId, status, updatedAt: new Date().toISOString() } };
  },

  searchEmployees: async (query) => {
    await delay();
    const q = (query || '').toLowerCase();
    return {
      data: MOCK_EMPLOYEES.filter((e) => e.name.toLowerCase().includes(q)),
    };
  },
};
