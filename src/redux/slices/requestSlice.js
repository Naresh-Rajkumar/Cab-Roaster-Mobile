import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { requestService } from '../../services/api/requestService';

// ─── Thunks ───────────────────────────────────────────────────────────────────

export const fetchStops = createAsyncThunk(
  'request/fetchStops',
  async (params, { rejectWithValue }) => {
    try {
      const response = await requestService.getStops(params);
      const payload = response.data.data || response.data;
      return payload.stops || payload;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch stops'
      );
    }
  }
);

export const fetchShifts = createAsyncThunk(
  'request/fetchShifts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await requestService.getShifts();
      const payload = response.data.data || response.data;
      return payload.shifts || payload;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch shifts'
      );
    }
  }
);

export const fetchWorkLocations = createAsyncThunk(
  'request/fetchWorkLocations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await requestService.getWorkLocations();
      const payload = response.data.data || response.data;
      return payload.locations || payload;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch work locations'
      );
    }
  }
);

export const submitCabRequest = createAsyncThunk(
  'request/submitCabRequest',
  async (payload, { rejectWithValue }) => {
    try {
      const response = await requestService.createRequest(payload);
      return response.data.data || response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to submit cab request'
      );
    }
  }
);

// ─── Slice ────────────────────────────────────────────────────────────────────

const requestSlice = createSlice({
  name: 'request',
  initialState: {
    stops: [],
    shifts: [],
    workLocations: [],
    isLoadingStops: false,
    isLoadingShifts: false,
    isSubmitting: false,
    submitError: null,
    submitSuccess: false,
    // Step1 form data — persisted across navigation
    formData: {
      workLocationId: null,
      workLocationName: 'Chennai',
      cabUsagePreference: 'both',
      homeLocationAddress: '',
      preferredPickupStopId: null,
      preferredDropStopId: null,
      differentDrop: false,
    },
  },
  reducers: {
    setFormData: (state, action) => {
      state.formData = { ...state.formData, ...action.payload };
    },
    resetForm: (state) => {
      state.formData = {
        workLocationId: null,
        workLocationName: 'Chennai',
        cabUsagePreference: 'both',
        homeLocationAddress: '',
        preferredPickupStopId: null,
        preferredDropStopId: null,
        differentDrop: false,
      };
      state.isSubmitting = false;
      state.submitSuccess = false;
      state.submitError = null;
    },
    clearSubmitStatus: (state) => {
      state.submitSuccess = false;
      state.submitError = null;
    },
  },
  extraReducers: (builder) => {
    // fetchStops
    builder
      .addCase(fetchStops.pending, (state) => {
        state.isLoadingStops = true;
      })
      .addCase(fetchStops.fulfilled, (state, action) => {
        state.isLoadingStops = false;
        state.stops = action.payload;
      })
      .addCase(fetchStops.rejected, (state) => {
        state.isLoadingStops = false;
      });

    // fetchShifts
    builder
      .addCase(fetchShifts.pending, (state) => {
        state.isLoadingShifts = true;
      })
      .addCase(fetchShifts.fulfilled, (state, action) => {
        state.isLoadingShifts = false;
        state.shifts = action.payload;
      })
      .addCase(fetchShifts.rejected, (state) => {
        state.isLoadingShifts = false;
      });

    // fetchWorkLocations
    builder
      .addCase(fetchWorkLocations.fulfilled, (state, action) => {
        state.workLocations = action.payload;
      });

    // submitCabRequest
    builder
      .addCase(submitCabRequest.pending, (state) => {
        state.isSubmitting = true;
        state.submitError = null;
        state.submitSuccess = false;
      })
      .addCase(submitCabRequest.fulfilled, (state) => {
        state.isSubmitting = false;
        state.submitSuccess = true;
      })
      .addCase(submitCabRequest.rejected, (state, action) => {
        state.isSubmitting = false;
        state.submitError = action.payload;
      });
  },
});

export const { setFormData, resetForm, clearSubmitStatus } = requestSlice.actions;
export default requestSlice.reducer;
