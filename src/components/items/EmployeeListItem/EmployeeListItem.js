import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeProvider';
import Avatar from '../../common/Avatar/Avatar';
import StatusBadge from '../../common/StatusBadge/StatusBadge';
import spacing from '../../../theme/spacing.json';
import typography from '../../../theme/typography.json';

const EmployeeListItem = ({ employee, onPress, onCallPress, showActions = true }) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <TouchableOpacity
      onPress={() => onPress?.(employee)}
      activeOpacity={0.7}
      style={[
        styles.container,
        {
          backgroundColor: colors.card,
          borderBottomColor: colors.divider,
        },
      ]}
    >
      <Avatar name={employee.name} source={employee.avatar} size={44} />

      <View style={styles.details}>
        <View style={styles.nameRow}>
          <Text
            style={[
              styles.name,
              {
                color: colors.text,
                fontFamily: typography.fontFamily.semiBold,
              },
            ]}
            numberOfLines={1}
          >
            {employee.name}
          </Text>
          <StatusBadge status={employee.handoffStatus || employee.status} />
        </View>

        <Text
          style={[
            styles.employeeId,
            {
              color: colors.textTertiary,
              fontFamily: typography.fontFamily.regular,
            },
          ]}
        >
          ID: {employee.employeeId}
        </Text>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons
              name="location-outline"
              size={13}
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
              numberOfLines={1}
            >
              {employee.pickupPoint || employee.location}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons
              name="time-outline"
              size={13}
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
              {employee.scheduledTime}
            </Text>
          </View>
        </View>
      </View>

      {showActions && (
        <View style={styles.actions}>
          <TouchableOpacity
            onPress={() => onCallPress?.(employee)}
            style={[styles.callButton, { backgroundColor: colors.successBackground }]}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="call-outline" size={18} color={colors.success} />
          </TouchableOpacity>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={colors.textTertiary}
          />
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.base,
    borderBottomWidth: 1,
  },
  details: {
    flex: 1,
    marginLeft: spacing.md,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  name: {
    fontSize: typography.fontSize.md,
    flex: 1,
    marginRight: spacing.sm,
  },
  employeeId: {
    fontSize: typography.fontSize.xs,
    marginBottom: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: typography.fontSize.sm,
    marginLeft: 3,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginLeft: spacing.sm,
  },
  callButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default React.memo(EmployeeListItem);
