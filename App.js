import React, { useEffect, useState } from 'react';
import { StatusBar, LogBox, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import store from './src/redux/store';
import { ThemeProvider } from './src/theme/ThemeProvider';
import RootNavigator from './src/navigation/RootNavigator';
import useAppFonts from './src/hooks/useAppFonts';
import { loadPersistedToken, fetchProfile } from './src/redux/slices/authSlice';
import { setAuthToken } from './src/services/axiosConfig';

// Keep splash screen visible while loading fonts
SplashScreen.preventAutoHideAsync().catch(() => {});

// If expo-font never resolves (device/storage quirks), do not block the app forever on the splash.
const FONT_READY_TIMEOUT_MS = 10000;

// Suppress known harmless warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
]);

const AppContent = () => {
  const { fontsLoaded, fontError } = useAppFonts();
  const [fontWaitExceeded, setFontWaitExceeded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setFontWaitExceeded(true), FONT_READY_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, []);

  const fontsReady = fontsLoaded || fontError || fontWaitExceeded;

  useEffect(() => {
    if (!fontsReady) return;
    (async () => {
      await SplashScreen.hideAsync();
      if (__DEV__ && fontWaitExceeded && !fontsLoaded && !fontError) {
        console.warn(
          '[App] Font loading timed out; continuing with system fonts. Check device storage / first launch.'
        );
      }
    })();
  }, [fontsReady, fontWaitExceeded, fontsLoaded, fontError]);

  useEffect(() => {
    // Restore persisted auth token on boot
    loadPersistedToken().then((token) => {
      if (token) {
        setAuthToken(token);
        store.dispatch(fetchProfile());
      }
    });
  }, []);

  if (!fontsReady) {
    // Non-null tree helps the native window finish layout; avoids “stuck on splash” on some Android builds.
    return <View style={{ flex: 1 }} />;
  }

  return <RootNavigator />;
};

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <SafeAreaProvider>
          <ThemeProvider>
            <StatusBar translucent backgroundColor="transparent" />
            <AppContent />
          </ThemeProvider>
        </SafeAreaProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
