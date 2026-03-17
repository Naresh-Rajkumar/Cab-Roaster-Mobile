import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { Avatar } from '../../components';
import spacing from '../../theme/spacing.json';
import typography from '../../theme/typography.json';
import { SCREENS } from '../../constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const STOPS = [
  {
    id: '1',
    time: '9:30 AM',
    location: 'Madippakkam',
    status: 'completed',
    statusLabel: 'Completed',
    employees: [{ id: 'e1', name: 'Tommie Strosin' }],
    expanded: false,
  },
  {
    id: '2',
    time: '9:45 AM',
    location: 'BSR Mall',
    status: 'next',
    statusLabel: 'Next Stop',
    employees: [
      { id: 'e2', name: 'James Parker' },
      { id: 'e3', name: 'Miss Ian Bosco' },
      { id: 'e4', name: 'Lana Mante' },
    ],
    expanded: true,
  },
  {
    id: '3',
    time: '10:15 AM',
    location: 'Aavin Bus Stop',
    status: 'pending',
    statusLabel: 'Pending',
    employees: [{ id: 'e5', name: 'Robin Kyle' }],
    expanded: false,
  },
  {
    id: '4',
    time: '10:30 AM',
    location: 'vThink Office',
    status: 'destination',
    statusLabel: '',
    employees: [],
    expanded: false,
  },
];

const getStatusColor = (status) => {
  switch (status) {
    case 'completed':
      return '#4CAF50';
    case 'next':
      return '#6B4EFF';
    case 'pending':
      return '#9E9E9E';
    default:
      return '#9E9E9E';
  }
};

const OverlappingAvatars = ({ employees, colors }) => {
  const maxVisible = 3;
  const visible = employees.slice(0, maxVisible);
  return (
    <View style={styles.overlappingAvatars}>
      {visible.map((emp, index) => (
        <View
          key={emp.id}
          style={[
            styles.avatarOverlap,
            { marginLeft: index === 0 ? 0 : -10, zIndex: maxVisible - index },
          ]}
        >
          <Avatar size={26} name={emp.name} />
        </View>
      ))}
    </View>
  );
};

