/**
 * WebMap — Leaflet-based map for web browser testing.
 * react-native-maps only works on native, so this provides a web fallback.
 */
import React, { useEffect, useRef, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import 'leaflet/dist/leaflet.css';

// Leaflet CSS injection (runs once)
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

const WebMap = ({ region, markers = [], driverLocation, polyline = [], style }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersRef = useRef([]);

  // Memoize center from region
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

    // Fix Leaflet default icon
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

    mapInstanceRef.current = map;
    setTimeout(() => map.invalidateSize(), 200);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update markers, driver, polyline
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const L = require('leaflet');

    // Clear previous layers
    layersRef.current.forEach((l) => l.remove());
    layersRef.current = [];

    // Driver marker
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

    // Stop markers
    markers.forEach((mk) => {
      if (!mk.latitude || !mk.longitude) return;
      const color = mk.color || '#9e9aa8';
      const icon = L.divIcon({
        className: '',
        html: `<div style="width:22px;height:22px;border-radius:50%;background:${color};display:flex;align-items:center;justify-content:center;border:2px solid white;color:white;font-size:10px;font-weight:700">${mk.label || '●'}</div>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
      });
      const m = L.marker([mk.latitude, mk.longitude], { icon }).addTo(map);
      if (mk.title) m.bindPopup(mk.title);
      layersRef.current.push(m);
    });

    // Polyline
    if (polyline.length > 1) {
      const line = L.polyline(
        polyline.map((p) => [p.latitude, p.longitude]),
        { color: '#643ee8', weight: 4, opacity: 0.8 }
      ).addTo(map);
      layersRef.current.push(line);
    }

    // Fit bounds
    const allPoints = [
      ...(driverLocation ? [[driverLocation.latitude, driverLocation.longitude]] : []),
      ...markers.filter((m) => m.latitude && m.longitude).map((m) => [m.latitude, m.longitude]),
    ];
    if (allPoints.length > 1) {
      map.fitBounds(L.latLngBounds(allPoints), { padding: [40, 40] });
    } else if (allPoints.length === 1) {
      map.setView(allPoints[0], DEFAULT_ZOOM);
    }
  }, [markers, driverLocation, polyline]);

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
