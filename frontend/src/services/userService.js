import apiClient from '../api/api';

export const userService = {
  updateProfile: (profileData) => {
    return apiClient.put('/users/profile', profileData);
  },
  
  changePassword: (passwordData) => {
    return apiClient.put('/users/change-password', passwordData);
  },
  
  deleteAccount: () => {
    return apiClient.delete('/users/me');
  }

};
