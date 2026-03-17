import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { Header, Input, Button, Card } from '../../components';
import spacing from '../../theme/spacing.json';
import typography from '../../theme/typography.json';

const CANCEL_REASONS = [
  'Working from home',
  'On leave',
  'Using own vehicle',
  'Shift change',
  'Other',
];

const CancelRequestScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [selectedReason, setSelectedReason] = useState('');
  const [otherReason, setOtherReason] = useState('');

  const handleSubmit = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['bottom']}
    >
      <Header
        title="Cancel Request"
        showBack
        onBackPress={() => navigation.goBack()}
      />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={[
            styles.sectionTitle,
            {
              color: colors.text,
              fontFamily: typography.fontFamily.semiBold,
            },
          ]}
        >
          Why do you want to cancel?
        </Text>

        <View style={styles.reasonsList}>
          {CANCEL_REASONS.map((reason) => (
            <TouchableOpacity
              key={reason}
              onPress={() => setSelectedReason(reason)}
              style={[
                styles.reasonItem,
                {
                  backgroundColor:
                    selectedReason === reason
                      ? colors.primaryContainer
                      : colors.surface,
                  borderColor:
                    selectedReason === reason
                      ? colors.primary
                      : colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.radio,
                  {
                    borderColor:
                      selectedReason === reason
                        ? colors.primary
                        : colors.border,
                  },
                ]}
              >
                {selectedReason === reason && (
                  <View
                    style={[
                      styles.radioInner,
                      { backgroundColor: colors.primary },
                    ]}
                  />
                )}
              </View>
              <Text
                style={[
                  styles.reasonText,
                  {
                    color:
                      selectedReason === reason
                        ? colors.primary
                        : colors.text,
                    fontFamily:
                      selectedReason === reason
                        ? typography.fontFamily.medium
                        : typography.fontFamily.regular,
                  },
                ]}
              >
                {reason}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {selectedReason === 'Other' && (
          <Input
            label="Please specify"
            value={otherReason}
            onChangeText={setOtherReason}
            placeholder="Enter your reason"
            multiline
            numberOfLines={3}
          />
        )}

        <Button
          title="Submit Cancellation"
          onPress={handleSubmit}
          fullWidth
          size="lg"
          variant="danger"
          disabled={!selectedReason}
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
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    marginBottom: spacing.base,
  },
  reasonsList: {
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.base,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1.5,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  reasonText: {
    fontSize: typography.fontSize.md,
  },
  submitBtn: {
    marginTop: spacing.md,
  },
});

export default CancelRequestScreen;
