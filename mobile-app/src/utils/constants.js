import { Platform } from 'react-native';

/**
 * API Configuration
 * 
 * FOR ANDROID EMULATOR: Uses 10.0.2.2
 * FOR iOS SIMULATOR: Uses localhost
 * FOR PHYSICAL DEVICE: Set DEVICE_API_URL below
 */

// 🔧 CONFIGURE THIS FOR PHYSICAL DEVICE TESTING
// Find your computer's IP from backend startup logs
// Example: const DEVICE_API_URL = 'http://192.168.1.100:5000';
const DEVICE_API_URL = ''; // Leave empty for emulator/simulator

/**
 * Get the API base URL based on platform
 */
const getApiBaseUrl = () => {
  // If testing on physical device, use the configured URL
  if (DEVICE_API_URL) {
    console.log('📱 Using device API URL:', DEVICE_API_URL);
    return DEVICE_API_URL;
  }

  // Auto-detect for emulator/simulator
  if (Platform.OS === 'android') {
    // Android emulator uses 10.0.2.2 to access host machine
    console.log('🤖 Android emulator detected, using 10.0.2.2:5000');
    return 'http://10.0.2.2:5000';
  } else if (Platform.OS === 'ios') {
    // iOS simulator uses localhost
    console.log('🍎 iOS simulator detected, using localhost:5000');
    return 'http://localhost:5000';
  } else {
    // Fallback for web or other platforms
    console.log('🌐 Web platform detected, using localhost:5000');
    return 'http://localhost:5000';
  }
};

export const API_BASE_URL = 'http://192.168.1.152:5000';

export const ENDPOINTS = {
  HEALTH: '/api/health',
  SERVER_INFO: '/api/server-info',
  SURF_SPOTS: '/api/surf-spots',
  HAZARD_REPORTS: '/api/hazard-reports',
  INCIDENTS: '/api/incidents',
};

export const RISK_LEVELS = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

export const FLAG_COLORS = {
  GREEN: 'green',
  YELLOW: 'yellow',
  RED: 'red',
};

export const HAZARD_TYPES = [
  'Rip Current',
  'High Surf',
  'Reef Cuts',
  'Jellyfish',
  'Sea Urchins',
  'Strong Winds',
  'Poor Visibility',
  'Overcrowding',
  'Equipment Issues',
  'Marine Life',
  'Other',
];

export const SEVERITY_LEVELS = ['low', 'medium', 'high'];

// Log configuration on startup
console.log('\n🌐 API Configuration:');
console.log('====================');
console.log('Platform:', Platform.OS);
console.log('Base URL:', API_BASE_URL);
console.log('====================\n');