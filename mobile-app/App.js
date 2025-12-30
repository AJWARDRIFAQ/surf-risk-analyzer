import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import RiskAnalyzerScreen from './screens/RiskAnalyzerScreen';
import ReportHazardScreen from './screens/ReportHazardScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="RiskAnalyzer"
          screenOptions={{
            headerStyle: {
              backgroundColor: '#0891b2',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        >
          <Stack.Screen 
            name="RiskAnalyzer" 
            component={RiskAnalyzerScreen}
            options={{ title: 'Surf Risk Analyzer' }}
          />
          <Stack.Screen 
            name="ReportHazard" 
            component={ReportHazardScreen}
            options={{ title: 'Report Hazard' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
