import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../theme/ThemeProvider';
import spacing from '../../../theme/spacing.json';
import typography from '../../../theme/typography.json';
import Button from '../Button/Button';

const EmptyState = ({
  icon = 'document-text-outline',
  title = 'No Data Found',
  message = 'There is nothing to display here.',
  actionLabel,
  onAction,
  style,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.iconContainer,
          { backgroundColor: colors.surfaceVariant },
        ]}
      >
        <Ionicons name={icon} size={48} color={colors.textTertiary} />
      </View>
      <Text
        style={[
          styles.title,
          {
            color: colors.text,
            fontFamily: typography.fontFamily.semiBold,
          },
        ]}
      >
        {title}
      </Text>
      <Text
        style={[
          styles.message,
          {
            color: colors.textSecondary,
            fontFamily: typography.fontFamily.regular,
          },
        ]}
      >
        {message}
      </Text>
      {actionLabel && onAction && (
        <Button
          title={actionLabel}
          onPress={onAction}
          variant="primary"
          size="sm"
          style={styles.actionButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.lg,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: typography.fontSize.md,
    textAlign: 'center',
    lineHeight: typography.lineHeight.md,
  },
  actionButton: {
    marginTop: spacing.lg,
  },
});

export default React.memo(EmptyState);
