/**
 * CrossPlatformMap — Native entry point (iOS / Android)
 *
 * Metro resolves .native.js BEFORE .js for native builds, so this file
 * is used instead of index.js — meaning WebMap.js (which requires leaflet)
 * is NEVER bundled on native and the 500 bundle error is eliminated.
 */
export { default } from './NativeMap';
