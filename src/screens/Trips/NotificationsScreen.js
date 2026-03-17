import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme/ThemeProvider';
import spacing from '../../theme/spacing.json';
import typography from '../../theme/typography.json';

const NOTIFICATIONS = [
  {
    id: '1',
    title: 'Shift Timing Updated',
    body: 'Your shift for next week is changed to 10:00 AM to 7:00 PM',
    time: '2 mins ago',
    unread: true,
    iconName: 'calendar',
    iconBg: '#FEF3C7',
    iconColor: '#F59E0B',
  },
  {
    id: '2',
    title: 'Office closed for Holiday',
    body: 'Reminder: The office will remain closed tomorrow for the public holiday.',
    time: '1 hour ago',
    unread: true,
    iconName: 'business',
    iconBg: '#DCFCE7',
    iconColor: '#22C55E',
  },
  {
    id: '3',
    title: 'Route Deviation Alert',
    body: 'Your cab took a different route due to heavy traffic on the highway.',
    time: 'Yesterday',
    unread: false,
    iconName: 'map',
    iconBg: '#FEE2E2',
    iconColor: '#EF4444',
  },
];

const NotificationCard = ({ item, colors }) => (
  <View style={[styles.card, { backgroundColor: colors.surface }]}>
    <View style={[styles.iconBox, { backgroundColor: item.iconBg }]}>
      <Ionicons name={item.iconName} size={20} color={item.iconColor} />
    </View>
    <View style={styles.cardBody}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: colors.text, fontFamily: typography.fontFamily.semiBold }]}
          numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.cardMeta}>
          <Text style={[styles.cardTime, { color: colors.textTertiary, fontFamily: typography.fontFamily.regular }]}>
            {item.time}
          </Text>
          {item.unread && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
        </View>
      </View>
      <Text style={[styles.cardBody2, { color: colors.textSecondary, fontFamily: typography.fontFamily.regular }]}
        numberOfLines={3}>
        {item.body}
      </Text>
    </View>
  </View>
);

const NotificationsScreen = () => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const [notifications, setNotifications] = useState(NOTIFICATIONS);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text, fontFamily: typography.fontFamily.bold }]}>
          Notifications
        </Text>
        <TouchableOpacity onPress={markAllRead}>
          <View style={styles.markReadRow}>
            <Text style={[styles.markReadText, { color: colors.primary, fontFamily: typography.fontFamily.medium }]}>
              Mark all as read
            </Text>
            <Ionicons name="checkmark-done" size={16} color={colors.primary} />
          </View>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionLabel, { color: colors.text, fontFamily: typography.fontFamily.semiBold }]}>
        Today
      </Text>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <NotificationCard item={item} colors={colors} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.base,
  },
  headerTitle: { fontSize: 22 },
  markReadRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  markReadText: { fontSize: 14 },
  sectionLabel: {
    fontSize: 15,
    paddingHorizontal: spacing.base,
    marginBottom: spacing.sm,
  },
  listContent: { paddingHorizontal: spacing.base, paddingBottom: spacing.xxxl },
  card: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: spacing.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    flexShrink: 0,
  },
  cardBody: { flex: 1 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  cardTitle: { fontSize: 14, flex: 1, marginRight: spacing.sm },
  cardMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  cardTime: { fontSize: 11 },
  unreadDot: { width: 8, height: 8, borderRadius: 4 },
  cardBody2: { fontSize: 13, lineHeight: 19 },
});

export default NotificationsScreen;
