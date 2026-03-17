import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tripService } from '../../services/api/tripService';

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchTrips = createAsyncThunk(
  'trip/fetchTrips',
  async (params, { rejectWithValue }) => {
    try {
      const response = await tripService.getTrips(params);
      return { data: response.data, type: params?.type || 'upcoming' };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch trips');
    }
  }
);

export const fetchTripDetails = createAsyncThunk(
  'trip/fetchTripDetails',
  async (tripId, { rejectWithValue }) => {
    try {
      const response = await tripService.getTripDetails(tripId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch trip details');
    }
  }
);

export const fetchTripStops = createAsyncThunk(
  'trip/fetchTripStops',
  async (tripId, { rejectWithValue }) => {
    try {
      const response = await tripService.getTripStops(tripId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch stops');
    }
  }
);

export const fetchCurrentRide = createAsyncThunk(
  'trip/fetchCurrentRide',
  async (_, { rejectWithValue }) => {
    try {
      const response = await tripService.getNextTrip();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch current ride');
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const tripSlice = createSlice({
  name: 'trip',
  initialState: {
    upcomingTrips: [],
    historyTrips: [],
    selectedTrip: null,
    currentRide: null,
    tripStops: [],
    driverInfo: null,
    isLoading: false,
    error: null,
    filters: {
      date: null,
      status: null,
      type: null,
    },
  },
  reducers: {
    setSelectedTrip: (state, action) => {
      state.selectedTrip = action.payload;
    },
    clearSelectedTrip: (state) => {
      state.selectedTrip = null;
      state.tripStops = [];
      state.driverInfo = null;
    },
    setDriverInfo: (state, action) => {
      state.driverInfo = action.payload;
    },
    setTripFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearTripFilters: (state) => {
      state.filters = { date: null, status: null, type: null };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTrips.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTrips.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.type === 'history') {
          state.historyTrips = action.payload.data;
        } else {
          state.upcomingTrips = action.payload.data;
        }
      })
      .addCase(fetchTrips.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchTripDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTripDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedTrip = action.payload.trip;
        state.driverInfo = action.payload.driver;
      })
      .addCase(fetchTripDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchTripStops.fulfilled, (state, action) => {
        state.tripStops = action.payload;
      })
      .addCase(fetchCurrentRide.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchCurrentRide.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentRide = action.payload;
      })
      .addCase(fetchCurrentRide.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedTrip,
  clearSelectedTrip,
  setDriverInfo,
  setTripFilters,
  clearTripFilters,
  clearError,
} = tripSlice.actions;
export default tripSlice.reducer;
