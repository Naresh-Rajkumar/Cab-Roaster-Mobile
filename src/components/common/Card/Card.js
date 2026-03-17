import React from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import spacing from '../../../theme/spacing.json';

const Card = ({
  children,
  onPress,
  elevated = false,
  style,
  padding = spacing.base,
  borderRadius = spacing.borderRadius.md,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const cardStyle = [
    styles.card,
    {
      backgroundColor: elevated ? colors.cardElevated : colors.card,
      borderRadius,
      padding,
      borderColor: colors.borderLight,
    },
    elevated && styles.elevated,
    elevated && { shadowColor: colors.shadow },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        style={cardStyle}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View style={cardStyle}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    overflow: 'hidden',
  },
  elevated: {
    borderWidth: 0,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
});

export default React.memo(Card);
