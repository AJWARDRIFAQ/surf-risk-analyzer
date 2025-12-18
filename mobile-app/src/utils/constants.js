// ==================== API CONFIGURATION ====================
export const API_CONFIG = {
  // BASE_URL: __DEV__ 
  //   ? 'http://localhost:5000/api'  // Development
  //   : 'https://your-production-api.com/api', // Production
  
  // ML_API_URL: __DEV__
  //   ? 'http://localhost:5001'
  //   : 'https://your-ml-api.com',

   BASE_URL: 'http://10.91.46.168:5000/api',  // Your computer's IP
  ML_API_URL: 'http://10.91.46.168:5001', 
  
  TIMEOUT: 30000, // 30 seconds
  MAX_RETRIES: 3,
};

// ==================== SURF SPOTS ====================
export const SURF_SPOTS = [
  { id: 1, name: 'Arugam Bay', region: 'Eastern Province' },
  { id: 2, name: 'Hikkaduwa', region: 'Southern Province' },
  { id: 3, name: 'Weligama', region: 'Southern Province' },
  { id: 4, name: 'Unawatuna', region: 'Southern Province' },
  { id: 5, name: 'Midigama', region: 'Southern Province' },
  { id: 6, name: 'Mirissa', region: 'Southern Province' },
  { id: 7, name: 'Matara', region: 'Southern Province' },
  { id: 8, name: 'Ahangama', region: 'Southern Province' },
  { id: 9, name: 'Thalpe', region: 'Southern Province' },
  { id: 10, name: 'Trincomalee', region: 'Eastern Province' },
  { id: 11, name: 'Point Pedro', region: 'Northern Province' },
  { id: 12, name: 'Kalpitiya', region: 'North Western Province' },
];

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
  { id: 11, value: 'Pollution', icon: '🗑️', severity: 'low' },
  { id: 12, value: 'Other', icon: '⚠️', severity: 'medium' },
];

// ==================== SEVERITY LEVELS ====================
export const SEVERITY_LEVELS = [
  { 
    value: 'low', 
    label: 'Low', 
    color: '#10b981',
    bgColor: '#d1fae5',
    textColor: '#065f46',
    description: 'Minor concern, manageable by most surfers'
  },
  { 
    value: 'medium', 
    label: 'Medium', 
    color: '#f59e0b',
    bgColor: '#fef3c7',
    textColor: '#92400e',
    description: 'Moderate risk, caution advised'
  },
  { 
    value: 'high', 
    label: 'High', 
    color: '#ef4444',
    bgColor: '#fee2e2',
    textColor: '#991b1b',
    description: 'Serious hazard, avoid if possible'
  },
];

// ==================== RISK LEVELS ====================
export const RISK_LEVELS = {
  LOW: {
    value: 'Low',
    range: [0, 3.3],
    color: '#10b981',
    bgColor: '#d1fae5',
    textColor: '#065f46',
    flag: 'green',
    emoji: '🟢',
    description: 'Safe conditions for most surfers',
    recommendations: [
      'Ideal for beginners',
      'Standard safety equipment sufficient',
      'Enjoy your session!',
    ],
  },
  MEDIUM: {
    value: 'Medium',
    range: [3.4, 6.6],
    color: '#f59e0b',
    bgColor: '#fef3c7',
    textColor: '#92400e',
    flag: 'yellow',
    emoji: '🟡',
    description: 'Caution advised - Check conditions carefully',
    recommendations: [
      'Intermediate+ surfers recommended',
      'Check recent hazard reports',
      'Use buddy system',
      'Be prepared for changing conditions',
    ],
  },
  HIGH: {
    value: 'High',
    range: [6.7, 10],
    color: '#ef4444',
    bgColor: '#fee2e2',
    textColor: '#991b1b',
    flag: 'red',
    emoji: '🔴',
    description: 'Dangerous conditions - Avoid surfing',
    recommendations: [
      'Advanced surfers only',
      'Multiple hazards present',
      'Consider postponing session',
      'Emergency contact ready',
    ],
  },
};

// ==================== FLAG COLORS ====================
export const FLAG_COLORS = {
  green: { 
    name: 'Green Flag', 
    description: 'Low Risk - Safe Conditions',
    emoji: '🟢',
    color: '#10b981',
  },
  yellow: { 
    name: 'Yellow Flag', 
    description: 'Medium Risk - Caution Advised',
    emoji: '🟡',
    color: '#f59e0b',
  },
  red: { 
    name: 'Red Flag', 
    description: 'High Risk - Dangerous Conditions',
    emoji: '🔴',
    color: '#ef4444',
  },
};

