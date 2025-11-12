// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Alert,
//   ActivityIndicator,
//   KeyboardAvoidingView,
//   Platform,
// } from 'react-native';
// import { authAPI } from '../services/api';
// import { saveToken, saveUser } from '../services/auth';

// export default function LoginScreen({ navigation }) {
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleLogin = async () => {
//     if (!email || !password) {
//       Alert.alert('Error', 'Please fill in all fields');
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await authAPI.login({ email, password });
      
//       if (response.data.success) {
//         await saveToken(response.data.token);
//         await saveUser(response.data.user);
//         navigation.replace('Home');
//       }
//     } catch (error) {
//       Alert.alert('Login Failed', error.response?.data?.message || 'An error occurred');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <KeyboardAvoidingView
//       behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//       className="flex-1 bg-cyan-600"
//     >
//       <View className="flex-1 justify-center px-6">
//         <View className="bg-white rounded-3xl p-8 shadow-lg">
//           <Text className="text-3xl font-bold text-cyan-600 text-center mb-2">
//             Surf Risk Analyzer
//           </Text>
//           <Text className="text-gray-500 text-center mb-8">
//             Stay Safe in the Waves
//           </Text>

//           <TextInput
//             className="bg-gray-100 rounded-xl px-4 py-3 mb-4 text-base"
//             placeholder="Email"
//             value={email}
//             onChangeText={setEmail}
//             autoCapitalize="none"
//             keyboardType="email-address"
//           />

//           <TextInput
//             className="bg-gray-100 rounded-xl px-4 py-3 mb-6 text-base"
//             placeholder="Password"
//             value={password}
//             onChangeText={setPassword}
//             secureTextEntry
//           />

//           <TouchableOpacity
//             className="bg-cyan-600 rounded-xl py-4 mb-4"
//             onPress={handleLogin}
//             disabled={loading}
//           >
//             {loading ? (
//               <ActivityIndicator color="white" />
//             ) : (
//               <Text className="text-white text-center font-semibold text-lg">
//                 Login
//               </Text>
//             )}
//           </TouchableOpacity>

//           <TouchableOpacity
//             onPress={() => navigation.navigate('Register')}
//           >
//             <Text className="text-cyan-600 text-center">
//               Don't have an account? <Text className="font-semibold">Register</Text>
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </KeyboardAvoidingView>
//   );
// }
