import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import RiskMarker from './RiskMarker';

/**
 * MapView Component
 * Displays interactive map with surf spot markers and risk indicators
 */
const SurfMapView = ({ surfSpots, onSpotSelect, selectedSpot }) => {
  const mapRef = useRef(null);
  const [mapType, setMapType] = useState('standard'); // standard, satellite, hybrid

  // Sri Lanka center coordinates
  const INITIAL_REGION = {
    latitude: 7.8731,
    longitude: 80.7718,
    latitudeDelta: 3.5,
    longitudeDelta: 3.5,
  };

  /**
   * Handle marker press - select surf spot and show details
   */
  const handleMarkerPress = (spot) => {
    if (onSpotSelect) {
      onSpotSelect(spot);
    }

    // Animate to selected spot
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
   * Toggle map type between standard, satellite, and hybrid
   */
  const toggleMapType = () => {
    const types = ['standard', 'satellite', 'hybrid'];
    const currentIndex = types.indexOf(mapType);
    const nextIndex = (currentIndex + 1) % types.length;
    setMapType(types[nextIndex]);
  };

  /**
   * Reset map to initial region showing all of Sri Lanka
   */
  const resetMapView = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(INITIAL_REGION, 1000);
    }
  };

  /**
   * Zoom to fit all markers
   */
  const fitAllMarkers = () => {
    if (mapRef.current && surfSpots.length > 0) {
      const coordinates = surfSpots.map(spot => ({
        latitude: spot.coordinates.latitude,
        longitude: spot.coordinates.longitude,
      }));

      mapRef.current.fitToCoordinates(coordinates, {
        edgePadding: {
          top: 50,
          right: 50,
          bottom: 50,
          left: 50,
        },
        animated: true,
      });
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={INITIAL_REGION}
        mapType={mapType}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        loadingEnabled={true}
        loadingBackgroundColor="#e0f2fe"
      >
        {surfSpots.map((spot) => (
          <RiskMarker
            key={spot._id}
            spot={spot}
            onPress={() => handleMarkerPress(spot)}
            isSelected={selectedSpot?._id === spot._id}
          />
        ))}
      </MapView>

      {/* Map Controls */}
      <View style={styles.controlsContainer}>
        {/* Map Type Toggle */}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={toggleMapType}
          activeOpacity={0.7}
        >
          <Text style={styles.controlButtonText}>
            {mapType === 'standard' ? '🗺️' : mapType === 'satellite' ? '🛰️' : '🌍'}
          </Text>
        </TouchableOpacity>

        {/* Reset View */}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={resetMapView}
          activeOpacity={0.7}
        >
          <Text style={styles.controlButtonText}>🎯</Text>
        </TouchableOpacity>

        {/* Fit All Markers */}
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

      {/* Selected Spot Info Banner */}
      {selectedSpot && (
        <View style={styles.selectedSpotBanner}>
          <Text style={styles.selectedSpotName}>{selectedSpot.name}</Text>
          <Text style={styles.selectedSpotRisk}>
            Risk Score: {selectedSpot.riskScore}/10
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