import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { driverService } from '../../services/api/driverService';

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchDriverDashboard = createAsyncThunk(
  'driver/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const [statsRes, nextTripRes, upcomingRes] = await Promise.all([
        driverService.getDailyStats(),
        driverService.getNextTrip(),
        driverService.getUpcomingTrips(),
      ]);
      return {
        stats: statsRes.data,
        nextTrip: nextTripRes.data,
        upcomingTrips: upcomingRes.data,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to load dashboard');
    }
  }
);

export const startTrip = createAsyncThunk(
  'driver/startTrip',
  async (tripId, { rejectWithValue }) => {
    try {
      const response = await driverService.startTrip(tripId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to start trip');
    }
  }
);

export const endTrip = createAsyncThunk(
  'driver/endTrip',
  async ({ tripId, summary }, { rejectWithValue }) => {
    try {
      const response = await driverService.endTrip(tripId, summary);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to end trip');
    }
  }
);

export const updateStopHandoff = createAsyncThunk(
  'driver/updateStopHandoff',
  async ({ stopId, employeeId, status }, { rejectWithValue }) => {
    try {
      const response = await driverService.updateStopHandoff(stopId, employeeId, status);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update handoff');
    }
  }
);

export const fetchDriverTrips = createAsyncThunk(
  'driver/fetchTrips',
  async (_, { rejectWithValue }) => {
    try {
      const [upcomingRes, historyRes] = await Promise.all([
        driverService.getUpcomingTrips(),
        driverService.getTripHistory(),
      ]);
      return { upcomingTrips: upcomingRes.data, tripHistory: historyRes.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to load trips');
    }
  }
);

export const saveTripData = createAsyncThunk(
  'driver/saveTripData',
  async ({ tripId, data }, { rejectWithValue }) => {
    try {
      const response = await driverService.saveTripData(tripId, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to save trip data');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const driverSlice = createSlice({
  name: 'driver',
  initialState: {
    activeTrip: null,
    nextTrip: null,
    upcomingTrips: [],
    tripHistory: [],
    completedTrips: [],
    currentStopIndex: 0,
    routeStops: [],
    totalTrips: 0,
    totalPickups: 0,
    isLoading: false,
    isSaving: false,
    error: null,
    tripSummary: null,
  },
  reducers: {
    setActiveTrip: (state, action) => {
      state.activeTrip = action.payload;
    },
    setRouteStops: (state, action) => {
      state.routeStops = action.payload;
    },
    advanceToNextStop: (state) => {
      if (state.currentStopIndex < state.routeStops.length - 1) {
        state.currentStopIndex += 1;
      }
    },
    updateEmployeeStatus: (state, action) => {
      const { stopId, employeeId, status } = action.payload;
      const stop = state.routeStops.find((s) => s.id === stopId);
      if (stop) {
        const emp = stop.employees.find((e) => e.id === employeeId);
        if (emp) emp.status = status;
      }
    },
    clearActiveTrip: (state) => {
      state.activeTrip = null;
      state.routeStops = [];
      state.currentStopIndex = 0;
      state.tripSummary = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Dashboard
    builder
      .addCase(fetchDriverDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDriverDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.totalTrips = action.payload.stats.totalTrips;
        state.totalPickups = action.payload.stats.totalPickups;
        state.nextTrip = action.payload.nextTrip;
        state.upcomingTrips = action.payload.upcomingTrips;
      })
      .addCase(fetchDriverDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Fetch Trips (My Trips screen)
    builder
      .addCase(fetchDriverTrips.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDriverTrips.fulfilled, (state, action) => {
        state.isLoading = false;
        state.upcomingTrips = action.payload.upcomingTrips;
        state.tripHistory = action.payload.tripHistory;
      })
      .addCase(fetchDriverTrips.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // Start Trip
    builder
      .addCase(startTrip.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startTrip.fulfilled, (state, action) => {
        state.isLoading = false;
        state.activeTrip = { ...state.nextTrip, status: 'in_progress', startedAt: action.payload.startedAt };
        state.routeStops = action.payload.routeStops || [];
        state.currentStopIndex = 0;
      })
      .addCase(startTrip.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // End Trip
    builder
      .addCase(endTrip.fulfilled, (state, action) => {
        state.tripSummary = action.payload.summary;
        state.activeTrip = null;
      });

    // Save Trip Data
    builder
      .addCase(saveTripData.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(saveTripData.fulfilled, (state) => {
        state.isSaving = false;
        state.activeTrip = null;
        state.tripSummary = null;
        state.routeStops = [];
        state.currentStopIndex = 0;
      })
      .addCase(saveTripData.rejected, (state, action) => {
        state.isSaving = false;
        state.error = action.payload;
      });
  },
});

export const {
  setActiveTrip,
  setRouteStops,
  advanceToNextStop,
  updateEmployeeStatus,
  clearActiveTrip,
  clearError,
} = driverSlice.actions;
export default driverSlice.reducer;