// ==================== EXPERIENCE LEVELS ====================
export const EXPERIENCE_LEVELS = [
  {
    value: 'beginner',
    label: 'Beginner',
    description: 'New to surfing or under 1 year experience',
    icon: '🏄‍♀️',
    riskTolerance: 'low',
  },
  {
    value: 'intermediate',
    label: 'Intermediate',
    description: '1-3 years experience, comfortable in most conditions',
    icon: '🏄',
    riskTolerance: 'medium',
  },
  {
    value: 'advanced',
    label: 'Advanced',
    description: '3+ years experience, confident in challenging conditions',
    icon: '🏄‍♂️',
    riskTolerance: 'high',
  },
];

// ==================== USER ROLES ====================
export const USER_ROLES = {
  USER: 'user',
  INSTRUCTOR: 'instructor',
  ADMIN: 'admin',
};

// ==================== MEDIA UPLOAD SETTINGS ====================
export const MEDIA_UPLOAD = {
  MAX_FILES: 5,
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_VIDEO_DURATION: 30, // 30 seconds
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
  MARKER_SIZE: {
    small: 30,
    medium: 40,
    large: 50,
  },
};

// ==================== VALIDATION RULES ====================
export const VALIDATION = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MIN_LENGTH: 2,
  DESCRIPTION_MIN_LENGTH: 10,
  DESCRIPTION_MAX_LENGTH: 500,
};

// ==================== ERROR MESSAGES ====================
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  AUTH_REQUIRED: 'Please login to continue.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  EMAIL_EXISTS: 'Email already registered.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  PASSWORD_TOO_SHORT: `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters.`,
  REQUIRED_FIELD: 'This field is required.',
  FILE_TOO_LARGE: 'File size exceeds 50MB limit.',
  INVALID_FILE_TYPE: 'Invalid file type. Please upload images or videos only.',
};

// ==================== SUCCESS MESSAGES ====================
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  REGISTER_SUCCESS: 'Registration successful!',
  REPORT_SUBMITTED: 'Hazard report submitted successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
};

// ==================== REPUTATION SYSTEM ====================
export const REPUTATION_POINTS = {
  REPORT_SUBMITTED: 5,
  REPORT_VERIFIED: 10,
  REPORT_REJECTED: -5,
  DAILY_LOGIN: 1,
  FIRST_REPORT: 20,
  HELPFUL_REPORT: 15,
};

// ==================== REFRESH INTERVALS ====================
export const REFRESH_INTERVALS = {
  RISK_SCORES: 5 * 60 * 1000, // 5 minutes
  HAZARD_REPORTS: 2 * 60 * 1000, // 2 minutes
  USER_PROFILE: 10 * 60 * 1000, // 10 minutes
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

// ==================== APP INFO ====================
export const APP_INFO = {
  NAME: 'Surf Risk Analyzer',
  VERSION: '1.0.0',
  DEVELOPER: 'RIFAQ M.A.M',
  STUDENT_ID: 'IT22901330',
  INSTITUTION: 'SLIIT',
  SUPPORT_EMAIL: 'support@surfrisk.com',
  PRIVACY_POLICY_URL: 'https://surfrisk.com/privacy',
  TERMS_URL: 'https://surfrisk.com/terms',
};

// ==================== COLORS ====================
export const COLORS = {
  primary: '#0891b2',
  secondary: '#06b6d4',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
  
  // Grays
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
  
  // Special
  white: '#ffffff',
  black: '#000000',
  transparent: 'transparent',
};

// ==================== EXPORT DEFAULT ====================
export default {
  API_CONFIG,
  SURF_SPOTS,
  HAZARD_TYPES,
  SEVERITY_LEVELS,
  RISK_LEVELS,
  FLAG_COLORS,
  EXPERIENCE_LEVELS,
  USER_ROLES,
  MEDIA_UPLOAD,
  MAP_SETTINGS,
  VALIDATION,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  REPUTATION_POINTS,
  REFRESH_INTERVALS,
  STORAGE_KEYS,
  APP_INFO,
  COLORS,
};
