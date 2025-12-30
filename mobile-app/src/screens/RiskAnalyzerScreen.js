// mobile-app/src/screens/RiskAnalyzerScreen.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';

import { getSurfSpots } from '../services/api';
import { SKILL_LEVELS } from '../utils/constants';
import { 
  getRiskLevelForSkill, 
  getRiskDataForSkill, 
  getThresholdRanges,
  getSkillLevelInfo,
  formatRelativeDate
} from '../utils/helpers';
import SkillLevelTabs from '../components/SkillLevelTabs';

const { width, height } = Dimensions.get('window');

export default function RiskAnalyzerScreen({ navigation }) {
  const [surfSpots, setSurfSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSkillLevel, setSelectedSkillLevel] = useState(SKILL_LEVELS.BEGINNER);
  const [viewMode, setViewMode] = useState('map');
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [error, setError] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    loadSurfSpots();
  }, []);

  const loadSurfSpots = async () => {
    try {
      if (!refreshing) setLoading(true);
      setError(null);
      
      const response = await getSurfSpots();
      const spots = response.data || [];
      
      console.log('✅ Loaded', spots.length, 'surf spots');
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

  const handleMarkerPress = (spot) => {
    setSelectedSpot(spot);
    
    if (mapRef.current && spot.coordinates) {
      mapRef.current.animateToRegion({
        latitude: spot.coordinates.latitude,
        longitude: spot.coordinates.longitude,
        latitudeDelta: 0.5,
        longitudeDelta: 0.5,
      }, 1000);
    }
  };

  const fitAllMarkers = () => {
    if (mapRef.current && surfSpots.length > 0) {
      const coordinates = surfSpots
        .filter(spot => spot.coordinates?.latitude && spot.coordinates?.longitude)
        .map(spot => ({
          latitude: spot.coordinates.latitude,
          longitude: spot.coordinates.longitude,
        }));

      if (coordinates.length > 0) {
        mapRef.current.fitToCoordinates(coordinates, {
          edgePadding: { top: 100, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    }
  };

  // Get marker color based on risk level
  const getMarkerColor = (riskLevel) => {
    switch(riskLevel.flag) {
      case 'green': return '#10b981';
      case 'yellow': return '#f59e0b';
      case 'red': return '#ef4444';
      default: return '#6b7280';
    }
  };

  // Render custom marker
  const renderMarker = (spot) => {
    if (!spot.coordinates?.latitude || !spot.coordinates?.longitude) {
      return null;
    }

    const riskData = getRiskDataForSkill(spot, selectedSkillLevel);
    const riskLevel = getRiskLevelForSkill(riskData.score, selectedSkillLevel);
    const isSelected = selectedSpot?._id === spot._id;

    return (
      <Marker
        key={spot._id}
        coordinate={{
          latitude: spot.coordinates.latitude,
          longitude: spot.coordinates.longitude,
        }}
        onPress={() => handleMarkerPress(spot)}
        pinColor={getMarkerColor(riskLevel)}
        zIndex={isSelected ? 1000 : 1}
      >
        <View style={[
          styles.customMarker,
          isSelected && styles.customMarkerSelected,
          { backgroundColor: riskLevel.color }
        ]}>
          <Text style={styles.markerText}>{riskData.score.toFixed(1)}</Text>
        </View>
      </Marker>
    );
  };

  // Loading state
  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0891b2" />
        <Text style={styles.loadingText}>Loading surf spots...</Text>
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
        <TouchableOpacity style={styles.retryButton} onPress={loadSurfSpots}>
          <Text style={styles.retryButtonText}>🔄 Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Skill Level Tabs */}
      <SkillLevelTabs
        selectedSkillLevel={selectedSkillLevel}
        onSkillChange={setSelectedSkillLevel}
      />

      {/* Threshold Banner */}
      {renderThresholdBanner()}

      {/* View Toggle */}
      <View style={styles.viewToggle}>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'map' && styles.toggleButtonActive]}
          onPress={() => setViewMode('map')}
        >
          <Text style={[styles.toggleText, viewMode === 'map' && styles.toggleTextActive]}>
            🗺️ Map
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleButton, viewMode === 'list' && styles.toggleButtonActive]}
          onPress={() => setViewMode('list')}
        >
          <Text style={[styles.toggleText, viewMode === 'list' && styles.toggleTextActive]}>
            📋 List
          </Text>
        </TouchableOpacity>
      </View>

      {/* Map or List View */}
      {viewMode === 'map' ? renderMapView() : renderListView()}

      {/* Floating Report Button */}
      <TouchableOpacity 
        style={styles.fabButton} 
        onPress={() => navigation.navigate('ReportHazard')}
      >
        <Text style={styles.fabIcon}>⚠️</Text>
        <Text style={styles.fabText}>Report</Text>
      </TouchableOpacity>
    </View>
  );

  // Threshold Banner
  function renderThresholdBanner() {
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
  }

  // Map View
  function renderMapView() {
    return (
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={{
            latitude: 7.8731,
            longitude: 80.7718,
            latitudeDelta: 3.5,
            longitudeDelta: 3.5,
          }}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
          loadingEnabled={true}
          loadingBackgroundColor="#e0f2fe"
          loadingIndicatorColor="#0891b2"
          onMapReady={fitAllMarkers}
          mapType="standard"
        >
          {surfSpots.map(spot => renderMarker(spot))}
        </MapView>

        {/* Map Controls */}
        <TouchableOpacity style={styles.fitMarkersButton} onPress={fitAllMarkers}>
          <Text style={styles.fitMarkersText}>🎯 Fit All</Text>
        </TouchableOpacity>

        {/* Selected Spot Card */}
        {selectedSpot && (
          <View style={styles.selectedSpotCard}>
            <View style={styles.selectedSpotHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.selectedSpotName}>{selectedSpot.name}</Text>
                <Text style={styles.selectedSpotLocation}>📍 {selectedSpot.location}</Text>
              </View>
              <TouchableOpacity onPress={() => setSelectedSpot(null)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            {renderSpotRiskInfo(selectedSpot)}
          </View>
        )}

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Risk Levels</Text>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#10b981' }]} />
            <Text style={styles.legendText}>Low</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#f59e0b' }]} />
            <Text style={styles.legendText}>Medium</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#ef4444' }]} />
            <Text style={styles.legendText}>High</Text>
          </View>
        </View>
      </View>
    );
  }

  // List View
  function renderListView() {
    const sortedSpots = [...surfSpots].sort((a, b) => {
      const scoreA = getRiskDataForSkill(a, selectedSkillLevel).score;
      const scoreB = getRiskDataForSkill(b, selectedSkillLevel).score;
      return scoreB - scoreA;
    });

    return (
      <ScrollView
        style={styles.listContainer}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {sortedSpots.map(spot => renderSpotListItem(spot))}
        <View style={{ height: 100 }} />
      </ScrollView>
    );
  }

  // Spot List Item
  function renderSpotListItem(spot) {
    const riskData = getRiskDataForSkill(spot, selectedSkillLevel);
    const riskLevel = getRiskLevelForSkill(riskData.score, selectedSkillLevel);

    return (
      <TouchableOpacity
        key={spot._id}
        style={[styles.spotCard, { borderLeftColor: riskLevel.color }]}
        onPress={() => {
          setSelectedSpot(spot);
          setViewMode('map');
        }}
      >
        <View style={styles.spotCardContent}>
          <View style={styles.spotInfo}>
            <Text style={styles.spotName}>{spot.name}</Text>
            <Text style={styles.spotLocation}>📍 {spot.location}</Text>
            <View style={[styles.riskBadge, { backgroundColor: riskLevel.bgColor }]}>
              <Text style={[styles.riskBadgeText, { color: riskLevel.textColor }]}>
                {riskLevel.emoji} {riskLevel.level} Risk
              </Text>
            </View>
          </View>
          <View style={styles.spotScore}>
            <Text style={[styles.scoreValue, { color: riskLevel.color }]}>
              {riskData.score.toFixed(1)}
            </Text>
            <Text style={styles.scoreLabel}>/10</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Spot Risk Info
  function renderSpotRiskInfo(spot) {
    return (
      <View style={styles.riskInfoContainer}>
        {['beginner', 'intermediate', 'advanced'].map(level => {
          const riskData = getRiskDataForSkill(spot, level);
          const riskLevel = getRiskLevelForSkill(riskData.score, level);
          const skillInfo = getSkillLevelInfo(level);
          const isActive = level === selectedSkillLevel;

          return (
            <View
              key={level}
              style={[
                styles.riskInfoRow,
                isActive && { 
                  backgroundColor: skillInfo.color + '15', 
                  borderWidth: 2, 
                  borderColor: skillInfo.color 
                }
              ]}
            >
              <Text style={styles.skillIcon}>{skillInfo.icon}</Text>
              <Text style={styles.skillLabel}>{skillInfo.label}</Text>
              <Text style={styles.riskEmoji}>{riskLevel.emoji}</Text>
              <Text style={[styles.riskScore, { color: riskLevel.color }]}>
                {riskData.score.toFixed(1)}
              </Text>
            </View>
          );
        })}
      </View>
    );
  }
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  
  loadingText: { marginTop: 16, fontSize: 16, fontWeight: '600', color: '#374151' },
  errorEmoji: { fontSize: 64, marginBottom: 16 },
  errorTitle: { fontSize: 20, fontWeight: 'bold', color: '#ef4444', marginBottom: 8 },
  errorMessage: { fontSize: 14, color: '#6b7280', textAlign: 'center', marginBottom: 24 },
  retryButton: { backgroundColor: '#0891b2', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8 },
  retryButtonText: { color: 'white', fontSize: 15, fontWeight: '600' },

  thresholdBanner: { paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderColor: '#e5e7eb' },
  thresholdTitle: { fontSize: 13, fontWeight: '700', textAlign: 'center', marginBottom: 12 },
  thresholdRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  thresholdItem: { alignItems: 'center', flex: 1 },
  thresholdEmoji: { fontSize: 20, marginBottom: 4 },
  thresholdLabel: { fontSize: 11, fontWeight: '600', color: '#374151', marginBottom: 2 },
  thresholdRange: { fontSize: 10, color: '#6b7280' },
  thresholdDivider: { width: 1, height: 40, backgroundColor: '#e5e7eb' },

  viewToggle: { flexDirection: 'row', padding: 12, backgroundColor: 'white', borderBottomWidth: 1, borderColor: '#e5e7eb' },
  toggleButton: { flex: 1, paddingVertical: 10, paddingHorizontal: 16, marginHorizontal: 4, borderRadius: 8, backgroundColor: '#f3f4f6', alignItems: 'center' },
  toggleButtonActive: { backgroundColor: '#0891b2' },
  toggleText: { fontSize: 14, fontWeight: '600', color: '#6b7280' },
  toggleTextActive: { color: 'white' },

  mapContainer: { flex: 1, position: 'relative' },
  map: { 
    ...StyleSheet.absoluteFillObject,
    width: width,
    height: '100%',
  },
  
  customMarker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  customMarkerSelected: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 4,
  },
  markerText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  
  fitMarkersButton: { position: 'absolute', top: 10, right: 10, backgroundColor: 'white', paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
  fitMarkersText: { fontSize: 13, fontWeight: '600', color: '#0891b2' },

  selectedSpotCard: { position: 'absolute', bottom: 20, left: 16, right: 16, backgroundColor: 'white', borderRadius: 16, padding: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 8 },
  selectedSpotHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  selectedSpotName: { fontSize: 20, fontWeight: 'bold', color: '#0891b2' },
  selectedSpotLocation: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  closeButton: { fontSize: 24, color: '#9ca3af', paddingLeft: 12 },

  riskInfoContainer: { marginTop: 8 },
  riskInfoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, marginBottom: 8, borderRadius: 8, backgroundColor: '#f9fafb' },
  skillIcon: { fontSize: 18, marginRight: 8 },
  skillLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: '#374151' },
  riskEmoji: { fontSize: 16, marginRight: 8 },
  riskScore: { fontSize: 18, fontWeight: 'bold' },

  legend: { position: 'absolute', bottom: 20, left: 10, backgroundColor: 'white', borderRadius: 12, padding: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 3.84, elevation: 5 },
  legendTitle: { fontSize: 12, fontWeight: 'bold', color: '#374151', marginBottom: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginVertical: 3 },
  legendDot: { width: 12, height: 12, borderRadius: 6, marginRight: 8 },
  legendText: { fontSize: 11, color: '#6b7280' },

  listContainer: { flex: 1, padding: 16 },
  spotCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, borderLeftWidth: 4, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3 },
  spotCardContent: { flexDirection: 'row', justifyContent: 'space-between' },
  spotInfo: { flex: 1, paddingRight: 12 },
  spotName: { fontSize: 17, fontWeight: 'bold', color: '#111827', marginBottom: 4 },
  spotLocation: { fontSize: 13, color: '#6b7280', marginBottom: 8 },
  riskBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 6 },
  riskBadgeText: { fontSize: 12, fontWeight: '700' },
  spotScore: { alignItems: 'center', paddingLeft: 12, borderLeftWidth: 1, borderColor: '#e5e7eb' },
  scoreValue: { fontSize: 32, fontWeight: 'bold', lineHeight: 36 },
  scoreLabel: { fontSize: 12, color: '#9ca3af', marginTop: -4 },

  fabButton: { position: 'absolute', bottom: 24, right: 24, backgroundColor: '#ef4444', width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5 },
  fabIcon: { fontSize: 24 },
  fabText: { color: 'white', fontSize: 10, fontWeight: '600', marginTop: 2 },
});