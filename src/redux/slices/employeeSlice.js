import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { employeeService } from '../../services/api/employeeService';

export const fetchEmployees = createAsyncThunk(
  'employee/fetchEmployees',
  async (params, { rejectWithValue }) => {
    try {
      const response = await employeeService.getEmployees(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch employees');
    }
  }
);

export const fetchHandoffList = createAsyncThunk(
  'employee/fetchHandoffList',
  async ({ date, tripId }, { rejectWithValue }) => {
    try {
      const response = await employeeService.getHandoffList(date, tripId);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch handoff list');
    }
  }
);

export const updateHandoffStatus = createAsyncThunk(
  'employee/updateHandoffStatus',
  async ({ employeeId, status }, { rejectWithValue }) => {
    try {
      const response = await employeeService.updateHandoffStatus(employeeId, status);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update status');
    }
  }
);

const employeeSlice = createSlice({
  name: 'employee',
  initialState: {
    employees: [],
    handoffList: [],
    selectedEmployee: null,
    isLoading: false,
    error: null,
    filters: {
      date: null,
      status: null,
      search: '',
    },
  },
  reducers: {
    setSelectedEmployee: (state, action) => {
      state.selectedEmployee = action.payload;
    },
    clearSelectedEmployee: (state) => {
      state.selectedEmployee = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = { date: null, status: null, search: '' };
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.isLoading = false;
        state.employees = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchHandoffList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchHandoffList.fulfilled, (state, action) => {
        state.isLoading = false;
        state.handoffList = action.payload;
      })
      .addCase(fetchHandoffList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateHandoffStatus.fulfilled, (state, action) => {
        const updated = action.payload;
        const index = state.handoffList.findIndex((e) => e.id === updated.id);
        if (index !== -1) {
          state.handoffList[index] = updated;
        }
      });
  },
});

export const {
  setSelectedEmployee,
  clearSelectedEmployee,
  setFilters,
  clearFilters,
  clearError,
} = employeeSlice.actions;
export default employeeSlice.reducer;
