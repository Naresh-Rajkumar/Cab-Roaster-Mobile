import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../theme/ThemeProvider';
import { Avatar } from '../../components';
import { logout } from '../../redux/slices/authSlice';
import spacing from '../../theme/spacing.json';
import typography from '../../theme/typography.json';
import { SCREENS } from '../../constants';

const MENU_SECTIONS = [
  {
    title: 'General',
    items: [
      { icon: 'person-outline', label: 'Personal Information' },
      { icon: 'calendar-outline', label: 'Shift Timing' },
    ],
  },
  {
    title: 'SOS',
    items: [
      { icon: 'shield-checkmark-outline', label: 'Safety' },
    ],
  },
  {
    title: 'Preferences',
    items: [
      { icon: 'notifications-outline', label: 'Push Notifications' },
      { icon: 'help-circle-outline', label: 'Help & Support' },
    ],
  },
];

const ProfileScreen = ({ navigation }) => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const colors = theme.colors;
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const userName = user?.name || 'Ragha Malliga';
  const employeeId = user?.employeeId || 'VT216';

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => dispatch(logout()) },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.topHeader}>
        <TouchableOpacity style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.topHeaderTitle, { color: colors.text, fontFamily: typography.fontFamily.semiBold }]}>
          More Details
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            <Avatar name={userName} size={80} />
            <TouchableOpacity style={[styles.cameraBtn, { backgroundColor: colors.primary }]}>
              <Ionicons name="camera" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.profileName, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
            {userName}
          </Text>
          <Text style={[styles.profileId, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
            {employeeId}
          </Text>
        </View>

        {/* Menu sections */}
        {MENU_SECTIONS.map((section) => (
          <View key={section.title} style={styles.menuSection}>
            <Text style={[styles.sectionTitle, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}>
              {section.title}
            </Text>
            <View style={[styles.menuCard, { backgroundColor: colors.surface }]}>
              {section.items.map((item, index) => (
                <TouchableOpacity
                  key={item.label}
                  style={[
                    styles.menuItem,
                    index < section.items.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.borderLight },
                  ]}
                  onPress={() => {
                    if (item.label === 'Shift Timing') navigation.navigate(SCREENS.REQUEST_CAB_STEP1);
                  }}
                  activeOpacity={0.7}
                >
                  <Ionicons name={item.icon} size={20} color={colors.icon} style={styles.menuIcon} />
                  <Text style={[styles.menuLabel, { color: colors.text, fontFamily: typography.fontFamily.regular }]}>
                    {item.label}
                  </Text>
                  <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
                </TouchableOpacity>
              ))}
              {/* Dark Mode toggle in Preferences section */}
              {section.title === 'Preferences' && (
                <View style={styles.menuItem}>
                  <Ionicons name="moon-outline" size={20} color={colors.icon} style={styles.menuIcon} />
                  <Text style={[styles.menuLabel, { color: colors.text, fontFamily: typography.fontFamily.regular, flex: 1 }]}>
                    Dark Mode
                  </Text>
                  <Switch
                    value={isDarkMode}
                    onValueChange={toggleTheme}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              )}
            </View>
          </View>
        ))}

        {/* Logout */}
        <TouchableOpacity
          style={[styles.logoutCard, { backgroundColor: colors.surface }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={[styles.logoutText, { color: colors.error, fontFamily: typography.fontFamily.semiBold }]}>
            Logout
          </Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: colors.textTertiary, fontFamily: typography.fontFamily.regular }]}>
          Version: v1.2.3
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
  },
  backBtn: { padding: 4 },
  topHeaderTitle: { fontSize: 18 },
  scrollContent: { paddingHorizontal: spacing.base, paddingBottom: spacing.xxxl },
  profileSection: { alignItems: 'center', paddingVertical: spacing.xl },
  avatarWrapper: { position: 'relative', marginBottom: spacing.md },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileName: { fontSize: 20, marginBottom: 4 },
  profileId: { fontSize: 14 },
  menuSection: { marginBottom: spacing.lg },
  sectionTitle: { fontSize: 13, marginBottom: spacing.sm, paddingLeft: spacing.xs },
  menuCard: { borderRadius: 12, overflow: 'hidden' },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.base,
    paddingHorizontal: spacing.base,
  },
  menuIcon: { marginRight: spacing.md },
  menuLabel: { flex: 1, fontSize: 15 },
  logoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    borderRadius: 12,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  logoutText: { fontSize: 15 },
  version: { fontSize: 12, textAlign: 'center', marginBottom: spacing.xxl },
});

export default ProfileScreen;
