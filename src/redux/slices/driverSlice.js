import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { driverService } from '../../services/api/driverService';

// ─── Response helpers ─────────────────────────────────────────────────────────

/** Unwrap { success, message, data } BE envelope. Returns the inner data. */
function unwrap(res) {
  // Real axios response: res.data = BE body = { success, message, data }
  // Mock response: res.data = the payload directly
  const body = res?.data;
  if (body && typeof body === 'object' && 'success' in body) {
    return body.data ?? null;
  }
  return body ?? null;
}

/** Get array from unwrapped result (handles both array and paginated { data: [] }) */
function toArray(val) {
  if (Array.isArray(val)) return val;
  if (val && Array.isArray(val.data)) return val.data;
  return [];
}

// ─── Normalizers ─────────────────────────────────────────────────────────────

/**
 * Normalize a BE trip object to the shape screens expect:
 * { id, tripNumber, vehicle, vehicleType, status, pickup, destination }
 */
function normalizeTripForDriver(trip) {
  if (!trip) return null;

  const id = String(trip.id ?? trip._id ?? '');
  const tripNumber = trip.tripNumber ?? (id ? `Trip #${id}` : 'Trip');
  const vehicle =
    trip.vehicle ?? trip.cabNumber ?? trip.cab?.cabNumber ?? trip.cab?.registrationNumber ?? '';
  const vehicleType = trip.vehicleType ?? trip.cab?.type ?? trip.cabType ?? '';
  const status = trip.status ?? 'scheduled';

  // First stop name from nextStop or passengerStops array
  const firstStopName = trip.nextStop
    ?? (Array.isArray(trip.passengerStops) && trip.passengerStops.length > 0 ? trip.passengerStops[0] : '')
    ?? trip.startLocation ?? '';

  // Pickup: prefer pre-built object, fall back to flat BE fields
  const pickup = trip.pickup ?? {
    name: firstStopName,
    time: formatTime(trip.scheduledStart ?? trip.startTime),
    employeeCount: trip.employeeCount ?? trip.passengerCount ?? trip.passengers?.length ?? 0,
  };

  // Destination: route name or work location
  const destination = trip.destination ?? {
    name: trip.route ?? trip.endLocation ?? trip.workLocation?.name ?? '',
    eta: formatTime(trip.scheduledEnd ?? trip.endTime ?? trip.estimatedArrival),
  };

  // cabId is needed by useDriverLocation to emit GPS updates to the socket
  const cabId = trip.cabId ?? trip.cab?.id ?? trip.cabAssignmentId ?? null;

  return { id, tripNumber, vehicle, vehicleType, status, pickup, destination, cabId, vehicleNo: vehicle };
}

function formatTime(isoOrStr) {
  if (!isoOrStr) return '';
  // Already formatted (e.g. "8:30 AM")
  if (!/^\d{4}-\d{2}-\d{2}/.test(isoOrStr)) return isoOrStr;
  try {
    return new Date(isoOrStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoOrStr;
  }
}

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchDriverDashboard = createAsyncThunk(
  'driver/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const [statsRes, activeTripRes, nextTripRes, upcomingRes] = await Promise.all([
        driverService.getDailyStats(),
        driverService.getActiveTrip().catch(() => null),  // non-fatal: may return empty
        driverService.getNextTrip(),
        driverService.getUpcomingTrips(),
      ]);

      const statsRaw = unwrap(statsRes) ?? statsRes?.data ?? {};
      const activeTripRaw = activeTripRes ? unwrap(activeTripRes) : null;
      const nextTripRaw = unwrap(nextTripRes);
      const upcomingRaw = unwrap(upcomingRes);

      // BE returns { activeTrips, upcomingTrips, completedTrips, alerts }
      const active = statsRaw?.activeTrips ?? 0;
      const upcoming = statsRaw?.upcomingTrips ?? 0;
      const completed = statsRaw?.completedTrips ?? 0;
      const stats = {
        totalTrips: active + upcoming + completed,
        totalPickups: completed,
      };

      // Prefer in_progress trip (driver already started) over upcoming
      const activeTripList = toArray(activeTripRaw);
      const nextTripList = toArray(nextTripRaw);
      const rawNextTrip = activeTripList[0] ?? nextTripList[0] ?? null;
      const nextTrip = normalizeTripForDriver(rawNextTrip);

      // upcomingTrips: list
      const upcomingTrips = toArray(upcomingRaw).map(normalizeTripForDriver);

      return { stats, nextTrip, upcomingTrips };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to load dashboard'
      );
    }
  }
);

