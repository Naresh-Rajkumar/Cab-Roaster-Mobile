import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector } from 'react-redux';
import { useTheme } from '../../theme/ThemeProvider';
import { Button } from '../../components';
import spacing from '../../theme/spacing.json';
import typography from '../../theme/typography.json';
import { SCREENS, USER_ROLES } from '../../constants';

const { width } = Dimensions.get('window');

const EMPLOYEE_SLIDES = [
  {
    id: '1',
    title: 'Where can we find you?',
    description: 'Enter your pickup and drop location to get started.',
    icon: 'location',
    color: '#643ee8',
    accentBg: '#f1ecff',
    buttonText: 'Continue The Journey',
  },
  {
    id: '2',
    title: 'Your Office Ride, Made Easy',
    description: 'Track, and manage your office cab in just a few taps.',
    icon: 'car',
    color: '#643ee8',
    accentBg: '#f1ecff',
    buttonText: 'Keep Rolling',
  },
  {
    id: '3',
    title: 'Effortless Attendance',
    description: 'Attendance made simple and stress-free.',
    icon: 'checkbox',
    color: '#643ee8',
    accentBg: '#f1ecff',
    buttonText: 'Ready To Go',
  },
];

const DRIVER_SLIDES = [
  {
    id: '1',
    title: 'Start Your Assigned Trip',
    description: 'Tap "Start Trip" to begin your route and view all pickup details for the shift.',
    icon: 'car-sport',
    color: '#16a34a',
    accentBg: '#e8f6ed',
    buttonText: 'Next',
  },
  {
    id: '2',
    title: 'Confirm Each Pickup',
    description: 'Mark employees as picked up at every stop to keep trip records accurate and updated.',
    icon: 'people',
    color: '#16a34a',
    accentBg: '#e8f6ed',
    buttonText: 'Next',
  },
  {
    id: '3',
    title: 'End & Submit Trip',
    description: 'Finish the trip after all drop-offs to automatically log trip details.',
    icon: 'checkmark-circle',
    color: '#16a34a',
    accentBg: '#e8f6ed',
    buttonText: 'Ready to Drive',
  },
];

const Slide = ({ item, colors }) => (
  <View style={[styles.slide, { width }]}>
    <View style={[styles.illustrationOuter, { backgroundColor: item.accentBg }]}>
      <View style={[styles.illustrationMiddle, { backgroundColor: item.accentBg, borderColor: item.color + '22' }]}>
        <View style={[styles.iconCircle, { backgroundColor: item.color }]}>
          <Ionicons name={item.icon} size={52} color="#ffffff" />
        </View>
      </View>
      <View style={[styles.decoDot1, { backgroundColor: item.color + '33' }]} />
      <View style={[styles.decoDot2, { backgroundColor: item.color + '22' }]} />
    </View>
    <Text style={[styles.slideTitle, { color: colors.text }]}>{item.title}</Text>
    <Text style={[styles.slideDesc, { color: colors.textSecondary }]}>{item.description}</Text>
  </View>
);

const OnboardingScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const role = useSelector((state) => state.auth.role);
  const slides = role === USER_ROLES.DRIVER ? DRIVER_SLIDES : EMPLOYEE_SLIDES;
  const accentColor = role === USER_ROLES.DRIVER ? '#16a34a' : colors.primary;

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.navigate(SCREENS.LOGIN);
    }
  };

  const handleSkip = () => {
    navigation.navigate(SCREENS.LOGIN);
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <View />
        <TouchableOpacity
          onPress={handleSkip}
          style={styles.skipButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={[styles.skipText, { color: accentColor }]}>Skip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={({ item }) => <Slide item={item} colors={colors} />}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        scrollEventThrottle={16}
      />

      <View style={styles.footer}>
        <View style={styles.dotsRow}>
          {slides.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                {
                  backgroundColor: idx === currentIndex ? accentColor : colors.border,
                  width: idx === currentIndex ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>
        <Button
          title={slides[currentIndex]?.buttonText ?? 'Next'}
          onPress={handleNext}
          fullWidth
          size="lg"
          style={[styles.btn, { backgroundColor: accentColor }]}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
  },
  skipButton: { padding: spacing.sm },
  skipText: { fontSize: typography.fontSize.md, fontWeight: '500' },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  illustrationOuter: {
    width: 240,
    height: 240,
    borderRadius: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 36,
    position: 'relative',
  },
  illustrationMiddle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
  },
  iconCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  decoDot1: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    top: 20,
    right: 20,
  },
  decoDot2: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    bottom: 24,
    left: 18,
  },
  slideTitle: {
    fontSize: typography.fontSize.xxl,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: spacing.md,
    letterSpacing: -0.3,
  },
  slideDesc: {
    fontSize: typography.fontSize.base,
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  dot: { height: 8, borderRadius: 4 },
  btn: { borderRadius: 14 },
});

export default OnboardingScreen;
