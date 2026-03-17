import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../theme/ThemeProvider';
import spacing from '../../../theme/spacing.json';
import typography from '../../../theme/typography.json';

const Header = ({
  title,
  subtitle,
  onBackPress,
  showBack = false,
  rightAction,
  rightIcon,
  onRightPress,
  style,
  transparent = false,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: transparent ? 'transparent' : colors.header,
          paddingTop: insets.top || (Platform.OS === 'android' ? StatusBar.currentHeight : 0),
          borderBottomColor: transparent ? 'transparent' : colors.borderLight,
        },
        style,
      ]}
    >
      <View style={styles.content}>
        <View style={styles.leftSection}>
          {showBack && (
            <TouchableOpacity
              onPress={onBackPress}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="arrow-back"
                size={spacing.iconSize.lg}
                color={colors.headerText}
              />
            </TouchableOpacity>
          )}
          <View style={styles.titleContainer}>
            <Text
              style={[
                styles.title,
                {
                  color: colors.headerText,
                  fontFamily: typography.fontFamily.semiBold,
                },
              ]}
              numberOfLines={1}
            >
              {title}
            </Text>
            {subtitle && (
              <Text
                style={[
                  styles.subtitle,
                  {
                    color: colors.textSecondary,
                    fontFamily: typography.fontFamily.regular,
                  },
                ]}
                numberOfLines={1}
              >
                {subtitle}
              </Text>
            )}
          </View>
        </View>

        {(rightAction || rightIcon) && (
          <TouchableOpacity
            onPress={onRightPress}
            style={styles.rightButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            {rightIcon || (
              <Text
                style={[
                  styles.rightActionText,
                  {
                    color: colors.primary,
                    fontFamily: typography.fontFamily.medium,
                  },
                ]}
              >
                {rightAction}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    height: 56,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: spacing.md,
    padding: spacing.xs,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: typography.fontSize.lg,
  },
  subtitle: {
    fontSize: typography.fontSize.sm,
    marginTop: 2,
  },
  rightButton: {
    padding: spacing.xs,
  },
  rightActionText: {
    fontSize: typography.fontSize.md,
  },
});

export default React.memo(Header);
