import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { tripService } from '../../services/api/tripService';

// ─── Response helpers ─────────────────────────────────────────────────────────

/** Unwrap { success, message, data } BE envelope. */
function unwrap(res) {
  const body = res?.data;
  if (body && typeof body === 'object' && 'success' in body) {
    return body.data ?? null;
  }
  return body ?? null;
}

function toArray(val) {
  if (Array.isArray(val)) return val;
  if (val && Array.isArray(val.data)) return val.data;
  return [];
}

function formatTime(isoOrStr) {
  if (!isoOrStr) return '';
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

// ─── Normalizers ─────────────────────────────────────────────────────────────

/** Normalize a BE trip object for employee trip list screens. */
function normalizeTripForEmployee(trip) {
  if (!trip) return null;
  const id = String(trip.id ?? trip._id ?? '');
  const status = trip.status ?? 'scheduled';

  // For employee trips the screen shows from/to, date, vehicle, icon
  return {
    id,
    tripNumber: trip.tripNumber ?? trip.slug ?? `Trip #${id}`,
    title: trip.title ?? trip.route ?? (status === 'completed' ? 'Completed Ride' : 'Upcoming Ride'),
    label: trip.route ?? trip.title ?? 'Ride',
    date: trip.date ?? trip.dateLabel ?? formatTime(trip.scheduledStart),
    from: trip.from ?? trip.startLocation ?? trip.pickup ?? trip.nextStop ?? '',
    to: trip.to ?? trip.endLocation ?? trip.dropoff ?? trip.route ?? '',
    vehicleNo: trip.vehicleNo ?? trip.vehicle ?? trip.cabNumber ?? '',
    vehicleType: trip.vehicleType ?? '',
    driverName: trip.driverName ?? trip.driver ?? '',
    driverContact: trip.driverContact ?? trip.driverPhone ?? '',
    route: trip.route ?? '',
    status,
    icon: trip.icon ?? (trip.type === 'drop' ? 'home' : 'business'),
    iconBg: trip.iconBg ?? '#DCFCE7',
    iconColor: trip.iconColor ?? '#22C55E',
    // Keep original fields too for detail screens
    ...trip,
    id, // ensure id stays string
  };
}

/** Normalize a single trip for the detail view. */
function normalizeTripDetail(trip) {
  if (!trip) return null;
  return {
    id: String(trip.id ?? trip._id ?? ''),
    tripId: trip.tripId ?? trip.id,
    tripNumber: trip.tripNumber ?? trip.slug,
    type: trip.type ?? trip.tripType ?? 'pickup',
    status: trip.status ?? 'scheduled',
    pickup: trip.pickup ?? trip.nextStop ?? trip.startLocation ?? '',
    dropoff: trip.dropoff ?? trip.route ?? trip.endLocation ?? '',
    route: trip.route ?? '',
    distance: trip.distance ?? '',
    eta: trip.eta ?? formatTime(trip.scheduledEnd),
    scheduledTime: trip.scheduledTime ?? formatTime(trip.scheduledStart),
    driverName: trip.driverName ?? trip.driver ?? '',
    driverContact: trip.driverContact ?? trip.driverPhone ?? '',
    vehicleNo: trip.vehicleNo ?? trip.vehicle ?? trip.cabNumber ?? '',
    vehicleType: trip.vehicleType ?? '',
    driverPhone: trip.driverPhone ?? trip.driverContact ?? '',
    otp: trip.otp ?? '',
    passengers: trip.passengers ?? [],
    ...trip,
    id: String(trip.id ?? trip._id ?? ''),
  };
}

/** Normalize a BE stop object. */
function normalizeStop(stop) {
  if (!stop) return null;
  return {
    id: String(stop.id ?? stop._id ?? ''),
    time: stop.time ?? stop.scheduledTime ?? formatTime(stop.scheduledArrival) ?? '',
    actualTime: stop.actualTime ?? stop.arrivedAt ?? null,
    name: stop.stopName ?? stop.name ?? stop.stop?.stopName ?? '',
    status: stop.status ?? 'pending',
    isDestination: stop.isDestination ?? stop.type === 'destination' ?? false,
    latitude: stop.latitude ?? stop.lat ?? stop.stop?.latitude ?? null,
    longitude: stop.longitude ?? stop.lng ?? stop.lon ?? stop.stop?.longitude ?? null,
    employees: toArray(stop.employees ?? stop.passengers).map(normalizeEmployee),
  };
}

function normalizeEmployee(emp) {
  if (!emp) return null;
  return {
    id: String(emp.id ?? emp._id ?? emp.employeeId ?? ''),
    name: emp.name ?? emp.employeeName ?? '',
    phone: emp.phone ?? emp.phoneNumber ?? '',
    status: emp.status ?? emp.handoffStatus ?? 'pending',
    avatar: emp.avatar ?? null,
  };
}

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchTrips = createAsyncThunk(
  'trip/fetchTrips',
  async (params, { rejectWithValue }) => {
    try {
      const response = await tripService.getTrips(params);
      const raw = unwrap(response);
      const trips = toArray(raw).map(normalizeTripForEmployee);
      return { data: trips, type: params?.type || 'upcoming' };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch trips'
      );
    }
  }
);

export const fetchTripDetails = createAsyncThunk(
  'trip/fetchTripDetails',
  async (tripId, { rejectWithValue }) => {
    try {
      const response = await tripService.getTripDetails(tripId);
      const raw = unwrap(response) ?? response?.data;

      // Mock returns { trip: {...}, driver: {...} }
      // BE likely returns the trip object directly
      if (raw && 'trip' in raw) {
        return { trip: normalizeTripDetail(raw.trip), driver: raw.driver ?? null };
      }
      return {
        trip: normalizeTripDetail(raw),
        driver: raw?.driver ?? null,
      };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch trip details'
      );
    }
  }
);

export const fetchTripStops = createAsyncThunk(
  'trip/fetchTripStops',
  async (tripId, { rejectWithValue }) => {
    try {
      const response = await tripService.getTripStops(tripId);
      const raw = unwrap(response);
      return toArray(raw).map(normalizeStop).filter(Boolean);
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch stops'
      );
    }
  }
);

export const fetchCurrentRide = createAsyncThunk(
  'trip/fetchCurrentRide',
  async (_, { rejectWithValue }) => {
    try {
      const response = await tripService.getNextTrip();
      const raw = unwrap(response);
      // Returns a list (limit=1) — take the first trip
      const list = toArray(raw);
      const trip = list[0] ?? raw;
      return trip ? normalizeTripDetail(trip) : null;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch current ride'
      );
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
