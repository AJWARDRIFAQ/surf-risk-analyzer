import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StyleSheet,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { surfSpotsAPI } from '../services/api';

export default function RiskAnalyzerScreen({ navigation }) {
  const [surfSpots, setSurfSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('overall'); // 'overall', 'beginner', 'intermediate', 'advanced'

  useEffect(() => {
    loadSurfSpots();
  }, []);

  const loadSurfSpots = async () => {
    try {
      const response = await surfSpotsAPI.getAll();
      if (response.data.success) {
        setSurfSpots(response.data.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load surf spots');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSurfSpots();
  };

  const getFlagEmoji = (color) => {
    switch(color) {
      case 'green': return '🟢';
      case 'yellow': return '🟡';
      case 'red': return '🔴';
      default: return '⚪';
    }
  };

  const getMarkerColor = (flagColor) => {
    switch(flagColor) {
      case 'green': return '#10b981';
      case 'yellow': return '#f59e0b';
      case 'red': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Get risk data based on selected skill level
  const getRiskData = (spot) => {
    if (selectedSkillLevel === 'overall') {
      return {
        score: spot.riskScore,
        level: spot.riskLevel,
        flag: spot.flagColor,
        incidents: spot.totalIncidents
      };
    } else {
      const skillData = spot.skillLevelRisks?.[selectedSkillLevel];
      return skillData || {
        score: spot.riskScore,
        level: spot.riskLevel,
        flag: spot.flagColor,
        incidents: 0
      };
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0891b2" />
        <Text style={styles.loadingText}>Loading risk data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Skill Level Selector */}
      <View style={styles.skillSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { value: 'overall', label: 'Overall', icon: '📊' },
            { value: 'beginner', label: 'Beginner', icon: '🏄‍♀️' },
            { value: 'intermediate', label: 'Intermediate', icon: '🏄' },
            { value: 'advanced', label: 'Advanced', icon: '🏄‍♂️' }
          ].map((skill) => (
            <TouchableOpacity
              key={skill.value}
              style={[
                styles.skillButton,
                selectedSkillLevel === skill.value && styles.skillButtonActive
              ]}
              onPress={() => setSelectedSkillLevel(skill.value)}
            >
              <Text style={styles.skillIcon}>{skill.icon}</Text>
              <Text style={[
                styles.skillButtonText,
                selectedSkillLevel === skill.value && styles.skillButtonTextActive
              ]}>
                {skill.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: 7.8731,
            longitude: 80.7718,
            latitudeDelta: 3.5,
            longitudeDelta: 3.5,
          }}
        >
          {surfSpots.map((spot) => {
            const riskData = getRiskData(spot);
            return (
              <Marker
                key={spot._id}
                coordinate={{
                  latitude: spot.coordinates.latitude,
                  longitude: spot.coordinates.longitude,
                }}
                pinColor={getMarkerColor(riskData.flag)}
              >
                <Callout>
                  <View style={styles.callout}>
                    <Text style={styles.calloutTitle}>{spot.name}</Text>
                    <Text style={styles.calloutSkill}>
                      {selectedSkillLevel === 'overall' ? 'Overall Risk' : `${selectedSkillLevel.charAt(0).toUpperCase() + selectedSkillLevel.slice(1)} Risk`}
                    </Text>
                    <Text>{getFlagEmoji(riskData.flag)} {riskData.level}</Text>
                    <Text>Score: {riskData.score}/10</Text>
                    {selectedSkillLevel !== 'overall' && (
                      <Text style={styles.calloutIncidents}>Incidents: {riskData.incidents}</Text>
                    )}
                  </View>
                </Callout>
              </Marker>
            );
          })}
        </MapView>
      </View>

      {/* Surf Spots List */}
      <ScrollView
        style={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {selectedSkillLevel === 'overall' ? 'Overall' : selectedSkillLevel.charAt(0).toUpperCase() + selectedSkillLevel.slice(1)} Risk Status
          </Text>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {surfSpots.map((spot) => {
          const riskData = getRiskData(spot);
          return (
            <View
              key={spot._id}
              style={[
                styles.spotCard,
                { borderLeftColor: getMarkerColor(riskData.flag) }
              ]}
            >
              <View style={styles.spotHeader}>
                <View style={styles.spotInfo}>
                  <Text style={styles.spotName}>
                    {getFlagEmoji(riskData.flag)} {spot.name}
                  </Text>
                  <Text style={styles.spotLocation}>{spot.location}</Text>
                  
                  <View style={[
                    styles.riskBadge,
                    { backgroundColor: riskData.level === 'High' ? '#fee2e2' : riskData.level === 'Medium' ? '#fef3c7' : '#d1fae5' }
                  ]}>
                    <Text style={[
                      styles.riskBadgeText,
                      { color: riskData.level === 'High' ? '#991b1b' : riskData.level === 'Medium' ? '#92400e' : '#065f46' }
                    ]}>
                      {riskData.level} Risk
                    </Text>
                  </View>

                  {/* Show all skill levels if overall is selected */}
                  {selectedSkillLevel === 'overall' && spot.skillLevelRisks && (
                    <View style={styles.skillBreakdown}>
                      <Text style={styles.skillBreakdownTitle}>By Skill Level:</Text>
                      <Text style={styles.skillBreakdownItem}>
                        🏄‍♀️ Beginner: {spot.skillLevelRisks.beginner?.riskScore}/10 {getFlagEmoji(spot.skillLevelRisks.beginner?.flagColor)}
                      </Text>
                      <Text style={styles.skillBreakdownItem}>
                        🏄 Intermediate: {spot.skillLevelRisks.intermediate?.riskScore}/10 {getFlagEmoji(spot.skillLevelRisks.intermediate?.flagColor)}
                      </Text>
                      <Text style={styles.skillBreakdownItem}>
                        🏄‍♂️ Advanced: {spot.skillLevelRisks.advanced?.riskScore}/10 {getFlagEmoji(spot.skillLevelRisks.advanced?.flagColor)}
                      </Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.riskScore}>
                  <Text style={styles.riskScoreValue}>{riskData.score}</Text>
                  <Text style={styles.riskScoreLabel}>/ 10</Text>
                </View>
              </View>

              <View style={styles.spotFooter}>
                {selectedSkillLevel !== 'overall' && (
                  <Text style={styles.footerText}>
                    Incidents ({selectedSkillLevel}): {riskData.incidents}
                  </Text>
                )}
                <Text style={styles.footerText}>
                  Total Incidents: {spot.totalIncidents || 0}
                </Text>
                <Text style={styles.footerText}>
                  Updated: {new Date(spot.lastUpdated).toLocaleDateString()}
                </Text>
              </View>
            </View>
          );
        })}

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Risk Level Guide</Text>
          
          <View style={styles.legendItem}>
            <Text style={styles.legendEmoji}>🟢</Text>
            <View>
              <Text style={styles.legendLabel}>Green Flag - Low Risk</Text>
              <Text style={styles.legendDesc}>Safe for this skill level</Text>
            </View>
          </View>

          <View style={styles.legendItem}>
            <Text style={styles.legendEmoji}>🟡</Text>
            <View>
              <Text style={styles.legendLabel}>Yellow Flag - Medium Risk</Text>
              <Text style={styles.legendDesc}>Caution advised for this skill level</Text>
            </View>
          </View>

          <View style={styles.legendItem}>
            <Text style={styles.legendEmoji}>🔴</Text>
            <View>
              <Text style={styles.legendLabel}>Red Flag - High Risk</Text>
              <Text style={styles.legendDesc}>Dangerous for this skill level</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Report Hazard Button */}
      <TouchableOpacity
        style={styles.fabButton}
        onPress={() => navigation.navigate('ReportHazard')}
      >
        <Text style={styles.fabText}>⚠️</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 16, color: '#6b7280' },
  
  // Skill Selector Styles
  skillSelector: { 
    backgroundColor: 'white', 
    paddingVertical: 12, 
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3
  },
  skillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 2,
    borderColor: '#e5e7eb'
  },
  skillButtonActive: {
    backgroundColor: '#e0f2fe',
    borderColor: '#0891b2'
  },
  skillIcon: { fontSize: 18, marginRight: 6 },
  skillButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280'
  },
  skillButtonTextActive: {
    color: '#0891b2'
  },
  
  mapContainer: { height: '35%' },
  map: { flex: 1 },
  callout: { padding: 8, minWidth: 150 },
  calloutTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 4 },
  calloutSkill: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  calloutIncidents: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
  
  listContainer: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  refreshButton: { backgroundColor: '#0891b2', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  refreshButtonText: { color: 'white', fontWeight: '600', fontSize: 13 },
  
  spotCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, borderLeftWidth: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
  spotHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  spotInfo: { flex: 1 },
  spotName: { fontSize: 17, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  spotLocation: { fontSize: 13, color: '#6b7280', marginBottom: 8 },
  riskBadge: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 8 },
  riskBadgeText: { fontSize: 12, fontWeight: '600' },
  
  skillBreakdown: { 
    marginTop: 12, 
    paddingTop: 12, 
    borderTopWidth: 1, 
    borderTopColor: '#f3f4f6' 
  },
  skillBreakdownTitle: { 
    fontSize: 12, 
    fontWeight: '600', 
    color: '#6b7280', 
    marginBottom: 6 
  },
  skillBreakdownItem: { 
    fontSize: 11, 
    color: '#374151', 
    marginBottom: 3 
  },
  
  riskScore: { alignItems: 'flex-end' },
  riskScoreValue: { fontSize: 32, fontWeight: 'bold', color: '#1f2937' },
  riskScoreLabel: { fontSize: 12, color: '#9ca3af' },
  
  spotFooter: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  footerText: { fontSize: 11, color: '#6b7280', marginBottom: 3 },
  
  legend: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginTop: 8, marginBottom: 24 },
  legendTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  legendEmoji: { fontSize: 24, marginRight: 12 },
  legendLabel: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  legendDesc: { fontSize: 12, color: '#6b7280' },
  
  fabButton: { position: 'absolute', bottom: 24, right: 24, backgroundColor: '#ef4444', width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 8 },
  fabText: { fontSize: 32 },
});