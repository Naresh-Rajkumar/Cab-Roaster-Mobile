import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';

// useNativeDriver is not supported on web
const ND = Platform.OS !== 'web';
import { SCREENS } from '../../constants';

const { width, height } = Dimensions.get('window');

const PRIMARY = '#643ee8';
const PRIMARY_LIGHT = '#f1ecff';
const BG = '#f5f4f9';

const SplashScreen = ({ navigation }) => {
  const logoScale = useRef(new Animated.Value(0.4)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const blob1Scale = useRef(new Animated.Value(0)).current;
  const blob2Scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      // Blobs expand first
      Animated.parallel([
        Animated.spring(blob1Scale, { toValue: 1, useNativeDriver: ND, tension: 40, friction: 8 }),
        Animated.spring(blob2Scale, { toValue: 1, useNativeDriver: ND, tension: 40, friction: 8, delay: 100 }),
      ]),
      // Logo pops in
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, useNativeDriver: ND, tension: 50, friction: 7 }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 300, useNativeDriver: ND }),
      ]),
      // App name fades in
      Animated.timing(textOpacity, { toValue: 1, duration: 350, useNativeDriver: ND }),
      // Tagline fades in
      Animated.timing(taglineOpacity, { toValue: 1, duration: 350, useNativeDriver: ND }),
    ]).start();

    // Navigate after delay
    const timer = setTimeout(() => {
      navigation.replace(SCREENS.ROLE_SELECTION);
    }, 2600);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Background blobs */}
      <Animated.View
        style={[
          styles.blob1,
          { transform: [{ scale: blob1Scale }] },
        ]}
      />
      <Animated.View
        style={[
          styles.blob2,
          { transform: [{ scale: blob2Scale }] },
        ]}
      />

      {/* Logo mark */}
      <Animated.View
        style={[
          styles.logoWrapper,
          {
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
          },
        ]}
      >
        <View style={styles.logoBox}>
          <View style={styles.logoInner}>
            {/* Stylised "C" mark */}
            <View style={styles.cMark}>
              <View style={styles.cTop} />
              <View style={styles.cBottom} />
            </View>
          </View>
        </View>
      </Animated.View>

      {/* App name */}
      <Animated.View style={{ opacity: textOpacity, alignItems: 'center' }}>
        <Text style={styles.appName}>
          <Text style={styles.appNameBold}>Cab</Text>
          <Text style={styles.appNameThin}> Roster</Text>
        </Text>
      </Animated.View>

      {/* Tagline */}
      <Animated.View style={{ opacity: taglineOpacity }}>
        <Text style={styles.tagline}>Employee Transport Management</Text>
      </Animated.View>

      {/* Bottom powered-by */}
      <View style={styles.bottomBar}>
        <Text style={styles.poweredBy}>Powered by vThink Global Technology</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
    alignItems: 'center',
    justifyContent: 'center',
  },
  blob1: {
    position: 'absolute',
    width: 340,
    height: 340,
    borderRadius: 170,
    backgroundColor: PRIMARY_LIGHT,
    top: -80,
    right: -80,
    opacity: 0.7,
  },
  blob2: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: PRIMARY_LIGHT,
    bottom: -60,
    left: -80,
    opacity: 0.5,
  },
  logoWrapper: {
    marginBottom: 24,
  },
  logoBox: {
    width: 96,
    height: 96,
    borderRadius: 28,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  logoInner: {
    width: 60,
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cMark: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 5,
    borderColor: '#ffffff',
    borderRightColor: 'transparent',
    transform: [{ rotate: '45deg' }],
  },
  cTop: {},
  cBottom: {},
  appName: {
    fontSize: 32,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  appNameBold: {
    fontWeight: '800',
    color: PRIMARY,
  },
  appNameThin: {
    fontWeight: '300',
    color: '#312e3a',
  },
  tagline: {
    fontSize: 13,
    color: '#5e5c66',
    fontWeight: '400',
    letterSpacing: 0.3,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 40,
    alignItems: 'center',
  },
  poweredBy: {
    fontSize: 11,
    color: '#b9c0c9',
    fontWeight: '400',
    letterSpacing: 0.2,
  },
});

export default SplashScreen;
