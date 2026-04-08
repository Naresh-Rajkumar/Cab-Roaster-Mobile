import axiosInstance from '../axiosConfig';

export const configService = {
  getWorkLocations: () => axiosInstance.get('/work-locations'),
  /** Enough rows for pickup/drop pickers; active stops only. */
  getStops: () => axiosInstance.get('/stops?limit=100&status=active'),
  getShifts: () => axiosInstance.get('/shifts'),
  getRoutes: () => axiosInstance.get('/routes'),
};
