import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { Header, Input, Button, Card } from '../../components';
import spacing from '../../theme/spacing.json';
import typography from '../../theme/typography.json';

const LocationChangeScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [currentLocation, setCurrentLocation] = useState('Marathahalli Bridge');
  const [newLocation, setNewLocation] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['bottom']}
    >
      <Header
        title="Location Change Request"
        showBack
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card elevated style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons
              name="information-circle"
              size={20}
              color={colors.info}
            />
            <Text
              style={[
                styles.infoText,
                {
                  color: colors.textSecondary,
                  fontFamily: typography.fontFamily.regular,
                },
              ]}
            >
              Submit a request to add or update your pickup location. Approval may take up to 24 hours.
            </Text>
          </View>
        </Card>

        <Input
          label="Current Pickup Location"
          value={currentLocation}
          onChangeText={setCurrentLocation}
          editable={false}
          leftIcon={
            <Ionicons
              name="location"
              size={18}
              color={colors.textTertiary}
            />
          }
        />

        <Input
          label="New Pickup Location"
          value={newLocation}
          onChangeText={setNewLocation}
          placeholder="Enter new pickup location"
          leftIcon={
            <Ionicons
              name="location-outline"
              size={18}
              color={colors.textTertiary}
            />
          }
        />

        <Input
          label="Reason for Change"
          value={reason}
          onChangeText={setReason}
          placeholder="Explain why you need to change pickup location"
          multiline
          numberOfLines={4}
        />

        <Button
          title="Submit Request"
          onPress={handleSubmit}
          fullWidth
          size="lg"
          disabled={!newLocation.trim()}
          style={styles.submitBtn}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: {
    padding: spacing.base,
    paddingBottom: spacing.xxxl,
  },
  infoCard: {
    marginBottom: spacing.lg,
    backgroundColor: '#DBEAFE20',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
  },
  submitBtn: {
    marginTop: spacing.md,
  },
});

export default LocationChangeScreen;
