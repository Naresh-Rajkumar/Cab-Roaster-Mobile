import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { requestsService } from '../../services/api/requestsService';

function unwrap(res) {
  const body = res?.data;
  if (body && typeof body === 'object' && 'success' in body) return body.data ?? null;
  return body ?? null;
}

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchNotifications = createAsyncThunk(
  'app/fetchNotifications',
  async (params, { rejectWithValue }) => {
    try {
      const res = await requestsService.getNotifications(params);
      const raw = unwrap(res);
      return Array.isArray(raw) ? raw : [];
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch notifications');
    }
  }
);

export const submitRequest = createAsyncThunk(
  'app/submitRequest',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await requestsService.createRequest(payload);
      return unwrap(res) ?? {};
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to submit request');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const appSlice = createSlice({
  name: 'app',
  initialState: {
    isAppReady: false,
    isDarkMode: false,
    notifications: [],
    unreadCount: 0,
    networkStatus: 'online',
    selectedDate: new Date().toISOString().split('T')[0],
    isSubmitting: false,
    submitError: null,
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
      state.notifications = state.notifications.map((n) => ({ ...n, read: true }));
      state.unreadCount = 0;
    },
    setNetworkStatus: (state, action) => {
      state.networkStatus = action.payload;
    },
    setSelectedDate: (state, action) => {
      state.selectedDate = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.notifications = action.payload;
        state.unreadCount = action.payload.filter((n) => !n.read).length;
      })
      .addCase(submitRequest.pending, (state) => {
        state.isSubmitting = true;
        state.submitError = null;
      })
      .addCase(submitRequest.fulfilled, (state) => {
        state.isSubmitting = false;
      })
      .addCase(submitRequest.rejected, (state, action) => {
        state.isSubmitting = false;
        state.submitError = action.payload;
      });
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
