/**
 * MOCK NOTIFICATION SERVICE
 */
import { MOCK_DELAY_MIN, MOCK_DELAY_MAX } from '../../config/env';
import { MOCK_NOTIFICATIONS } from './mockData';

const delay = () =>
  new Promise((resolve) =>
    setTimeout(
      resolve,
      Math.random() * (MOCK_DELAY_MAX - MOCK_DELAY_MIN) + MOCK_DELAY_MIN
    )
  );

export const mockNotificationService = {
  getNotifications: async () => {
    await delay();
    return { data: MOCK_NOTIFICATIONS };
  },

  markAllRead: async () => {
    await delay();
    return { data: { success: true } };
  },

  markRead: async (notificationId) => {
    await delay();
    return { data: { id: notificationId, read: true } };
  },
};
