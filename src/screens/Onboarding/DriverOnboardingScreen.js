/**
 * DriverOnboardingScreen
 * Screens 1/17, 2/17, 3/17 from Driver Handoff Figma
 *
 * Flow:
 *   RoleSelection (Driver) → DriverOnboarding (1→2→3) → Login (4/17)
 *   Skip on any slide → Login (4/17)
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Animated,
  PanResponder,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { SCREENS } from '../../constants';

const { width } = Dimensions.get('window');

// ─── Design tokens (matching Figma Driver Handoff palette) ───────────────────
const PRIMARY = '#643ee8';
const PRIMARY_LIGHT = '#f1ecff';
const PRIMARY_FAINT = '#d2c5ff';
const GREEN = '#16a34a';
const GREEN_LIGHT = '#e8f6ed';
const AMBER = '#d97706';
const AMBER_LIGHT = '#fef3c7';
const BG = '#F5F4F9';
const TEXT = '#312e3a';
const TEXT_SEC = '#5e5c66';
const WHITE = '#ffffff';
const BORDER = '#E8E6F0';
const CARD_BG = '#ffffff';
const SHADOW = { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 4 };

// ─── Slide 1 Preview: Driver Home Trip Card (mirrors 6/17 Home) ──────────────
const TripCardPreview = () => (
  <View style={[previewStyles.card, SHADOW]}>
    {/* Trip header row */}
    <View style={previewStyles.cardHeader}>
      <Text style={previewStyles.tripNum}>Trip #231</Text>
      <View style={[previewStyles.badge, { backgroundColor: GREEN_LIGHT }]}>
        <View style={[previewStyles.badgeDot, { backgroundColor: GREEN }]} />
        <Text style={[previewStyles.badgeText, { color: GREEN }]}>Start Now</Text>
      </View>
    </View>

    {/* Vehicle */}
    <Text style={previewStyles.vehicleText}>TN 14 CV 3755 · Ertiga</Text>

    {/* Route */}
    <View style={previewStyles.routeBlock}>
      <View style={previewStyles.routeRow}>
        <View style={[previewStyles.routeIcon, { backgroundColor: GREEN_LIGHT }]}>
          <Ionicons name="location" size={12} color={GREEN} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={previewStyles.stopName}>Karapakkam Bus Stop</Text>
          <Text style={previewStyles.stopMeta}>Start @ 8:30 AM</Text>
        </View>
      </View>

      <View style={previewStyles.connectorLine} />

      <View style={previewStyles.routeRow}>
        <View style={[previewStyles.routeIcon, { backgroundColor: PRIMARY_LIGHT }]}>
          <Ionicons name="business" size={12} color={PRIMARY} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={previewStyles.stopName}>vThink Global Technology</Text>
          <Text style={previewStyles.stopMeta}>ETA @ 9:00 AM</Text>
        </View>
      </View>
    </View>

    {/* Actions */}
    <View style={previewStyles.actionRow}>
      <View style={[previewStyles.primaryBtn, { backgroundColor: PRIMARY }]}>
        <Text style={previewStyles.primaryBtnText}>Start Trip</Text>
      </View>
      <View style={[previewStyles.outlineBtn, { borderColor: BORDER }]}>
        <Ionicons name="alert-circle-outline" size={13} color={TEXT_SEC} />
        <Text style={previewStyles.outlineBtnText}>Report Issue</Text>
      </View>
    </View>
  </View>
);

// ─── Slide 2 Preview: Active Trip Route Stops (mirrors 7–8/17) ───────────────
const RouteStopsPreview = () => (
  <View style={[previewStyles.card, SHADOW]}>
    {/* Mini header */}
    <View style={previewStyles.previewHeader}>
      <Text style={previewStyles.previewHeaderTitle}>Active Trip</Text>
      <View style={[previewStyles.badge, { backgroundColor: AMBER_LIGHT }]}>
        <Text style={[previewStyles.badgeText, { color: AMBER }]}>In Progress</Text>
      </View>
    </View>

    {/* Completed stop */}
    <View style={previewStyles.stopItem}>
      <View style={previewStyles.timeline}>
        <View style={[previewStyles.timelineDot, { backgroundColor: GREEN }]} />
        <View style={[previewStyles.timelineLine, { borderColor: GREEN + '55' }]} />
      </View>
      <View style={previewStyles.stopBody}>
        <Text style={previewStyles.stopItemName}>Karapakkam Bus Stop</Text>
        <View style={[previewStyles.chip, { backgroundColor: GREEN_LIGHT }]}>
          <Text style={[previewStyles.chipText, { color: GREEN }]}>Completed</Text>
        </View>
      </View>
    </View>

    {/* Current stop */}
    <View style={previewStyles.stopItem}>
      <View style={previewStyles.timeline}>
        <View style={[previewStyles.timelineDot, { backgroundColor: PRIMARY }]} />
        <View style={[previewStyles.timelineLine, { borderColor: PRIMARY + '33' }]} />
      </View>
      <View style={previewStyles.stopBody}>
        <Text style={previewStyles.stopItemName}>Sholinganallur</Text>
        <View style={[previewStyles.chip, { backgroundColor: AMBER_LIGHT }]}>
          <Text style={[previewStyles.chipText, { color: AMBER }]}>3rd Stop</Text>
        </View>
        <View style={[previewStyles.confirmBtn, { backgroundColor: PRIMARY }]}>
          <Text style={previewStyles.confirmBtnText}>Confirm Attendance</Text>
        </View>
      </View>
    </View>
  </View>
);

