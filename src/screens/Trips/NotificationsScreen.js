/**
 * Notifications Screen — Figma: Employee Handoff 09/02/2026 "Notifications"
 */
import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { useTheme } from '../../theme/ThemeProvider';
import { fetchNotifications, markAllNotificationsRead } from '../../redux/slices/appSlice';

const NotificationItem = ({ item, colors }) => (
  <View style={[styles.notifCard, { backgroundColor: colors.surface }]}>
    <View style={[styles.notifIcon, { backgroundColor: item.iconBg }]}>
      <Ionicons name={item.iconName} size={22} color={item.iconColor} />
    </View>
    <View style={styles.notifBody}>
      <View style={styles.notifHeader}>
        <Text style={[styles.notifTitle, { color: colors.text }, item.unread && styles.notifTitleBold]}>
          {item.title}
        </Text>
        <Text style={[styles.notifTime, { color: item.unread ? colors.textSecondary : colors.textTertiary }]}>
          {item.time}
        </Text>
      </View>
      <Text style={[styles.notifText, { color: colors.textSecondary }]}>{item.body}</Text>
    </View>
    {item.unread && <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />}
  </View>
);

const NotificationsScreen = () => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const dispatch = useDispatch();

  const notifications = useSelector((state) => state.app.notifications);
  const unreadCount = useSelector((state) => state.app.unreadCount);
  const [refreshing, setRefreshing] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  useEffect(() => {
    setIsLoading(true);
    dispatch(fetchNotifications()).finally(() => setIsLoading(false));
  }, [dispatch]);

  const onRefresh = () => {
    setRefreshing(true);
    dispatch(fetchNotifications()).finally(() => setRefreshing(false));
  };

  const markAllRead = () => {
    dispatch(markAllNotificationsRead());
  };

  // Group by category field or date proximity
  const todayItems = notifications.filter((n) => n.category === 'today' || !n.category);
  const yesterdayItems = notifications.filter((n) => n.category === 'yesterday');

  const sections = [
    ...(todayItems.length > 0
      ? [{ type: 'header', label: 'Today' }, ...todayItems.map((n) => ({ type: 'item', ...n }))]
      : []),
    ...(yesterdayItems.length > 0
      ? [{ type: 'header', label: 'Yesterday' }, ...yesterdayItems.map((n) => ({ type: 'item', ...n }))]
      : []),
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.pageHeader}>
        <Text style={[styles.pageTitle, { color: colors.text }]}>Notifications</Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={markAllRead} activeOpacity={0.7} style={styles.markAllRow}>
            <Text style={[styles.markAllText, { color: colors.primary }]}>Mark all as read</Text>
            <Ionicons name="checkmark-done" size={16} color={colors.primary} />
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={sections}
          keyExtractor={(item, idx) => item.id ?? `header-${idx}`}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
          }
          ListEmptyComponent={
            <Text style={[styles.sectionLabel, { color: colors.textSecondary, textAlign: 'center', marginTop: 40 }]}>
              No notifications
            </Text>
          }
          renderItem={({ item }) => {
            if (item.type === 'header') {
              return (
                <Text style={[styles.sectionLabel, { color: colors.text }]}>{item.label}</Text>
              );
            }
            return <NotificationItem item={item} colors={colors} />;
          }}
          ItemSeparatorComponent={({ leadingItem }) =>
            leadingItem?.type === 'item' ? <View style={{ height: 10 }} /> : null
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  pageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  pageTitle: { fontSize: 22, fontWeight: '700' },
  markAllRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  markAllText: { fontSize: 13, fontWeight: '600' },
  listContent: { padding: 16 },
  sectionLabel: { fontSize: 15, fontWeight: '700', marginBottom: 12, marginTop: 4 },

  notifCard: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 14,
    alignItems: 'flex-start',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  notifIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBody: { flex: 1 },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  notifTitle: { fontSize: 14, fontWeight: '500', flex: 1, marginRight: 8 },
  notifTitleBold: { fontWeight: '700' },
  notifTime: { fontSize: 11 },
  notifText: { fontSize: 13, lineHeight: 20 },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginTop: 3,
  },
});

export default NotificationsScreen;
