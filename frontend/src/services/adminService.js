import apiClient from '../api/api';

export const adminService = {
  getMetrics: () => {
    return apiClient.get('/admin/metrics');
  },
  
  getDriftReport: () => {
    return apiClient.get('/admin/drift');
  },
  
  triggerRetrain: () => {
    return apiClient.post('/admin/retrain');
  },

  getPendingPayments: () => {
    return apiClient.get('/admin/pending-payments');
  },

  approvePayment: (txId) => {
    return apiClient.post(`/admin/approve-payment/${txId}`);
  },

  rejectPayment: (txId) => {
    return apiClient.post(`/admin/reject-payment/${txId}`);
  }
};
