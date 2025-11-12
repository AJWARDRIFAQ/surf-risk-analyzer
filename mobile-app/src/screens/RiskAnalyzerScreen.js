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
          {surfSpots.map((spot) => (
            <Marker
              key={spot._id}
              coordinate={{
                latitude: spot.coordinates.latitude,
                longitude: spot.coordinates.longitude,
              }}
              pinColor={getMarkerColor(spot.flagColor)}
            >
              <Callout>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>{spot.name}</Text>
                  <Text>{getFlagEmoji(spot.flagColor)} {spot.riskLevel}</Text>
                  <Text>Risk: {spot.riskScore}/10</Text>
                </View>
              </Callout>
            </Marker>
          ))}
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
          <Text style={styles.headerTitle}>Surf Spots Risk Status</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
            <Text style={styles.refreshButtonText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {surfSpots.map((spot) => (
          <View
            key={spot._id}
            style={[
              styles.spotCard,
              { borderLeftColor: getMarkerColor(spot.flagColor) }
            ]}
          >
            <View style={styles.spotHeader}>
              <View style={styles.spotInfo}>
                <Text style={styles.spotName}>
                  {getFlagEmoji(spot.flagColor)} {spot.name}
                </Text>
                <Text style={styles.spotLocation}>{spot.location}</Text>
                <View style={[
                  styles.riskBadge,
                  { backgroundColor: spot.riskLevel === 'High' ? '#fee2e2' : spot.riskLevel === 'Medium' ? '#fef3c7' : '#d1fae5' }
                ]}>
                  <Text style={[
                    styles.riskBadgeText,
                    { color: spot.riskLevel === 'High' ? '#991b1b' : spot.riskLevel === 'Medium' ? '#92400e' : '#065f46' }
                  ]}>
                    {spot.riskLevel} Risk
                  </Text>
                </View>
              </View>
              
              <View style={styles.riskScore}>
                <Text style={styles.riskScoreValue}>{spot.riskScore}</Text>
                <Text style={styles.riskScoreLabel}>/ 10</Text>
              </View>
            </View>

            <View style={styles.spotFooter}>
              <Text style={styles.footerText}>
                Incidents: {spot.totalIncidents || 0}
              </Text>
              <Text style={styles.footerText}>
                Updated: {new Date(spot.lastUpdated).toLocaleDateString()}
              </Text>
            </View>
          </View>
        ))}

        {/* Legend */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Risk Level Guide</Text>
          
          <View style={styles.legendItem}>
            <Text style={styles.legendEmoji}>🟢</Text>
            <View>
              <Text style={styles.legendLabel}>Green Flag - Low Risk</Text>
              <Text style={styles.legendDesc}>Safe conditions for most surfers</Text>
            </View>
          </View>

          <View style={styles.legendItem}>
            <Text style={styles.legendEmoji}>🟡</Text>
            <View>
              <Text style={styles.legendLabel}>Yellow Flag - Medium Risk</Text>
              <Text style={styles.legendDesc}>Caution advised, check conditions</Text>
            </View>
          </View>

          <View style={styles.legendItem}>
            <Text style={styles.legendEmoji}>🔴</Text>
            <View>
              <Text style={styles.legendLabel}>Red Flag - High Risk</Text>
              <Text style={styles.legendDesc}>Dangerous conditions, avoid surfing</Text>
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
  mapContainer: { height: '40%' },
  map: { flex: 1 },
  callout: { padding: 8 },
  calloutTitle: { fontWeight: 'bold', fontSize: 16 },
  listContainer: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1f2937' },
  refreshButton: { backgroundColor: '#0891b2', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  refreshButtonText: { color: 'white', fontWeight: '600' },
  spotCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, borderLeftWidth: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 3 },
  spotHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  spotInfo: { flex: 1 },
  spotName: { fontSize: 18, fontWeight: 'bold', color: '#1f2937', marginBottom: 4 },
  spotLocation: { fontSize: 14, color: '#6b7280', marginBottom: 8 },
  riskBadge: { paddingVertical: 4, paddingHorizontal: 12, borderRadius: 8, alignSelf: 'flex-start' },
  riskBadgeText: { fontSize: 13, fontWeight: '600' },
  riskScore: { alignItems: 'flex-end' },
  riskScoreValue: { fontSize: 32, fontWeight: 'bold', color: '#1f2937' },
  riskScoreLabel: { fontSize: 12, color: '#9ca3af' },
  spotFooter: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#f3f4f6' },
  footerText: { fontSize: 12, color: '#6b7280', marginBottom: 4 },
  legend: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginTop: 8, marginBottom: 24 },
  legendTitle: { fontSize: 16, fontWeight: 'bold', color: '#1f2937', marginBottom: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  legendEmoji: { fontSize: 24, marginRight: 12 },
  legendLabel: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  legendDesc: { fontSize: 12, color: '#6b7280' },
  fabButton: { position: 'absolute', bottom: 24, right: 24, backgroundColor: '#ef4444', width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 8 },
  fabText: { fontSize: 32 },
});
