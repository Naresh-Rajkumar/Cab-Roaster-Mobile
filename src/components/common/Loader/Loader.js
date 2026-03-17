import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import spacing from '../../../theme/spacing.json';
import typography from '../../../theme/typography.json';

const Loader = ({
  size = 'large',
  message,
  fullScreen = false,
  color,
  style,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const indicatorColor = color || colors.primary;

  if (fullScreen) {
    return (
      <View
        style={[
          styles.fullScreen,
          { backgroundColor: colors.background },
          style,
        ]}
      >
        <ActivityIndicator size={size} color={indicatorColor} />
        {message && (
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
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <ActivityIndicator size={size} color={indicatorColor} />
      {message && (
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
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    marginTop: spacing.md,
    fontSize: typography.fontSize.md,
    textAlign: 'center',
  },
});

export default React.memo(Loader);
