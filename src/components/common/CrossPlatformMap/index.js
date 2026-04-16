/**
 * CrossPlatformMap — Renders Leaflet on web, WebView-Leaflet on native.
 *
 * Props:
 *   region: { latitude, longitude, latitudeDelta, longitudeDelta }
 *   markers: [{ id, latitude, longitude, title, color, label, eta }]
 *   driverLocation: { latitude, longitude } — animated car marker
 *   currentLocation: { latitude, longitude } — blue "you are here" pulse dot
 *   polyline: [{ latitude, longitude }] — GPS breadcrumb trail
 *   roadRoute: [{ latitude, longitude }] — OSRM road-following route (purple)
 *   dropRoadRoute: [{ latitude, longitude }] — second OSRM route for drop point (red)
 *   style: ViewStyle
 *   onMapPress({ latitude, longitude }) — fires when user taps map
 */
import { Platform } from 'react-native';

const CrossPlatformMap = Platform.OS === 'web'
  ? require('./WebMap').default
  : require('./NativeMap').default;

export default CrossPlatformMap;
