import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { Card, Avatar, StatusBadge, Button, Header } from '../../components';
import StopItem from '../../components/items/StopItem/StopItem';
import spacing from '../../theme/spacing.json';
import typography from '../../theme/typography.json';
import { SCREENS } from '../../constants';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const MOCK_STOPS = [
  {
    id: '1',
    name: 'Marathahalli Bridge',
    address: 'Outer Ring Road, Marathahalli',
    time: '08:30 AM',
    employeeCount: 1,
    distance: '2.3 km',
    isCompleted: true,
    isCurrent: false,
  },
  {
    id: '2',
    name: 'Kundalahalli Gate',
    address: 'Kundalahalli Main Rd, Brookefield',
    time: '08:40 AM',
    employeeCount: 1,
    distance: '1.5 km',
    isCompleted: false,
    isCurrent: true,
  },
  {
    id: '3',
    name: 'ITPL Main Road',
    address: 'ITPL Main Road, Whitefield',
    time: '08:50 AM',
    employeeCount: 1,
    distance: '3.1 km',
    isCompleted: false,
    isCurrent: false,
  },
  {
    id: '4',
    name: 'Manyata Tech Park',
    address: 'Manyata Embassy Business Park',
    time: '09:15 AM',
    employeeCount: 0,
    distance: '8.2 km',
    isCompleted: false,
    isCurrent: false,
  },
];

