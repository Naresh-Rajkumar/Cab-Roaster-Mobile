/**
 * Driver More/Profile Screen
 * Matches Figma: Driver Handoff → "More" frame
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../../theme/ThemeProvider';
import { logoutUser } from '../../redux/slices/authSlice';
import { Avatar } from '../../components';

const GENERAL_ITEMS = [
  { id: 'personal', label: 'Personal Information', icon: 'person-outline' },
  { id: 'shift', label: 'Shift Timing', icon: 'time-outline' },
];
const SOS_ITEMS = [
  { id: 'safety', label: 'Safety', icon: 'shield-outline' },
];
const PREF_ITEMS = [
  { id: 'notifications', label: 'Push Notifications', icon: 'notifications-outline', toggle: true },
  { id: 'support', label: 'Help & Support', icon: 'help-circle-outline' },
  { id: 'darkmode', label: 'Dark Mode', icon: 'moon-outline', toggle: true },
];

const MenuRow = ({ item, value, onToggle, colors }) => (
  <View style={[styles.menuRow, { borderBottomColor: colors.borderLight }]}>
    <View style={[styles.menuIcon, { backgroundColor: '#e8f6ed' }]}>
      <Ionicons name={item.icon} size={18} color="#16a34a" />
    </View>
    <Text style={[styles.menuLabel, { color: colors.text }]}>{item.label}</Text>
    {item.toggle ? (
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: colors.border, true: '#16a34a' }}
        thumbColor="#ffffff"
        ios_backgroundColor={colors.border}
      />
    ) : (
      <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
    )}
  </View>
);

const LogoutModal = ({ visible, onConfirm, onCancel, colors }) => (
  <Modal transparent visible={visible} animationType="fade">
    <View style={styles.overlay}>
      <View style={[styles.modalBox, { backgroundColor: colors.surface }]}>
        <View style={[styles.modalIcon, { backgroundColor: '#fce8e8' }]}>
          <Ionicons name="log-out-outline" size={28} color="#dc2626" />
        </View>
        <Text style={[styles.modalTitle, { color: colors.text }]}>Logout</Text>
        <Text style={[styles.modalBody, { color: colors.textSecondary }]}>
          Are you sure you want to logout?
        </Text>
        <View style={styles.modalBtns}>
          <TouchableOpacity
            style={[styles.cancelBtn, { borderColor: colors.border }]}
            onPress={onCancel}
          >
            <Text style={[styles.cancelBtnText, { color: colors.text }]}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.logoutBtnFill]} onPress={onConfirm}>
            <Text style={styles.logoutBtnFillText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

const DriverProfileScreen = ({ navigation }) => {
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const colors = theme.colors;
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [notifOn, setNotifOn] = useState(true);
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = () => {
    dispatch(logoutUser());
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={[styles.pageTitle, { color: colors.text }]}>More Details</Text>

        {/* Profile card */}
        <View style={[styles.profileCard, { backgroundColor: colors.surface }]}>
          <Avatar name={user?.name ?? 'Celia Hagenes'} size={64} />
          <View style={styles.profileMeta}>
            <Text style={[styles.profileName, { color: colors.text }]}>
              {user?.name ?? 'Celia Hagenes'}
            </Text>
            <View style={[styles.driverBadge, { backgroundColor: '#e8f6ed' }]}>
              <Text style={[styles.driverBadgeText, { color: '#16a34a' }]}>Driver</Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.editBtn, { borderColor: colors.border }]} onPress={() => navigation.navigate('EditProfile')}>
            <Text style={[styles.editBtnText, { color: colors.primary }]}>Edit</Text>
          </TouchableOpacity>
        </View>

        {/* Sections */}
        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>GENERAL</Text>
        <View style={[styles.group, { backgroundColor: colors.surface }]}>
          {GENERAL_ITEMS.map((item) => (
            <MenuRow key={item.id} item={item} colors={colors} />
          ))}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>SOS</Text>
        <View style={[styles.group, { backgroundColor: colors.surface }]}>
          {SOS_ITEMS.map((item) => (
            <MenuRow key={item.id} item={item} colors={colors} />
          ))}
        </View>

        <Text style={[styles.sectionLabel, { color: colors.textSecondary }]}>PREFERENCES</Text>
        <View style={[styles.group, { backgroundColor: colors.surface }]}>
          {PREF_ITEMS.map((item) => (
            <MenuRow
              key={item.id}
              item={item}
              colors={colors}
              value={item.id === 'darkmode' ? isDarkMode : item.id === 'notifications' ? notifOn : false}
              onToggle={item.id === 'darkmode' ? toggleTheme : item.id === 'notifications' ? setNotifOn : undefined}
            />
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={[styles.logoutBtn, { borderColor: '#dc2626' }]}
          onPress={() => setShowLogout(true)}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color="#dc2626" />
          <Text style={styles.logoutBtnText}>Logout</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: colors.textTertiary }]}>Version: v1.2.3</Text>
        <View style={{ height: 80 }} />
      </ScrollView>

      <LogoutModal
        visible={showLogout}
        onConfirm={handleLogout}
        onCancel={() => setShowLogout(false)}
        colors={colors}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingBottom: 16 },
  pageTitle: { fontSize: 20, fontWeight: '700', paddingHorizontal: 16, paddingTop: 16, marginBottom: 16 },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  profileMeta: { flex: 1 },
  profileName: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  driverBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 999 },
  driverBadgeText: { fontSize: 12, fontWeight: '600' },
  editBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, borderWidth: 1 },
  editBtnText: { fontSize: 13, fontWeight: '600' },

  sectionLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.8, marginHorizontal: 16, marginBottom: 6, marginTop: 4 },
  group: {
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
    paddingVertical: 14,
    gap: 12,
    borderBottomWidth: 1,
  },
  menuIcon: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  menuLabel: { flex: 1, fontSize: 14, fontWeight: '500' },

  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    height: 50,
    borderRadius: 14,
    borderWidth: 1.5,
    gap: 8,
    marginBottom: 12,
  },
  logoutBtnText: { color: '#dc2626', fontSize: 15, fontWeight: '700' },
  version: { textAlign: 'center', fontSize: 12 },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalBox: { width: 310, borderRadius: 20, padding: 24, alignItems: 'center' },
  modalIcon: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 14 },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  modalBody: { fontSize: 13, textAlign: 'center', marginBottom: 20 },
  modalBtns: { flexDirection: 'row', gap: 12, width: '100%' },
  cancelBtn: { flex: 1, height: 44, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { fontSize: 14, fontWeight: '600' },
  logoutBtnFill: { flex: 1, height: 44, borderRadius: 12, backgroundColor: '#dc2626', alignItems: 'center', justifyContent: 'center' },
  logoutBtnFillText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});

export default DriverProfileScreen;
