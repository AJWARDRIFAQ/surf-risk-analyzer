import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../src/utils/constants';

/**
 * Storage Service
 * Wrapper around AsyncStorage for type-safe data persistence
 */

// ==================== GENERIC STORAGE FUNCTIONS ====================

/**
 * Store data in AsyncStorage
 */
export const setItem = async (key, value) => {
  try {
    // Normalize undefined to null so AsyncStorage.setItem always receives a string
    const safeValue = value === undefined ? null : value;
    const jsonValue = JSON.stringify(safeValue);
    await AsyncStorage.setItem(key, jsonValue);
    return { success: true };
  } catch (error) {
    console.error(`Error storing ${key}:`, error);
    return { success: false, error };
  }
};

/**
 * Retrieve data from AsyncStorage
 */
export const getItem = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`Error retrieving ${key}:`, error);
    return null;
  }
};

/**
 * Remove data from AsyncStorage
 */
export const removeItem = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return { success: true };
  } catch (error) {
    console.error(`Error removing ${key}:`, error);
    return { success: false, error };
  }
};

/**
 * Clear all data from AsyncStorage
 */
export const clearAll = async () => {
  try {
    await AsyncStorage.clear();
    return { success: true };
  } catch (error) {
    console.error('Error clearing storage:', error);
    return { success: false, error };
  }
};

/**
 * Get all keys in AsyncStorage
 */
export const getAllKeys = async () => {
  try {
    return await AsyncStorage.getAllKeys();
  } catch (error) {
    console.error('Error getting all keys:', error);
    return [];
  }
};

/**
 * Get multiple items at once
 */
export const multiGet = async (keys) => {
  try {
    const items = await AsyncStorage.multiGet(keys);
    return items.reduce((acc, [key, value]) => {
      acc[key] = value ? JSON.parse(value) : null;
      return acc;
    }, {});
  } catch (error) {
    console.error('Error getting multiple items:', error);
    return {};
  }
};

/**
 * Set multiple items at once
 */
export const multiSet = async (keyValuePairs) => {
  try {
    const pairs = keyValuePairs.map(([key, value]) => [
      key,
      // Convert undefined to null to avoid AsyncStorage errors
      JSON.stringify(value === undefined ? null : value),
    ]);
    await AsyncStorage.multiSet(pairs);
    return { success: true };
  } catch (error) {
    console.error('Error setting multiple items:', error);
    return { success: false, error };
  }
};

// ==================== AUTH TOKEN MANAGEMENT ====================

/**
 * Save authentication token
 */
export const saveToken = async (token) => {
  return await setItem(STORAGE_KEYS.TOKEN, token);
};

/**
 * Get authentication token
 */
export const getToken = async () => {
  return await getItem(STORAGE_KEYS.TOKEN);
};

/**
 * Remove authentication token
 */
