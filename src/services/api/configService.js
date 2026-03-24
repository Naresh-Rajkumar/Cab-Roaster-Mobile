import axiosInstance from '../axiosConfig';

export const configService = {
  getWorkLocations: () => axiosInstance.get('/work-locations'),
  getStops: () => axiosInstance.get('/stops'),
  getShifts: () => axiosInstance.get('/shifts'),
  getRoutes: () => axiosInstance.get('/routes'),
};
