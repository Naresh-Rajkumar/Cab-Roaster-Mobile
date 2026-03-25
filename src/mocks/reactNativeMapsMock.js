/**
 * Web stub for react-native-maps.
 * react-native-maps uses Codegen (codegenNativeComponent) which is not
 * supported by react-native-web. This stub is swapped in by metro.config.js
 * when bundling for web so the app doesn't crash.
 * Maps simply render as an empty View on web.
 */
import React from 'react';
import { View } from 'react-native';

const MapView = ({ children, style }) => <View style={style}>{children}</View>;
MapView.Animated = MapView;

const Marker = () => null;
const Polyline = () => null;
const Circle = () => null;
const Polygon = () => null;
const Callout = ({ children }) => children || null;

export const PROVIDER_GOOGLE = 'google';
export const PROVIDER_DEFAULT = null;

export { Marker, Polyline, Circle, Polygon, Callout };
export default MapView;
