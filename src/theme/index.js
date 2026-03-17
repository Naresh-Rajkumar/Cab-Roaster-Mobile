import colors from './colors.json';
import typography from './typography.json';
import spacing from './spacing.json';
import lightTheme from './lightTheme.json';
import darkTheme from './darkTheme.json';
import fonts from './fonts.json';

export { colors, typography, spacing, lightTheme, darkTheme, fonts };

export const getTheme = (isDark) => ({
  ...(isDark ? darkTheme : lightTheme),
  typography,
  spacing,
  fonts,
});
