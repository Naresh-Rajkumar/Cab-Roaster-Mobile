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
 *
 * Additional props:
 *  onMapPress({ latitude, longitude }) — called when the user taps the map
 *  currentLocation { latitude, longitude } — shows a blue "you are here" dot
 */
import React, { useRef, useEffect, useImperativeHandle, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import WebView from 'react-native-webview';

// ─── Leaflet HTML template ────────────────────────────────────────────────────
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
    .current-loc-pin {
      width: 18px; height: 18px; border-radius: 50%;
      background: #2563EB; border: 3px solid #fff;
      box-shadow: 0 0 0 6px rgba(37,99,235,0.22);
    }
    .stop-wrap {
      position: relative; display: flex; align-items: center; pointer-events: none;
    }
    .stop-pin {
      border-radius: 50%; display: flex; align-items: center;
      justify-content: center; border: 2.5px solid #fff; color: #fff;
      font-size: 11px; font-weight: 700;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25); flex-shrink: 0;
    }
    .eta-badge {
      position: absolute; left: 30px; top: -6px;
      background: #fff; border-radius: 10px; padding: 3px 9px;
      font-size: 11px; font-weight: 700; color: #643ee8;
      white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.18);
      border: 1px solid rgba(100,62,232,0.2); pointer-events: none;
    }
    .tap-hint {
      position: absolute; bottom: 10px; left: 50%; transform: translateX(-50%);
      background: rgba(0,0,0,0.55); color: #fff; font-size: 11px;
      padding: 4px 12px; border-radius: 20px; white-space: nowrap;
      pointer-events: none;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var map = L.map('map', { zoomControl: false, attributionControl: false })
               .setView([12.9716, 80.2209], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

    var driverLayer    = null;
    var currentLocLayer = null;
    var stopLayers     = [];
    var trailLayer     = null;
    var roadLayer      = null;
    var dropRoadLayer  = null;
    var tapHintShown   = false;

    function driverIcon() {
      return L.divIcon({ className: '', html: '<div class="driver-pin">🚗</div>', iconSize: [38,38], iconAnchor: [19,19] });
    }

    function currentLocIcon() {
      return L.divIcon({ className: '', html: '<div class="current-loc-pin"></div>', iconSize: [18,18], iconAnchor: [9,9] });
    }

    function stopIcon(color, label, eta) {
      var bg = color || '#9e9aa8';
      var size = 26;
      var etaHtml = eta ? '<div class="eta-badge">' + eta + '</div>' : '';
      return L.divIcon({
        className: '',
        html: '<div class="stop-wrap"><div class="stop-pin" style="width:'+size+'px;height:'+size+'px;background:'+bg+'">' +
              (label || '●') + '</div>' + etaHtml + '</div>',
        iconSize: [size,size], iconAnchor: [size/2, size/2],
      });
    }

    // ── Map tap → post message back to React Native ──────────────────
    map.on('click', function(e) {
      if (window.ReactNativeWebView) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'mapPress',
          latitude: e.latlng.lat,
          longitude: e.latlng.lng,
        }));
      }
    });

    // ── Public API ───────────────────────────────────────────────────
    window.updateMap = function(data) {
      // Driver marker
      if (data.driverLocation) {
        var pos = [data.driverLocation.latitude, data.driverLocation.longitude];
        if (driverLayer) { driverLayer.setLatLng(pos); }
        else { driverLayer = L.marker(pos, { icon: driverIcon() }).addTo(map); }
        map.panTo(pos, { animate: true, duration: 0.5 });
      }

      // Current location dot (blue pulse)
      if (data.currentLocation) {
        var clPos = [data.currentLocation.latitude, data.currentLocation.longitude];
        if (currentLocLayer) { currentLocLayer.setLatLng(clPos); }
        else { currentLocLayer = L.marker(clPos, { icon: currentLocIcon() }).addTo(map); }
      }

      // Stop markers
      stopLayers.forEach(function(m) { m.remove(); });
      stopLayers = [];
      if (data.markers && data.markers.length) {
        data.markers.forEach(function(mk) {
          if (!mk.latitude || !mk.longitude) return;
          var m = L.marker([mk.latitude, mk.longitude], { icon: stopIcon(mk.color, mk.label, mk.eta) }).addTo(map);
          if (mk.title) m.bindPopup(mk.title);
          stopLayers.push(m);
        });
      }

      // GPS trail
      if (trailLayer) { trailLayer.remove(); trailLayer = null; }
      if (data.polyline && data.polyline.length > 1) {
        trailLayer = L.polyline(data.polyline.map(function(p){ return [p.latitude, p.longitude]; }),
          { color: '#643ee8', weight: 3, opacity: 0.5, dashArray: '4 4' }).addTo(map);
      }

      // Pickup road route — purple solid
      if (roadLayer) { roadLayer.remove(); roadLayer = null; }
      if (data.roadRoute && data.roadRoute.length > 1) {
        roadLayer = L.polyline(data.roadRoute.map(function(p){ return [p.latitude, p.longitude]; }),
          { color: '#643ee8', weight: 4, opacity: 0.85 }).addTo(map);
      }

      // Drop road route — red solid
      if (dropRoadLayer) { dropRoadLayer.remove(); dropRoadLayer = null; }
      if (data.dropRoadRoute && data.dropRoadRoute.length > 1) {
        dropRoadLayer = L.polyline(data.dropRoadRoute.map(function(p){ return [p.latitude, p.longitude]; }),
          { color: '#E84E3E', weight: 4, opacity: 0.85 }).addTo(map);
      }
    };

    window.animateTo = function(lat, lng, zoom) {
      map.setView([lat, lng], zoom || map.getZoom(), { animate: true, duration: 0.6 });
    };

    window.showTapHint = function(visible) {
      var el = document.getElementById('tap-hint');
      if (!el) {
        el = document.createElement('div');
        el.id = 'tap-hint';
        el.className = 'tap-hint';
        el.textContent = 'Tap map to set home location';
        document.getElementById('map').appendChild(el);
      }
      el.style.display = visible ? 'block' : 'none';
    };
  </script>
</body>
</html>
`;

// ─── Component ────────────────────────────────────────────────────────────────
const NativeMap = React.forwardRef((
  { region, markers = [], driverLocation, currentLocation, polyline = [], roadRoute = [], dropRoadRoute = [], style, onMapPress },
  ref,
) => {
  const webViewRef = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const pendingUpdateRef = useRef(null);

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
      currentLocation: currentLocation ?? null,
      markers,
      polyline,
      roadRoute,
      dropRoadRoute,
    });
    const js = `window.updateMap(${payload}); true;`;
    if (mapReady) {
      webViewRef.current?.injectJavaScript(js);
    } else {
      pendingUpdateRef.current = js;
    }
  }, [driverLocation, currentLocation, markers, polyline, roadRoute, dropRoadRoute, mapReady]);

  // Pan to region when it changes
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

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'mapPress' && onMapPress) {
        onMapPress({ latitude: data.latitude, longitude: data.longitude });
      }
    } catch (_) {}
  };

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        source={{ html: MAP_HTML }}
        style={styles.webview}
        onLoad={handleLoad}
        onMessage={handleMessage}
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
  webview: { flex: 1, backgroundColor: 'transparent' },
});

export default NativeMap;
