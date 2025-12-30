import axios from 'axios';
import { API_BASE_URL, ENDPOINTS } from '../utils/constants';
import { Alert, Platform } from 'react-native';

// Create axios instance with auto-detected base URL
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.url}`, response.status);
    return response;
  },
  (error) => {
    console.error('❌ API Error:', error.message);
    
    if (error.code === 'ECONNREFUSED' || error.code === 'ERR_NETWORK') {
      Alert.alert(
        'Connection Error',
        `Cannot connect to server at ${API_BASE_URL}.\n\n` +
        'Please ensure:\n' +
        '1. Backend server is running\n' +
        '2. You are on the same network\n' +
        '3. API_BASE_URL is configured correctly',
        [{ text: 'OK' }]
      );
    }
    
    return Promise.reject(error);
  }
);

// ==================== API METHODS ====================

/**
 * Check server health and get connection info
 */
export const checkServerHealth = async () => {
  try {
    const response = await api.get(ENDPOINTS.HEALTH);
    return response.data;
  } catch (error) {
    throw new Error(`Server health check failed: ${error.message}`);
  }
};

/**
 * Get server network information
 */
export const getServerInfo = async () => {
  try {
    const response = await api.get(ENDPOINTS.SERVER_INFO);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to get server info: ${error.message}`);
  }
};

/**
 * Get all surf spots
 */
export const getSurfSpots = async () => {
  try {
    const response = await api.get(ENDPOINTS.SURF_SPOTS);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch surf spots: ${error.message}`);
  }
};

/**
 * Get specific surf spot details
 */
export const getSurfSpotById = async (spotId) => {
  try {
    const response = await api.get(`${ENDPOINTS.SURF_SPOTS}/${spotId}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch surf spot: ${error.message}`);
  }
};

/**
 * Submit hazard report
 */
export const submitHazardReport = async (formData) => {
  try {
    const response = await api.post(ENDPOINTS.HAZARD_REPORTS, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw new Error(`Failed to submit hazard report: ${error.message}`);
  }
};

/**
 * Get hazard reports for a surf spot
 */
export const getHazardReportsBySpot = async (spotId) => {
  try {
    const response = await api.get(`${ENDPOINTS.HAZARD_REPORTS}/spot/${spotId}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch hazard reports: ${error.message}`);
  }
};

/**
 * Get incidents for a surf spot
 */
export const getIncidentsBySpot = async (spotName) => {
  try {
    const response = await api.get(`${ENDPOINTS.INCIDENTS}/spot/${spotName}`);
    return response.data;
  } catch (error) {
    throw new Error(`Failed to fetch incidents: ${error.message}`);
  }
};

/**
 * Test API connection
 */
export const testConnection = async () => {
  try {
    const health = await checkServerHealth();
    console.log('🎉 API Connection successful!', health);
    return { success: true, data: health };
  } catch (error) {
    console.error('💥 API Connection failed:', error.message);
    return { success: false, error: error.message };
  }
};

export default api;