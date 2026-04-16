/**
 * WebMap — Leaflet-based map for web browser testing.
 * react-native-maps only works on native, so this provides a web fallback.
 *
 * Props:
 *   onMapPress({ latitude, longitude }) — called when user taps the map
 *   currentLocation { latitude, longitude } — blue "you are here" dot
 */
import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';

let leafletCssInjected = false;
function injectLeafletCss() {
  if (leafletCssInjected || typeof document === 'undefined') return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
  document.head.appendChild(link);
  leafletCssInjected = true;
}

const DEFAULT_CENTER = [12.9716, 80.2209];
const DEFAULT_ZOOM = 14;

const WebMap = ({ region, markers = [], driverLocation, currentLocation, polyline = [], roadRoute = [], dropRoadRoute = [], style, onMapPress }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef([]);
  const currentLocLayerRef = useRef(null);

  const center = useMemo(() => {
    if (driverLocation) return [driverLocation.latitude, driverLocation.longitude];
    if (region) return [region.latitude, region.longitude];
    return DEFAULT_CENTER;
  }, [region?.latitude, region?.longitude, driverLocation?.latitude, driverLocation?.longitude]);

  // Initialize map
  useEffect(() => {
    injectLeafletCss();
    const L = require('leaflet');
    if (!mapRef.current || mapInstanceRef.current) return;

    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const map = L.map(mapRef.current).setView(center, DEFAULT_ZOOM);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map);

    // Map tap → onMapPress callback
    map.on('click', (e) => {
      if (onMapPress) {
        onMapPress({ latitude: e.latlng.lat, longitude: e.latlng.lng });
      }
    });

    mapInstanceRef.current = map;
    setTimeout(() => map.invalidateSize(), 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update current location dot
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const L = require('leaflet');

    if (currentLocLayerRef.current) {
      currentLocLayerRef.current.remove();
      currentLocLayerRef.current = null;
    }

    if (currentLocation?.latitude && currentLocation?.longitude) {
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:16px;height:16px;border-radius:50%;background:#2563EB;border:3px solid white;box-shadow:0 0 0 6px rgba(37,99,235,0.2)"></div>`,
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      currentLocLayerRef.current = L.marker(
        [currentLocation.latitude, currentLocation.longitude],
        { icon }
      ).addTo(map);
    }
  }, [currentLocation?.latitude, currentLocation?.longitude]);

  // Update markers, driver, polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const L = require('leaflet');

    layersRef.current.forEach((l) => l.remove());
    layersRef.current = [];

    if (driverLocation) {
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:28px;height:28px;border-radius:50%;background:#643ee8;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3);color:white;font-size:14px">🚗</div>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
      const m = L.marker([driverLocation.latitude, driverLocation.longitude], { icon }).addTo(map);
      m.bindPopup('Driver');
      layersRef.current.push(m);
      map.panTo([driverLocation.latitude, driverLocation.longitude], { animate: true });
    }

    markers.forEach((mk) => {
      if (!mk.latitude || !mk.longitude) return;
      const color = mk.color || '#9e9aa8';
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:26px;height:26px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;border:2.5px solid white;color:white;font-size:11px;font-weight:700;box-shadow:0 2px 6px rgba(0,0,0,0.25)">${mk.label || '●'}</div>`,
        iconSize: [26, 26],
        iconAnchor: [13, 13],
      });
      const m = L.marker([mk.latitude, mk.longitude], { icon }).addTo(map);
      if (mk.title) m.bindPopup(mk.title);
      layersRef.current.push(m);
    });

    if (polyline.length > 1) {
      const line = L.polyline(
        polyline.map((p) => [p.latitude, p.longitude]),
        { color: '#643ee8', weight: 3, opacity: 0.5, dashArray: '4 4' }
      ).addTo(map);
      layersRef.current.push(line);
    }

    // Pickup road route — purple solid
    if (roadRoute.length > 1) {
      const line = L.polyline(
        roadRoute.map((p) => [p.latitude, p.longitude]),
        { color: '#643ee8', weight: 4, opacity: 0.85 }
      ).addTo(map);
      layersRef.current.push(line);
    }

    // Drop road route — red solid
    if (dropRoadRoute.length > 1) {
      const line = L.polyline(
        dropRoadRoute.map((p) => [p.latitude, p.longitude]),
        { color: '#E84E3E', weight: 4, opacity: 0.85 }
      ).addTo(map);
      layersRef.current.push(line);
    }

    const allPoints = [
      ...(driverLocation ? [[driverLocation.latitude, driverLocation.longitude]] : []),
      ...markers.filter((m) => m.latitude && m.longitude).map((m) => [m.latitude, m.longitude]),
    ];
    if (allPoints.length > 1) {
      map.fitBounds(L.latLngBounds(allPoints), { padding: [40, 40] });
    } else if (allPoints.length === 1) {
      map.setView(allPoints[0], DEFAULT_ZOOM);
    }
  }, [markers, driverLocation, polyline, roadRoute, dropRoadRoute]);

  // Pan when region prop changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !region) return;
    map.setView([region.latitude, region.longitude], DEFAULT_ZOOM, { animate: true });
  }, [region?.latitude, region?.longitude]);

  return (
    <View style={[styles.container, style]}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden', borderRadius: 12 },
});

export default WebMap;
