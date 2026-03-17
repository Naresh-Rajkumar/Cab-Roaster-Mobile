import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import { Header, Input, Button } from '../../components';
import spacing from '../../theme/spacing.json';
import typography from '../../theme/typography.json';

const ISSUE_CATEGORIES = [
  { id: 'driver', label: 'Driver Related', icon: 'person-outline' },
  { id: 'vehicle', label: 'Vehicle Issue', icon: 'car-outline' },
  { id: 'route', label: 'Route Problem', icon: 'navigate-outline' },
  { id: 'safety', label: 'Safety Concern', icon: 'shield-outline' },
  { id: 'delay', label: 'Excessive Delay', icon: 'time-outline' },
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' },
];

const ReportIssueScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [selectedCategory, setSelectedCategory] = useState('');
  const [description, setDescription] = useState('');
  const [tripId, setTripId] = useState('');

  const handleSubmit = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['bottom']}
    >
      <Header
        title="Report Issue"
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
          Select Issue Category
        </Text>

        <View style={styles.categoriesGrid}>
          {ISSUE_CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              onPress={() => setSelectedCategory(category.id)}
              style={[
                styles.categoryItem,
                {
                  backgroundColor:
                    selectedCategory === category.id
                      ? colors.primaryContainer
                      : colors.surface,
                  borderColor:
                    selectedCategory === category.id
                      ? colors.primary
                      : colors.border,
                },
              ]}
            >
              <Ionicons
                name={category.icon}
                size={24}
                color={
                  selectedCategory === category.id
                    ? colors.primary
                    : colors.textSecondary
                }
              />
              <Text
                style={[
                  styles.categoryLabel,
                  {
                    color:
                      selectedCategory === category.id
                        ? colors.primary
                        : colors.text,
                    fontFamily: typography.fontFamily.medium,
                  },
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Input
          label="Trip ID (Optional)"
          value={tripId}
          onChangeText={setTripId}
          placeholder="e.g., TR-1042"
          leftIcon={
            <Ionicons
              name="search-outline"
              size={18}
              color={colors.textTertiary}
            />
          }
        />

        <Input
          label="Describe the issue"
          value={description}
          onChangeText={setDescription}
          placeholder="Please describe your issue in detail..."
          multiline
          numberOfLines={5}
        />

        <Button
          title="Submit Report"
          onPress={handleSubmit}
          fullWidth
          size="lg"
          disabled={!selectedCategory || !description.trim()}
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
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  categoryItem: {
    width: '31%',
    alignItems: 'center',
    paddingVertical: spacing.base,
    borderRadius: spacing.borderRadius.md,
    borderWidth: 1.5,
    gap: spacing.sm,
  },
  categoryLabel: {
    fontSize: typography.fontSize.xs,
    textAlign: 'center',
  },
  submitBtn: {
    marginTop: spacing.md,
  },
});

export default ReportIssueScreen;
