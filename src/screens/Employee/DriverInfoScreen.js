import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { Header, Card, Avatar, Button } from '../../components';
import spacing from '../../theme/spacing.json';
import typography from '../../theme/typography.json';

const DriverInfoScreen = ({ navigation, route }) => {
  const { driver } = route.params || {};
  const { theme } = useTheme();
  const colors = theme.colors;

  const driverData = driver || {
    name: 'Rajesh Kumar',
    phone: '+91 98765 00001',
    vehicleNo: 'KA-01-AB-1234',
    vehicleType: 'Toyota Innova',
    rating: 4.8,
    totalTrips: 1245,
    experience: '5 Years',
    licenseNo: 'KA-2021-XXXXXXX',
  };

  const handleCall = () => {
    Linking.openURL(`tel:${driverData.phone}`);
  };

  const infoItems = [
    {
      icon: 'call-outline',
      label: 'Phone',
      value: driverData.phone,
      color: colors.success,
      bg: colors.successBackground,
    },
    {
      icon: 'car-sport-outline',
      label: 'Vehicle',
      value: driverData.vehicleType,
      color: colors.primary,
      bg: colors.primaryContainer,
    },
    {
      icon: 'card-outline',
      label: 'Vehicle No',
      value: driverData.vehicleNo,
      color: colors.info,
      bg: colors.infoBackground,
    },
    {
      icon: 'document-outline',
      label: 'License',
      value: driverData.licenseNo || 'KA-2021-XXXXXXX',
      color: colors.warning,
      bg: colors.warningBackground,
    },
  ];

  const statsItems = [
    { label: 'Rating', value: driverData.rating, icon: 'star' },
    { label: 'Trips', value: driverData.totalTrips || 1245, icon: 'car' },
    { label: 'Experience', value: driverData.experience || '5 Yrs', icon: 'time' },
  ];

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background }]}
      edges={['bottom']}
    >
      <Header
        title="Driver Details"
        showBack
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <Card elevated style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <Avatar name={driverData.name} size={80} />
            <Text
              style={[
                styles.driverName,
                {
                  color: colors.text,
                  fontFamily: typography.fontFamily.bold,
                },
              ]}
            >
              {driverData.name}
            </Text>
            <Text
              style={[
                styles.driverRole,
                {
                  color: colors.textSecondary,
                  fontFamily: typography.fontFamily.regular,
                },
              ]}
            >
              Cab Driver
            </Text>
          </View>

          {/* Stats */}
          <View style={[styles.statsRow, { borderTopColor: colors.divider }]}>
            {statsItems.map((stat, index) => (
              <React.Fragment key={stat.label}>
                <View style={styles.statItem}>
                  <Ionicons
                    name={stat.icon}
                    size={18}
                    color={colors.primary}
                  />
                  <Text
                    style={[
                      styles.statValue,
                      {
                        color: colors.text,
                        fontFamily: typography.fontFamily.bold,
                      },
                    ]}
                  >
                    {stat.value}
                  </Text>
                  <Text
                    style={[
                      styles.statLabel,
                      {
                        color: colors.textSecondary,
                        fontFamily: typography.fontFamily.regular,
                      },
                    ]}
                  >
                    {stat.label}
                  </Text>
                </View>
                {index < statsItems.length - 1 && (
                  <View
                    style={[
                      styles.statDivider,
                      { backgroundColor: colors.divider },
                    ]}
                  />
                )}
              </React.Fragment>
            ))}
          </View>
        </Card>

        {/* Info Items */}
        <Card elevated style={styles.infoCard}>
          <Text
            style={[
              styles.sectionTitle,
              {
                color: colors.text,
                fontFamily: typography.fontFamily.semiBold,
              },
            ]}
          >
            Driver Information
          </Text>
          {infoItems.map((item, index) => (
            <View
              key={item.label}
              style={[
                styles.infoRow,
                index < infoItems.length - 1 && {
                  borderBottomColor: colors.divider,
                  borderBottomWidth: 1,
                },
              ]}
            >
              <View style={[styles.infoIcon, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon} size={18} color={item.color} />
              </View>
              <View style={styles.infoContent}>
                <Text
                  style={[
                    styles.infoLabel,
                    {
                      color: colors.textTertiary,
                      fontFamily: typography.fontFamily.regular,
                    },
                  ]}
                >
                  {item.label}
                </Text>
                <Text
                  style={[
                    styles.infoValue,
                    {
                      color: colors.text,
                      fontFamily: typography.fontFamily.medium,
                    },
                  ]}
                >
                  {item.value}
                </Text>
              </View>
            </View>
          ))}
        </Card>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button
            title="Call Driver"
            onPress={handleCall}
            variant="primary"
            fullWidth
            size="lg"
            icon={
              <Ionicons name="call" size={18} color="#FFFFFF" />
            }
          />
          <Button
            title="Report Issue"
            onPress={() => {}}
            variant="outline"
            fullWidth
            size="lg"
            style={styles.reportButton}
            icon={
              <Ionicons name="alert-circle-outline" size={18} color={colors.primary} />
            }
          />
        </View>
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
    alignItems: 'center',
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: spacing.base,
  },
  driverName: {
    fontSize: typography.fontSize.xl,
    marginTop: spacing.md,
    marginBottom: 2,
  },
  driverRole: {
    fontSize: typography.fontSize.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingTop: spacing.base,
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSize.lg,
    marginTop: spacing.xs,
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
  },
  infoCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.base,
    marginBottom: spacing.base,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: spacing.borderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: typography.fontSize.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: typography.fontSize.md,
  },
  actionButtons: {
    gap: spacing.md,
  },
  reportButton: {
    marginTop: 0,
  },
});

export default DriverInfoScreen;
