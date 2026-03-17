import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { Button } from '../../components';
import spacing from '../../theme/spacing.json';
import typography from '../../theme/typography.json';
import { SCREENS } from '../../constants';

const { width } = Dimensions.get('window');

const ONBOARDING_DATA = [
  {
    id: '1',
    title: 'Where can we find you?',
    description:
      'Set your pickup location so we can find the best route for your daily commute.',
    icon: 'location',
    color: '#6C3AE1',
    buttonText: 'Confirm The Location',
  },
  {
    id: '2',
    title: 'Your Office Ride, Made Easy',
    description:
      'Enjoy seamless daily commutes with real-time tracking, smart routing, and hassle-free pickups.',
    icon: 'car',
    color: '#6C3AE1',
    buttonText: 'Next',
  },
  {
    id: '3',
    title: 'Effortless Attendance',
    description:
      'Mark your attendance automatically when you board. No more manual check-ins.',
    icon: 'checkbox',
    color: '#6C3AE1',
    buttonText: 'Ready To Go',
  },
];

const OnboardingScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    if (currentIndex < ONBOARDING_DATA.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.replace(SCREENS.WELCOME);
    }
  };

  const handleSkip = () => {
    navigation.replace(SCREENS.WELCOME);
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const renderItem = ({ item }) => (
    <View style={[styles.slide, { width }]}>
      {/* Illustration placeholder */}
      <View
        style={[
          styles.illustrationContainer,
          { backgroundColor: colors.primaryContainer },
        ]}
      >
        <View style={[styles.iconCircle, { backgroundColor: colors.primary }]}>
          <Ionicons name={item.icon} size={64} color="#FFFFFF" />
        </View>
      </View>

      <View style={styles.textContainer}>
        <Text
          style={[
            styles.title,
            {
              color: colors.text,
              fontFamily: typography.fontFamily.bold,
            },
          ]}
        >
          {item.title}
        </Text>
        <Text
          style={[
            styles.description,
            {
              color: colors.textSecondary,
              fontFamily: typography.fontFamily.regular,
            },
          ]}
        >
          {item.description}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Skip button */}
      <View style={styles.headerRow}>
        <View />
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text
            style={[
              styles.skipText,
              {
                color: colors.primary,
                fontFamily: typography.fontFamily.medium,
              },
            ]}
          >
            Skip
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        ref={flatListRef}
        data={ONBOARDING_DATA}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
      />

      {/* Dots & Button */}
      <View style={styles.footer}>
        <View style={styles.dotsContainer}>
          {ONBOARDING_DATA.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor:
                    index === currentIndex
                      ? colors.primary
                      : colors.border,
                  width: index === currentIndex ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        <Button
          title={ONBOARDING_DATA[currentIndex]?.buttonText || 'Next'}
          onPress={handleNext}
          fullWidth
          size="lg"
          style={styles.nextButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingTop: spacing.sm,
  },
  skipButton: {
    padding: spacing.sm,
  },
  skipText: {
    fontSize: typography.fontSize.md,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  illustrationContainer: {
    width: 240,
    height: 240,
    borderRadius: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xxxl,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing.base,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.fontSize.base,
    textAlign: 'center',
    lineHeight: typography.lineHeight.base,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  nextButton: {
    borderRadius: 12,
  },
});

export default OnboardingScreen;
