import apiClient from '../api/api';

export const authService = {
  login: (username, password) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    
    return apiClient.post('/auth/token', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  },
  
  register: (username, password, role) => {
    return apiClient.post('/auth/register', {
      username,
      password,
      role
    });
  }
};
