import { Alert } from 'react-native';
import { 
  VALIDATION, 
  ERROR_MESSAGES, 
  RISK_LEVELS,
  SEVERITY_LEVELS 
} from './constants';

/**
 * Utility Helper Functions
 * Collection of reusable helper functions for the app
 */

// ==================== VALIDATION HELPERS ====================

/**
 * Validate email address
 */
export const validateEmail = (email) => {
  if (!email) {
    return { valid: false, message: ERROR_MESSAGES.REQUIRED_FIELD };
  }
  
  if (!VALIDATION.EMAIL_REGEX.test(email)) {
    return { valid: false, message: ERROR_MESSAGES.INVALID_EMAIL };
  }
  
  return { valid: true };
};

/**
 * Validate password
 */
export const validatePassword = (password) => {
  if (!password) {
    return { valid: false, message: ERROR_MESSAGES.REQUIRED_FIELD };
  }
  
  if (password.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    return { valid: false, message: ERROR_MESSAGES.PASSWORD_TOO_SHORT };
  }
  
  return { valid: true };
};

/**
 * Validate name
 */
export const validateName = (name) => {
  if (!name || name.trim().length < VALIDATION.NAME_MIN_LENGTH) {
    return { valid: false, message: 'Name must be at least 2 characters' };
  }
  
  return { valid: true };
};

/**
 * Validate description
 */
export const validateDescription = (description) => {
  if (!description || description.trim().length < VALIDATION.DESCRIPTION_MIN_LENGTH) {
    return { 
      valid: false, 
      message: `Description must be at least ${VALIDATION.DESCRIPTION_MIN_LENGTH} characters` 
    };
  }
  
  if (description.length > VALIDATION.DESCRIPTION_MAX_LENGTH) {
    return { 
      valid: false, 
      message: `Description cannot exceed ${VALIDATION.DESCRIPTION_MAX_LENGTH} characters` 
    };
  }
  
  return { valid: true };
};

// ==================== DATE/TIME HELPERS ====================

/**
 * Format date to readable string
 */
export const formatDate = (dateString, format = 'full') => {
  const date = new Date(dateString);
  
  if (isNaN(date.getTime())) {
    return 'Invalid date';
  }
  
  const options = {
    full: { year: 'numeric', month: 'long', day: 'numeric' },
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    time: { hour: '2-digit', minute: '2-digit' },
    datetime: { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit', 
      minute: '2-digit' 
    },
  };
  
  return date.toLocaleDateString('en-US', options[format] || options.full);
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  
  if (diffSeconds < 60) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffWeeks < 4) return `${diffWeeks}w ago`;
  if (diffMonths < 12) return `${diffMonths}mo ago`;
  
  return formatDate(dateString, 'short');
};

/**
 * Check if date is today
 */
export const isToday = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  
  return date.toDateString() === today.toDateString();
};

/**
 * Check if date is within last 24 hours
 */
export const isRecent = (dateString, hours = 24) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffHours = diffMs / (1000 * 60 * 60);
  
  return diffHours <= hours;
};

// ==================== RISK CALCULATION HELPERS ====================

/**
 * Get risk level from score
 */
export const getRiskLevelFromScore = (score) => {
  if (score <= 3.3) return RISK_LEVELS.LOW;
  if (score <= 6.6) return RISK_LEVELS.MEDIUM;
  return RISK_LEVELS.HIGH;
};

/**
 * Get flag color from risk score
 */
export const getFlagColorFromScore = (score) => {
  if (score <= 3.3) return 'green';
  if (score <= 6.6) return 'yellow';
  return 'red';
};

/**
 * Get risk emoji from score
 */
export const getRiskEmoji = (score) => {
  if (score <= 3.3) return '🟢';
  if (score <= 6.6) return '🟡';
  return '🔴';
};

/**
 * Calculate average risk score
 */
export const calculateAverageRisk = (surfSpots) => {
  if (!surfSpots || surfSpots.length === 0) return 0;
  
  const sum = surfSpots.reduce((acc, spot) => acc + (spot.riskScore || 0), 0);
  return (sum / surfSpots.length).toFixed(2);
};

/**
 * Get severity object from value
 */
export const getSeverityLevel = (severityValue) => {
  return SEVERITY_LEVELS.find(level => level.value === severityValue) || SEVERITY_LEVELS[0];
};

