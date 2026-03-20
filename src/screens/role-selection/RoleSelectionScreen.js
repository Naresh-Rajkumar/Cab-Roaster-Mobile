import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { setPendingRole } from '../../redux/slices/authSlice';
import { SCREENS, USER_ROLES } from '../../constants';

const { width } = Dimensions.get('window');

const PRIMARY = '#643ee8';
const PRIMARY_LIGHT = '#f1ecff';
const BG = '#f5f4f9';
const TEXT = '#312e3a';
const TEXT_SECONDARY = '#5e5c66';
const BORDER = '#dadada';
const WHITE = '#ffffff';

const ROLES = [
  {
    id: USER_ROLES.EMPLOYEE,
    label: 'Employee',
    description: 'Track your daily cab, request changes, and manage your commute.',
    icon: 'person',
    iconBg: PRIMARY_LIGHT,
    iconColor: PRIMARY,
    badge: 'Office Commuter',
  },
  {
    id: USER_ROLES.DRIVER,
    label: 'Driver',
    description: 'Manage trips, confirm pickups, and log attendance on the go.',
    icon: 'car',
    iconBg: '#e8f6ed',
    iconColor: '#16a34a',
    badge: 'Fleet Partner',
  },
];

const RoleCard = ({ role, selected, onPress }) => {
  const isSelected = selected === role.id;

  return (
    <TouchableOpacity
      style={[
        styles.roleCard,
        isSelected && styles.roleCardSelected,
      ]}
      onPress={() => onPress(role.id)}
      activeOpacity={0.8}
    >
      {/* Selection indicator */}
      <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
        {isSelected && <View style={styles.radioInner} />}
      </View>

      {/* Icon */}
      <View style={[styles.roleIconBox, { backgroundColor: role.iconBg }]}>
        <Ionicons name={role.icon} size={28} color={role.iconColor} />
      </View>

      {/* Content */}
      <View style={styles.roleContent}>
        <View style={styles.roleTitleRow}>
          <Text style={styles.roleLabel}>{role.label}</Text>
          <View style={[styles.roleBadge, { backgroundColor: isSelected ? PRIMARY_LIGHT : '#f5f6f7' }]}>
            <Text style={[styles.roleBadgeText, { color: isSelected ? PRIMARY : TEXT_SECONDARY }]}>
              {role.badge}
            </Text>
          </View>
        </View>
        <Text style={styles.roleDescription}>{role.description}</Text>
      </View>
    </TouchableOpacity>
  );
};

const RoleSelectionScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const [selectedRole, setSelectedRole] = useState(null);


  const handleContinue = () => {
    if (!selectedRole) {
      Alert.alert('Select a Role', 'Please choose whether you are an Employee or Driver to continue.');
      return;
    }
    dispatch(setPendingRole(selectedRole));
    navigation.navigate(SCREENS.ONBOARDING);
  };

  return (
    <View style={styles.root}>
      {/* Background blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.logoMark}>
              <View style={styles.cMark} />
            </View>
            <Text style={styles.appTitle}>
              <Text style={styles.appTitleBold}>Cab</Text>
              <Text style={styles.appTitleThin}> Roster</Text>
            </Text>
            <Text style={styles.appTagline}>Employee Transport Management</Text>
          </View>

          {/* Title block */}
          <View style={styles.titleBlock}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Select your role to access your personalised dashboard and commute tools.
            </Text>
          </View>

          {/* Role cards */}
          <View style={styles.rolesContainer}>
            {ROLES.map((role) => (
              <RoleCard
                key={role.id}
                role={role}
                selected={selectedRole}
                onPress={setSelectedRole}
              />
            ))}
          </View>

          {/* CTA */}
          <TouchableOpacity
            style={[
              styles.continueButton,
              !selectedRole && styles.continueButtonDisabled,
            ]}
            onPress={handleContinue}
            activeOpacity={0.85}
            disabled={!selectedRole}
          >
            <View style={styles.continueButtonInner}>
              <Text style={styles.continueButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color={WHITE} />
            </View>
          </TouchableOpacity>

          {/* Terms */}
          <Text style={styles.terms}>
            By continuing, you agree to our{' '}
            <Text style={styles.termsLink}>Terms & Conditions</Text>
            {' '}and{' '}
            <Text style={styles.termsLink}>Privacy Policy</Text>
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: BG },
  blob1: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: PRIMARY_LIGHT,
    top: -100,
    right: -80,
    opacity: 0.6,
  },
  blob2: {
    position: 'absolute',
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#e8f6ed',
    bottom: -60,
    left: -80,
    opacity: 0.5,
  },
  safeArea: { flex: 1 },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },

  // Header / brand
  header: { alignItems: 'center', marginBottom: 32 },
  logoMark: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: PRIMARY,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cMark: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 3.5,
    borderColor: WHITE,
    borderRightColor: 'transparent',
    transform: [{ rotate: '45deg' }],
  },
  appTitle: { fontSize: 22, marginBottom: 4 },
  appTitleBold: { fontWeight: '800', color: PRIMARY },
  appTitleThin: { fontWeight: '300', color: TEXT },
  appTagline: { fontSize: 12, color: TEXT_SECONDARY, letterSpacing: 0.3 },

  // Title block
  titleBlock: { marginBottom: 28 },
  title: { fontSize: 26, fontWeight: '700', color: TEXT, marginBottom: 8, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: TEXT_SECONDARY, lineHeight: 22 },

  // Role cards
  rolesContainer: { gap: 14, marginBottom: 32 },
  roleCard: {
    backgroundColor: WHITE,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1.5,
    borderColor: BORDER,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  roleCardSelected: {
    borderColor: PRIMARY,
    backgroundColor: '#fdfcff',
    shadowColor: PRIMARY,
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
    marginTop: 2,
  },
  radioOuterSelected: { borderColor: PRIMARY },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: PRIMARY,
  },
  roleIconBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  roleContent: { flex: 1 },
  roleTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  roleLabel: { fontSize: 16, fontWeight: '700', color: TEXT },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  roleBadgeText: { fontSize: 11, fontWeight: '600' },
  roleDescription: { fontSize: 13, color: TEXT_SECONDARY, lineHeight: 19 },

  // CTA
  continueButton: {
    backgroundColor: PRIMARY,
    borderRadius: 14,
    height: 54,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: PRIMARY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  continueButtonDisabled: {
    backgroundColor: '#b9c0c9',
    shadowOpacity: 0,
    elevation: 0,
  },
  continueButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  continueButtonText: {
    color: WHITE,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // Terms
  terms: { fontSize: 12, color: TEXT_SECONDARY, textAlign: 'center', lineHeight: 18 },
  termsLink: { color: PRIMARY, fontWeight: '600' },
});

export default RoleSelectionScreen;
