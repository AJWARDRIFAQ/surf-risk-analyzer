// import React, { useState, useEffect } from 'react';
// import { ActivityIndicator, View } from 'react-native';
// import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
// import { getToken } from '../services/auth';

// // Import Screens
// import LoginScreen from '../screens/LoginScreen';
// import RegisterScreen from '../screens/RegisterScreen';
// import HomeScreen from '../screens/HomeScreen';
// import RiskAnalyzerScreen from '../screens/RiskAnalyzerScreen';
// import ReportHazardScreen from '../screens/ReportHazardScreen';

// const Stack = createStackNavigator();

// /**
//  * AppNavigator Component
//  * Main navigation controller with authentication flow
//  */
// const AppNavigator = () => {
//   const [isLoading, setIsLoading] = useState(true);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   useEffect(() => {
//     checkAuthStatus();
//   }, []);

//   /**
//    * Check if user is already logged in
//    */
//   const checkAuthStatus = async () => {
//     try {
//       const token = await getToken();
//       setIsAuthenticated(!!token);
//     } catch (error) {
//       console.error('Auth check error:', error);
//       setIsAuthenticated(false);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   /**
//    * Show loading screen while checking auth
//    */
//   if (isLoading) {
//     return (
//       <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0891b2' }}>
//         <ActivityIndicator size="large" color="white" />
//       </View>
//     );
//   }

//   return (
//     <NavigationContainer>
//       <Stack.Navigator
//         initialRouteName={isAuthenticated ? 'Home' : 'Login'}
//         screenOptions={{
//           headerStyle: {
//             backgroundColor: '#0891b2',
//             elevation: 0,
//             shadowOpacity: 0,
//           },
//           headerTintColor: '#fff',
//           headerTitleStyle: {
//             fontWeight: 'bold',
//             fontSize: 18,
//           },
//           headerTitleAlign: 'center',
//           cardStyle: { backgroundColor: '#f9fafb' },
//         }}
//       >
//         {/* Auth Stack */}
//         {!isAuthenticated ? (
//           <>
//             <Stack.Screen 
//               name="Login" 
//               component={LoginScreen}
//               options={{ headerShown: false }}
//             />
//             <Stack.Screen 
//               name="Register" 
//               component={RegisterScreen}
//               options={{ 
//                 headerShown: false,
//                 animationEnabled: true,
//               }}
//             />
//           </>
//         ) : (
//           /* Main App Stack */
//           <>
//             <Stack.Screen 
//               name="Home" 
//               component={HomeScreen}
//               options={{ 
//                 title: 'Surf Risk Analyzer',
//                 headerLeft: null, // Disable back button
//               }}
//             />
//             <Stack.Screen 
//               name="RiskAnalyzer" 
//               component={RiskAnalyzerScreen}
//               options={{ 
//                 title: 'Risk Analyzer',
//                 headerBackTitle: 'Back',
//               }}
//             />
//             <Stack.Screen 
//               name="ReportHazard" 
//               component={ReportHazardScreen}
//               options={{ 
//                 title: 'Report Hazard',
//                 headerBackTitle: 'Back',
//               }}
//             />
//           </>
//         )}
//       </Stack.Navigator>
//     </NavigationContainer>
//   );
// };

// export default AppNavigator;