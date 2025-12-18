import axios from 'axios';

const API_BASE_URL = 'http://10.91.46.168:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const surfSpotsAPI = {
  getAll: () => api.get('/surf-spots'),
  getById: (id) => api.get(`/surf-spots/${id}`),
};

export const hazardReportsAPI = {
  submit: (formData) => {
    return api.post('/hazard-reports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getBySpot: (spotId) => api.get(`/hazard-reports/spot/${spotId}`),
};

export default api;
