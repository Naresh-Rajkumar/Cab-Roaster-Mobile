import axiosInstance from '../axiosConfig';

export const profileService = {
  getProfile: () => axiosInstance.get('/profile'),
  updateProfile: (data) => axiosInstance.put('/profile', data),
};
