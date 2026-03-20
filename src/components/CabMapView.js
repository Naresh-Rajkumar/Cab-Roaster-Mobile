/**
 * CabMapView — Leaflet + OpenStreetMap map.
 * No API key required. Same tile provider as the web dashboard.
 *
 * - On web: renders Leaflet directly via iframe (srcdoc)
 * - On native: renders via react-native-webview
 *
 * Features:
 * - Smooth marker animation (CSS transitions)
 * - GPS trail polyline
 * - Heading rotation on cab marker
 * - Camera follow (panTo)
 * - Speed badge overlay
 * - Pulse ring animation (same as web dashboard)
 * - Route polylines (completed + remaining)
 * - Stop markers with color-coded types
 */
import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

let WebView = null;
if (Platform.OS !== 'web') {
  try {
    WebView = require('react-native-webview').WebView;
  } catch {
    // WebView not available on this platform
  }
}

const PRIMARY = '#643ee8';

const DEFAULT_REGION = {
  latitude: 12.9278,
  longitude: 80.2278,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

// ─── Fallback when nothing works ──────────────────────────────────────────────
const MapFallback = ({ markers = [], style }) => (
  <View style={[styles.fallback, style]}>
    <View style={styles.fallbackInner}>
      <Ionicons name="map-outline" size={40} color={PRIMARY} />
      <Text style={styles.fallbackText}>Map View</Text>
      {markers.length > 0 && (
        <Text style={styles.fallbackSub}>
          {markers.map((m) => m.title).filter(Boolean).join(' → ')}
        </Text>
      )}
    </View>
  </View>
);

// ─── Speed Badge Overlay ──────────────────────────────────────────────────────
const SpeedBadge = ({ speed }) => {
  const kmh = Math.round((speed || 0) * 3.6);
  return (
    <View style={styles.speedBadge}>
      <Text style={styles.speedValue}>{kmh}</Text>
      <Text style={styles.speedUnit}>km/h</Text>
    </View>
  );
};

// ─── Generate the Leaflet HTML ────────────────────────────────────────────────
function buildLeafletHTML(initialRegion) {
  const { latitude, longitude } = initialRegion || DEFAULT_REGION;
  const latDelta = initialRegion?.latitudeDelta || 0.05;
  const zoom = Math.min(Math.round(Math.log2(360 / latDelta)), 18);

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"><\/script>
  <style>
    * { margin: 0; padding: 0; }
    html, body, #map { width: 100%; height: 100%; overflow: hidden; }
    @keyframes pulse-ring {
      0% { transform: scale(0.8); opacity: 0.8; }
      100% { transform: scale(2); opacity: 0; }
    }
    .cab-marker { transition: transform 0.5s ease-out; }
    .cab-dot {
      width: 20px; height: 20px; border-radius: 50%;
      background: #2563eb; border: 3px solid #fff;
      box-shadow: 0 0 12px rgba(37,99,235,0.5);
      z-index: 2; position: relative;
    }
    .cab-dot.stationary { background: #16a34a; box-shadow: 0 0 12px rgba(22,163,106,0.5); }
    .cab-pulse {
      position: absolute; width: 36px; height: 36px; border-radius: 50%;
      background: rgba(37,99,235,0.2); top: 50%; left: 50%;
      margin-top: -18px; margin-left: -18px;
      animation: pulse-ring 2s ease-out infinite; z-index: 1;
    }
    .cab-pulse.stationary { background: rgba(22,163,106,0.2); }
    .cab-arrow {
      width: 0; height: 0;
      border-left: 6px solid transparent; border-right: 6px solid transparent;
      border-bottom: 10px solid #2563eb;
      position: absolute; top: -12px; left: 50%; margin-left: -6px;
      z-index: 3; transition: opacity 0.3s;
    }
    .cab-arrow.stationary { border-bottom-color: #16a34a; opacity: 0; }
    .leaflet-control-attribution { font-size: 8px !important; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', {
      center: [${latitude}, ${longitude}],
      zoom: ${zoom},
      zoomControl: false,
      attributionControl: true
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '\\u00a9 OpenStreetMap',
      maxZoom: 19
    }).addTo(map);

    var cabMarker = null, trailPolyline = null, completedPolyline = null;
    var remainingPolyline = null, stopMarkers = [], followMode = false;

    function createCabIcon(heading, isMoving) {
      var cls = isMoving ? '' : ' stationary';
      return L.divIcon({
        className: 'cab-marker',
        html: '<div style="position:relative;width:36px;height:36px;display:flex;align-items:center;justify-content:center;">' +
          '<div class="cab-pulse' + cls + '"><\\/div>' +
          '<div class="cab-arrow' + cls + '" style="transform:rotate(' + heading + 'deg);"><\\/div>' +
          '<div class="cab-dot' + cls + '"><\\/div>' +
          '<\\/div>',
        iconSize: [36, 36], iconAnchor: [18, 18]
      });
    }

    function createStopIcon(type, index) {
      var colors = { pickup: '#22C55E', drop: '#643ee8', stop: '#6B7280', default: '#643ee8' };
      var color = colors[type] || colors['default'];
      var label = type === 'drop' ? '\\u25CF' : (index + 1);
      return L.divIcon({
        className: '',
        html: '<div style="width:28px;height:28px;border-radius:50%;background:' + color +
          ';color:#fff;display:flex;align-items:center;justify-content:center;' +
          'font-size:12px;font-weight:700;border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);">' +
          label + '<\\/div>',
        iconSize: [28, 28], iconAnchor: [14, 14]
      });
    }

    function updateCab(lat, lng, heading, speed) {
      var isMoving = (speed || 0) > 0.5;
      var icon = createCabIcon(heading || 0, isMoving);
      if (!cabMarker) {
        cabMarker = L.marker([lat, lng], { icon: icon, zIndexOffset: 1000 }).addTo(map);
      } else {
        cabMarker.setLatLng([lat, lng]);
        cabMarker.setIcon(icon);
      }
      if (followMode) {
        map.setView([lat, lng], map.getZoom(), { animate: true, duration: 0.5 });
      }
    }

    function updateTrail(coords) {
      if (trailPolyline) map.removeLayer(trailPolyline);
      if (coords.length > 1) {
        trailPolyline = L.polyline(coords, {
          color: '#6366f1', weight: 4, opacity: 0.7, lineJoin: 'round', lineCap: 'round'
        }).addTo(map);
      }
    }

    function updateRoutePolylines(completed, remaining) {
      if (completedPolyline) map.removeLayer(completedPolyline);
      if (remainingPolyline) map.removeLayer(remainingPolyline);
      if (completed && completed.length > 1) {
        completedPolyline = L.polyline(completed, { color: '#22C55E', weight: 4, opacity: 0.8 }).addTo(map);
      }
      if (remaining && remaining.length > 1) {
        remainingPolyline = L.polyline(remaining, { color: '#643ee8', weight: 3, opacity: 0.7, dashArray: '8, 6' }).addTo(map);
      }
    }

    function updateStopMarkers(stops) {
      stopMarkers.forEach(function(m) { map.removeLayer(m); });
      stopMarkers = [];
      stops.forEach(function(s, i) {
        var icon = createStopIcon(s.type, i);
        var m = L.marker([s.lat, s.lng], { icon: icon }).addTo(map);
        if (s.title) m.bindPopup('<b>' + s.title + '<\\/b><br>' + (s.description || ''));
        stopMarkers.push(m);
      });
    }

    function fitBounds(points) {
      if (points.length > 1) {
        map.fitBounds(L.latLngBounds(points), { padding: [40, 40], maxZoom: 16, animate: true });
      } else if (points.length === 1) {
        map.setView(points[0], 15, { animate: true });
      }
    }

    function handleMessage(data) {
      try {
        var msg = typeof data === 'string' ? JSON.parse(data) : data;
        switch (msg.type) {
          case 'updateCab': updateCab(msg.lat, msg.lng, msg.heading, msg.speed); break;
          case 'updateTrail': updateTrail(msg.coords); break;
          case 'updateRoutePolylines': updateRoutePolylines(msg.completed, msg.remaining); break;
          case 'updateStopMarkers': updateStopMarkers(msg.stops); break;
          case 'fitBounds': fitBounds(msg.points); break;
          case 'setFollowMode': followMode = msg.on; break;
        }
      } catch (e) {}
    }

    // Listen for postMessage (works for both iframe and RN WebView)
    window.addEventListener('message', function(e) { handleMessage(e.data); });
    document.addEventListener('message', function(e) { handleMessage(e.data); });

    // Signal map ready
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'mapReady' }));
    } else if (window.parent !== window) {
      window.parent.postMessage(JSON.stringify({ type: 'mapReady' }), '*');
    }
  <\/script>
