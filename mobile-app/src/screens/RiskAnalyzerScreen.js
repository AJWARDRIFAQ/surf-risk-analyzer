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

import { getSurfSpots } from '../services/api';
import { API_BASE_URL, SKILL_LEVELS } from '../utils/constants';
import { 
  getRiskLevelForSkill, 
  getRiskDataForSkill, 
  getThresholdRanges,
  getSkillLevelInfo,
  getMarkerColor,
  formatRelativeDate
} from '../utils/helpers';

export default function RiskAnalyzerScreen({ navigation }) {
  const [surfSpots, setSurfSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSkillLevel, setSelectedSkillLevel] = useState(SKILL_LEVELS.BEGINNER);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSurfSpots();
  }, []);

  const loadSurfSpots = async () => {
    try {
      if (!refreshing) setLoading(true);
      setError(null);
      
      console.log('📡 Fetching surf spots from:', API_BASE_URL);
      const response = await getSurfSpots();
      
      const spots = response.data || [];
      console.log('✅ Surf spots loaded:', spots.length);
      
      if (spots.length > 0) {
        console.log('🔍 Sample spot:', JSON.stringify(spots[0], null, 2));
      }

      setSurfSpots(spots);
      
    } catch (err) {
      console.error('❌ Error loading surf spots:', err);
      setError(err.message || 'Failed to load data');
      Alert.alert('Connection Error', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSurfSpots();
  };

  // Render skill selector button
  const renderSkillButton = (skillLevel) => {
    const skillInfo = getSkillLevelInfo(skillLevel);
    const isSelected = selectedSkillLevel === skillLevel;

    return (
      <TouchableOpacity
        key={skillLevel}
        style={[
          styles.skillButton,
          isSelected && styles.skillButtonActive,
          { borderColor: isSelected ? skillInfo.color : '#e5e7eb' }
        ]}
        onPress={() => setSelectedSkillLevel(skillLevel)}
        activeOpacity={0.7}
      >
        <Text style={styles.skillIcon}>{skillInfo.icon}</Text>
        <View>
          <Text style={[
            styles.skillButtonText,
            isSelected && { color: skillInfo.color }
          ]}>
            {skillInfo.label}
          </Text>
          <Text style={styles.skillButtonDesc}>{skillInfo.description}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Render threshold banner
  const renderThresholdBanner = () => {
    const thresholds = getThresholdRanges(selectedSkillLevel);
    const skillInfo = getSkillLevelInfo(selectedSkillLevel);

    return (
      <View style={[styles.thresholdBanner, { backgroundColor: skillInfo.color + '15' }]}>
        <Text style={[styles.thresholdTitle, { color: skillInfo.color }]}>
          {skillInfo.icon} {skillInfo.label} Risk Thresholds
        </Text>
        <View style={styles.thresholdRow}>
          <View style={styles.thresholdItem}>
            <Text style={styles.thresholdEmoji}>{thresholds.low.emoji}</Text>
            <Text style={styles.thresholdLabel}>Low</Text>
            <Text style={styles.thresholdRange}>{thresholds.low.label}</Text>
          </View>
          <View style={styles.thresholdDivider} />
          <View style={styles.thresholdItem}>
            <Text style={styles.thresholdEmoji}>{thresholds.medium.emoji}</Text>
            <Text style={styles.thresholdLabel}>Medium</Text>
            <Text style={styles.thresholdRange}>{thresholds.medium.label}</Text>
          </View>
          <View style={styles.thresholdDivider} />
          <View style={styles.thresholdItem}>
            <Text style={styles.thresholdEmoji}>{thresholds.high.emoji}</Text>
            <Text style={styles.thresholdLabel}>High</Text>
            <Text style={styles.thresholdRange}>{thresholds.high.label}</Text>
          </View>
        </View>
      </View>
    );
  };

  // Render spot card
  const renderSpotCard = (spot) => {
    const riskData = getRiskDataForSkill(spot, selectedSkillLevel);
    const riskLevel = getRiskLevelForSkill(riskData.score, selectedSkillLevel);

    return (
      <View 
        key={spot._id} 
        style={[
          styles.spotCard, 
          { borderLeftColor: riskLevel.color, borderLeftWidth: 4 }
        ]}
      >
        <View style={styles.spotHeader}>
          <View style={styles.spotInfo}>
            <View style={styles.spotNameRow}>
              <Text style={styles.spotName}>{spot.name}</Text>
              <Text style={styles.spotEmoji}>{riskLevel.emoji}</Text>
            </View>
            <Text style={styles.spotLocation}>📍 {spot.location}</Text>
            
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

            {/* Additional Info */}
            <View style={styles.additionalInfo}>
              {riskData.incidents > 0 && (
                <Text style={styles.incidentText}>
                  ⚠️ {riskData.incidents} incidents recorded
                </Text>
              )}
              <Text style={styles.updatedText}>
                Updated: {formatRelativeDate(spot.lastUpdated)}
              </Text>
            </View>
          </View>

          {/* Risk Score */}
          <View style={styles.riskScoreContainer}>
            <Text style={[
              styles.riskScoreValue, 
              { color: riskLevel.color }
            ]}>
              {riskData.score.toFixed(1)}
            </Text>
            <Text style={styles.riskScoreLabel}>/10</Text>
            <Text style={styles.riskScoreFlag}>{riskLevel.emoji}</Text>
          </View>
        </View>
      </View>
    );
  };

  // Loading state
  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0891b2" />
        <Text style={styles.loadingText}>Loading risk data...</Text>
        <Text style={styles.loadingSubtext}>Analyzing surf conditions</Text>
      </View>
    );
  }

  // Error state
  if (error && !refreshing && surfSpots.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorEmoji}>⚠️</Text>
        <Text style={styles.errorTitle}>Connection Failed</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={loadSurfSpots}
          activeOpacity={0.7}
        >
          <Text style={styles.retryButtonText}>🔄 Retry Connection</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Skill Level Selector */}
      <View style={styles.skillSelector}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.skillScrollContent}
        >
          {Object.values(SKILL_LEVELS).map(renderSkillButton)}
        </ScrollView>
      </View>

      {/* Threshold Banner */}
      {renderThresholdBanner()}

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
            // Skip spots without valid coordinates
            if (!spot?.coordinates?.latitude || !spot?.coordinates?.longitude) {
              return null;
            }

            const riskData = getRiskDataForSkill(spot, selectedSkillLevel);
            const riskLevel = getRiskLevelForSkill(riskData.score, selectedSkillLevel);

            return (
              <Marker
                key={spot._id}
                coordinate={{
                  latitude: parseFloat(spot.coordinates.latitude),
                  longitude: parseFloat(spot.coordinates.longitude),
                }}
                pinColor={getMarkerColor(riskLevel.flag)}
              >
                <Callout>
                  <View style={styles.callout}>
                    <Text style={styles.calloutTitle}>{spot.name}</Text>
                    <Text style={styles.calloutRisk}>
                      {riskLevel.emoji} {riskLevel.level} Risk
                    </Text>
                    <Text style={styles.calloutScore}>
                      Score: {riskData.score.toFixed(1)}/10
                    </Text>
                    <Text style={styles.calloutLocation}>{spot.location}</Text>
                  </View>
                </Callout>
              </Marker>
            );
          })}
        </MapView>
      </View>

      {/* List View */}
      <ScrollView
        style={styles.listContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            colors={['#0891b2']}
            tintColor="#0891b2"
          />
        }
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>
              {getSkillLevelInfo(selectedSkillLevel).label} Surf Spots
            </Text>
            <Text style={styles.headerSubtitle}>
              {surfSpots.length} locations analyzed
            </Text>
          </View>
          <TouchableOpacity 
            onPress={onRefresh} 
            style={styles.refreshButton}
            activeOpacity={0.7}
          >
            <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
          </TouchableOpacity>
        </View>

        {surfSpots.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🌊</Text>
            <Text style={styles.emptyText}>No surf spots found</Text>
            <Text style={styles.emptySubtext}>
              Pull down to refresh or check your connection
            </Text>
          </View>
        ) : (
          surfSpots.map(renderSpotCard)
        )}
        
        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>📊 Understanding Risk Levels</Text>
          <View style={styles.legendItem}>
            <Text style={styles.legendEmoji}>🟢</Text>
            <View style={styles.legendTextContainer}>
              <Text style={styles.legendText}>Low Risk</Text>
              <Text style={styles.legendSubtext}>Safe conditions for this skill level</Text>
            </View>
          </View>
          <View style={styles.legendItem}>
            <Text style={styles.legendEmoji}>🟡</Text>
            <View style={styles.legendTextContainer}>
              <Text style={styles.legendText}>Medium Risk</Text>
              <Text style={styles.legendSubtext}>Caution advised, check conditions</Text>
            </View>
          </View>
          <View style={styles.legendItem}>
            <Text style={styles.legendEmoji}>🔴</Text>
            <View style={styles.legendTextContainer}>
              <Text style={styles.legendText}>High Risk</Text>
              <Text style={styles.legendSubtext}>Dangerous, avoid surfing</Text>
            </View>
          </View>
        </View>

        {/* Bottom padding */}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fabButton} 
        onPress={() => navigation.navigate('ReportHazard')}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>⚠️</Text>
        <Text style={styles.fabText}>Report</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9fafb',
  },

  // Loading State
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  loadingSubtext: {
    marginTop: 4,
    fontSize: 14,
    color: '#6b7280',
  },

  // Error State
  errorEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ef4444',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  retryButton: {
    backgroundColor: '#0891b2',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },

  // Skill Selector
  skillSelector: {
    backgroundColor: 'white',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  skillScrollContent: {
    paddingHorizontal: 16,
  },
  skillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 12,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  skillButtonActive: {
    backgroundColor: 'white',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  skillIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  skillButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 2,
  },
  skillButtonDesc: {
    fontSize: 11,
    color: '#9ca3af',
  },

  // Threshold Banner
  thresholdBanner: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  thresholdTitle: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  thresholdRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  thresholdItem: {
    alignItems: 'center',
    flex: 1,
  },
  thresholdEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  thresholdLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  thresholdRange: {
    fontSize: 10,
    color: '#6b7280',
  },
  thresholdDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e5e7eb',
  },

  // Map
  mapContainer: {
    height: '30%',
    borderBottomWidth: 2,
    borderColor: '#e5e7eb',
  },
  map: {
    flex: 1,
  },
  callout: {
    padding: 8,
    minWidth: 150,
  },
  calloutTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0891b2',
    marginBottom: 4,
  },
  calloutRisk: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 2,
  },
  calloutScore: {
    fontSize: 11,
    color: '#6b7280',
    marginBottom: 2,
  },
  calloutLocation: {
    fontSize: 10,
    color: '#9ca3af',
  },

  // List View
  listContainer: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  refreshButton: {
    backgroundColor: '#0891b2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },

  // Spot Card
  spotCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  spotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  spotInfo: {
    flex: 1,
    paddingRight: 12,
  },
  spotNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  spotName: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#111827',
    marginRight: 8,
  },
  spotEmoji: {
    fontSize: 20,
  },
  spotLocation: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 8,
  },
  riskBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  riskBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  additionalInfo: {
    marginTop: 4,
  },
  incidentText: {
    fontSize: 11,
    color: '#f59e0b',
    marginBottom: 2,
  },
  updatedText: {
    fontSize: 10,
    color: '#9ca3af',
  },
  riskScoreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderColor: '#e5e7eb',
  },
  riskScoreValue: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 36,
  },
  riskScoreLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: -4,
  },
  riskScoreFlag: {
    fontSize: 24,
    marginTop: 4,
  },

  // Legend
  legend: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  legendEmoji: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
  },
  legendTextContainer: {
    flex: 1,
  },
  legendText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  legendSubtext: {
    fontSize: 11,
    color: '#6b7280',
  },

  // FAB
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
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  fabIcon: {
    fontSize: 24,
  },
  fabText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
});