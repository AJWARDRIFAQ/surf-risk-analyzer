// import AsyncStorage from '@react-native-async-storage/async-storage';

// export const saveToken = async (token) => {
//   try {
//     await AsyncStorage.setItem('token', token);
//   } catch (error) {
//     console.error('Error saving token:', error);
//   }
// };

// export const getToken = async () => {
//   try {
//     return await AsyncStorage.getItem('token');
//   } catch (error) {
//     console.error('Error getting token:', error);
//     return null;
//   }
// };

// export const removeToken = async () => {
//   try {
//     await AsyncStorage.removeItem('token');
//   } catch (error) {
//     console.error('Error removing token:', error);
//   }
// };

// export const saveUser = async (user) => {
//   try {
//     await AsyncStorage.setItem('user', JSON.stringify(user));
//   } catch (error) {
//     console.error('Error saving user:', error);
//   }
// };

// export const getUser = async () => {
//   try {
//     const user = await AsyncStorage.getItem('user');
//     return user ? JSON.parse(user) : null;
//   } catch (error) {
//     console.error('Error getting user:', error);
//     return null;
//   }
// };

// // ===== mobile-app/src/utils/constants.js =====
// export const SURF_SPOTS = [
//   'Arugam Bay',
//   'Hikkaduwa',
//   'Weligama',
//   'Unawatuna',
//   'Midigama',
//   'Mirissa',
//   'Matara',
//   'Ahangama',
//   'Thalpe',
//   'Trincomalee',
//   'Point Pedro',
//   'Kalpitiya'
// ];

// export const HAZARD_TYPES = [
//   'Rip Current',
//   'High Surf',
//   'Reef Cuts',
//   'Jellyfish',
//   'Sea Urchins',
//   'Strong Winds',
//   'Poor Visibility',
//   'Overcrowding',
//   'Equipment Issues',
//   'Marine Life',
//   'Other'
// ];

// export const SEVERITY_LEVELS = [
//   { value: 'low', label: 'Low', color: '#10b981' },
//   { value: 'medium', label: 'Medium', color: '#f59e0b' },
//   { value: 'high', label: 'High', color: '#ef4444' }
// ];

// export const FLAG_COLORS = {
//   green: { name: 'Green Flag', description: 'Low Risk - Safe Conditions' },
//   yellow: { name: 'Yellow Flag', description: 'Medium Risk - Caution Advised' },
//   red: { name: 'Red Flag', description: 'High Risk - Dangerous Conditions' }
// };