</body>
</html>`;
}

// ─── Main Component ───────────────────────────────────────────────────────────
const CabMapView = ({
  markers = [],
  polylineCoords = [],
  completedPolylineCoords = [],
  cabPosition = null,
  cabHeading = 0,
  cabSpeed = 0,
  trailCoords = [],
  followCab = false,
  showSpeedBadge = false,
  initialRegion = DEFAULT_REGION,
  style,
  onMapReady,
  fitToMarkers = true,
  children,
}) => {
  const webViewRef = useRef(null);  // For native WebView
  const iframeRef = useRef(null);   // For web iframe
  const [mapReady, setMapReady] = useState(false);

  const html = useMemo(() => buildLeafletHTML(initialRegion), []);

  const isWeb = Platform.OS === 'web';

  // Helper to send messages to the map (works for both iframe and WebView)
  const postMessage = useCallback((msg) => {
    if (!mapReady) return;
    const data = JSON.stringify(msg);

    if (isWeb && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(data, '*');
    } else if (!isWeb && webViewRef.current) {
      webViewRef.current.postMessage(data);
    }
  }, [mapReady, isWeb]);

  // Listen for mapReady from iframe on web
  useEffect(() => {
    if (!isWeb) return;
    const handler = (e) => {
      try {
        const msg = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (msg.type === 'mapReady') {
          setMapReady(true);
          onMapReady?.();
        }
      } catch {}
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, [isWeb, onMapReady]);

  // Update cab position
  useEffect(() => {
    if (!cabPosition || !mapReady) return;
    postMessage({
      type: 'updateCab',
      lat: cabPosition.latitude,
      lng: cabPosition.longitude,
      heading: cabHeading,
      speed: cabSpeed,
    });
  }, [cabPosition, cabHeading, cabSpeed, mapReady, postMessage]);

  // Update trail
  useEffect(() => {
    if (!mapReady || trailCoords.length === 0) return;
    postMessage({
      type: 'updateTrail',
      coords: trailCoords.map((c) => [c.latitude, c.longitude]),
    });
  }, [trailCoords, mapReady, postMessage]);

  // Store latest route data in a ref so we can send it when map becomes ready
  const pendingRouteRef = useRef({ completed: [], remaining: [] });

  // Update pending route data whenever props change
  useEffect(() => {
    const completed = completedPolylineCoords.map((c) => [c.latitude, c.longitude]);
    const remaining = polylineCoords.map((c) => [c.latitude, c.longitude]);
    pendingRouteRef.current = { completed, remaining };

    if (!mapReady) return;
    if (completed.length === 0 && remaining.length === 0) return;
    postMessage({ type: 'updateRoutePolylines', completed, remaining });
  }, [completedPolylineCoords, polylineCoords, mapReady, postMessage]);

  // When map becomes ready, flush any pending route data
  useEffect(() => {
    if (!mapReady) return;
    const { completed, remaining } = pendingRouteRef.current;
    if (completed.length === 0 && remaining.length === 0) return;
    postMessage({ type: 'updateRoutePolylines', completed, remaining });
  }, [mapReady, postMessage]);

  // Update stop markers
  useEffect(() => {
    if (!mapReady || markers.length === 0) return;
    postMessage({
      type: 'updateStopMarkers',
      stops: markers.map((m) => ({
        lat: m.coordinate.latitude,
        lng: m.coordinate.longitude,
        title: m.title,
        description: m.description,
        type: m.type,
      })),
    });
  }, [markers, mapReady, postMessage]);

  // Follow mode
  useEffect(() => {
    if (!mapReady) return;
    postMessage({ type: 'setFollowMode', on: followCab });
  }, [followCab, mapReady, postMessage]);

  // Fit to markers (when not following cab)
  useEffect(() => {
    if (!mapReady || followCab || !fitToMarkers) return;

    const points = markers
      .filter((m) => m.coordinate?.latitude && m.coordinate?.longitude)
      .map((m) => [m.coordinate.latitude, m.coordinate.longitude]);

    if (cabPosition) {
      points.push([cabPosition.latitude, cabPosition.longitude]);
    }

    if (points.length > 0) {
      setTimeout(() => postMessage({ type: 'fitBounds', points }), 600);
    }
  }, [markers, cabPosition, fitToMarkers, followCab, mapReady, postMessage]);

  // Handle messages from native WebView
  const onNativeMessage = useCallback((event) => {
    try {
      const msg = JSON.parse(event.nativeEvent.data);
      if (msg.type === 'mapReady') {
        setMapReady(true);
        onMapReady?.();
      }
    } catch {}
  }, [onMapReady]);

  // ─── Web: render via iframe ─────────────────────────────────────────────────
  if (isWeb) {
    return (
      <View style={[styles.container, style]}>
        <iframe
          ref={iframeRef}
          srcDoc={html}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
          }}
          title="CabMap"
        />
        {showSpeedBadge && <SpeedBadge speed={cabSpeed} />}
        {children}
      </View>
    );
  }

  // ─── Native: render via WebView ─────────────────────────────────────────────
  if (!WebView) {
    return <MapFallback markers={markers} style={style} />;
  }

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ html }}
        style={styles.map}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        onMessage={onNativeMessage}
        scrollEnabled={false}
        bounces={false}
        overScrollMode="never"
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        startInLoadingState={false}
        mixedContentMode="always"
      />
      {showSpeedBadge && <SpeedBadge speed={cabSpeed} />}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  speedBadge: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    minWidth: 56,
  },
  speedValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1a1a2e',
    lineHeight: 24,
  },
  speedUnit: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: -2,
  },
  fallback: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#EDE9FE',
    minHeight: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallbackInner: {
    alignItems: 'center',
    gap: 6,
  },
  fallbackText: {
    fontSize: 14,
    fontWeight: '600',
    color: PRIMARY,
  },
  fallbackSub: {
    fontSize: 12,
    color: '#7C3AED',
    textAlign: 'center',
    paddingHorizontal: 16,
  },
});

export default CabMapView;
