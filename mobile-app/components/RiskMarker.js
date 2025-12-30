// mobile-app/src/components/RiskMarker.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import { getRiskLevelForSkill, getRiskDataForSkill, formatRelativeDate } from '../utils/helpers';

const RiskMarker = ({ spot, skillLevel, onPress, isSelected }) => {
  const riskData = getRiskDataForSkill(spot, skillLevel);
  const riskLevel = getRiskLevelForSkill(riskData.score, skillLevel);

  const getMarkerColor = (color) => {
    switch(color) {
      case '#10b981': return '#10b981'; // green
      case '#f59e0b': return '#f59e0b'; // yellow
      case '#ef4444': return '#ef4444'; // red
      default: return '#6b7280';
    }
  };

  return (
    <Marker
      coordinate={{
        latitude: spot.coordinates.latitude,
        longitude: spot.coordinates.longitude,
      }}
      onPress={onPress}
      pinColor={getMarkerColor(riskLevel.color)}
      opacity={isSelected ? 1 : 0.85}
      zIndex={isSelected ? 1000 : 1}
    >
      {/* Custom Marker View */}
      <View style={[
        styles.markerContainer,
        isSelected && styles.markerContainerSelected
      ]}>
        <View style={[
          styles.markerPin,
          { backgroundColor: riskLevel.color }
        ]}>
          <Text style={styles.markerText}>
            {riskData.score.toFixed(1)}
          </Text>
        </View>
        <View style={[
          styles.markerArrow,
          { borderTopColor: riskLevel.color }
        ]} />
      </View>

      {/* Callout */}
      <Callout tooltip>
        <View style={styles.calloutContainer}>
          <View style={styles.calloutHeader}>
            <Text style={styles.calloutTitle}>{spot.name}</Text>
            <Text style={styles.calloutEmoji}>{riskLevel.emoji}</Text>
          </View>

          <View style={styles.calloutRiskContainer}>
            <Text style={styles.calloutRiskLabel}>Risk Score</Text>
            <Text style={[styles.calloutRiskScore, { color: riskLevel.color }]}>
              {riskData.score}/10
            </Text>
          </View>

          <View style={[
            styles.calloutBadge,
            { backgroundColor: riskLevel.bgColor }
          ]}>
            <Text style={[styles.calloutBadgeText, { color: riskLevel.textColor }]}>
              {riskLevel.emoji} {riskLevel.level} Risk
            </Text>
          </View>

          <Text style={styles.calloutLocation}>📍 {spot.location}</Text>

          <View style={styles.calloutStats}>
            <View style={styles.calloutStatItem}>
              <Text style={styles.calloutStatValue}>{spot.totalIncidents || 0}</Text>
              <Text style={styles.calloutStatLabel}>Incidents</Text>
            </View>
            <View style={styles.calloutStatDivider} />
            <View style={styles.calloutStatItem}>
              <Text style={styles.calloutStatValue}>
                {spot.recentHazards?.length || 0}
              </Text>
              <Text style={styles.calloutStatLabel}>Hazards</Text>
            </View>
          </View>

          <Text style={styles.calloutUpdated}>
            Updated: {formatRelativeDate(spot.lastUpdated)}
          </Text>
        </View>
      </Callout>
    </Marker>
  );
};

const styles = StyleSheet.create({
  markerContainer: { alignItems: 'center' },
  markerContainerSelected: { transform: [{ scale: 1.2 }] },
  markerPin: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: 'white', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.3, shadowRadius: 3, elevation: 5 },
  markerText: { color: 'white', fontSize: 12, fontWeight: 'bold' },
  markerArrow: { width: 0, height: 0, backgroundColor: 'transparent', borderStyle: 'solid', borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 10, borderLeftColor: 'transparent', borderRightColor: 'transparent' },

  calloutContainer: { backgroundColor: 'white', borderRadius: 12, padding: 16, width: 260, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 5, elevation: 8 },
  calloutHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  calloutTitle: { fontSize: 18, fontWeight: 'bold', color: '#0891b2', flex: 1 },
  calloutEmoji: { fontSize: 24 },
  calloutRiskContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  calloutRiskLabel: { fontSize: 14, color: '#6b7280' },
  calloutRiskScore: { fontSize: 24, fontWeight: 'bold' },
  calloutBadge: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, alignSelf: 'flex-start', marginBottom: 12 },
calloutBadgeText: { fontSize: 13, fontWeight: '600' },
calloutLocation: { fontSize: 13, color: '#6b7280', marginBottom: 12 },
calloutStats: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 12, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#e5e7eb', marginBottom: 8 },
calloutStatItem: { alignItems: 'center' },
calloutStatValue: { fontSize: 20, fontWeight: 'bold', color: '#0891b2' },
calloutStatLabel: { fontSize: 11, color: '#9ca3af', marginTop: 2 },
calloutStatDivider: { width: 1, backgroundColor: '#e5e7eb' },
calloutUpdated: { fontSize: 11, color: '#9ca3af', marginTop: 4 },
});
export default RiskMarker;