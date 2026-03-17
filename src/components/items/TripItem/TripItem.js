import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeProvider';
import Card from '../../common/Card/Card';
import StatusBadge from '../../common/StatusBadge/StatusBadge';
import spacing from '../../../theme/spacing.json';
import typography from '../../../theme/typography.json';

const TripItem = ({ trip, onPress }) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <Card onPress={() => onPress?.(trip)} elevated style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.tripIdContainer}>
          <Ionicons name="car-outline" size={18} color={colors.primary} />
          <Text
            style={[
              styles.tripId,
              {
                color: colors.text,
                fontFamily: typography.fontFamily.semiBold,
              },
            ]}
          >
            Trip #{trip.id}
          </Text>
        </View>
        <StatusBadge status={trip.status} />
      </View>

      <View style={[styles.divider, { backgroundColor: colors.divider }]} />

      <View style={styles.routeContainer}>
        <View style={styles.routePoint}>
          <View style={[styles.dot, { backgroundColor: colors.success }]} />
          <View style={styles.routeTextContainer}>
            <Text
              style={[
                styles.routeLabel,
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
                styles.routeText,
                {
                  color: colors.text,
                  fontFamily: typography.fontFamily.medium,
                },
              ]}
              numberOfLines={1}
            >
              {trip.pickupLocation}
            </Text>
          </View>
        </View>

        <View style={[styles.routeLine, { borderColor: colors.border }]} />

        <View style={styles.routePoint}>
          <View style={[styles.dot, { backgroundColor: colors.error }]} />
          <View style={styles.routeTextContainer}>
            <Text
              style={[
                styles.routeLabel,
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
                styles.routeText,
                {
                  color: colors.text,
                  fontFamily: typography.fontFamily.medium,
                },
              ]}
              numberOfLines={1}
            >
              {trip.dropLocation}
            </Text>
          </View>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.divider }]} />

      <View style={styles.bottomRow}>
        <View style={styles.infoItem}>
          <Ionicons
            name="time-outline"
            size={14}
            color={colors.textSecondary}
          />
          <Text
            style={[
              styles.infoText,
              {
                color: colors.textSecondary,
                fontFamily: typography.fontFamily.regular,
              },
            ]}
          >
            {trip.scheduledTime}
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons
            name="people-outline"
            size={14}
            color={colors.textSecondary}
          />
          <Text
            style={[
              styles.infoText,
              {
                color: colors.textSecondary,
                fontFamily: typography.fontFamily.regular,
              },
            ]}
          >
            {trip.employeeCount} Employees
          </Text>
        </View>
        <View style={styles.infoItem}>
          <Ionicons
            name="navigate-outline"
            size={14}
            color={colors.textSecondary}
          />
          <Text
            style={[
              styles.infoText,
              {
                color: colors.textSecondary,
                fontFamily: typography.fontFamily.regular,
              },
            ]}
          >
            {trip.stops} Stops
          </Text>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: spacing.md,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tripId: {
    fontSize: typography.fontSize.base,
    marginLeft: spacing.sm,
  },
  divider: {
    height: 1,
    marginVertical: spacing.md,
  },
  routeContainer: {
    paddingLeft: spacing.xs,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
    marginRight: spacing.md,
  },
  routeLine: {
    borderLeftWidth: 1.5,
    borderStyle: 'dashed',
    height: 20,
    marginLeft: 4,
  },
  routeTextContainer: {
    flex: 1,
  },
  routeLabel: {
    fontSize: typography.fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  routeText: {
    fontSize: typography.fontSize.md,
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    marginLeft: spacing.xs,
  },
});

export default React.memo(TripItem);
