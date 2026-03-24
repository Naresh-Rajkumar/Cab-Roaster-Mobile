import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/api/authService';
import { setAuthToken } from '../../services/axiosConfig';

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      if (response.data?.data?.accessToken) {
        setAuthToken(response.data.data.accessToken);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Login failed');
    }
  }
);

// verifyOTP — NestJS uses single-step employee-login (no separate OTP endpoint)
// Maps phone + otp to employee-login credentials
export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ phone, otp }, { getState, rejectWithValue }) => {
    try {
      const role = getState().auth.pendingRole || 'employee';
      const response = await authService.login({ phone, password: otp, role });
      if (response.data?.data?.accessToken) {
        setAuthToken(response.data.data.accessToken);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Verification failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
    } catch {
      // Always allow local logout even if server call fails
    } finally {
      setAuthToken(null);
    }
  }
);

export const fetchProfile = createAsyncThunk(
  'auth/fetchProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getProfile();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch profile');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    role: null,
    pendingRole: null,
    isAuthenticated: false,
    needsOnboarding: false,
    isLoading: false,
    error: null,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.role = action.payload?.role || null;
      state.isAuthenticated = true;
    },
    setToken: (state, action) => {
      state.token = action.payload;
    },
    setRole: (state, action) => {
      state.role = action.payload;
    },
    completeOnboarding: (state) => {
      state.needsOnboarding = false;
    },
    setPendingRole: (state, action) => {
      state.pendingRole = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.pendingRole = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload?.data || action.payload;
        state.user = data?.user || null;
        state.token = data?.accessToken || null;
        state.role = data?.user?.role || state.pendingRole || 'employee';
        state.isAuthenticated = !!(data?.accessToken);
        // Employee without empCode/employeeId needs onboarding (no employee record yet)
        const role = state.role;
        const user = data?.user;
        if (role !== 'driver' && user && !user.empCode && !user.employeeId && !user.empId) {
          state.needsOnboarding = true;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload?.data || action.payload;
        state.user = data?.user || null;
        state.token = data?.accessToken || null;
        state.role = data?.user?.role || state.pendingRole || 'employee';
        state.isAuthenticated = !!(data?.accessToken);
        const role = state.role;
        const user = data?.user;
        if (role !== 'driver' && user && !user.empCode && !user.employeeId && !user.empId) {
          state.needsOnboarding = true;
        }
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.role = null;
        state.pendingRole = null;
        state.isAuthenticated = false;
        state.error = null;
      })

      .addCase(fetchProfile.fulfilled, (state, action) => {
        const data = action.payload?.data || action.payload;
        if (data) state.user = data;
      });
  },
});

export const { setUser, setToken, setRole, setPendingRole, completeOnboarding, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
