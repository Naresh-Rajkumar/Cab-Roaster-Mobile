import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services/api/authService';
import { setAuthToken } from '../../services/axiosConfig';

// ─── Thunks ───────────────────────────────────────────────────────────────────

/**
 * loginWithMicrosoft — exchanges Microsoft auth code for our backend tokens.
 * Calls POST /api/auth/microsoft with { code, redirectUri }
 */
export const loginWithMicrosoft = createAsyncThunk(
  'auth/loginWithMicrosoft',
  async ({ code, redirectUri }, { rejectWithValue }) => {
    try {
      const response = await authService.microsoftLogin({ code, redirectUri });
      const { user, token } = response.data;
      // Set auth token on axios for subsequent requests
      setAuthToken(token);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Microsoft login failed'
      );
    }
  }
);

/**
 * loginWithCredentials — dev/test login with email + password.
 * Calls POST /api/auth/employee-login with { email, password }
 */
export const loginWithCredentials = createAsyncThunk(
  'auth/loginWithCredentials',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await authService.employeeLogin({ email, password });
      const { accessToken, user } = response.data.data;
      setAuthToken(accessToken);
      return { user, token: accessToken };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Login failed'
      );
    }
  }
);

/**
 * loginUser — sends OTP to the phone number (legacy flow).
 */
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Login failed');
    }
  }
);

export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ phone, otp }, { getState, rejectWithValue }) => {
    try {
      const role = getState().auth.pendingRole || 'employee';
      const response = await authService.verifyOTP(phone, otp, role);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'OTP verification failed');
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async () => {
    try {
      await authService.logout();
    } catch {
      // Always allow local logout even if server call fails
    }
    setAuthToken(null);
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    token: null,
    role: null,         // 'employee' | 'driver' — set after auth
    pendingRole: null,  // selected on RoleSelection screen before login
    isAuthenticated: false,
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
    // loginWithMicrosoft
    builder
      .addCase(loginWithMicrosoft.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithMicrosoft.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.role = action.payload.user?.role || 'employee';
        // Don't set isAuthenticated yet — user still needs to complete cab request setup
      })
      .addCase(loginWithMicrosoft.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // loginWithCredentials (dev login)
    builder
      .addCase(loginWithCredentials.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginWithCredentials.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.role = action.payload.user?.role || 'employee';
        // Don't set isAuthenticated yet — user still needs to complete cab request setup
      })
      .addCase(loginWithCredentials.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // loginUser — only sends OTP, does NOT set isAuthenticated
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // verifyOTP — authenticates the user
    builder
      .addCase(verifyOTP.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.role = action.payload.user?.role || state.pendingRole || 'employee';
        state.isAuthenticated = true;
      })
      .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // logoutUser
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.user = null;
      state.token = null;
      state.role = null;
      state.pendingRole = null;
      state.isAuthenticated = false;
      state.error = null;
    });
  },
});

export const { setUser, setToken, setRole, setPendingRole, logout, clearError } = authSlice.actions;
export default authSlice.reducer;
