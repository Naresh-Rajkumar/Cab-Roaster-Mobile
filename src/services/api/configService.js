import axiosInstance from '../axiosConfig';

export const configService = {
  getWorkLocations: () => axiosInstance.get('/work-locations'),
  /** Enough rows for pickup/drop pickers; active stops only. */
  getStops: () => axiosInstance.get('/stops?limit=100&status=active'),
  /** @param {'employee'|'driver'} [type] - filter by shift type. Omit to get all. */
  getShifts: (type) => axiosInstance.get(type ? `/shifts?type=${type}` : '/shifts'),
  getRoutes: () => axiosInstance.get('/routes'),
};
