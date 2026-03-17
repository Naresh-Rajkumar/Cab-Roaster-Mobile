import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import spacing from '../../../theme/spacing.json';
import typography from '../../../theme/typography.json';

const STATUS_MAP = {
  scheduled: { label: 'Scheduled', type: 'info' },
  in_progress: { label: 'In Progress', type: 'warning' },
  completed: { label: 'Completed', type: 'success' },
  cancelled: { label: 'Cancelled', type: 'error' },
  delayed: { label: 'Delayed', type: 'warning' },
  pending: { label: 'Pending', type: 'info' },
  picked_up: { label: 'Picked Up', type: 'success' },
  dropped_off: { label: 'Dropped Off', type: 'success' },
  no_show: { label: 'No Show', type: 'error' },
  active: { label: 'Active', type: 'success' },
  on_leave: { label: 'On Leave', type: 'warning' },
  inactive: { label: 'Inactive', type: 'error' },
};

const StatusBadge = ({ status, label: customLabel, size = 'sm', style }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const mapped = STATUS_MAP[status] || { label: status, type: 'info' };
  const displayLabel = customLabel || mapped.label;

  const getColors = () => {
    switch (mapped.type) {
      case 'success':
        return { bg: colors.successBackground, text: colors.success };
      case 'warning':
        return { bg: colors.warningBackground, text: colors.warning };
      case 'error':
        return { bg: colors.errorBackground, text: colors.error };
      case 'info':
      default:
        return { bg: colors.infoBackground, text: colors.info };
    }
  };

  const { bg, text } = getColors();

  const isSmall = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bg,
          paddingVertical: isSmall ? 2 : spacing.xs,
          paddingHorizontal: isSmall ? spacing.sm : spacing.md,
        },
        style,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: text }]} />
      <Text
        style={[
          styles.text,
          {
            color: text,
            fontSize: isSmall ? typography.fontSize.xs : typography.fontSize.sm,
            fontFamily: typography.fontFamily.medium,
          },
        ]}
      >
        {displayLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: spacing.borderRadius.full,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: spacing.xs,
  },
  text: {
    textTransform: 'capitalize',
  },
});

export default React.memo(StatusBadge);