export const removeToken = async () => {
  return await removeItem(STORAGE_KEYS.TOKEN);
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async () => {
  const token = await getToken();
  return !!token;
};

// ==================== USER DATA MANAGEMENT ====================

/**
 * Save user data
 */
export const saveUser = async (user) => {
  return await setItem(STORAGE_KEYS.USER, user);
};

/**
 * Get user data
 */
export const getUser = async () => {
  return await getItem(STORAGE_KEYS.USER);
};

/**
 * Update user data
 */
export const updateUser = async (updates) => {
  try {
    const currentUser = await getUser();
    if (!currentUser) {
      return { success: false, error: 'No user found' };
    }
    
    const updatedUser = { ...currentUser, ...updates };
    return await saveUser(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return { success: false, error };
  }
};

/**
 * Remove user data
 */
export const removeUser = async () => {
  return await removeItem(STORAGE_KEYS.USER);
};

// ==================== THEME & PREFERENCES ====================

/**
 * Save theme preference
 */
export const saveTheme = async (theme) => {
  return await setItem(STORAGE_KEYS.THEME, theme);
};

/**
 * Get theme preference
 */
export const getTheme = async () => {
  const theme = await getItem(STORAGE_KEYS.THEME);
  return theme || 'light'; // Default to light theme
};

/**
 * Save language preference
 */
export const saveLanguage = async (language) => {
  return await setItem(STORAGE_KEYS.LANGUAGE, language);
};

/**
 * Get language preference
 */
export const getLanguage = async () => {
  const language = await getItem(STORAGE_KEYS.LANGUAGE);
  return language || 'en'; // Default to English
};

// ==================== ONBOARDING ====================

/**
 * Mark onboarding as complete
 */
export const completeOnboarding = async () => {
  return await setItem(STORAGE_KEYS.ONBOARDING_COMPLETE, true);
};

/**
 * Check if onboarding is complete
 */
export const isOnboardingComplete = async () => {
  const complete = await getItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
  return !!complete;
};

/**
 * Reset onboarding status
 */
export const resetOnboarding = async () => {
  return await removeItem(STORAGE_KEYS.ONBOARDING_COMPLETE);
};

// ==================== FAVORITE SURF SPOTS ====================

/**
 * Add surf spot to favorites
 */
export const addFavoriteSpot = async (spotId) => {
  try {
    const favorites = await getFavoriteSpots();
    
    if (favorites.includes(spotId)) {
      return { success: true, message: 'Already in favorites' };
    }
    
    const updatedFavorites = [...favorites, spotId];
    return await setItem(STORAGE_KEYS.FAVORITE_SPOTS, updatedFavorites);
  } catch (error) {
    console.error('Error adding favorite spot:', error);
    return { success: false, error };
  }
};

/**
 * Remove surf spot from favorites
 */
export const removeFavoriteSpot = async (spotId) => {
  try {
    const favorites = await getFavoriteSpots();
    const updatedFavorites = favorites.filter(id => id !== spotId);
    return await setItem(STORAGE_KEYS.FAVORITE_SPOTS, updatedFavorites);
  } catch (error) {
    console.error('Error removing favorite spot:', error);
    return { success: false, error };
  }
};

/**
 * Get all favorite surf spots
 */
export const getFavoriteSpots = async () => {
  const favorites = await getItem(STORAGE_KEYS.FAVORITE_SPOTS);
  return favorites || [];
};

/**
 * Check if spot is in favorites
 */
export const isFavoriteSpot = async (spotId) => {
  const favorites = await getFavoriteSpots();
  return favorites.includes(spotId);
};

/**
 * Clear all favorite spots
 */
export const clearFavoriteSpots = async () => {
  return await removeItem(STORAGE_KEYS.FAVORITE_SPOTS);
};

// ==================== NOTIFICATION SETTINGS ====================

/**
 * Save notification settings
 */
export const saveNotificationSettings = async (settings) => {
  return await setItem(STORAGE_KEYS.NOTIFICATION_SETTINGS, settings);
};

/**
 * Get notification settings
 */
export const getNotificationSettings = async () => {
  const settings = await getItem(STORAGE_KEYS.NOTIFICATION_SETTINGS);
  return settings || {
    enabled: true,
    riskAlerts: true,
    hazardReports: true,
    systemUpdates: false,
    sound: true,
    vibrate: true,
  };
};

/**
 * Update specific notification setting
 */
export const updateNotificationSetting = async (key, value) => {
  try {
    const settings = await getNotificationSettings();
    const updatedSettings = { ...settings, [key]: value };
    return await saveNotificationSettings(updatedSettings);
  } catch (error) {
    console.error('Error updating notification setting:', error);
    return { success: false, error };
  }
};

// ==================== CACHED DATA ====================

/**
 * Cache surf spots data
 */
export const cacheSurfSpots = async (surfSpots) => {
  return await setItem('@cached_surf_spots', {
    data: surfSpots,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Get cached surf spots
 */
export const getCachedSurfSpots = async (maxAge = 5 * 60 * 1000) => {
  try {
    const cached = await getItem('@cached_surf_spots');
    
    if (!cached) return null;
    
    const age = Date.now() - new Date(cached.timestamp).getTime();
    
    if (age > maxAge) {
      await removeItem('@cached_surf_spots');
      return null;
    }
    
    return cached.data;
  } catch (error) {
    console.error('Error getting cached surf spots:', error);
    return null;
  }
};

/**
 * Cache hazard reports
 */
export const cacheHazardReports = async (reports) => {
  return await setItem('@cached_hazard_reports', {
    data: reports,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Get cached hazard reports
 */
export const getCachedHazardReports = async (maxAge = 2 * 60 * 1000) => {
  try {
    const cached = await getItem('@cached_hazard_reports');
    
    if (!cached) return null;
    
    const age = Date.now() - new Date(cached.timestamp).getTime();
    
    if (age > maxAge) {
      await removeItem('@cached_hazard_reports');
      return null;
    }
    
    return cached.data;
  } catch (error) {
    console.error('Error getting cached hazard reports:', error);
    return null;
  }
};

/**
 * Clear all cached data
 */
export const clearCache = async () => {
  try {
    const keys = await getAllKeys();
    const cacheKeys = keys.filter(key => key.startsWith('@cached_'));
    await Promise.all(cacheKeys.map(key => removeItem(key)));
    return { success: true };
  } catch (error) {
    console.error('Error clearing cache:', error);
    return { success: false, error };
  }
};

// ==================== SESSION DATA ====================

/**
 * Save session data (temporary data cleared on logout)
 */
export const saveSessionData = async (key, value) => {
  return await setItem(`@session_${key}`, value);
};

/**
 * Get session data
 */
export const getSessionData = async (key) => {
  return await getItem(`@session_${key}`);
};

/**
 * Clear all session data
 */
export const clearSessionData = async () => {
  try {
    const keys = await getAllKeys();
    const sessionKeys = keys.filter(key => key.startsWith('@session_'));
    await Promise.all(sessionKeys.map(key => removeItem(key)));
    return { success: true };
  } catch (error) {
    console.error('Error clearing session data:', error);
    return { success: false, error };
  }
};

// ==================== LOGOUT ====================

/**
 * Logout user (clear auth data but keep preferences)
 */
export const logout = async () => {
  try {
    await removeToken();
    await removeUser();
    await clearSessionData();
    await clearCache();
    return { success: true };
  } catch (error) {
    console.error('Error during logout:', error);
    return { success: false, error };
  }
};

/**
 * Full logout (clear everything)
 */
export const fullLogout = async () => {
  try {
    await clearAll();
    return { success: true };
  } catch (error) {
    console.error('Error during full logout:', error);
    return { success: false, error };
  }
};

// ==================== DRAFT DATA ====================

/**
 * Save draft hazard report
 */
export const saveDraftReport = async (draft) => {
  return await setItem('@draft_report', {
    ...draft,
    savedAt: new Date().toISOString(),
  });
};

/**
 * Get draft hazard report
 */
export const getDraftReport = async () => {
  return await getItem('@draft_report');
};

/**
 * Clear draft hazard report
 */
export const clearDraftReport = async () => {
  return await removeItem('@draft_report');
};

/**
 * Check if draft exists
 */
export const hasDraftReport = async () => {
  const draft = await getDraftReport();
  return !!draft;
};

// ==================== SEARCH HISTORY ====================

/**
 * Save search query to history
 */
export const saveSearchQuery = async (query) => {
  try {
    const history = await getSearchHistory();
    
    // Remove duplicates and add to beginning
    const updatedHistory = [
      query,
      ...history.filter(q => q !== query)
    ].slice(0, 10); // Keep only last 10 searches
    
    return await setItem('@search_history', updatedHistory);
  } catch (error) {
    console.error('Error saving search query:', error);
    return { success: false, error };
  }
};

/**
 * Get search history
 */
export const getSearchHistory = async () => {
  const history = await getItem('@search_history');
  return history || [];
};

/**
 * Clear search history
 */
export const clearSearchHistory = async () => {
  return await removeItem('@search_history');
};

// ==================== APP USAGE STATS ====================

/**
 * Track app launch
 */
export const trackAppLaunch = async () => {
  try {
    const stats = await getItem('@app_stats') || { 
      launchCount: 0, 
      lastLaunch: null,
      firstLaunch: new Date().toISOString(),
    };
    
    stats.launchCount += 1;
    stats.lastLaunch = new Date().toISOString();
    
    return await setItem('@app_stats', stats);
  } catch (error) {
    console.error('Error tracking app launch:', error);
    return { success: false, error };
  }
};

/**
 * Get app usage stats
 */
export const getAppStats = async () => {
  const stats = await getItem('@app_stats');
  return stats || { 
    launchCount: 0, 
    lastLaunch: null,
    firstLaunch: null,
  };
};

// ==================== EXPORT ALL ====================
export default {
  // Generic
  setItem,
  getItem,
  removeItem,
  clearAll,
  getAllKeys,
  multiGet,
  multiSet,
  
  // Auth
  saveToken,
  getToken,
  removeToken,
  isAuthenticated,
  
  // User
  saveUser,
  getUser,
  updateUser,
  removeUser,
  
  // Preferences
  saveTheme,
  getTheme,
  saveLanguage,
  getLanguage,
  
  // Onboarding
  completeOnboarding,
  isOnboardingComplete,
  resetOnboarding,
  
  // Favorites
  addFavoriteSpot,
  removeFavoriteSpot,
  getFavoriteSpots,
  isFavoriteSpot,
  clearFavoriteSpots,
  
  // Notifications
  saveNotificationSettings,
  getNotificationSettings,
  updateNotificationSetting,
  
  // Cache
  cacheSurfSpots,
  getCachedSurfSpots,
  cacheHazardReports,
  getCachedHazardReports,
  clearCache,
  
  // Session
  saveSessionData,
  getSessionData,
  clearSessionData,
  
  // Logout
  logout,
  fullLogout,
  
  // Drafts
  saveDraftReport,
  getDraftReport,
  clearDraftReport,
  hasDraftReport,
  
  // Search
  saveSearchQuery,
  getSearchHistory,
  clearSearchHistory,
  
  // Stats
  trackAppLaunch,
  getAppStats,
};