export const startTrip = createAsyncThunk(
  'driver/startTrip',
  async (tripId, { rejectWithValue }) => {
    try {
      const response = await driverService.startTrip(tripId);
      const data = unwrap(response) ?? response?.data ?? {};
      return {
        tripId,
        status: 'in_progress',
        startedAt: data?.startedAt ?? data?.updatedAt ?? new Date().toISOString(),
        // routeStops intentionally NOT expected here — loaded separately via fetchTripStops
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to start trip'
      );
    }
  }
);

export const endTrip = createAsyncThunk(
  'driver/endTrip',
  async ({ tripId }, { rejectWithValue }) => {
    try {
      await driverService.endTrip(tripId);

      // Fetch trip detail after completion for summary screen
      let summary = null;
      try {
        const { tripService } = require('../../services/api/tripService');
        const detailRes = await tripService.getTripDetails(tripId);
        const detail = unwrap(detailRes);
        if (detail) {
          summary = {
            tripNumber: detail.tripNumber ?? detail.slug ?? tripId,
            vehicle: detail.vehicle ?? detail.cabNumber ?? '',
            vehicleType: detail.vehicleType ?? '',
            startedAt: detail.actualStart ?? detail.scheduledStart ?? '',
            endedAt: detail.actualEnd ?? new Date().toISOString(),
            totalPickups: detail.passengerCount ?? detail.passengers?.length ?? 0,
            totalStops: detail.stops?.length ?? detail.stopCount ?? 0,
            totalDistance: detail.distance ?? '',
          };
        }
      } catch { /* ignore — summary is best-effort */ }

      return {
        tripId,
        status: 'completed',
        endedAt: new Date().toISOString(),
        summary,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to end trip'
      );
    }
  }
);

export const updateStopHandoff = createAsyncThunk(
  'driver/updateStopHandoff',
  async ({ stopId, employeeId, status }, { getState, rejectWithValue }) => {
    try {
      // tripId comes from active trip in Redux state
      const tripId = getState().driver.activeTrip?.id;
      if (!tripId) throw new Error('No active trip');
      const response = await driverService.updateStopHandoff(tripId, stopId);
      const data = unwrap(response) ?? response?.data ?? {};
      return { stopId, employeeId, status, ...data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update handoff'
      );
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
      const upcomingTrips = toArray(unwrap(upcomingRes)).map(normalizeTripForDriver);
      const tripHistory = toArray(unwrap(historyRes)).map(normalizeTripForDriver);
      return { upcomingTrips, tripHistory };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to load trips'
      );
    }
  }
);

export const saveTripData = createAsyncThunk(
  'driver/saveTripData',
  async ({ tripId } = {}, { rejectWithValue }) => {
    try {
      await driverService.saveTripData(tripId);
      return { success: true };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to save trip data');
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
        const emp = stop.employees?.find((e) => e.id === employeeId);
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

    // Fetch Trips
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
        state.activeTrip = {
          ...(state.nextTrip ?? {}),
          id: action.payload.tripId,
          status: 'in_progress',
          startedAt: action.payload.startedAt,
        };
        // routeStops are loaded separately by the screen via fetchTripStops
      })
      .addCase(startTrip.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });

    // End Trip
    builder
      .addCase(endTrip.fulfilled, (state, action) => {
        state.tripSummary = action.payload.summary ?? { tripId: action.payload.tripId };
        state.activeTrip = null;
      })
      .addCase(endTrip.rejected, (state, action) => {
        state.error = action.payload;
      });

    // Save Trip Data (local cleanup)
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
