// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   TouchableOpacity,
//   ScrollView,
//   ActivityIndicator,
// } from 'react-native';
// import { getUser } from '../services/auth';

// export default function HomeScreen({ navigation }) {
//   const [user, setUser] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     loadUser();
//   }, []);

//   const loadUser = async () => {
//     const userData = await getUser();
//     setUser(userData);
//     setLoading(false);
//   };

//   if (loading) {
//     return (
//       <View className="flex-1 justify-center items-center bg-gray-50">
//         <ActivityIndicator size="large" color="#0891b2" />
//       </View>
//     );
//   }

//   return (
//     <ScrollView className="flex-1 bg-gray-50">
//       <View className="p-6">
//         {/* Welcome Card */}
//         <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm">
//           <Text className="text-2xl font-bold text-gray-800 mb-2">
//             Welcome, {user?.name}!
//           </Text>
//           <Text className="text-gray-600">
//             Experience Level: <Text className="font-semibold capitalize">{user?.experienceLevel}</Text>
//           </Text>
//           <Text className="text-gray-600">
//             Reputation Score: <Text className="font-semibold text-cyan-600">{user?.reputationScore || 0}</Text>
//           </Text>
//         </View>

//         {/* Risk Analyzer Button */}
//         <TouchableOpacity
//           className="bg-cyan-600 rounded-2xl p-6 mb-4 shadow-md"
//           onPress={() => navigation.navigate('RiskAnalyzer')}
//         >
//           <Text className="text-white text-xl font-bold mb-2">
//             🌊 Risk Analyzer
//           </Text>
//           <Text className="text-cyan-100">
//             View real-time risk scores and safety alerts for all surf spots
//           </Text>
//         </TouchableOpacity>

//         {/* Quick Actions */}
//         <View className="flex-row justify-between mb-6">
//           <TouchableOpacity
//             className="bg-white rounded-xl p-4 flex-1 mr-2 shadow-sm"
//             onPress={() => navigation.navigate('ReportHazard')}
//           >
//             <Text className="text-2xl mb-2">⚠️</Text>
//             <Text className="text-gray-800 font-semibold">Report Hazard</Text>
//           </TouchableOpacity>

//           <TouchableOpacity
//             className="bg-white rounded-xl p-4 flex-1 ml-2 shadow-sm"
//           >
//             <Text className="text-2xl mb-2">📊</Text>
//             <Text className="text-gray-800 font-semibold">My Reports</Text>
//           </TouchableOpacity>
//         </View>

//         {/* Safety Tips */}
//         <View className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
//           <Text className="text-lg font-bold text-amber-800 mb-3">
//             🏄 Safety Tips
//           </Text>
//           <Text className="text-amber-700 mb-2">• Always check risk scores before surfing</Text>
//           <Text className="text-amber-700 mb-2">• Report hazards to help the community</Text>
//           <Text className="text-amber-700 mb-2">• Wear booties to prevent reef cuts</Text>
//           <Text className="text-amber-700">• Use the buddy system</Text>
//         </View>
//       </View>
//     </ScrollView>
//   );
// }