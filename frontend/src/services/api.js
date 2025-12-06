import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// RFP API
export const rfpAPI = {
  create: (description) => api.post('/rfps/create', { description }),
  getAll: () => api.get('/rfps'),
  getById: (id) => api.get(`/rfps/${id}`),
  send: (id, vendorIds) => api.post(`/rfps/${id}/send`, { vendorIds }),
  update: (id, data) => api.put(`/rfps/${id}`, data),
  delete: (id) => api.delete(`/rfps/${id}`),
};

// Vendor API
export const vendorAPI = {
  create: (data) => api.post('/vendors', data),
  getAll: () => api.get('/vendors'),
  getById: (id) => api.get(`/vendors/${id}`),
  update: (id, data) => api.put(`/vendors/${id}`, data),
  delete: (id) => api.delete(`/vendors/${id}`),
};

// Proposal API
export const proposalAPI = {
  getByRFP: (rfpId) => api.get(`/proposals/rfp/${rfpId}`),
  checkEmails: () => api.post('/proposals/check-emails'),
  compare: (rfpId) => api.get(`/proposals/compare/${rfpId}`),
  getById: (id) => api.get(`/proposals/${id}`),
  delete: (id) => api.delete(`/proposals/${id}`),
};

export default api;
