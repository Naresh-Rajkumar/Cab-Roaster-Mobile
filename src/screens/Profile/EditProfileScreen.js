/**
 * Edit Profile Screen — shared by Employee and Driver.
 * Calls PUT /api/v1/profile to update user profile.
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSelector, useDispatch } from 'react-redux';
import { useTheme } from '../../theme/ThemeProvider';
import { Avatar } from '../../components';
import { profileService } from '../../services/api/profileService';
import { updateUser } from '../../redux/slices/authSlice';

const BLOOD_GROUPS = ['O+ve', 'O-ve', 'A+ve', 'A-ve', 'B+ve', 'B-ve', 'AB+ve', 'AB-ve'];

const FormField = ({ label, value, onChangeText, placeholder, keyboardType, editable = true, colors }) => (
  <View style={styles.fieldContainer}>
    <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>{label}</Text>
    <TextInput
      style={[
        styles.fieldInput,
        {
          backgroundColor: editable ? colors.surface : '#f5f5f5',
          color: editable ? colors.text : colors.textSecondary,
          borderColor: colors.borderLight,
        },
      ]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.textTertiary ?? '#9CA3AF'}
      keyboardType={keyboardType}
      editable={editable}
    />
  </View>
);

export default function EditProfileScreen({ navigation }) {
  const { theme } = useTheme();
  const colors = theme.colors;
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    phone: '',
    bloodGroup: '',
    homeAddress: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
  });

  // Load current profile
  useEffect(() => {
    profileService.getProfile()
      .then((res) => {
        const data = res?.data?.data || res?.data || {};
        setForm({
          name: data.name || user?.name || '',
          phone: data.phone || user?.phone || '',
          bloodGroup: data.bloodGroup || '',
          homeAddress: data.homeAddress || '',
          emergencyContactName: data.emergencyContactName || '',
          emergencyContactPhone: data.emergencyContactPhone || '',
        });
      })
      .catch(() => {
        // Use Redux user data as fallback
        setForm((f) => ({
          ...f,
          name: user?.name || user?.displayName || '',
          phone: user?.phone || '',
        }));
      })
      .finally(() => setLoading(false));
  }, [user]);

  const update = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSave = async () => {
    if (!form.name?.trim()) {
      Alert.alert('Error', 'Name is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {};
      if (form.phone) payload.phone = form.phone;
      if (form.bloodGroup) payload.bloodGroup = form.bloodGroup;
      if (form.homeAddress) payload.homeAddress = form.homeAddress;
      if (form.emergencyContactName) payload.emergencyContactName = form.emergencyContactName;
      if (form.emergencyContactPhone) payload.emergencyContactPhone = form.emergencyContactPhone;

      const res = await profileService.updateProfile(payload);
      const data = res?.data?.data || res?.data || {};

      // Update Redux auth state
      if (data) {
        dispatch(updateUser(data));
      }

      Alert.alert('Success', 'Profile updated', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (err) {
      Alert.alert('Error', err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const [showBloodGroup, setShowBloodGroup] = useState(false);

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.borderLight }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <Avatar name={form.name || 'User'} size={80} />
          <TouchableOpacity style={[styles.changePhotoBtn, { borderColor: colors.primary }]}>
            <Ionicons name="camera-outline" size={16} color={colors.primary} />
            <Text style={[styles.changePhotoText, { color: colors.primary }]}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        {/* Fields */}
        <View style={[styles.formCard, { backgroundColor: colors.surface }]}>
          <FormField
            label="Full Name"
            value={form.name}
            onChangeText={(v) => update('name', v)}
            placeholder="Enter your name"
            editable={false}
            colors={colors}
          />

          <FormField
            label="Phone Number"
            value={form.phone}
            onChangeText={(v) => update('phone', v)}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
            colors={colors}
          />

          {/* Blood Group Picker */}
          <View style={styles.fieldContainer}>
            <Text style={[styles.fieldLabel, { color: colors.textSecondary }]}>Blood Group</Text>
            <TouchableOpacity
              style={[styles.fieldInput, styles.pickerInput, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}
              onPress={() => setShowBloodGroup(!showBloodGroup)}
            >
              <Text style={{ color: form.bloodGroup ? colors.text : colors.textTertiary ?? '#9CA3AF', fontSize: 14 }}>
                {form.bloodGroup || 'Select blood group'}
              </Text>
              <Ionicons name="chevron-down" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
            {showBloodGroup && (
              <View style={[styles.pickerDropdown, { backgroundColor: colors.surface, borderColor: colors.borderLight }]}>
                {BLOOD_GROUPS.map((bg) => (
                  <TouchableOpacity
                    key={bg}
                    style={[styles.pickerItem, form.bloodGroup === bg && { backgroundColor: colors.primaryContainer }]}
                    onPress={() => { update('bloodGroup', bg); setShowBloodGroup(false); }}
                  >
                    <Text style={[styles.pickerItemText, { color: colors.text }]}>{bg}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          <FormField
            label="Home Address"
            value={form.homeAddress}
            onChangeText={(v) => update('homeAddress', v)}
            placeholder="Enter home address"
            colors={colors}
          />

          <FormField
            label="Emergency Contact Name"
            value={form.emergencyContactName}
            onChangeText={(v) => update('emergencyContactName', v)}
            placeholder="Enter emergency contact name"
            colors={colors}
          />

          <FormField
            label="Emergency Contact Phone"
            value={form.emergencyContactPhone}
            onChangeText={(v) => update('emergencyContactPhone', v)}
            placeholder="Enter emergency contact phone"
            keyboardType="phone-pad"
            colors={colors}
          />
        </View>
      </ScrollView>

      {/* Save Button */}
      <View style={[styles.footer, { backgroundColor: colors.surface, borderTopColor: colors.borderLight }]}>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: colors.primary }]}
          onPress={handleSave}
          disabled={saving}
          activeOpacity={0.85}
        >
          {saving ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>Save Changes</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16,
    paddingVertical: 12, borderBottomWidth: 1, gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700' },
  scrollContent: { padding: 16 },
  avatarSection: { alignItems: 'center', marginBottom: 20 },
  changePhotoBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    marginTop: 10, borderWidth: 1, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  changePhotoText: { fontSize: 13, fontWeight: '500' },
  formCard: { borderRadius: 16, padding: 16, gap: 16 },
  fieldContainer: {},
  fieldLabel: { fontSize: 12, fontWeight: '500', marginBottom: 6 },
  fieldInput: {
    borderWidth: 1, borderRadius: 10, paddingHorizontal: 14,
    paddingVertical: 12, fontSize: 14,
  },
  pickerInput: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  pickerDropdown: {
    borderWidth: 1, borderRadius: 10, marginTop: 4,
    overflow: 'hidden',
  },
  pickerItem: { paddingHorizontal: 14, paddingVertical: 10 },
  pickerItemText: { fontSize: 14 },
  footer: {
    paddingHorizontal: 16, paddingVertical: 12,
    paddingBottom: 32, borderTopWidth: 1,
  },
  saveBtn: {
    height: 50, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
