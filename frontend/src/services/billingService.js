import apiClient from '../api/api';

export const billingService = {
  createOrder: (planName) => {
    return apiClient.post('/billing/create-order', { plan_name: planName });
  },
  
  verifyPayment: (payload) => {
    return apiClient.post('/billing/verify-payment', payload);
  },
  
  getHistory: () => {
    return apiClient.get('/billing/history');
  },
  
  getConfig: () => {
    return apiClient.get('/billing/config');
  },

  confirmUPI: (upiReference) => {
    return apiClient.post('/billing/confirm-upi', { upi_reference: upiReference });
  }


};
