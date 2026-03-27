/**
 * NativeMap — Wrapper around react-native-maps for iOS/Android.
 */
import React from 'react';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NativeMap = ({ region, markers = [], driverLocation, polyline = [], style, showsUserLocation }) => (
  <MapView
    style={[styles.map, style]}
    region={region}
    showsUserLocation={showsUserLocation}
    showsMyLocationButton={false}
  >
    {driverLocation && (
      <Marker coordinate={driverLocation} title="Driver">
        <View style={styles.driverMarker}>
          <Ionicons name="car" size={14} color="#fff" />
        </View>
      </Marker>
    )}

    {markers.map((m) => (
      <Marker
        key={m.id}
        coordinate={{ latitude: m.latitude, longitude: m.longitude }}
        title={m.title}
      >
        {m.children || (
          <View style={[styles.stopMarker, { backgroundColor: m.color || '#9e9aa8' }]}>
            <Ionicons name="location" size={12} color="#fff" />
          </View>
        )}
      </Marker>
    ))}

    {polyline.length > 1 && (
      <Polyline
        coordinates={polyline}
        strokeColor="#643ee8"
        strokeWidth={4}
      />
    )}
  </MapView>
);

const styles = StyleSheet.create({
  map: { flex: 1 },
  driverMarker: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#643ee8', alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
  stopMarker: {
    width: 24, height: 24, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: '#fff',
  },
});

export default NativeMap;
