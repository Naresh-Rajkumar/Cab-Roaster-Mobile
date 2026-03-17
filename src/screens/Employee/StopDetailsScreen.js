import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import {
  Header,
  Card,
  StatusBadge,
  Avatar,
  Button,
  Modal,
} from '../../components';
import spacing from '../../theme/spacing.json';
import typography from '../../theme/typography.json';
import { HANDOFF_STATUS } from '../../constants';

const StopDetailsScreen = ({ navigation, route }) => {
  const { employee } = route.params || {};
  const { theme } = useTheme();
  const colors = theme.colors;
  const [currentStatus, setCurrentStatus] = useState(
    employee?.handoffStatus || HANDOFF_STATUS.PENDING
  );
  const [showStatusModal, setShowStatusModal] = useState(false);

  const handleCall = () => {
    if (employee?.phone) {
      Linking.openURL(`tel:${employee.phone}`);
    }
  };

  const handleStatusUpdate = (newStatus) => {
    Alert.alert(
      'Update Status',
      `Mark ${employee?.name} as "${newStatus.replace('_', ' ')}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            setCurrentStatus(newStatus);
            setShowStatusModal(false);
          },
        },
      ]
    );
  };

  const statusActions = [
    {
      key: HANDOFF_STATUS.PICKED_UP,
      label: 'Picked Up',
      icon: 'checkmark-circle',
      color: colors.success,
      bg: colors.successBackground,
    },
    {
      key: HANDOFF_STATUS.NO_SHOW,
      label: 'No Show',
      icon: 'close-circle',
      color: colors.error,
      bg: colors.errorBackground,
    },
    {
      key: HANDOFF_STATUS.CANCELLED,
      label: 'Cancelled',
      icon: 'ban',
      color: colors.warning,
      bg: colors.warningBackground,
    },
  ];

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={['bottom']}
    >
      <Header
        title="Employee Details"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Employee Profile Card */}
        <Card elevated style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Avatar
              name={employee?.name || 'Employee'}
              source={employee?.avatar}
              size={64}
            />
            <View style={styles.profileInfo}>
              <Text
                style={[
                  styles.employeeName,
                  {
                    color: colors.text,
                    fontFamily: typography.fontFamily.bold,
                  },
                ]}
              >
                {employee?.name || 'Employee Name'}
              </Text>
              <Text
                style={[
                  styles.employeeId,
                  {
                    color: colors.textSecondary,
                    fontFamily: typography.fontFamily.regular,
                  },
                ]}
              >
                {employee?.employeeId || 'EMP-0000'}
              </Text>
              <StatusBadge status={currentStatus} size="md" />
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          {/* Contact Actions */}
          <View style={styles.contactActions}>
            <TouchableOpacity
              onPress={handleCall}
              style={[
                styles.contactButton,
                { backgroundColor: colors.successBackground },
              ]}
            >
              <Ionicons name="call" size={20} color={colors.success} />
              <Text
                style={[
                  styles.contactButtonText,
                  {
                    color: colors.success,
                    fontFamily: typography.fontFamily.medium,
                  },
                ]}
              >
                Call
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.contactButton,
                { backgroundColor: colors.infoBackground },
              ]}
            >
              <Ionicons name="chatbubble" size={20} color={colors.info} />
              <Text
                style={[
                  styles.contactButtonText,
                  {
                    color: colors.info,
                    fontFamily: typography.fontFamily.medium,
                  },
                ]}
              >
                Message
              </Text>
            </TouchableOpacity>
          </View>
        </Card>

        {/* Pickup Details */}
        <Card elevated style={styles.detailsCard}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.text,
                fontFamily: typography.fontFamily.semiBold,
              },
            ]}
          >
            Pickup Details
          </Text>

          <View style={styles.detailRow}>
            <View style={[styles.detailIcon, { backgroundColor: colors.primaryContainer }]}>
              <Ionicons name="location" size={18} color={colors.primary} />
            </View>
            <View style={styles.detailContent}>
              <Text
                style={[
                  styles.detailLabel,
                  {
                    color: colors.textTertiary,
                    fontFamily: typography.fontFamily.regular,
                  },
                ]}
              >
                Pickup Point
              </Text>
              <Text
                style={[
                  styles.detailValue,
                  {
                    color: colors.text,
                    fontFamily: typography.fontFamily.medium,
                  },
                ]}
              >
                {employee?.pickupPoint || 'Stop Location'}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={[styles.detailIcon, { backgroundColor: colors.warningBackground }]}>
              <Ionicons name="time" size={18} color={colors.warning} />
            </View>
            <View style={styles.detailContent}>
              <Text
                style={[
                  styles.detailLabel,
                  {
                    color: colors.textTertiary,
                    fontFamily: typography.fontFamily.regular,
                  },
                ]}
              >
                Scheduled Time
              </Text>
              <Text
                style={[
                  styles.detailValue,
                  {
                    color: colors.text,
                    fontFamily: typography.fontFamily.medium,
                  },
                ]}
              >
                {employee?.scheduledTime || '00:00 AM'}
              </Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={[styles.detailIcon, { backgroundColor: colors.infoBackground }]}>
              <Ionicons name="car" size={18} color={colors.info} />
            </View>
            <View style={styles.detailContent}>
              <Text
                style={[
                  styles.detailLabel,
                  {
                    color: colors.textTertiary,
                    fontFamily: typography.fontFamily.regular,
                  },
                ]}
              >
                Trip ID
              </Text>
              <Text
                style={[
                  styles.detailValue,
                  {
                    color: colors.text,
                    fontFamily: typography.fontFamily.medium,
                  },
                ]}
              >
                {employee?.tripId || 'TR-0000'}
              </Text>
            </View>
          </View>
        </Card>

        {/* Status Update */}
        <Card elevated style={styles.statusCard}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.text,
                fontFamily: typography.fontFamily.semiBold,
              },
            ]}
          >
            Update Handoff Status
          </Text>

          <View style={styles.statusActions}>
            {statusActions.map((action) => (
              <TouchableOpacity
                key={action.key}
                onPress={() => handleStatusUpdate(action.key)}
                style={[
                  styles.statusAction,
                  {
                    backgroundColor: action.bg,
                    borderColor:
                      currentStatus === action.key
                        ? action.color
                        : 'transparent',
                    borderWidth: currentStatus === action.key ? 2 : 0,
                  },
                ]}
              >
                <Ionicons name={action.icon} size={28} color={action.color} />
                <Text
                  style={[
                    styles.statusActionText,
                    {
                      color: action.color,
                      fontFamily: typography.fontFamily.medium,
                    },
                  ]}
                >
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: spacing.xxxl,
  },
  profileCard: {
    marginBottom: spacing.md,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
    marginLeft: spacing.base,
  },
  employeeName: {
    fontSize: typography.fontSize.lg,
    marginBottom: 2,
  },
  employeeId: {
    fontSize: typography.fontSize.sm,
    marginBottom: spacing.sm,
  },
  divider: {
    height: 1,
    marginVertical: spacing.base,
  },
  contactActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  contactButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    borderRadius: spacing.borderRadius.sm,
    gap: spacing.sm,
  },
  contactButtonText: {
    fontSize: typography.fontSize.md,
  },
  detailsCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    marginBottom: spacing.base,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: spacing.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: typography.fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: typography.fontSize.md,
  },
  statusCard: {
    marginBottom: spacing.md,
  },
  statusActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  statusAction: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.lg,
    borderRadius: spacing.borderRadius.md,
    gap: spacing.sm,
  },
  statusActionText: {
    fontSize: typography.fontSize.sm,
  },
});

export default StopDetailsScreen;
