// ==================== SKILL-SPECIFIC RISK THRESHOLDS ====================
export const SKILL_RISK_THRESHOLDS = {
  beginner: {
    low: 5.0,      // 1-5 = Green Flag (Low Risk)
    medium: 6.5    // 5-6.5 = Yellow Flag (Medium Risk), 6.5-10 = Red Flag (High Risk)
  },
  intermediate: {
    low: 6.0,      // 1-6 = Green Flag (Low Risk)
    medium: 7.2    // 6-7.2 = Yellow Flag (Medium Risk), 7.2-10 = Red Flag (High Risk)
  },
  advanced: {
    low: 7.0,      // 1-7 = Green Flag (Low Risk)
    medium: 8.0    // 7-8 = Yellow Flag (Medium Risk), 8-10 = Red Flag (High Risk)
  },
  overall: {
    low: 3.3,      // 1-3.3 = Green Flag (Low Risk)
    medium: 6.6    // 3.3-6.6 = Yellow Flag (Medium Risk), 6.6-10 = Red Flag (High Risk)
  }
};

// ==================== API CONFIGURATION ====================
export const API_CONFIG = {
  BASE_URL: 'http://10.91.46.168:5000/api',
  ML_API_URL: 'http://10.91.46.168:5001', 
  TIMEOUT: 30000,
  MAX_RETRIES: 3,
};

// ==================== HAZARD TYPES ====================
export const HAZARD_TYPES = [
  { id: 1, value: 'Rip Current', icon: '🌊', severity: 'high' },
  { id: 2, value: 'High Surf', icon: '🌊', severity: 'high' },
  { id: 3, value: 'Reef Cuts', icon: '🪨', severity: 'medium' },
  { id: 4, value: 'Jellyfish', icon: '🪼', severity: 'medium' },
  { id: 5, value: 'Sea Urchins', icon: '🦔', severity: 'low' },
  { id: 6, value: 'Strong Winds', icon: '💨', severity: 'medium' },
  { id: 7, value: 'Poor Visibility', icon: '🌫️', severity: 'low' },
  { id: 8, value: 'Overcrowding', icon: '👥', severity: 'low' },
  { id: 9, value: 'Equipment Issues', icon: '🏄', severity: 'medium' },
  { id: 10, value: 'Marine Life', icon: '🐟', severity: 'medium' },
  { id: 11, value: 'Other', icon: '⚠️', severity: 'medium' },
];

// ==================== SEVERITY LEVELS ====================
export const SEVERITY_LEVELS = [
  { 
    value: 'low', 
    label: 'Low', 
    color: '#10b981',
    bgColor: '#d1fae5',
    textColor: '#065f46',
    description: 'Minor concern'
  },
  { 
    value: 'medium', 
    label: 'Medium', 
    color: '#f59e0b',
    bgColor: '#fef3c7',
    textColor: '#92400e',
    description: 'Moderate risk'
  },
  { 
    value: 'high', 
    label: 'High', 
    color: '#ef4444',
    bgColor: '#fee2e2',
    textColor: '#991b1b',
    description: 'Serious hazard'
  },
];

// ==================== EXPERIENCE LEVELS ====================
export const EXPERIENCE_LEVELS = [
  {
    value: 'beginner',
    label: 'Beginner',
    description: 'New to surfing or under 1 year experience',
    icon: '🏄‍♀️',
    thresholds: SKILL_RISK_THRESHOLDS.beginner,
  },
  {
    value: 'intermediate',
    label: 'Intermediate',
    description: '1-3 years experience',
    icon: '🏄',
    thresholds: SKILL_RISK_THRESHOLDS.intermediate,
  },
  {
    value: 'advanced',
    label: 'Advanced',
    description: '3+ years experience',
    icon: '🏄‍♂️',
    thresholds: SKILL_RISK_THRESHOLDS.advanced,
  },
];

// ==================== MEDIA UPLOAD SETTINGS ====================
export const MEDIA_UPLOAD = {
  MAX_FILES: 5,
  MAX_FILE_SIZE: 50 * 1024 * 1024,
  MAX_VIDEO_DURATION: 30,
  ACCEPTED_IMAGE_TYPES: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  ACCEPTED_VIDEO_TYPES: ['video/mp4', 'video/mov', 'video/avi'],
  IMAGE_QUALITY: 0.8,
};

// ==================== MAP SETTINGS ====================
export const MAP_SETTINGS = {
  SRI_LANKA_CENTER: {
    latitude: 7.8731,
    longitude: 80.7718,
    latitudeDelta: 3.5,
    longitudeDelta: 3.5,
  },
  DEFAULT_ZOOM: {
    latitudeDelta: 0.5,
    longitudeDelta: 0.5,
  },
};

// ==================== STORAGE KEYS ====================
export const STORAGE_KEYS = {
  TOKEN: '@surf_risk_token',
  USER: '@surf_risk_user',
  THEME: '@surf_risk_theme',
  LANGUAGE: '@surf_risk_language',
  ONBOARDING_COMPLETE: '@surf_risk_onboarding',
  FAVORITE_SPOTS: '@surf_risk_favorites',
  NOTIFICATION_SETTINGS: '@surf_risk_notifications',
};

// ==================== COLORS ====================
export const COLORS = {
  primary: '#0891b2',
  secondary: '#06b6d4',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  
  gray50: '#f9fafb',
  gray100: '#f3f4f6',
  gray200: '#e5e7eb',
  gray300: '#d1d5db',
  gray400: '#9ca3af',
  gray500: '#6b7280',
  gray600: '#4b5563',
  gray700: '#374151',
  gray800: '#1f2937',
  gray900: '#111827',
  
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
};

export default {
  API_CONFIG,
  SKILL_RISK_THRESHOLDS,
  HAZARD_TYPES,
  SEVERITY_LEVELS,
  EXPERIENCE_LEVELS,
  MEDIA_UPLOAD,
  MAP_SETTINGS,
  STORAGE_KEYS,
  COLORS,
};