// ─── Slide 3 Preview: End Trip Slider (mirrors 9/17 + 12/17) ─────────────────
const EndTripPreview = () => (
  <View style={[previewStyles.card, SHADOW]}>
    {/* Mini trip header */}
    <View style={previewStyles.previewHeader}>
      <Text style={previewStyles.previewHeaderTitle}>Trip #231</Text>
      <View style={[previewStyles.badge, { backgroundColor: GREEN_LIGHT }]}>
        <View style={[previewStyles.badgeDot, { backgroundColor: GREEN }]} />
        <Text style={[previewStyles.badgeText, { color: GREEN }]}>All Picked Up</Text>
      </View>
    </View>

    {/* Stats row */}
    <View style={previewStyles.statsRow}>
      {[
        { val: '4', lbl: 'Pickups' },
        { val: '3', lbl: 'Stops' },
        { val: '8:30', lbl: 'Start' },
        { val: '9:00', lbl: 'ETA' },
      ].map((s, i, arr) => (
        <React.Fragment key={s.lbl}>
          <View style={previewStyles.statBox}>
            <Text style={previewStyles.statVal}>{s.val}</Text>
            <Text style={previewStyles.statLbl}>{s.lbl}</Text>
          </View>
          {i < arr.length - 1 && <View style={previewStyles.statDivider} />}
        </React.Fragment>
      ))}
    </View>

    {/* Slide-to-end track */}
    <View style={[previewStyles.slideTrack, { backgroundColor: PRIMARY + '18', borderColor: PRIMARY + '44' }]}>
      <Text style={[previewStyles.slideLabel, { color: PRIMARY }]}>Slide to End Trip</Text>
      <View style={[previewStyles.slideThumb, { backgroundColor: PRIMARY }]}>
        <Ionicons name="chevron-forward" size={14} color={WHITE} />
      </View>
    </View>
  </View>
);

// ─── Slide data ───────────────────────────────────────────────────────────────
const SLIDES = [
  {
    id: '1',
    title: 'Start Your Assigned Trip',
    description: 'Tap "Start Trip" to begin your route and view all pickup details for the shift.',
    Preview: TripCardPreview,
    nextLabel: 'See Pickup Flow',
    showBack: false,
  },
  {
    id: '2',
    title: 'Confirm Each Pickup',
    description:
      'Mark employees as picked up at every stop to keep trip records accurate and updated.',
    Preview: RouteStopsPreview,
    nextLabel: 'Next',
    showBack: true,
  },
  {
    id: '3',
    title: 'End & Submit Trip',
    description: 'Finish the trip after all drop-offs to automatically log trip details.',
    Preview: EndTripPreview,
    nextLabel: 'Get Started',
    showBack: true,
  },
];

// ─── Single slide component ───────────────────────────────────────────────────
const Slide = ({ item }) => {
  const Preview = item.Preview;
  return (
    <View style={[styles.slide, { width }]}>
      {/* Decorative background blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      {/* Preview card */}
      <View style={styles.previewWrapper}>
        <Preview />
      </View>

      {/* Text block */}
      <View style={styles.textBlock}>
        <Text style={styles.slideTitle}>{item.title}</Text>
        <Text style={styles.slideDesc}>{item.description}</Text>
      </View>
    </View>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────
const DriverOnboardingScreen = ({ navigation }) => {
  const flatListRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToLogin = () => navigation.replace(SCREENS.DRIVER_LOGIN);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const nextIdx = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIdx, animated: true });
      setCurrentIndex(nextIdx);
    } else {
      goToLogin();
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      flatListRef.current?.scrollToIndex({ index: prevIdx, animated: true });
      setCurrentIndex(prevIdx);
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index ?? 0);
    }
  }).current;

  const currentSlide = SLIDES[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      {/* ── Top bar: Back (slide 2+) + Skip ── */}
      <View style={styles.topBar}>
        {currentSlide.showBack ? (
          <TouchableOpacity onPress={handleBack} style={styles.backBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Ionicons name="arrow-back" size={20} color={TEXT_SEC} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backBtn} />
        )}

        <TouchableOpacity onPress={goToLogin} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* ── Slides ── */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={({ item }) => <Slide item={item} />}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ viewAreaCoveragePercentThreshold: 50 }}
        scrollEventThrottle={16}
        style={styles.flatList}
      />

      {/* ── Footer: dots + CTA ── */}
      <View style={styles.footer}>
        {/* Pagination dots */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                {
                  backgroundColor: idx === currentIndex ? PRIMARY : PRIMARY_FAINT,
                  width: idx === currentIndex ? 24 : 8,
                },
              ]}
            />
          ))}
        </View>

        {/* Next / Get Started button */}
        <TouchableOpacity
          style={styles.nextBtn}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.nextBtnText}>{currentSlide.nextLabel}</Text>
          <Ionicons name="arrow-forward" size={18} color={WHITE} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// ─── Preview sub-styles ───────────────────────────────────────────────────────
