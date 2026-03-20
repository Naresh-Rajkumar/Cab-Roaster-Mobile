import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import employeeReducer from './slices/employeeSlice';
import tripReducer from './slices/tripSlice';
import appReducer from './slices/appSlice';
import driverReducer from './slices/driverSlice';
import requestReducer from './slices/requestSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    employee: employeeReducer,
    trip: tripReducer,
    app: appReducer,
    driver: driverReducer,
    request: requestReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['auth/setUser', 'auth/mockLogin'],
      },
    }),
});

export default store;
