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

// Only import API, we will define helpers locally to prevent crashes
import { getSurfSpots } from '../services/api';
import { API_BASE_URL } from '../utils/constants';

export default function RiskAnalyzerScreen({ navigation }) {
  const [surfSpots, setSurfSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('beginner');
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
      
      // Safety check for response structure
      const spots = response.data || [];
      console.log('✅ Surf spots loaded:', spots.length);
      
      if (spots.length > 0) {
         // Debug: Log the first spot to ensure coordinates exist
         console.log('🔍 First spot data sample:', JSON.stringify(spots[0], null, 2));
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

  // --- LOCAL HELPERS (Moved here to prevent external file crashes) ---

  const getMarkerColor = (flagColor) => {
    // Default to red if undefined/null
    return flagColor || '#ef4444';
  };

  const getSkillLabel = (skill) => {
    const labels = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };
    return labels[skill] || 'Beginner';
  };

  const getSkillIcon = (skill) => {
    const icons = { beginner: '🏄‍♀️', intermediate: '🏄', advanced: '🏄‍♂️' };
    return icons[skill] || '🏄‍♀️';
  };

  const getRiskData = (spot) => {
    if (!spot) return { score: 0, level: 'Unknown', flag: '#9ca3af', incidents: 0 };

    // safe access to nested properties
    const risks = spot.skillLevelRisks || {};
    const skillData = risks[selectedSkillLevel];

    if (skillData) {
      return {
        score: typeof skillData.riskScore === 'number' ? skillData.riskScore : 0,
        level: skillData.riskLevel || 'Unknown',
        flag: skillData.flagColor || '#9ca3af',
        incidents: skillData.incidents || 0
      };
    }

    // Fallback to spot root level data
    return {
      score: spot.riskScore || 0,
      level: spot.riskLevel || 'Unknown',
      flag: spot.flagColor || '#9ca3af',
      incidents: 0
    };
  };

  const getRiskLevelForSkill = (score, skill) => {
    // Local logic to avoid "undefined" object crashes
    const numScore = Number(score) || 0;
    
    if (numScore <= 3) return { level: 'Low', color: '#10b981', bgColor: '#d1fae5', textColor: '#065f46', emoji: '🟢' };
    if (numScore <= 7) return { level: 'Medium', color: '#f59e0b', bgColor: '#fef3c7', textColor: '#92400e', emoji: '🟡' };
    return { level: 'High', color: '#ef4444', bgColor: '#fee2e2', textColor: '#991b1b', emoji: '🔴' };
  };

  // Safe threshold getter
  const getThresholdRanges = (skill) => {
    return {
      low: { label: '0 - 3' },
      medium: { label: '4 - 7' },
      high: { label: '8 - 10' }
    };
  };

  // --- RENDERING ---

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#0891b2" />
        <Text style={styles.loadingText}>Loading risk data...</Text>
      </View>
    );
  }

  if (error && !refreshing && surfSpots.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorTitle}>⚠️ Connection Failed</Text>
        <Text style={styles.errorMessage}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadSurfSpots}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const thresholds = getThresholdRanges(selectedSkillLevel);

  return (
    <View style={styles.container}>
      {/* Skill Level Selector */}
      <View style={styles.skillSelector}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {['beginner', 'intermediate', 'advanced'].map((skill) => (
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

      {/* Threshold Banner */}
      <View style={styles.thresholdBanner}>
        <Text style={styles.thresholdTitle}>{getSkillLabel(selectedSkillLevel)} Risk Thresholds</Text>
        <View style={styles.thresholdRow}>
          <View style={styles.thresholdItem}><Text>🟢 {thresholds.low.label}</Text></View>
          <View style={styles.thresholdItem}><Text>🟡 {thresholds.medium.label}</Text></View>
          <View style={styles.thresholdItem}><Text>🔴 {thresholds.high.label}</Text></View>
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
            // CRITICAL FIX: Skip spots without valid coordinates to prevent crashes
            if (!spot || !spot.coordinates || !spot.coordinates.latitude || !spot.coordinates.longitude) {
              return null;
            }

            const riskData = getRiskData(spot);
            const riskLevel = getRiskLevelForSkill(riskData.score, selectedSkillLevel);

            return (
              <Marker
                key={spot._id || Math.random().toString()}
                coordinate={{
                  latitude: parseFloat(spot.coordinates.latitude),
                  longitude: parseFloat(spot.coordinates.longitude),
                }}
                pinColor={getMarkerColor(riskData.flag)}
              >
                <Callout>
                  <View style={styles.callout}>
                    <Text style={styles.calloutTitle}>{spot.name}</Text>
                    <Text style={styles.calloutRisk}>{riskLevel.emoji} {riskLevel.level}</Text>
                    <Text>Score: {riskData.score}/10</Text>
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{getSkillLabel(selectedSkillLevel)} Spots</Text>
          <TouchableOpacity onPress={onRefresh} style={styles.refreshButton}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {surfSpots.length === 0 ? (
          <Text style={styles.emptyText}>No spots found.</Text>
        ) : (
          surfSpots.map((spot) => {
            const riskData = getRiskData(spot);
            const riskLevel = getRiskLevelForSkill(riskData.score, selectedSkillLevel);

            return (
              <View key={spot._id} style={[styles.spotCard, { borderLeftColor: riskLevel.color }]}>
                <View style={styles.spotHeader}>
                  <View style={styles.spotInfo}>
                    <View style={styles.spotNameRow}>
                      <Text style={styles.spotName}>{spot.name}</Text>
                      <Text style={styles.spotEmoji}>{riskLevel.emoji}</Text>
                    </View>
                    <Text style={styles.spotLocation}>{spot.location}</Text>
                    <View style={[styles.riskBadge, { backgroundColor: riskLevel.bgColor }]}>
                      <Text style={{ color: riskLevel.textColor, fontWeight: 'bold' }}>
                        {riskLevel.level} Risk
                      </Text>
                    </View>
                  </View>
                  <View style={styles.riskScoreContainer}>
                    <Text style={[styles.riskScoreValue, { color: riskLevel.color }]}>{riskData.score}</Text>
                    <Text style={styles.riskScoreLabel}>/10</Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
        
        {/* Helper Legend */}
        <View style={styles.legend}>
            <Text style={styles.legendTitle}>Guide</Text>
            <Text>🟢 Low Risk: Ideal for learning</Text>
            <Text>🟡 Medium Risk: Caution advised</Text>
            <Text>🔴 High Risk: Dangerous conditions</Text>
        </View>
      </ScrollView>

      {/* FAB */}
      <TouchableOpacity style={styles.fabButton} onPress={() => navigation.navigate('ReportHazard')}>
        <Text style={styles.fabText}>⚠️</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { marginTop: 10, color: '#6b7280' },
  errorTitle: { fontSize: 20, fontWeight: 'bold', color: '#ef4444' },
  errorMessage: { marginVertical: 10, textAlign: 'center', color: '#374151' },
  retryButton: { backgroundColor: '#0891b2', padding: 10, borderRadius: 8 },
  retryButtonText: { color: 'white', fontWeight: 'bold' },
  
  skillSelector: { backgroundColor: 'white', padding: 10, borderBottomWidth: 1, borderColor: '#e5e7eb' },
  skillButton: { flexDirection: 'row', padding: 8, marginRight: 8, borderRadius: 20, backgroundColor: '#f3f4f6', borderWidth: 1, borderColor: '#e5e7eb' },
  skillButtonActive: { backgroundColor: '#e0f2fe', borderColor: '#0891b2' },
  skillIcon: { marginRight: 5 },
  skillButtonText: { fontSize: 13, fontWeight: '600', color: '#6b7280' },
  skillButtonTextActive: { color: '#0891b2' },

  thresholdBanner: { flexDirection: 'column', backgroundColor: '#dbeafe', padding: 10 },
  thresholdTitle: { textAlign: 'center', fontWeight: 'bold', color: '#1e40af', marginBottom: 5 },
  thresholdRow: { flexDirection: 'row', justifyContent: 'space-around' },
  thresholdItem: { alignItems: 'center' },

  mapContainer: { height: '30%' },
  map: { flex: 1 },
  callout: { padding: 5, width: 140 },
  calloutTitle: { fontWeight: 'bold' },
  
  listContainer: { flex: 1, padding: 15 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  headerTitle: { fontSize: 18, fontWeight: 'bold' },
  refreshButton: { backgroundColor: '#0891b2', padding: 8, borderRadius: 6 },
  refreshButtonText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', marginTop: 20, color: '#6b7280' },

  spotCard: { backgroundColor: 'white', padding: 15, borderRadius: 12, marginBottom: 12, borderLeftWidth: 4, elevation: 2 },
  spotHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  spotInfo: { flex: 1 },
  spotNameRow: { flexDirection: 'row', alignItems: 'center' },
  spotName: { fontSize: 16, fontWeight: 'bold', marginRight: 5 },
  spotLocation: { fontSize: 12, color: '#6b7280', marginVertical: 4 },
  riskBadge: { alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 },
  
  riskScoreContainer: { alignItems: 'center', justifyContent: 'center', paddingLeft: 10 },
  riskScoreValue: { fontSize: 24, fontWeight: 'bold' },
  riskScoreLabel: { fontSize: 10, color: '#9ca3af' },

  legend: { marginTop: 10, padding: 15, backgroundColor: 'white', borderRadius: 8, marginBottom: 30 },
  legendTitle: { fontWeight: 'bold', marginBottom: 5 },

  fabButton: { position: 'absolute', bottom: 20, right: 20, backgroundColor: '#ef4444', width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', elevation: 5 },
  fabText: { fontSize: 24 },
});