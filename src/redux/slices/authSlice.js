import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';
import { authService } from '../../services/api/authService';
import { setAuthToken } from '../../services/axiosConfig';

const TOKEN_KEY = 'auth_access_token';

/** Persist token to secure storage (fire-and-forget — never blocks auth flow) */
function persistToken(token) {
  if (token) {
    SecureStore.setItemAsync(TOKEN_KEY, token).catch(() => {});
  } else {
    SecureStore.deleteItemAsync(TOKEN_KEY).catch(() => {});
  }
}

/** Load persisted token on app boot. Returns token string or null. */
export async function loadPersistedToken() {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      const token = response.data?.data?.accessToken;
      if (token) {
        setAuthToken(token);
        persistToken(token);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Login failed');
    }
  }
);

export const sendOtp = createAsyncThunk(
  'auth/sendOtp',
  async (phone, { rejectWithValue }) => {
    try {
      const response = await authService.sendOtp(phone);
      return response.data?.data ?? response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to send OTP');
    }
  }
);

// verifyOTP — for driver role uses the dedicated /auth/verify-otp endpoint;
// for employee role falls back to /auth/employee-login with password.
export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ phone, otp }, { getState, rejectWithValue }) => {
    try {
      const role = getState().auth.pendingRole || 'employee';
      let response;
      if (role === 'driver') {
        response = await authService.verifyOtpCode(phone, otp);
      } else {
        response = await authService.login({ phone, password: otp, role });
      }
      const token = response.data?.data?.accessToken;
      if (token) {
        setAuthToken(token);
        persistToken(token);
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
      persistToken(null);
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
        // Use roleName (lowercase: "employee", "driver") not role (display: "Employee", "Driver")
        state.role = data?.user?.roleName || state.pendingRole || 'employee';
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
        state.role = data?.user?.roleName || state.pendingRole || 'employee';
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

      .addCase(sendOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(sendOtp.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(sendOtp.rejected, (state, action) => {
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

      .addCase(fetchProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        const data = action.payload?.data || action.payload;
        if (data) {
          state.user = data;
          state.role = data.roleName || state.role;
          state.isAuthenticated = true;
        }
      })
      .addCase(fetchProfile.rejected, (state) => {
        // Token invalid — clear auth state
        state.isLoading = false;
        state.isAuthenticated = false;
        state.token = null;
      });
  },
});

export const { setUser, setToken, setRole, setPendingRole, completeOnboarding, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