const LiveTrackingScreen = ({ navigation, route }) => {
  const { ride } = route.params || {};
  const { theme } = useTheme();
  const colors = theme.colors;
  const [showDetails, setShowDetails] = useState(false);

  const driverInfo = {
    name: ride?.driverName || 'Rajesh Kumar',
    phone: '+91 98765 00001',
    vehicleNo: ride?.vehicleNo || 'KA 01 AB 1234',
    vehicleType: ride?.vehicleType || 'Toyota Innova',
    rating: 4.8,
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['top']}
    >
      {/* Header overlay */}
      <View style={[styles.mapHeader, { backgroundColor: colors.surface }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[
            styles.backBtn,
            { backgroundColor: colors.surface },
          ]}
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text
          style={[
            styles.headerTitle,
            {
              color: colors.text,
              fontFamily: typography.fontFamily.semiBold,
            },
          ]}
        >
          Live Tracking
        </Text>
        <TouchableOpacity
          style={[
            styles.recenterBtn,
            { backgroundColor: colors.surface },
          ]}
        >
          <Ionicons name="locate" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Map placeholder */}
      <View
        style={[
          styles.mapContainer,
          { backgroundColor: colors.surfaceVariant },
        ]}
      >
        <View style={[styles.mapPlaceholder]}>
          <View
            style={[
              styles.markerContainer,
              { backgroundColor: colors.primary },
            ]}
          >
            <Text style={styles.markerText}>V</Text>
          </View>
          <Text
            style={[
              styles.mapPlaceholderText,
              {
                color: colors.textTertiary,
                fontFamily: typography.fontFamily.regular,
              },
            ]}
          >
            Map View - Integrate with react-native-maps
          </Text>
        </View>
      </View>

      {/* Bottom Sheet */}
      <View
        style={[
          styles.bottomSheet,
          { backgroundColor: colors.surface },
        ]}
      >
        <View style={styles.sheetHandle}>
          <View
            style={[
              styles.handleBar,
              { backgroundColor: colors.border },
            ]}
          />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Ride Info */}
          <View style={styles.rideInfoSection}>
            <View style={styles.rideInfoRow}>
              <View>
                <Text
                  style={[
                    styles.rideLabel,
                    {
                      color: colors.textSecondary,
                      fontFamily: typography.fontFamily.regular,
                    },
                  ]}
                >
                  Ride Details
                </Text>
                <Text
                  style={[
                    styles.rideId,
                    {
                      color: colors.text,
                      fontFamily: typography.fontFamily.bold,
                    },
                  ]}
                >
                  {ride?.id || 'TR-1042'}
                </Text>
              </View>
              <StatusBadge status="in_progress" label="On the way" size="md" />
            </View>

            {/* Route Stops */}
            <View style={styles.routeStops}>
              <View style={styles.routeStop}>
                <View
                  style={[
                    styles.stopDot,
                    { backgroundColor: colors.success },
                  ]}
                />
                <View style={styles.stopTextContainer}>
                  <Text
                    style={[
                      styles.stopLabel,
                      {
                        color: colors.textTertiary,
                        fontFamily: typography.fontFamily.regular,
                      },
                    ]}
                  >
                    Pickup
                  </Text>
                  <Text
                    style={[
                      styles.stopName,
                      {
                        color: colors.text,
                        fontFamily: typography.fontFamily.medium,
                      },
                    ]}
                  >
                    {ride?.pickupLocation || 'Marathahalli Bridge'}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.stopTime,
                    {
                      color: colors.primary,
                      fontFamily: typography.fontFamily.semiBold,
                    },
                  ]}
                >
                  {ride?.scheduledTime || '08:30 AM'}
                </Text>
              </View>
              <View
                style={[
                  styles.connectorLine,
                  { borderLeftColor: colors.border },
                ]}
              />
              <View style={styles.routeStop}>
                <View
                  style={[
                    styles.stopDot,
                    { backgroundColor: colors.error },
                  ]}
                />
                <View style={styles.stopTextContainer}>
                  <Text
                    style={[
                      styles.stopLabel,
                      {
                        color: colors.textTertiary,
                        fontFamily: typography.fontFamily.regular,
                      },
                    ]}
                  >
                    Drop
                  </Text>
                  <Text
                    style={[
                      styles.stopName,
                      {
                        color: colors.text,
                        fontFamily: typography.fontFamily.medium,
                      },
                    ]}
                  >
                    {ride?.dropLocation || 'Manyata Tech Park'}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.stopTime,
                    {
                      color: colors.textSecondary,
                      fontFamily: typography.fontFamily.regular,
                    },
                  ]}
                >
                  09:15 AM
                </Text>
              </View>
            </View>
          </View>

          {/* Driver Card */}
          <View
            style={[
              styles.driverCard,
              { borderTopColor: colors.divider },
            ]}
          >
            <View style={styles.driverRow}>
              <Avatar name={driverInfo.name} size={44} />
              <View style={styles.driverDetails}>
                <Text
                  style={[
                    styles.driverName,
                    {
                      color: colors.text,
                      fontFamily: typography.fontFamily.semiBold,
                    },
                  ]}
                >
                  {driverInfo.name}
                </Text>
                <View style={styles.vehicleRow}>
                  <Text
                    style={[
                      styles.vehicleText,
                      {
                        color: colors.textSecondary,
                        fontFamily: typography.fontFamily.regular,
                      },
                    ]}
                  >
                    {driverInfo.vehicleType} | {driverInfo.vehicleNo}
                  </Text>
                </View>
              </View>
              <View style={styles.driverActions}>
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    { backgroundColor: colors.successBackground },
                  ]}
                >
                  <Ionicons name="call" size={18} color={colors.success} />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionBtn,
                    { backgroundColor: colors.primaryContainer },
                  ]}
                >
                  <Ionicons
                    name="chatbubble"
                    size={18}
                    color={colors.primary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* OTP */}
            <View
              style={[
                styles.otpBar,
                { backgroundColor: colors.primaryContainer },
              ]}
            >
              <Ionicons name="key-outline" size={16} color={colors.primary} />
              <Text
                style={[
                  styles.otpText,
                  {
                    color: colors.primary,
                    fontFamily: typography.fontFamily.medium,
                  },
                ]}
              >
                Share OTP with driver:
              </Text>
              <Text
                style={[
                  styles.otpCode,
                  {
                    color: colors.primary,
                    fontFamily: typography.fontFamily.bold,
                  },
                ]}
              >
                {ride?.otp || '4521'}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <Button
              title="Track Ride"
              onPress={() => {}}
              fullWidth
              size="lg"
              icon={
                <Ionicons name="navigate" size={16} color="#FFFFFF" />
              }
            />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    zIndex: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
  },
  recenterBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapContainer: {
    height: SCREEN_HEIGHT * 0.32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholder: {
    alignItems: 'center',
  },
  markerContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  markerText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
  },
  mapPlaceholderText: {
    fontSize: typography.fontSize.sm,
  },
  bottomSheet: {
    flex: 1,
    borderTopLeftRadius: spacing.borderRadius.xl,
    borderTopRightRadius: spacing.borderRadius.xl,
    marginTop: -spacing.lg,
    paddingHorizontal: spacing.base,
  },
  sheetHandle: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  rideInfoSection: {
    marginBottom: spacing.base,
  },
  rideInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  rideLabel: {
    fontSize: typography.fontSize.sm,
  },
  rideId: {
    fontSize: typography.fontSize.lg,
    marginTop: 2,
  },
  routeStops: {
    paddingLeft: spacing.xs,
  },
  routeStop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stopDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.md,
  },
  stopTextContainer: {
    flex: 1,
  },
  stopLabel: {
    fontSize: typography.fontSize.xs,
    textTransform: 'uppercase',
  },
  stopName: {
    fontSize: typography.fontSize.md,
    marginTop: 2,
  },
  stopTime: {
    fontSize: typography.fontSize.sm,
  },
  connectorLine: {
    borderLeftWidth: 1.5,
    borderStyle: 'dashed',
    height: 20,
    marginLeft: 4,
  },
  driverCard: {
    borderTopWidth: 1,
    paddingTop: spacing.base,
    marginBottom: spacing.base,
  },
  driverRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  driverDetails: {
    flex: 1,
    marginLeft: spacing.md,
  },
  driverName: {
    fontSize: typography.fontSize.md,
  },
  vehicleRow: {
    marginTop: 2,
  },
  vehicleText: {
    fontSize: typography.fontSize.sm,
  },
  driverActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  otpBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: spacing.borderRadius.sm,
    gap: spacing.sm,
  },
  otpText: {
    fontSize: typography.fontSize.sm,
  },
  otpCode: {
    fontSize: typography.fontSize.lg,
    letterSpacing: 4,
  },
  actionButtons: {
    paddingBottom: spacing.xxl,
  },
});

export default LiveTrackingScreen;
