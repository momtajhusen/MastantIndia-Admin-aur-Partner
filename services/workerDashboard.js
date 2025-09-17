// =======================
// services/workerDashboard.js
// =======================
import apiClient from './apiClient';

/* =======================
   WORKER DASHBOARD
======================= */

// Get worker dashboard data
export const getWorkerDashboard = () => {
  return apiClient.get('/worker/dashboard');
};

// Update worker availability status
export const updateWorkerAvailability = (isAvailable) => {
  return apiClient.put('/worker/availability', { 
    is_available: isAvailable 
  });
};