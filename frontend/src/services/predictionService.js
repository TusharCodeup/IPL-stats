import apiClient from '../api/api';

export const predictionService = {
  getPreMatchPrediction: (params) => {
    return apiClient.post('/predict/pre-match', params);
  },
  
  getLivePrediction: (gameState) => {
    return apiClient.post('/predict/live-chase', gameState);
  },
  
  getHistory: () => {
    return apiClient.get('/predict/history');
  }
};