const previewStyles = StyleSheet.create({
  card: {
    backgroundColor: CARD_BG,
    borderRadius: 18,
    padding: 16,
    width: '100%',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  tripNum: { fontSize: 14, fontWeight: '700', color: TEXT },
  vehicleText: { fontSize: 11, color: TEXT_SEC, marginBottom: 12 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    gap: 4,
  },
  badgeDot: { width: 6, height: 6, borderRadius: 3 },
  badgeText: { fontSize: 10, fontWeight: '600' },

  routeBlock: { marginBottom: 12 },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  routeIcon: {
    width: 22,
    height: 22,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopName: { fontSize: 12, fontWeight: '600', color: TEXT },
  stopMeta: { fontSize: 10, color: TEXT_SEC, marginTop: 1 },
  connectorLine: {
    width: 2,
    height: 14,
    backgroundColor: BORDER,
    marginLeft: 10,
    marginVertical: 2,
    borderRadius: 1,
  },

  actionRow: { flexDirection: 'row', gap: 8 },
  primaryBtn: {
    flex: 1,
    height: 34,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: WHITE, fontSize: 12, fontWeight: '700' },
  outlineBtn: {
    flex: 1,
    height: 34,
    borderRadius: 9,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  outlineBtnText: { color: TEXT_SEC, fontSize: 11, fontWeight: '600' },

  // Slide 2
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  previewHeaderTitle: { fontSize: 13, fontWeight: '700', color: TEXT },
  stopItem: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  timeline: { alignItems: 'center', width: 14 },
  timelineDot: { width: 10, height: 10, borderRadius: 5, marginTop: 2 },
  timelineLine: {
    flex: 1,
    borderLeftWidth: 2,
    borderStyle: 'dashed',
    marginTop: 4,
    minHeight: 20,
  },
  stopBody: { flex: 1, gap: 5 },
  stopItemName: { fontSize: 12, fontWeight: '600', color: TEXT },
  chip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 20,
  },
  chipText: { fontSize: 10, fontWeight: '600' },
  confirmBtn: {
    height: 28,
    borderRadius: 7,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  confirmBtnText: { color: WHITE, fontSize: 11, fontWeight: '700' },

  // Slide 3
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: BG,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statVal: { fontSize: 13, fontWeight: '700', color: TEXT },
  statLbl: { fontSize: 9, color: TEXT_SEC, marginTop: 1 },
  statDivider: { width: 1, height: 24, backgroundColor: BORDER },

  slideTrack: {
    height: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    paddingHorizontal: 4,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  slideLabel: { fontSize: 12, fontWeight: '500', position: 'absolute' },
  slideThumb: {
    position: 'absolute',
    left: 4,
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

// ─── Screen styles ────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 4,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
    minWidth: 60,
  },
  backText: { fontSize: 14, color: TEXT_SEC, fontWeight: '500' },
  skipText: { fontSize: 14, color: TEXT_SEC, fontWeight: '500', paddingVertical: 6 },

  flatList: { flex: 1 },

  slide: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },

  // Decorative background blobs
  blob1: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: PRIMARY_LIGHT,
    top: -80,
    right: -80,
    opacity: 0.55,
  },
  blob2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: PRIMARY_LIGHT,
    bottom: 20,
    left: -60,
    opacity: 0.4,
  },

  previewWrapper: {
    width: '100%',
    marginBottom: 32,
  },

  textBlock: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  slideTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: TEXT,
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: -0.3,
  },
  slideDesc: {
    fontSize: 14,
    color: TEXT_SEC,
    textAlign: 'center',
    lineHeight: 22,
  },

  footer: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 16,
  },
  dotsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginBottom: 20,
  },
  dot: { height: 8, borderRadius: 4 },

  nextBtn: {
    height: 54,
    backgroundColor: PRIMARY,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  nextBtnText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});

export default DriverOnboardingScreen;
