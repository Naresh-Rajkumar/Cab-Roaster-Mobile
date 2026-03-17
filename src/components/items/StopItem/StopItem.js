import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeProvider';
import spacing from '../../../theme/spacing.json';
import typography from '../../../theme/typography.json';

const StopItem = ({ stop, index, isLast = false, onPress }) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const getStopColor = () => {
    if (stop.isCompleted) return colors.success;
    if (stop.isCurrent) return colors.primary;
    return colors.textTertiary;
  };

  const stopColor = getStopColor();

  return (
    <View style={styles.container}>
      {/* Timeline */}
      <View style={styles.timeline}>
        <View
          style={[
            styles.dot,
            {
              backgroundColor: stop.isCompleted ? stopColor : 'transparent',
              borderColor: stopColor,
            },
          ]}
        >
          {stop.isCompleted && (
            <Ionicons name="checkmark" size={10} color="#FFFFFF" />
          )}
          {stop.isCurrent && (
            <View style={[styles.innerDot, { backgroundColor: stopColor }]} />
          )}
        </View>
        {!isLast && (
          <View
            style={[
              styles.line,
              {
                backgroundColor: stop.isCompleted
                  ? colors.success
                  : colors.border,
              },
            ]}
          />
        )}
      </View>

      {/* Content */}
      <View
        style={[
          styles.content,
          !isLast && { borderBottomColor: colors.divider, borderBottomWidth: 1 },
        ]}
      >
        <View style={styles.topRow}>
          <Text
            style={[
              styles.stopName,
              {
                color: colors.text,
                fontFamily: typography.fontFamily.medium,
              },
            ]}
            numberOfLines={1}
          >
            {stop.name}
          </Text>
          <Text
            style={[
              styles.time,
              {
                color: stop.isCurrent ? colors.primary : colors.textSecondary,
                fontFamily: typography.fontFamily.medium,
              },
            ]}
          >
            {stop.time}
          </Text>
        </View>

        <Text
          style={[
            styles.address,
            {
              color: colors.textSecondary,
              fontFamily: typography.fontFamily.regular,
            },
          ]}
          numberOfLines={2}
        >
          {stop.address}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons
              name="people-outline"
              size={13}
              color={colors.textTertiary}
            />
            <Text
              style={[
                styles.metaText,
                {
                  color: colors.textTertiary,
                  fontFamily: typography.fontFamily.regular,
                },
              ]}
            >
              {stop.employeeCount} employee{stop.employeeCount !== 1 ? 's' : ''}
            </Text>
          </View>
          {stop.distance && (
            <View style={styles.metaItem}>
              <Ionicons
                name="navigate-outline"
                size={13}
                color={colors.textTertiary}
              />
              <Text
                style={[
                  styles.metaText,
                  {
                    color: colors.textTertiary,
                    fontFamily: typography.fontFamily.regular,
                  },
                ]}
              >
                {stop.distance}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
  },
  timeline: {
    alignItems: 'center',
    width: 32,
    marginRight: spacing.md,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  line: {
    width: 2,
    flex: 1,
    marginVertical: 2,
  },
  content: {
    flex: 1,
    paddingBottom: spacing.base,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  stopName: {
    fontSize: typography.fontSize.md,
    flex: 1,
    marginRight: spacing.sm,
  },
  time: {
    fontSize: typography.fontSize.sm,
  },
  address: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    marginBottom: spacing.sm,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.base,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: typography.fontSize.xs,
    marginLeft: spacing.xs,
  },
});

export default React.memo(StopItem);
