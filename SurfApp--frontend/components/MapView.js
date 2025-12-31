import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

/**
 * MapView Component WITHOUT Google API Key
 * Uses default map provider (Apple Maps on iOS, OpenStreetMap-based on Android)
 */
const SurfMapView = ({ surfSpots, onSpotSelect, selectedSpot, selectedSkillLevel }) => {
  const mapRef = useRef(null);
  const [mapType, setMapType] = useState('standard');
  const [mapReady, setMapReady] = useState(false);

  // Sri Lanka center coordinates
  const INITIAL_REGION = {
    latitude: 7.8731,
    longitude: 80.7718,
    latitudeDelta: 3.5,
    longitudeDelta: 3.5,
  };

  useEffect(() => {
    // Fit markers after map is ready and spots are loaded
    if (mapReady && surfSpots.length > 0) {
      setTimeout(() => {
        fitAllMarkers();
      }, 500);
    }
  }, [mapReady, surfSpots]);

  /**
   * Handle map ready
   */
  const handleMapReady = () => {
    console.log('Map is ready');
    setMapReady(true);
  };

  /**
   * Get risk data for selected skill level
   */
  const getRiskDataForSkill = (spot) => {
    if (!spot || !spot.skillLevelRisks) {
      return { score: 0, level: 'Unknown', flagColor: 'green' };
    }

    const skillData = spot.skillLevelRisks[selectedSkillLevel];
    if (skillData) {
      return {
        score: skillData.riskScore || 0,
        level: skillData.riskLevel || 'Unknown',
        flagColor: skillData.flagColor || 'green'
      };
    }

    // Fallback to overall
    return {
      score: spot.riskScore || 0,
      level: spot.riskLevel || 'Unknown',
      flagColor: spot.flagColor || 'green'
    };
  };

  /**
   * Get marker color based on flag
   */
  const getMarkerColor = (flagColor) => {
    switch(flagColor) {
      case 'green': return '#10b981';
      case 'yellow': return '#f59e0b';
      case 'red': return '#ef4444';
      default: return '#6b7280';
    }
  };

  /**
   * Handle marker press
   */
  const handleMarkerPress = (spot) => {
    if (onSpotSelect) {
      onSpotSelect(spot);
    }

    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: spot.coordinates.latitude,
          longitude: spot.coordinates.longitude,
          latitudeDelta: 0.5,
          longitudeDelta: 0.5,
        },
        1000
      );
    }
  };

  /**
   * Toggle map type
   */
  const toggleMapType = () => {
    const types = ['standard', 'satellite', 'hybrid'];
    const currentIndex = types.indexOf(mapType);
    const nextIndex = (currentIndex + 1) % types.length;
    setMapType(types[nextIndex]);
  };

  /**
   * Reset map view
   */
  const resetMapView = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(INITIAL_REGION, 1000);
    }
  };

  /**
   * Fit all markers
   */
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

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={INITIAL_REGION}
        mapType={mapType}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        loadingEnabled={true}
        loadingBackgroundColor="#e0f2fe"
        onMapReady={handleMapReady}
        moveOnMarkerPress={false}
      >
        {surfSpots.map((spot) => {
          if (!spot.coordinates?.latitude || !spot.coordinates?.longitude) {
            return null;
          }

          const riskData = getRiskDataForSkill(spot);
          const isSelected = selectedSpot?._id === spot._id;
          const markerColor = getMarkerColor(riskData.flagColor);

          return (
            <Marker
              key={spot._id}
              coordinate={{
                latitude: spot.coordinates.latitude,
                longitude: spot.coordinates.longitude,
              }}
              onPress={() => handleMarkerPress(spot)}
              pinColor={markerColor}
            >
              <View style={[
                styles.customMarker,
                isSelected && styles.customMarkerSelected,
                { backgroundColor: markerColor }
              ]}>
                <Text style={styles.markerText}>{riskData.score.toFixed(1)}</Text>
              </View>
            </Marker>
          );
        })}
      </MapView>

      {/* Map Controls */}
      <View style={styles.controlsContainer}>
        <TouchableOpacity
          style={styles.controlButton}
          onPress={toggleMapType}
          activeOpacity={0.7}
        >
          <Text style={styles.controlButtonText}>
            {mapType === 'standard' ? '🗺️' : mapType === 'satellite' ? '🛰️' : '🌍'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={resetMapView}
          activeOpacity={0.7}
        >
          <Text style={styles.controlButtonText}>🎯</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.controlButton}
          onPress={fitAllMarkers}
          activeOpacity={0.7}
        >
          <Text style={styles.controlButtonText}>🔍</Text>
        </TouchableOpacity>
      </View>

      {/* Legend */}
      <View style={styles.legendContainer}>
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

      {/* Selected Spot Banner */}
      {selectedSpot && (
        <View style={styles.selectedSpotBanner}>
          <Text style={styles.selectedSpotName}>{selectedSpot.name}</Text>
          <Text style={styles.selectedSpotRisk}>
            Risk Score: {getRiskDataForSkill(selectedSpot).score.toFixed(1)}/10
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
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
  markerText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  controlsContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  controlButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
  },
  controlButtonText: {
    fontSize: 24,
  },
  legendContainer: {
    position: 'absolute',
    bottom: 20,
    left: 10,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  legendTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 3,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 11,
    color: '#6b7280',
  },
  selectedSpotBanner: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 80,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  selectedSpotName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0891b2',
    marginBottom: 4,
  },
  selectedSpotRisk: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default SurfMapView;