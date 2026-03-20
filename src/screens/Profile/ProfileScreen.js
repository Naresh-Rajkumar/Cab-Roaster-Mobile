/**
 * Profile / More Screen — Figma: Employee Handoff 09/02/2026 "More"
 * Centered profile, employee ID, bottom-sheet logout confirm.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../../theme/ThemeProvider';
import { logout } from '../../redux/slices/authSlice';
import { Avatar } from '../../components';

const GENERAL_ITEMS = [
  { id: 'personal', label: 'Personal Information', icon: 'person-circle-outline' },
  { id: 'shift',    label: 'Shift Timing',         icon: 'calendar-outline' },
];
const SOS_ITEMS = [
  { id: 'safety', label: 'Safety', icon: 'shield-checkmark-outline' },
];
const PREF_ITEMS = [
  { id: 'notifications', label: 'Push Notifications', icon: 'notifications-outline', toggle: true },
  { id: 'support',       label: 'Help & Support',     icon: 'help-circle-outline' },
  { id: 'darkmode',      label: 'Dark Mode',           icon: 'moon-outline',          toggle: true },
];

// ─── Menu Row ─────────────────────────────────────────────────────────────────
const MenuRow = ({ item, value, onToggle, colors, isLast }) => (
  <View style={[styles.menuRow, { borderBottomColor: isLast ? 'transparent' : colors.borderLight }]}>
    <Ionicons name={item.icon} size={20} color={colors.text} style={styles.menuIcon} />
    <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
    {item.toggle ? (
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor="#ffffff"
        ios_backgroundColor={colors.border}
      />
    ) : (
      <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
    )}
  </View>
);

// ─── Logout Bottom Sheet ──────────────────────────────────────────────────────
const LogoutSheet = ({ visible, onConfirm, onCancel, colors }) => (
  <Modal transparent visible={visible} animationType="slide">
    <TouchableOpacity style={styles.sheetOverlay} activeOpacity={1} onPress={onCancel}>
      <TouchableOpacity activeOpacity={1}>
        <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
          <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />
          <View style={[styles.logoutIconCircle, { backgroundColor: '#fee2e2' }]}>
            <Ionicons name="log-out-outline" size={30} color="#dc2626" />
          </View>
          <Text style={[styles.sheetTitle, { color: colors.text }]}>Logout?</Text>
          <Text style={[styles.sheetBody, { color: colors.textSecondary }]}>
            Are you sure you want to logout?
          </Text>
          <TouchableOpacity
            style={styles.sheetBtnYes}
            onPress={onConfirm}
            activeOpacity={0.85}
          >
            <Text style={styles.sheetBtnYesText}>Yes, Logout</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.sheetBtnNo} onPress={onCancel} activeOpacity={0.7}>
            <Text style={[styles.sheetBtnNoText, { color: colors.text }]}>No, Cancel</Text>
          </TouchableOpacity>
          <View style={{ height: 24 }} />
        </View>
      </TouchableOpacity>
    </TouchableOpacity>
  </Modal>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
const ProfileScreen = () => {
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const colors = theme.colors;
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [logoutVisible, setLogoutVisible] = useState(false);

  const displayName = user?.name ?? 'Ragha Malliga';
  const employeeId = user?.employeeId ?? 'VT216';

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.pageHeader}>
          <Text style={[styles.pageTitle, { color: colors.text }]}>More Details</Text>
        </View>

        {/* Centered Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrapper}>
            <Avatar name={displayName} size={88} />
            <TouchableOpacity style={[styles.cameraBtn, { backgroundColor: colors.primary }]}>
              <Ionicons name="camera" size={16} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.profileName, { color: colors.text }]}>{displayName}</Text>
          <Text style={[styles.profileId, { color: colors.textSecondary }]}>{employeeId}</Text>
        </View>

        {/* General */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>General</Text>
        <View style={[styles.menuGroup, { backgroundColor: colors.surface }]}>
          {GENERAL_ITEMS.map((item, idx) => (
            <MenuRow
              key={item.id}
              item={item}
              colors={colors}
              isLast={idx === GENERAL_ITEMS.length - 1}
            />
          ))}
        </View>

        {/* SOS */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>SOS</Text>
        <View style={[styles.menuGroup, { backgroundColor: colors.surface }]}>
          {SOS_ITEMS.map((item) => (
            <MenuRow key={item.id} item={item} colors={colors} isLast />
          ))}
        </View>

        {/* Preferences */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>Preferences</Text>
        <View style={[styles.menuGroup, { backgroundColor: colors.surface }]}>
          {PREF_ITEMS.map((item, idx) => (
            <MenuRow
              key={item.id}
              item={item}
              colors={colors}
              isLast={idx === PREF_ITEMS.length - 1}
              value={
                item.id === 'darkmode'
                  ? isDarkMode
                  : item.id === 'notifications'
                  ? notificationsOn
                  : false
              }
              onToggle={
                item.id === 'darkmode'
                  ? toggleTheme
                  : item.id === 'notifications'
                  ? setNotificationsOn
                  : undefined
              }
            />
          ))}
        </View>

        {/* Logout */}
        <View style={[styles.menuGroup, { backgroundColor: colors.surface, marginBottom: 8 }]}>
          <TouchableOpacity
            style={[styles.menuRow, { borderBottomColor: 'transparent' }]}
            onPress={() => setLogoutVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out-outline" size={20} color="#dc2626" style={styles.menuIcon} />
            <Text style={[styles.menuLabel, { color: '#dc2626' }]}>Logout</Text>
          </TouchableOpacity>
        </View>

        <Text style={[styles.version, { color: colors.textTertiary }]}>Version: v1.2.3</Text>
        <View style={{ height: 60 }} />
      </ScrollView>

      <LogoutSheet
        visible={logoutVisible}
        onConfirm={handleLogout}
        onCancel={() => setLogoutVisible(false)}
        colors={colors}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 16 },
  pageHeader: { paddingHorizontal: 16, paddingTop: 16, marginBottom: 8 },
  pageTitle: { fontSize: 20, fontWeight: '700' },

  // Avatar section
  avatarSection: { alignItems: 'center', paddingVertical: 20, paddingBottom: 28 },
  avatarWrapper: { position: 'relative', marginBottom: 12 },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  profileName: { fontSize: 20, fontWeight: '700', marginBottom: 4 },
  profileId: { fontSize: 14 },

  // Section label
  sectionLabel: { fontSize: 13, fontWeight: '500', marginHorizontal: 16, marginBottom: 6, marginTop: 4 },

  // Menu group
  menuGroup: {
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 15,
    borderBottomWidth: 1,
  },
  menuIcon: { marginRight: 12 },
  menuLabel: { flex: 1, fontSize: 15 },

  version: { textAlign: 'center', fontSize: 12 },

  // Logout sheet
  sheetOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginVertical: 14,
  },
  logoutIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    marginTop: 4,
  },
  sheetTitle: { fontSize: 22, fontWeight: '700', marginBottom: 8 },
  sheetBody: { fontSize: 14, textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  sheetBtnYes: {
    width: '100%',
    height: 52,
    backgroundColor: '#dc2626',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  sheetBtnYesText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  sheetBtnNo: { paddingVertical: 8 },
  sheetBtnNoText: { fontSize: 16, fontWeight: '600' },
});

export default ProfileScreen;