const StopItem = ({ stop, isLast, colors, onConfirmAttendance }) => {
  const [expanded, setExpanded] = useState(stop.expanded);
  const isCompleted = stop.status === 'completed';
  const isNext = stop.status === 'next';
  const isDestination = stop.status === 'destination';
  const statusColor = getStatusColor(stop.status);

  return (
    <View style={styles.stopItem}>
      {/* Timeline column */}
      <View style={styles.timelineColumn}>
        <View
          style={[
            styles.stopCircle,
            {
              borderColor: isCompleted || isNext ? statusColor : '#BDBDBD',
              backgroundColor: isCompleted || isNext ? statusColor : 'transparent',
            },
          ]}
        >
          {(isCompleted || isNext) && (
            <Ionicons
              name={isCompleted ? 'checkmark' : 'ellipse'}
              size={10}
              color="#FFFFFF"
            />
          )}
        </View>
        {!isLast && (
          <View
            style={[
              styles.timelineLine,
              { borderColor: isCompleted ? '#4CAF50' : '#E0E0E0' },
            ]}
          />
        )}
      </View>

      {/* Stop content */}
      <View style={styles.stopContent}>
        <TouchableOpacity
          style={styles.stopHeader}
          onPress={() => !isDestination && setExpanded(!expanded)}
          activeOpacity={0.7}
        >
          <View style={styles.stopInfo}>
            <Text style={[styles.stopTime, { color: colors.textSecondary }]}>{stop.time}</Text>
            <Text style={[styles.stopLocation, { color: colors.text }]}>{stop.location}</Text>
          </View>

          <View style={styles.stopMeta}>
            {stop.employees.length > 0 && (
              <OverlappingAvatars employees={stop.employees} colors={colors} />
            )}
            {stop.statusLabel !== '' && (
              <Text style={[styles.statusLabel, { color: statusColor }]}>
                {stop.statusLabel}
              </Text>
            )}
          </View>
        </TouchableOpacity>

        {/* Expanded employee list for "Next Stop" */}
        {expanded && isNext && (
          <View style={[styles.employeeList, { backgroundColor: '#F8F6FF', borderRadius: 10, padding: 10, marginTop: 8, marginBottom: 8 }]}>
            {stop.employees.map((emp, idx) => (
              <View
                key={emp.id}
                style={[
                  styles.employeeRow,
                  idx < stop.employees.length - 1 && {
                    borderBottomWidth: 1,
                    borderBottomColor: '#EDE7FF',
                    paddingBottom: 10,
                    marginBottom: 10,
                  },
                ]}
              >
                <Avatar size={32} name={emp.name} />
                <Text style={[styles.employeeName, { color: colors.text }]}>{emp.name}</Text>
                <TouchableOpacity
                  style={[styles.callButton, { backgroundColor: '#6B4EFF' }]}
                  activeOpacity={0.8}
                >
                  <Ionicons name="call" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ))}
            {/* Confirm Attendance button for this stop */}
            <TouchableOpacity
              style={[styles.confirmAttendanceBtn, { backgroundColor: '#6B4EFF', marginTop: 10 }]}
              onPress={() => onConfirmAttendance && onConfirmAttendance(stop)}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-circle-outline" size={16} color="#FFF" />
              <Text style={styles.confirmAttendanceBtnText}>Confirm Attendance</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
};

export default function DriverActiveTripScreen({ navigation }) {
  const { theme } = useTheme();
  const colors = theme.colors;

  const allStopsCompleted = STOPS.filter(s => s.status !== 'destination').every(
    s => s.status === 'completed'
  );

  const handleConfirmAttendance = (stop) => {
    navigation.navigate(SCREENS.ATTENDANCE, { stop });
  };

  const handleSlideToEndTrip = () => {
    Alert.alert(
      'End Trip',
      'Are you sure you want to end this trip?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'End Trip', style: 'destructive', onPress: () => navigation.navigate(SCREENS.TRIP_SUMMARY) },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Map Placeholder (top half) */}
      <View style={[styles.mapContainer, { backgroundColor: '#D8E8D0' }]}>
        {/* Map grid lines for visual reference */}
        <View style={styles.mapGrid}>
          {[...Array(6)].map((_, i) => (
            <View key={`h${i}`} style={[styles.gridLineH, { top: `${(i + 1) * 14}%`, backgroundColor: '#C5D9BC' }]} />
          ))}
          {[...Array(5)].map((_, i) => (
            <View key={`v${i}`} style={[styles.gridLineV, { left: `${(i + 1) * 17}%`, backgroundColor: '#C5D9BC' }]} />
          ))}
        </View>

        {/* Route line placeholder */}
        <View style={styles.routeLinePlaceholder}>
          <View style={[styles.routeLine, { backgroundColor: '#6B4EFF' }]} />
        </View>

        {/* Car marker */}
        <View style={[styles.carMarker, { backgroundColor: '#6B4EFF' }]}>
          <Ionicons name="car" size={20} color="#FFFFFF" />
        </View>

        {/* Header overlay */}
        <SafeAreaView style={styles.mapHeaderOverlay}>
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: 'rgba(255,255,255,0.9)' }]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.8}
          >
            <Ionicons name="arrow-back" size={20} color="#222222" />
            <Text style={styles.backButtonText}>Active Trip</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </View>

      {/* Bottom Sheet */}
      <View style={[styles.bottomSheet, { backgroundColor: colors.card }]}>
        {/* Drag handle */}
        <View style={styles.dragHandleContainer}>
          <View style={[styles.dragHandle, { backgroundColor: '#E0E0E0' }]} />
        </View>

        {/* Trip Details header */}
        <View style={styles.bottomSheetHeader}>
          <Text style={[styles.tripDetailsTitle, { color: colors.text }]}>Trip Details</Text>
          <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Ionicons name="close" size={22} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Route Stops */}
        <Text style={[styles.routeStopsLabel, { color: colors.textSecondary }]}>Route Stops</Text>
        <ScrollView showsVerticalScrollIndicator={false} style={styles.stopsList}>
          {STOPS.map((stop, index) => (
            <StopItem
              key={stop.id}
              stop={stop}
              isLast={index === STOPS.length - 1}
              colors={colors}
              onConfirmAttendance={handleConfirmAttendance}
            />
          ))}

          {/* Slide to End Trip button */}
          <TouchableOpacity
            style={[styles.slideToEndBtn, { backgroundColor: '#FFEBEE', borderColor: '#E53935' }]}
            onPress={handleSlideToEndTrip}
            activeOpacity={0.85}
          >
            <View style={[styles.slideCircle, { backgroundColor: '#E53935' }]}>
              <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
            </View>
            <Text style={[styles.slideToEndText, { color: '#E53935' }]}>Slide To End Trip</Text>
            <Ionicons name="chevron-forward" size={16} color="#E53935" style={{ opacity: 0.4 }} />
            <Ionicons name="chevron-forward" size={16} color="#E53935" style={{ opacity: 0.2 }} />
          </TouchableOpacity>

          <View style={{ height: 24 }} />
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    height: SCREEN_HEIGHT * 0.42,
    position: 'relative',
    overflow: 'hidden',
  },
  mapGrid: {
    ...StyleSheet.absoluteFillObject,
  },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    opacity: 0.5,
  },
  gridLineV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    opacity: 0.5,
  },
  routeLinePlaceholder: {
    position: 'absolute',
    top: '30%',
    left: '20%',
    right: '20%',
    alignItems: 'center',
    transform: [{ rotate: '-20deg' }],
  },
  routeLine: {
    height: 4,
    width: '100%',
    borderRadius: 2,
    opacity: 0.7,
  },
  carMarker: {
    position: 'absolute',
    top: '38%',
    left: '45%',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6B4EFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  mapHeaderOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    margin: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 3,
  },
  backButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#222222',
  },
  bottomSheet: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 10,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingTop: 12,
    paddingBottom: 6,
  },
  dragHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
  },
  bottomSheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  tripDetailsTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  routeStopsLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  stopsList: {
    flex: 1,
  },
  stopItem: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  timelineColumn: {
    alignItems: 'center',
    width: 24,
    marginRight: 12,
  },
  stopCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  timelineLine: {
    flex: 1,
    width: 2,
    borderLeftWidth: 2,
    borderStyle: 'dashed',
    minHeight: 30,
    marginTop: 4,
  },
  stopContent: {
    flex: 1,
    paddingBottom: 16,
  },
  stopHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  stopInfo: {
    flex: 1,
  },
  stopTime: {
    fontSize: 12,
    fontWeight: '400',
    marginBottom: 2,
  },
  stopLocation: {
    fontSize: 15,
    fontWeight: '600',
  },
  stopMeta: {
    alignItems: 'flex-end',
    gap: 4,
  },
  overlappingAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarOverlap: {
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    borderRadius: 14,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  employeeList: {},
  employeeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  employeeName: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  callButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  confirmAttendanceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderRadius: 10,
    paddingVertical: 10,
  },
  confirmAttendanceBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  slideToEndBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 4,
  },
  slideCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  slideToEndText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
  },
});
