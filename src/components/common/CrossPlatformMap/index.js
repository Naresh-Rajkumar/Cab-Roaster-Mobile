/**
 * CrossPlatformMap — Renders Leaflet on web, react-native-maps on native.
 *
 * Props:
 *   region: { latitude, longitude, latitudeDelta, longitudeDelta }
 *   markers: [{ id, latitude, longitude, title, color, children }]
 *   driverLocation: { latitude, longitude } — blue car marker
 *   polyline: [{ latitude, longitude }] — route trail
 *   style: ViewStyle
 *   showsUserLocation: boolean
 */
import { Platform } from 'react-native';

const CrossPlatformMap = Platform.OS === 'web'
  ? require('./WebMap').default
  : require('./NativeMap').default;

export default CrossPlatformMap;
