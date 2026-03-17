import React, { useState } from 'react';
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
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../../theme/ThemeProvider';
import { Avatar } from '../../components';
import { SCREENS } from '../../constants';
import { logout } from '../../redux/slices/authSlice';

const APP_VERSION = '1.0.0';

const MENU_SECTIONS = [
  {
    title: 'General',
    items: [
      {
        id: 'personal',
        label: 'Personal Information',
        icon: 'person-outline',
        type: 'navigate',
      },
      {
        id: 'shift',
        label: 'Shift Timing',
        icon: 'time-outline',
        type: 'navigate',
      },
    ],
  },
  {
    title: 'SOS',
    items: [
      {
        id: 'safety',
        label: 'Safety',
        icon: 'shield-checkmark-outline',
        type: 'navigate',
        iconColor: '#E53935',
      },
    ],
  },
  {
    title: 'Preferences',
    items: [
      {
        id: 'notifications',
        label: 'Push Notifications',
        icon: 'notifications-outline',
        type: 'toggle',
        toggleKey: 'notifications',
      },
      {
        id: 'help',
        label: 'Help & Support',
        icon: 'help-circle-outline',
        type: 'navigate',
      },
      {
        id: 'darkmode',
        label: 'Dark Mode',
        icon: 'moon-outline',
        type: 'toggle',
        toggleKey: 'darkMode',
      },
    ],
  },
];

const MenuItem = ({ item, colors, onPress, toggleValue, onToggle }) => {
  return (
    <TouchableOpacity
      style={[styles.menuItem, { borderBottomColor: colors.border || '#F0F0F0' }]}
      onPress={item.type === 'navigate' ? onPress : undefined}
      activeOpacity={item.type === 'navigate' ? 0.7 : 1}
    >
      <View style={[styles.menuItemIcon, { backgroundColor: (item.iconColor || '#6B4EFF') + '15' }]}>
        <Ionicons
          name={item.icon}
          size={18}
          color={item.iconColor || '#6B4EFF'}
        />
      </View>
      <Text style={[styles.menuItemLabel, { color: colors.text }]}>{item.label}</Text>
      {item.type === 'toggle' ? (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: '#E0E0E0', true: '#6B4EFF' }}
          thumbColor="#FFFFFF"
        />
      ) : (
        <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
      )}
    </TouchableOpacity>
  );
};

const MenuSection = ({ section, colors, onItemPress, toggleStates, onToggle }) => (
  <View style={styles.menuSection}>
    <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
      {section.title}
    </Text>
    <View style={[styles.sectionCard, { backgroundColor: colors.card }]}>
      {section.items.map((item, index) => (
        <MenuItem
          key={item.id}
          item={item}
          colors={colors}
          onPress={() => onItemPress(item)}
          toggleValue={item.toggleKey ? toggleStates[item.toggleKey] : false}
          onToggle={item.toggleKey ? (val) => onToggle(item.toggleKey, val) : undefined}
          style={index === section.items.length - 1 ? { borderBottomWidth: 0 } : {}}
        />
      ))}
    </View>
  </View>
);

export default function DriverProfileScreen({ navigation }) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth?.user);
  const driverName = user?.name || 'Driver';

  const [toggleStates, setToggleStates] = useState({
    notifications: true,
    darkMode: false,
  });

  const handleToggle = (key, value) => {
    setToggleStates((prev) => ({ ...prev, [key]: value }));
  };

  const handleItemPress = (item) => {
    // Navigate to sub-screens if they exist; otherwise no-op
    switch (item.id) {
      case 'personal':
        // navigation.navigate('PersonalInformation');
        break;
      case 'shift':
        navigation.navigate(SCREENS.REQUEST_CAB_STEP1);
        break;
      case 'safety':
        // navigation.navigate('Safety');
        break;
      case 'help':
        // navigation.navigate('HelpSupport');
        break;
      default:
        break;
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: () => dispatch(logout()),
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.pageHeader}>
          <Text style={[styles.pageTitle, { color: colors.text }]}>Profile</Text>
        </View>

        {/* Profile card */}
        <View style={[styles.profileCard, { backgroundColor: colors.card }]}>
          <Avatar size={70} name={driverName} />
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: colors.text }]}>{driverName}</Text>
            <View style={[styles.roleBadge, { backgroundColor: '#EDE7FF' }]}>
              <Ionicons name="car" size={12} color="#6B4EFF" />
              <Text style={[styles.roleText, { color: '#6B4EFF' }]}>Driver</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.editButton, { borderColor: '#6B4EFF', borderWidth: 1.5 }]}
            activeOpacity={0.7}
          >
            <Ionicons name="pencil" size={16} color="#6B4EFF" />
          </TouchableOpacity>
        </View>

        {/* Menu sections */}
        {MENU_SECTIONS.map((section) => (
          <MenuSection
            key={section.title}
            section={section}
            colors={colors}
            onItemPress={handleItemPress}
            toggleStates={toggleStates}
            onToggle={handleToggle}
          />
        ))}

        {/* Logout button */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: '#FFEBEE' }]}
          onPress={handleLogout}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={20} color="#E53935" />
          <Text style={[styles.logoutText, { color: '#E53935' }]}>Log Out</Text>
        </TouchableOpacity>

        {/* Version */}
        <Text style={[styles.versionText, { color: colors.textSecondary }]}>
          Version {APP_VERSION}
        </Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  pageHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: 16,
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
  },
  profileInfo: {
    flex: 1,
    gap: 6,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  sectionCard: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    gap: 12,
  },
  menuItemIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginTop: 8,
    paddingVertical: 15,
    borderRadius: 14,
    gap: 8,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '400',
    marginTop: 16,
  },
});
