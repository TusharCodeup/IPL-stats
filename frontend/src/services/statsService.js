import apiClient from '../api/api';

export const statsService = {
  getTeams: () => {
    return apiClient.get('/stats/teams');
  },
  
  getVenues: () => {
    return apiClient.get('/stats/venues');
  },
  
  getSummary: () => {
    return apiClient.get('/stats/summary');
  }
};
