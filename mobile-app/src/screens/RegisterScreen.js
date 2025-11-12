// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   Alert,
//   ActivityIndicator,
//   ScrollView,
// } from 'react-native';
// import { Picker } from '@react-native-picker/picker';
// import { authAPI } from '../services/api';
// import { saveToken, saveUser } from '../services/auth';

// export default function RegisterScreen({ navigation }) {
//   const [formData, setFormData] = useState({
//     name: '',
//     email: '',
//     password: '',
//     confirmPassword: '',
//     experienceLevel: 'beginner'
//   });
//   const [loading, setLoading] = useState(false);

//   const handleRegister = async () => {
//     if (!formData.name || !formData.email || !formData.password) {
//       Alert.alert('Error', 'Please fill in all fields');
//       return;
//     }

//     if (formData.password !== formData.confirmPassword) {
//       Alert.alert('Error', 'Passwords do not match');
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await authAPI.register({
//         name: formData.name,
//         email: formData.email,
//         password: formData.password,
//         experienceLevel: formData.experienceLevel
//       });
      
//       if (response.data.success) {
//         await saveToken(response.data.token);
//         await saveUser(response.data.user);
//         navigation.replace('Home');
//       }
//     } catch (error) {
//       Alert.alert('Registration Failed', error.response?.data?.message || 'An error occurred');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <ScrollView className="flex-1 bg-cyan-600">
//       <View className="flex-1 justify-center px-6 py-12">
//         <View className="bg-white rounded-3xl p-8 shadow-lg">
//           <Text className="text-3xl font-bold text-cyan-600 text-center mb-2">
//             Create Account
//           </Text>
//           <Text className="text-gray-500 text-center mb-6">
//             Join our surf safety community
//           </Text>

//           <TextInput
//             className="bg-gray-100 rounded-xl px-4 py-3 mb-4 text-base"
//             placeholder="Full Name"
//             value={formData.name}
//             onChangeText={(text) => setFormData({...formData, name: text})}
//           />

//           <TextInput
//             className="bg-gray-100 rounded-xl px-4 py-3 mb-4 text-base"
//             placeholder="Email"
//             value={formData.email}
//             onChangeText={(text) => setFormData({...formData, email: text})}
//             autoCapitalize="none"
//             keyboardType="email-address"
//           />

//           <TextInput
//             className="bg-gray-100 rounded-xl px-4 py-3 mb-4 text-base"
//             placeholder="Password"
//             value={formData.password}
//             onChangeText={(text) => setFormData({...formData, password: text})}
//             secureTextEntry
//           />

//           <TextInput
//             className="bg-gray-100 rounded-xl px-4 py-3 mb-4 text-base"
//             placeholder="Confirm Password"
//             value={formData.confirmPassword}
//             onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
//             secureTextEntry
//           />

//           <View className="bg-gray-100 rounded-xl mb-6">
//             <Text className="text-gray-600 px-4 pt-2 text-sm">Experience Level</Text>
//             <Picker
//               selectedValue={formData.experienceLevel}
//               onValueChange={(value) => setFormData({...formData, experienceLevel: value})}
//             >
//               <Picker.Item label="Beginner" value="beginner" />
//               <Picker.Item label="Intermediate" value="intermediate" />
//               <Picker.Item label="Advanced" value="advanced" />
//             </Picker>
//           </View>

//           <TouchableOpacity
//             className="bg-cyan-600 rounded-xl py-4 mb-4"
//             onPress={handleRegister}
//             disabled={loading}
//           >
//             {loading ? (
//               <ActivityIndicator color="white" />
//             ) : (
//               <Text className="text-white text-center font-semibold text-lg">
//                 Register
//               </Text>
//             )}
//           </TouchableOpacity>

//           <TouchableOpacity
//             onPress={() => navigation.goBack()}
//           >
//             <Text className="text-cyan-600 text-center">
//               Already have an account? <Text className="font-semibold">Login</Text>
//             </Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </ScrollView>
//   );
// }