// ==================== STRING HELPERS ====================

/**
 * Capitalize first letter
 */
export const capitalizeFirst = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

/**
 * Truncate text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Format number with commas
 */
export const formatNumber = (num) => {
  if (num === undefined || num === null) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

/**
 * Generate initials from name
 */
export const getInitials = (name) => {
  if (!name) return '??';
  
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

// ==================== FILE HELPERS ====================

/**
 * Format file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  if (!bytes) return 'Unknown';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get file extension
 */
export const getFileExtension = (filename) => {
  if (!filename) return '';
  return filename.split('.').pop().toLowerCase();
};

/**
 * Check if file is image
 */
export const isImageFile = (filename) => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'];
  const ext = getFileExtension(filename);
  return imageExtensions.includes(ext);
};

/**
 * Check if file is video
 */
export const isVideoFile = (filename) => {
  const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
  const ext = getFileExtension(filename);
  return videoExtensions.includes(ext);
};

// ==================== ALERT HELPERS ====================

/**
 * Show success alert
 */
export const showSuccessAlert = (message, onPress = null) => {
  Alert.alert(
    'Success',
    message,
    [{ text: 'OK', onPress }],
    { cancelable: false }
  );
};

/**
 * Show error alert
 */
export const showErrorAlert = (message, onPress = null) => {
  Alert.alert(
    'Error',
    message,
    [{ text: 'OK', onPress }],
    { cancelable: false }
  );
};

/**
 * Show confirmation alert
 */
export const showConfirmAlert = (title, message, onConfirm, onCancel = null) => {
  Alert.alert(
    title,
    message,
    [
      {
        text: 'Cancel',
        style: 'cancel',
        onPress: onCancel,
      },
      {
        text: 'Confirm',
        onPress: onConfirm,
      },
    ],
    { cancelable: false }
  );
};

// ==================== ARRAY HELPERS ====================

/**
 * Remove duplicates from array
 */
export const removeDuplicates = (array, key = null) => {
  if (!key) {
    return [...new Set(array)];
  }
  
  return array.filter((item, index, self) =>
    index === self.findIndex(t => t[key] === item[key])
  );
};

/**
 * Sort array by key
 */
export const sortByKey = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    if (order === 'asc') {
      return a[key] > b[key] ? 1 : -1;
    } else {
      return a[key] < b[key] ? 1 : -1;
    }
  });
};

/**
 * Group array by key
 */
export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

// ==================== COORDINATE HELPERS ====================

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance; // Returns distance in km
};

/**
 * Convert degrees to radians
 */
const toRad = (degrees) => {
  return degrees * (Math.PI / 180);
};

/**
 * Find nearest surf spot
 */
export const findNearestSpot = (currentLat, currentLon, surfSpots) => {
  if (!surfSpots || surfSpots.length === 0) return null;
  
  let nearest = surfSpots[0];
  let minDistance = calculateDistance(
    currentLat,
    currentLon,
    surfSpots[0].coordinates.latitude,
    surfSpots[0].coordinates.longitude
  );
  
  surfSpots.forEach(spot => {
    const distance = calculateDistance(
      currentLat,
      currentLon,
      spot.coordinates.latitude,
      spot.coordinates.longitude
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      nearest = spot;
    }
  });
  
  return { spot: nearest, distance: minDistance };
};

// ==================== EXPORT ALL ====================
export default {
  // Validation
  validateEmail,
  validatePassword,
  validateName,
  validateDescription,
  
  // Date/Time
  formatDate,
  getRelativeTime,
  isToday,
  isRecent,
  
  // Risk
  getRiskLevelFromScore,
  getFlagColorFromScore,
  getRiskEmoji,
  calculateAverageRisk,
  getSeverityLevel,
  
  // String
  capitalizeFirst,
  truncateText,
  formatNumber,
  getInitials,
  
  // File
  formatFileSize,
  getFileExtension,
  isImageFile,
  isVideoFile,
  
  // Alert
  showSuccessAlert,
  showErrorAlert,
  showConfirmAlert,
  
  // Array
  removeDuplicates,
  sortByKey,
  groupBy,
  
  // Coordinates
  calculateDistance,
  findNearestSpot,
};