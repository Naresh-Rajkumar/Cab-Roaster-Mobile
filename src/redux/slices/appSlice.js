import { createSlice } from '@reduxjs/toolkit';

const appSlice = createSlice({
  name: 'app',
  initialState: {
    isAppReady: false,
    isDarkMode: false,
    notifications: [],
    unreadCount: 0,
    networkStatus: 'online',
    selectedDate: new Date().toISOString().split('T')[0],
  },
  reducers: {
    setAppReady: (state, action) => {
      state.isAppReady = action.payload;
    },
    setDarkMode: (state, action) => {
      state.isDarkMode = action.payload;
    },
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
    },
    setNotifications: (state, action) => {
      state.notifications = action.payload;
    },
    addNotification: (state, action) => {
      state.notifications.unshift(action.payload);
      state.unreadCount += 1;
    },
    markNotificationsRead: (state) => {
      state.unreadCount = 0;
    },
    setNetworkStatus: (state, action) => {
      state.networkStatus = action.payload;
    },
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
  },
});

export const {
  setAppReady,
  setDarkMode,
  toggleDarkMode,
  setNotifications,
  addNotification,
  markNotificationsRead,
  setNetworkStatus,
  setSelectedDate,
} = appSlice.actions;
export default appSlice.reducer;
