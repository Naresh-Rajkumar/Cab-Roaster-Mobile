/**
 * NativeMap — WebView-based Leaflet map for iOS and Android.
 *
 * Why WebView instead of react-native-maps:
 *  - Works in Expo Go without a development build
 *  - No Google Maps API key required
 *  - Uses free OpenStreetMap tiles
 *  - Identical rendering to the WebMap used on web
 *
 * Ref API (via useImperativeHandle):
 *  ref.current.animateToRegion({ latitude, longitude, latitudeDelta, longitudeDelta })
 *  — matches the react-native-maps MapView API used in LiveTrackingScreen
 */
import React, { useRef, useEffect, useImperativeHandle, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';

// ─── Leaflet HTML template ────────────────────────────────────────────────────
// Leaflet is loaded from CDN. The map exposes two global functions:
//   updateMap(data)           — update driver marker, stop markers, polyline, roadRoute
//   animateTo(lat, lng, zoom) — pan + zoom to a position
const MAP_HTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body, #map { width: 100%; height: 100%; overflow: hidden; }
    .driver-pin {
      width: 38px; height: 38px; border-radius: 50%;
      background: #643ee8; display: flex; align-items: center;
      justify-content: center; border: 3px solid #fff;
      box-shadow: 0 3px 10px rgba(100,62,232,0.45); font-size: 18px;
    }
    .stop-wrap {
      position: relative;
      display: flex;
      align-items: center;
      pointer-events: none;
    }
    .stop-pin {
      border-radius: 50%;
      display: flex; align-items: center;
      justify-content: center; border: 2.5px solid #fff; color: #fff;
      font-size: 11px; font-weight: 700;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
      flex-shrink: 0;
    }
    .eta-badge {
      position: absolute;
      left: 30px;
      top: -6px;
      background: #fff;
      border-radius: 10px;
      padding: 3px 9px;
      font-size: 11px;
      font-weight: 700;
      color: #643ee8;
      white-space: nowrap;
      box-shadow: 0 2px 6px rgba(0,0,0,0.18);
      border: 1px solid rgba(100,62,232,0.2);
      pointer-events: none;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    // ── Map init ────────────────────────────────────────────────────────────
    var map = L.map('map', { zoomControl: false, attributionControl: false })
               .setView([12.9716, 80.2209], 15);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19
    }).addTo(map);

    // ── Layer refs ──────────────────────────────────────────────────────────
    var driverLayer  = null;
    var stopLayers   = [];
    var trailLayer   = null;
    var roadLayer    = null;

    // ── Icon factories ──────────────────────────────────────────────────────
    function driverIcon() {
      return L.divIcon({
        className: '',
        html: '<div class="driver-pin">🚗</div>',
        iconSize:   [38, 38],
        iconAnchor: [19, 19],
      });
    }

    function stopIcon(color, label, eta) {
      var bg = color || '#9e9aa8';
      var size = 26;
      var etaHtml = eta
        ? '<div class="eta-badge">' + eta + '</div>'
        : '';
      return L.divIcon({
        className: '',
        html: '<div class="stop-wrap">' +
              '<div class="stop-pin" style="width:' + size + 'px;height:' + size + 'px;background:' + bg + '">' +
              (label || '●') + '</div>' +
              etaHtml +
              '</div>',
        iconSize:   [size, size],
        iconAnchor: [size / 2, size / 2],
      });
    }

    // ── Public API ──────────────────────────────────────────────────────────
    window.updateMap = function(data) {
      // Driver marker
      if (data.driverLocation) {
        var pos = [data.driverLocation.latitude, data.driverLocation.longitude];
        if (driverLayer) {
          driverLayer.setLatLng(pos);
        } else {
          driverLayer = L.marker(pos, { icon: driverIcon() }).addTo(map);
        }
        map.panTo(pos, { animate: true, duration: 0.5 });
      }

      // Stop markers — clear then redraw
      stopLayers.forEach(function(m) { m.remove(); });
      stopLayers = [];
      if (data.markers && data.markers.length) {
        data.markers.forEach(function(mk) {
          if (!mk.latitude || !mk.longitude) return;
          var m = L.marker(
            [mk.latitude, mk.longitude],
            { icon: stopIcon(mk.color, mk.label, mk.eta) }
          ).addTo(map);
          if (mk.title) m.bindPopup(mk.title);
          stopLayers.push(m);
        });
      }

      // GPS trail (breadcrumb where cab has been — dashed, lighter)
      if (trailLayer) { trailLayer.remove(); trailLayer = null; }
      if (data.polyline && data.polyline.length > 1) {
        trailLayer = L.polyline(
          data.polyline.map(function(p) { return [p.latitude, p.longitude]; }),
          { color: '#643ee8', weight: 3, opacity: 0.5, dashArray: '4 4' }
        ).addTo(map);
      }

      // Road-following route ahead (OSRM, dashed purple)
      if (roadLayer) { roadLayer.remove(); roadLayer = null; }
      if (data.roadRoute && data.roadRoute.length > 1) {
        roadLayer = L.polyline(
          data.roadRoute.map(function(p) { return [p.latitude, p.longitude]; }),
          { color: '#643ee8', weight: 4, opacity: 0.85, dashArray: '8 6' }
        ).addTo(map);
      }
    };

    window.animateTo = function(lat, lng, zoom) {
      map.setView([lat, lng], zoom || map.getZoom(), { animate: true, duration: 0.6 });
    };
  </script>
</body>
</html>
`;

// ─── Component ────────────────────────────────────────────────────────────────
const NativeMap = React.forwardRef((
  { region, markers = [], driverLocation, polyline = [], roadRoute = [], style },
  ref,
) => {
  const webViewRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  // Queue updates that arrive before the WebView finishes loading
  const pendingUpdateRef = useRef(null);

  // Expose animateToRegion so LiveTrackingScreen can pan the map via mapRef
  useImperativeHandle(ref, () => ({
    animateToRegion: (r) => {
      const js = `window.animateTo(${r.latitude}, ${r.longitude}, 16); true;`;
      webViewRef.current?.injectJavaScript(js);
    },
  }));

  // Push data into the WebView whenever props change
  useEffect(() => {
    const payload = JSON.stringify({
      driverLocation: driverLocation ?? null,
      markers,
      polyline,
      roadRoute,
    });
    const js = `window.updateMap(${payload}); true;`;

    if (mapReady) {
      webViewRef.current?.injectJavaScript(js);
    } else {
      // Store the latest update so we can send it once the map is ready
      pendingUpdateRef.current = js;
    }
  }, [driverLocation, markers, polyline, roadRoute, mapReady]);

  // Also pan to the region prop when it changes (initial centre)
  useEffect(() => {
    if (!mapReady || !region) return;
    const js = `window.animateTo(${region.latitude}, ${region.longitude}, 15); true;`;
    webViewRef.current?.injectJavaScript(js);
  }, [region?.latitude, region?.longitude, mapReady]);

  const handleLoad = () => {
    setMapReady(true);
    if (pendingUpdateRef.current) {
      webViewRef.current?.injectJavaScript(pendingUpdateRef.current);
      pendingUpdateRef.current = null;
    }
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ html: MAP_HTML }}
        style={styles.webview}
        onLoad={handleLoad}
        scrollEnabled={false}
        javaScriptEnabled
        domStorageEnabled
        originWhitelist={['*']}
        mixedContentMode="always"
        onError={(e) => console.warn('[NativeMap] WebView error:', e.nativeEvent)}
      />
    </View>
  );
});

NativeMap.displayName = 'NativeMap';

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
  webview:   { flex: 1, backgroundColor: 'transparent' },
});

export default NativeMap;
