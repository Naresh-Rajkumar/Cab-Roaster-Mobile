import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import employeeReducer from './slices/employeeSlice';
import tripReducer from './slices/tripSlice';
import appReducer from './slices/appSlice';
import driverReducer from './slices/driverSlice';
import { injectStore } from '../services/axiosConfig';

const store = configureStore({
  reducer: {
    auth: authReducer,
    employee: employeeReducer,
    trip: tripReducer,
    app: appReducer,
    driver: driverReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/setUser', 'auth/mockLogin'],
      },
    }),
});

// Inject store into axios interceptor for 401 handling
injectStore(store);

export default store;
