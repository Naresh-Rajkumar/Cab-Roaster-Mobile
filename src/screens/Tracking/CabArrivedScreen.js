import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { Avatar } from '../../components';
import spacing from '../../theme/spacing.json';
import typography from '../../theme/typography.json';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const CabArrivedScreen = ({ navigation, route }) => {
  const { driverName, vehicleNo, vehicleType } = route.params || {
    driverName: 'Rogelio Adams',
    vehicleNo: 'TN 14 CV 3755',
    vehicleType: 'Ertiga',
  };
  const { theme } = useTheme();
  const colors = theme.colors;

  const handleGotIn = () => {
    navigation.goBack();
  };

  const handleMissed = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.overlay, { backgroundColor: colors.overlay }]}>
      {/* Blurred map area (top portion) */}
      <View style={[styles.mapArea, { backgroundColor: colors.surfaceVariant }]}>
        <Text style={[styles.mapPlaceholderText, { color: colors.textTertiary }]}>Live Map</Text>
      </View>

      {/* Bottom sheet */}
      <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
        <View style={styles.handleRow}>
          <View style={[styles.handle, { backgroundColor: colors.border }]} />
        </View>

        {/* Car icon */}
        <View style={[styles.carIconContainer, { backgroundColor: colors.primaryContainer }]}>
          <Ionicons name="car" size={36} color={colors.primary} />
        </View>

        <Text style={[styles.arrivedTitle, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
          Your cab has arrived
        </Text>

        {/* Driver info card */}
        <View style={[styles.driverCard, { backgroundColor: colors.surfaceVariant }]}>
          <Avatar name={driverName} size={44} />
          <View style={styles.driverInfo}>
            <Text style={[styles.driverName, { color: colors.text, fontFamily: typography.fontFamily.semiBold }]}>
              {driverName}
            </Text>
            <View style={styles.vehicleRow}>
              <Text style={[styles.vehicleNo, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
                {vehicleNo}
              </Text>
              <View style={[styles.vehicleDot, { backgroundColor: colors.textTertiary }]} />
              <Text style={[styles.vehicleType, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
                {vehicleType}
              </Text>
            </View>
          </View>
        </View>

        {/* Got In button */}
        <TouchableOpacity
          style={[styles.gotInButton, { backgroundColor: colors.primary }]}
          onPress={handleGotIn}
          activeOpacity={0.8}
        >
          <Text style={[styles.gotInText, { fontFamily: typography.fontFamily.semiBold }]}>
            Yes, I Got In The Cab
          </Text>
        </TouchableOpacity>

        {/* Missed button */}
        <TouchableOpacity style={styles.missedButton} onPress={handleMissed} activeOpacity={0.7}>
          <Text style={[styles.missedText, { color: colors.text, fontFamily: typography.fontFamily.semiBold }]}>
            No, I Missed The Cab
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  mapArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPlaceholderText: {
    fontSize: 14,
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxxl,
    alignItems: 'center',
  },
  handleRow: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  carIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  arrivedTitle: {
    fontSize: 22,
    marginBottom: spacing.xl,
  },
  driverCard: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: spacing.base,
    borderRadius: 12,
    marginBottom: spacing.xl,
  },
  driverInfo: {
    flex: 1,
    marginLeft: spacing.md,
  },
  driverName: {
    fontSize: 16,
    marginBottom: 4,
  },
  vehicleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleNo: {
    fontSize: 13,
  },
  vehicleDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: spacing.xs,
  },
  vehicleType: {
    fontSize: 13,
  },
  gotInButton: {
    width: '100%',
    paddingVertical: spacing.base,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  gotInText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  missedButton: {
    paddingVertical: spacing.sm,
  },
  missedText: {
    fontSize: 15,
  },
});

export default CabArrivedScreen;
