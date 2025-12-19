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
import { 
  getRiskLevelForSkill, 
  getMarkerColor, 
  formatRelativeDate,
  getThresholdRanges 
} from '../utils/helpers';

export default function RiskAnalyzerScreen({ navigation }) {
  const [surfSpots, setSurfSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('overall');

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
      if (skillData) {
        return {
          score: skillData.riskScore,
          level: skillData.riskLevel,
          flag: skillData.flagColor,
          incidents: skillData.incidents
        };
      }
      // Fallback to overall if skill data not available
      return {
        score: spot.riskScore,
        level: spot.riskLevel,
        flag: spot.flagColor,
        incidents: 0
      };
    }
  };

  const getSkillIcon = (skill) => {
    switch(skill) {
      case 'overall': return '📊';
      case 'beginner': return '🏄‍♀️';
      case 'intermediate': return '🏄';
      case 'advanced': return '🏄‍♂️';
      default: return '📊';
    }
  };

  const getSkillLabel = (skill) => {
    switch(skill) {
      case 'overall': return 'Overall';
      case 'beginner': return 'Beginner';
      case 'intermediate': return 'Intermediate';
      case 'advanced': return 'Advanced';
      default: return 'Overall';
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

  // Get threshold ranges for current skill level
  const thresholds = getThresholdRanges(selectedSkillLevel);

  return (
    <View style={styles.container}>
      {/* Skill Level Selector */}
      <View style={styles.skillSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['overall', 'beginner', 'intermediate', 'advanced'].map((skill) => (
            <TouchableOpacity
              key={skill}
              style={[
                styles.skillButton,
                selectedSkillLevel === skill && styles.skillButtonActive
              ]}
              onPress={() => setSelectedSkillLevel(skill)}
            >
              <Text style={styles.skillIcon}>{getSkillIcon(skill)}</Text>
              <Text style={[
                styles.skillButtonText,
                selectedSkillLevel === skill && styles.skillButtonTextActive
              ]}>
                {getSkillLabel(skill)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Threshold Info Banner */}
      <View style={styles.thresholdBanner}>
        <Text style={styles.thresholdTitle}>
          {getSkillLabel(selectedSkillLevel)} Risk Thresholds
        </Text>
        <View style={styles.thresholdRow}>
          <View style={styles.thresholdItem}>
            <Text style={styles.thresholdEmoji}>🟢</Text>
            <Text style={styles.thresholdText}>{thresholds.low.label}</Text>
          </View>
          <View style={styles.thresholdItem}>
            <Text style={styles.thresholdEmoji}>🟡</Text>
            <Text style={styles.thresholdText}>{thresholds.medium.label}</Text>
          </View>
          <View style={styles.thresholdItem}>
            <Text style={styles.thresholdEmoji}>🔴</Text>
            <Text style={styles.thresholdText}>{thresholds.high.label}</Text>
          </View>
        </View>
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
            const riskLevel = getRiskLevelForSkill(riskData.score, selectedSkillLevel);
            
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
                      {getSkillLabel(selectedSkillLevel)} Risk
                    </Text>
                    <Text style={styles.calloutRisk}>
                      {riskLevel.emoji} {riskLevel.level}
                    </Text>
                    {/* Score and Incidents removed per design */}
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
            {getSkillLabel(selectedSkillLevel)} Risk Status
          </Text>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {surfSpots.map((spot) => {
          const riskData = getRiskData(spot);
          const riskLevel = getRiskLevelForSkill(riskData.score, selectedSkillLevel);
          
          return (
            <View
              key={spot._id}
              style={[
                styles.spotCard,
                { borderLeftColor: riskLevel.color }
              ]}
            >
              <View style={styles.spotHeader}>
                <View style={styles.spotInfo}>
                  <View style={styles.spotNameRow}>
                    <Text style={styles.spotName}>{spot.name}</Text>
                    <Text style={styles.spotEmoji}>{riskLevel.emoji}</Text>
                  </View>
                  <Text style={styles.spotLocation}>{spot.location}</Text>
                  
                  {/* Risk Badge */}
                  <View style={[
                    styles.riskBadge,
                    { backgroundColor: riskLevel.bgColor }
                  ]}>
                    <Text style={[
                      styles.riskBadgeText,
                      { color: riskLevel.textColor }
                    ]}>
                      {riskLevel.level} Risk
                    </Text>
                  </View>

                  {/* Skill-specific info removed: incidents and score hidden */}

                  {/* Show all skill levels when viewing overall */}
                  {selectedSkillLevel === 'overall' && spot.skillLevelRisks && (
                    <View style={styles.skillBreakdown}>
                      <Text style={styles.skillBreakdownTitle}>By Skill Level:</Text>
                      {['beginner', 'intermediate', 'advanced'].map((skill) => {
                        const skillData = spot.skillLevelRisks[skill];
                        if (!skillData) return null;
                        
                        const skillRisk = getRiskLevelForSkill(skillData.riskScore, skill);
                        return (
                          <Text key={skill} style={styles.skillBreakdownItem}>
                            {getSkillIcon(skill)} {getSkillLabel(skill)}: {skillData.riskScore}/10 {skillRisk.emoji}
                          </Text>
                        );
                      })}
                    </View>
                  )}
                </View>
                
                {/* Large Risk Score Display */}
                <View style={styles.riskScoreContainer}>
                  <Text style={[styles.riskScoreValue, { color: riskLevel.color }]}>
                    {riskData.score}
                  </Text>
                  <Text style={styles.riskScoreLabel}>/ 10</Text>
                </View>
              </View>

              {/* Footer */}
              <View style={styles.spotFooter}>
                <Text style={styles.footerText}>
                  Updated: {formatRelativeDate(spot.lastUpdated)}
                </Text>
              </View>
            </View>
          );
        })}

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>
            {getSkillLabel(selectedSkillLevel)} Risk Guide
          </Text>
          
          <View style={styles.legendItem}>
            <Text style={styles.legendEmoji}>🟢</Text>
            <View style={styles.legendContent}>
              <Text style={styles.legendLabel}>Green Flag - Low Risk</Text>
              <Text style={styles.legendRange}>Range: {thresholds.low.label}</Text>
              <Text style={styles.legendDesc}>
                {selectedSkillLevel === 'beginner' && 'Ideal conditions for beginners'}
                {selectedSkillLevel === 'intermediate' && 'Safe for intermediate surfers'}
                {selectedSkillLevel === 'advanced' && 'Low risk for advanced surfers'}
                {selectedSkillLevel === 'overall' && 'Generally safe conditions'}
              </Text>
            </View>
          </View>

          <View style={styles.legendItem}>
            <Text style={styles.legendEmoji}>🟡</Text>
            <View style={styles.legendContent}>
              <Text style={styles.legendLabel}>Yellow Flag - Medium Risk</Text>
              <Text style={styles.legendRange}>Range: {thresholds.medium.label}</Text>
              <Text style={styles.legendDesc}>
                {selectedSkillLevel === 'beginner' && 'Caution advised for beginners'}
                {selectedSkillLevel === 'intermediate' && 'Moderate risk for intermediates'}
                {selectedSkillLevel === 'advanced' && 'Some caution for advanced'}
                {selectedSkillLevel === 'overall' && 'Caution advised - check conditions'}
              </Text>
            </View>
          </View>

          <View style={styles.legendItem}>
            <Text style={styles.legendEmoji}>🔴</Text>
            <View style={styles.legendContent}>
              <Text style={styles.legendLabel}>Red Flag - High Risk</Text>
              <Text style={styles.legendRange}>Range: {thresholds.high.label}</Text>
              <Text style={styles.legendDesc}>
                {selectedSkillLevel === 'beginner' && 'Dangerous for beginners - avoid'}
                {selectedSkillLevel === 'intermediate' && 'High risk for intermediates'}
                {selectedSkillLevel === 'advanced' && 'Challenging even for advanced'}
                {selectedSkillLevel === 'overall' && 'Dangerous conditions - avoid'}
              </Text>
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
  
  thresholdBanner: {
    backgroundColor: '#dbeafe',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#93c5fd'
  },
  thresholdTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
    textAlign: 'center'
  },
  thresholdRow: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  thresholdItem: {
    alignItems: 'center'
  },
  thresholdEmoji: {
    fontSize: 20,
    marginBottom: 4
  },
  thresholdText: {
    fontSize: 11,
    color: '#1e40af',
    fontWeight: '500'
  },
  
  mapContainer: { height: '30%' },
  map: { flex: 1 },
  callout: { padding: 8, minWidth: 150 },
  calloutTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 4, color: '#1f2937' },
  calloutSkill: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  calloutRisk: { fontSize: 14, fontWeight: '600', marginBottom: 2 },
  calloutScore: { fontSize: 13, color: '#374151', marginBottom: 2 },
  calloutIncidents: { fontSize: 12, color: '#6b7280' },
  
  listContainer: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#1f2937' },
  refreshButton: { backgroundColor: '#0891b2', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  refreshButtonText: { color: 'white', fontWeight: '600', fontSize: 13 },
  
  spotCard: { 
    backgroundColor: 'white', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 12, 
    borderLeftWidth: 4,
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.1, 
    shadowRadius: 3, 
    elevation: 3 
  },
  spotHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  spotInfo: { flex: 1 },
  spotNameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  spotName: { fontSize: 17, fontWeight: 'bold', color: '#1f2937', marginRight: 8 },
  spotEmoji: { fontSize: 20 },
  spotLocation: { fontSize: 13, color: '#6b7280', marginBottom: 8 },
  
  riskBadge: { 
    paddingVertical: 4, 
    paddingHorizontal: 12, 
    borderRadius: 8, 
    alignSelf: 'flex-start', 
    marginBottom: 12 
  },
  riskBadgeText: { fontSize: 12, fontWeight: '600' },
  
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6'
  },
  statItem: {
    flex: 1,
    alignItems: 'center'
  },
  statLabel: {
    fontSize: 11,
    color: '#9ca3af',
    marginBottom: 4
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151'
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#e5e7eb'
  },
  
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
  
  riskScoreContainer: { 
    alignItems: 'flex-end',
    justifyContent: 'center'
  },
  riskScoreValue: { 
    fontSize: 36, 
    fontWeight: 'bold'
  },
  riskScoreLabel: { 
    fontSize: 14, 
    color: '#9ca3af',
    marginTop: -4
  },
  
  spotFooter: { 
    marginTop: 12, 
    paddingTop: 12, 
    borderTopWidth: 1, 
    borderTopColor: '#f3f4f6' 
  },
  footerText: { 
    fontSize: 11, 
    color: '#6b7280' 
  },
  
  legend: { 
    backgroundColor: 'white', 
    borderRadius: 12, 
    padding: 16, 
    marginTop: 8, 
    marginBottom: 24 
  },
  legendTitle: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#1f2937', 
    marginBottom: 12 
  },
  legendItem: { 
    flexDirection: 'row', 
    alignItems: 'flex-start', 
    marginBottom: 16 
  },
  legendEmoji: { 
    fontSize: 24, 
    marginRight: 12,
    marginTop: 2
  },
  legendContent: {
    flex: 1
  },
  legendLabel: { 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#1f2937',
    marginBottom: 4
  },
  legendRange: {
    fontSize: 12,
    color: '#0891b2',
    fontWeight: '600',
    marginBottom: 4
  },
  legendDesc: { 
    fontSize: 12, 
    color: '#6b7280',
    lineHeight: 16
  },
  
  fabButton: { 
    position: 'absolute', 
    bottom: 24, 
    right: 24, 
    backgroundColor: '#ef4444', 
    width: 64, 
    height: 64, 
    borderRadius: 32, 
    justifyContent: 'center', 
    alignItems: 'center', 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.3, 
    shadowRadius: 5, 
    elevation: 8 
  },
  fabText: { fontSize: 32 },
});