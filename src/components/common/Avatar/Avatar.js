import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../theme/ThemeProvider';
import spacing from '../../../theme/spacing.json';
import typography from '../../../theme/typography.json';

const Avatar = ({
  source,
  name,
  size = 40,
  style,
  backgroundColor,
}) => {
  const { theme } = useTheme();
  const colors = theme.colors;

  const getInitials = (fullName) => {
    if (!fullName) return '?';
    const parts = fullName.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return parts[0][0].toUpperCase();
  };

  const bgColor = backgroundColor || colors.primaryContainer;
  const fontSize = size * 0.38;

  if (source?.uri || source) {
    return (
      <Image
        source={typeof source === 'string' ? { uri: source } : source}
        style={[
          styles.image,
          { width: size, height: size, borderRadius: size / 2 },
          style,
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.placeholder,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: bgColor,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.initials,
          {
            fontSize,
            color: colors.primary,
            fontFamily: typography.fontFamily.semiBold,
          },
        ]}
      >
        {getInitials(name)}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    textAlign: 'center',
  },
});

export default React.memo(Avatar);
