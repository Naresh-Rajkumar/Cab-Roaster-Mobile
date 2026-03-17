import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { getTheme } from './index';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDarkMode, setIsDarkMode] = useState(systemColorScheme === 'dark');

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => !prev);
  }, []);

  const setThemeMode = useCallback((dark) => {
    setIsDarkMode(dark);
  }, []);

  const theme = useMemo(() => getTheme(isDarkMode), [isDarkMode]);

  const value = useMemo(
    () => ({
      theme,
      isDarkMode,
      toggleTheme,
      setThemeMode,
    }),
    [theme, isDarkMode, toggleTheme, setThemeMode]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;
