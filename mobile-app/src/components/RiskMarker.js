import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Marker, Callout } from 'react-native-maps';
import RiskFlag from './RiskFlag';

/**
 * RiskMarker Component
 * Custom map marker displaying surf spot with risk-based styling
 */
const RiskMarker = ({ spot, onPress, isSelected }) => {
  /**
   * Get marker color based on risk level
   */
  const getMarkerColor = (flagColor) => {
    switch (flagColor) {
      case 'green':
        return '#10b981';
      case 'yellow':
        return '#f59e0b';
      case 'red':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  /**
   * Get risk emoji based on flag color
   */
  const getRiskEmoji = (flagColor) => {
    switch (flagColor) {
      case 'green':
        return '🟢';
      case 'yellow':
        return '🟡';
      case 'red':
        return '🔴';
      default:
        return '⚪';
    }
  };

  /**
   * Format last updated date
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffHrs = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffHrs / 24);

    if (diffHrs < 1) return 'Just now';
    if (diffHrs < 24) return `${diffHrs}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Marker
      coordinate={{
        latitude: spot.coordinates.latitude,
        longitude: spot.coordinates.longitude,
      }}
      onPress={onPress}
      pinColor={getMarkerColor(spot.flagColor)}
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
          { backgroundColor: getMarkerColor(spot.flagColor) }
        ]}>
          <Text style={styles.markerText}>
            {spot.riskScore.toFixed(1)}
          </Text>
        </View>
        <View style={[
          styles.markerArrow,
          { borderTopColor: getMarkerColor(spot.flagColor) }
        ]} />
      </View>

      {/* Callout - Info popup when marker is tapped */}
      <Callout tooltip>
        <View style={styles.calloutContainer}>
          {/* Header with flag */}
          <View style={styles.calloutHeader}>
            <Text style={styles.calloutTitle}>{spot.name}</Text>
            <RiskFlag flagColor={spot.flagColor} size="small" />
          </View>

          {/* Risk Score */}
          <View style={styles.calloutRiskContainer}>
            <Text style={styles.calloutRiskLabel}>Risk Score</Text>
            <Text style={[
              styles.calloutRiskScore,
              { color: getMarkerColor(spot.flagColor) }
            ]}>
              {spot.riskScore}/10
            </Text>
          </View>

          {/* Risk Level Badge */}
          <View style={[
            styles.calloutBadge,
            {
              backgroundColor:
                spot.riskLevel === 'High' ? '#fee2e2' :
                spot.riskLevel === 'Medium' ? '#fef3c7' :
                '#d1fae5'
            }
          ]}>
            <Text style={[
              styles.calloutBadgeText,
              {
                color:
                  spot.riskLevel === 'High' ? '#991b1b' :
                  spot.riskLevel === 'Medium' ? '#92400e' :
                  '#065f46'
              }
            ]}>
              {getRiskEmoji(spot.flagColor)} {spot.riskLevel} Risk
            </Text>
          </View>

          {/* Location */}
          <Text style={styles.calloutLocation}>📍 {spot.location}</Text>

          {/* Statistics */}
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
              <Text style={styles.calloutStatLabel}>Recent Hazards</Text>
            </View>
          </View>

          {/* Last Updated */}
          <Text style={styles.calloutUpdated}>
            Updated: {formatDate(spot.lastUpdated)}
          </Text>

          {/* Tap for details hint */}
          <Text style={styles.calloutHint}>Tap for more details →</Text>
        </View>
      </Callout>
    </Marker>
  );
};

const styles = StyleSheet.create({
  // Custom Marker Styles
  markerContainer: {
    alignItems: 'center',
  },
  markerContainerSelected: {
    transform: [{ scale: 1.2 }],
  },
  markerPin: {
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
  markerText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  markerArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
  },

  // Callout Styles
  calloutContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    width: 260,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  calloutHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  calloutTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0891b2',
    flex: 1,
  },
  calloutRiskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  calloutRiskLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  calloutRiskScore: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  calloutBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  calloutBadgeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  calloutLocation: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 12,
  },
  calloutStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 8,
  },
  calloutStatItem: {
    alignItems: 'center',
  },
  calloutStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0891b2',
  },
  calloutStatLabel: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  calloutStatDivider: {
    width: 1,
    backgroundColor: '#e5e7eb',
  },
  calloutUpdated: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 4,
  },
  calloutHint: {
    fontSize: 11,
    color: '#0891b2',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});

export default RiskMarker;
