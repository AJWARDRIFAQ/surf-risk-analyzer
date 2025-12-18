import axios from 'axios';
import Constants from 'expo-constants';

// Get API URL from environment or use default
const getApiBaseUrl = () => {
  // Priority: 
  // 1. Expo config (from app.config.js extra)
  // 2. Environment variable
  // 3. Default localhost
  
  if (Constants.expoConfig?.extra?.apiBaseUrl) {
    return Constants.expoConfig.extra.apiBaseUrl;
  }
  
  // Fallback for different environments
  const platform = Constants.platform;
  
  if (platform?.ios) {
    // iOS Simulator can use localhost
    return 'http://localhost:5000/api';
  } else if (platform?.android) {
    // Android Emulator: 10.0.2.2 maps to host's localhost
    // Physical device: Use your computer's IP
    return 'http://10.91.46.168:5000/api';
  }
  
  // Default fallback
  return 'http://10.91.46.168:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

console.log('📡 API Configuration:');
console.log('   Base URL:', API_BASE_URL);
console.log('   Platform:', Constants.platform);
console.log('   Environment:', Constants.expoConfig?.extra?.environment || 'development');

// Create axios instance with configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.url} - ${response.status}`);
    return response;
  },
  (error) => {
    if (error.response) {
      // Server responded with error
      console.error('❌ API Error Response:', {
        url: error.config?.url,
        status: error.response.status,
        message: error.response.data?.message || error.message
      });
    } else if (error.request) {
      // Request made but no response
      console.error('❌ API No Response:', {
        url: error.config?.url,
        message: 'No response from server. Check if backend is running.'
      });
    } else {
      // Error setting up request
      console.error('❌ API Setup Error:', error.message);
    }
    return Promise.reject(error);
  }
);

// ==================== API ENDPOINTS ====================

export const surfSpotsAPI = {
  /**
   * Get all surf spots
   */
  getAll: () => api.get('/surf-spots'),
  
  /**
   * Get surf spot by ID
   * @param {string} id - Surf spot ID
   */
  getById: (id) => api.get(`/surf-spots/${id}`),
  
  /**
   * Update risk score (called by ML service)
   * @param {string} id - Surf spot ID
   * @param {object} data - Risk score data
   */
  updateRiskScore: (id, data) => api.put(`/surf-spots/${id}/risk-score`, data),
};

export const hazardReportsAPI = {
  /**
   * Submit new hazard report
   * @param {FormData} formData - Form data with media files
   */
  submit: (formData) => {
    return api.post('/hazard-reports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // 60 seconds for file upload
    });
  },
  
  /**
   * Get hazard reports for a specific surf spot
   * @param {string} spotId - Surf spot ID
   */
  getBySpot: (spotId) => api.get(`/hazard-reports/spot/${spotId}`),
  
  /**
   * Verify hazard report (requires admin/instructor auth)
   * @param {string} id - Report ID
   * @param {string} status - 'verified' or 'rejected'
   */
  verify: (id, status) => api.post(`/hazard-reports/${id}/verify`, { status }),
};

export const incidentsAPI = {
  /**
   * Get all incidents with pagination
   * @param {number} page - Page number
   * @param {number} limit - Items per page
   */
  getAll: (page = 1, limit = 50) => 
    api.get('/incidents', { params: { page, limit } }),
  
  /**
   * Get incidents for a specific surf spot
   * @param {string} spotName - Surf spot name
   */
  getBySpot: (spotName) => api.get(`/incidents/spot/${spotName}`),
};

export const healthAPI = {
  /**
   * Health check endpoint
   */
  check: () => api.get('/health'),
};

// ==================== UTILITY FUNCTIONS ====================

/**
 * Test API connection
 * @returns {Promise<boolean>} - Connection status
 */
export const testConnection = async () => {
  try {
    const response = await healthAPI.check();
    console.log('✅ API Connection Successful:', response.data);
    return true;
  } catch (error) {
    console.error('❌ API Connection Failed:', error.message);
    return false;
  }
};

/**
 * Get current API configuration
 * @returns {object} - API configuration
 */
export const getApiConfig = () => ({
  baseURL: API_BASE_URL,
  timeout: api.defaults.timeout,
  platform: Constants.platform,
  environment: Constants.expoConfig?.extra?.environment || 'development',
});

// Export axios instance as default
export default api;