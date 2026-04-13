/**
 * CabArrivedScreen — Employee: "Your cab has arrived"
 *
 * Shown when the driver reaches the employee's stop (triggered by a
 * driver_at_stop socket event received in LiveTrackingScreen).
 *
 * Shows:
 *  - Live map with cab position
 *  - Driver info card
 *  - "Yes, I Got In" → confirm boarding + go to LiveTrackingScreen
 *  - "No, I Missed" → go back to previous screen
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { Avatar, CrossPlatformMap } from '../../components';
import { SCREENS } from '../../constants';
import { tripService } from '../../services/api/tripService';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const DEFAULT_REGION = {
  latitude: 12.9716,
  longitude: 80.2209,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

const CabArrivedScreen = ({ navigation, route }) => {
  const {
    driverName = 'Driver',
    vehicleNo = '',
    vehicleType = '',
    tripId = null,
    stopId = null,
    cabLocation = null, // { latitude, longitude } — last known position from LiveTrackingScreen
  } = route?.params ?? {};

  const { theme } = useTheme();
  const colors = theme.colors;
  const [confirming, setConfirming] = useState(false);

  const mapRegion = cabLocation
    ? {
        latitude: cabLocation.latitude,
        longitude: cabLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : DEFAULT_REGION;

  const handleGotIn = async () => {
    setConfirming(true);
    try {
      // Confirm boarding via API so backend records the employee as picked_up
      if (tripId && stopId) {
        await tripService.confirmBoarding(tripId, stopId).catch(() => {
          // Non-fatal: best-effort confirmation
          console.warn('[CabArrivedScreen] confirmBoarding API not implemented on BE yet');
        });
      }
      // Navigate to live tracking — employee is now in the cab
      navigation.navigate(SCREENS.LIVE_TRACKING);
    } catch (err) {
      Alert.alert('Error', 'Could not confirm boarding. Please try again.');
    } finally {
      setConfirming(false);
    }
  };

  const handleMissed = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      {/* ── Map (top portion) ── */}
      <View style={styles.mapArea}>
        <CrossPlatformMap
          style={StyleSheet.absoluteFillObject}
          region={mapRegion}
          driverLocation={cabLocation}
          markers={[]}
          polyline={[]}
        />

        {/* LIVE badge */}
        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>

        {/* Header overlay */}
        <View style={styles.headerOverlay}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={handleMissed}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color="#1a1a2e" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cab Arrived</Text>
          <View style={{ width: 40 }} />
        </View>
      </View>

      {/* ── Bottom Sheet ── */}
      <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
        <View style={[styles.handle, { backgroundColor: colors.border }]} />

        {/* Icon */}
        <View style={[styles.iconCircle, { backgroundColor: '#e8f6ed' }]}>
          <Ionicons name="car" size={36} color="#16a34a" />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Your cab has arrived!</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          {vehicleNo}{vehicleNo && vehicleType ? '  •  ' : ''}{vehicleType}
        </Text>

        {/* Driver card */}
        <View style={[styles.driverCard, { backgroundColor: colors.background }]}>
          <Avatar name={driverName} size={44} />
          <View style={styles.driverInfo}>
            <Text style={[styles.driverName, { color: colors.text }]}>{driverName}</Text>
            <Text style={[styles.driverSub, { color: colors.textSecondary }]}>
              {vehicleNo}{vehicleNo && vehicleType ? '  •  ' : ''}{vehicleType}
            </Text>
          </View>
        </View>

        {/* Got In */}
        <TouchableOpacity
          style={[styles.gotInBtn, { backgroundColor: '#16a34a' }]}
          onPress={handleGotIn}
          activeOpacity={0.85}
          disabled={confirming}
        >
          {confirming ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.gotInText}>Yes, I Got In The Cab</Text>
          )}
        </TouchableOpacity>

        {/* Missed */}
        <TouchableOpacity
          style={styles.missedBtn}
          onPress={handleMissed}
          activeOpacity={0.7}
          disabled={confirming}
        >
          <Text style={[styles.missedText, { color: colors.textSecondary }]}>
            No, I Missed The Cab
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const SHEET_HEIGHT = SCREEN_HEIGHT * 0.48;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#d1d5db' },

  // Map
  mapArea: {
    flex: 1,
  },
  liveBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 5,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#16a34a',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    gap: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  liveDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#fff',
  },
  liveText: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 0.5 },
  headerOverlay: {
    position: 'absolute',
    top: 48,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
    color: '#1a1a2e',
  },

  // Sheet
  sheet: {
    height: SHEET_HEIGHT,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    paddingBottom: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 10,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginVertical: 14,
  },
  iconCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center' },
  subtitle: { fontSize: 14, marginTop: 4, marginBottom: 18, textAlign: 'center' },

  // Driver card
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    gap: 12,
  },
  driverInfo: { flex: 1 },
  driverName: { fontSize: 15, fontWeight: '700' },
  driverSub: { fontSize: 12, marginTop: 2 },

  // Buttons
  gotInBtn: {
    width: '100%',
    height: 54,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  gotInText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  missedBtn: { paddingVertical: 10 },
  missedText: { fontSize: 15, fontWeight: '600' },
});

export default CabArrivedScreen;
