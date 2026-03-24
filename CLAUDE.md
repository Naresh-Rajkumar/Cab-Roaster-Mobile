# Cab-Roaster-Mobile — Governance

## Stack

Expo SDK · React Native · Redux Toolkit · Axios · Socket.IO client · expo-location · React Navigation v6

**Branch:** `VT276-Cab-Roaster-Base-Setup`
**Related BE:** `../Cabroster-BE` (branch: `architecture_migration`)

---

## Architecture Rules

### State Management

**Redux Toolkit** is the only allowed state management for server/async data.
`useState` is allowed only for local UI state (form inputs, toggles, loading spinners inside a single component).

```javascript
// ✅ CORRECT — server data from Redux
const trips = useSelector((state) => state.trip.list);

// ❌ FORBIDDEN — server data in local state
const [trips, setTrips] = useState([]);
useEffect(() => { fetchTrips().then(setTrips) }, []);
```

### API Calls

**All API calls must go through named service functions in `src/services/api/`.**
Never call Axios directly in components or screens.

```javascript
// ✅ CORRECT
import { tripService } from '../../services/api/tripService';
const res = await tripService.getTripDetails(tripId);

// ❌ FORBIDDEN — direct Axios in screen
import axios from 'axios';
axios.get(`/trips/${id}`)
```

### API Base URL

**Single source of truth: `src/config/env.js`**

```javascript
// ✅ axiosConfig.js imports from env.js
import { API_BASE_URL } from '../config/env';

// ❌ FORBIDDEN — duplicate hardcoded URL
const API_BASE_URL = __DEV__ ? 'http://localhost:4001/api/v1' : '...';
```

Never hardcode the API URL in `axiosConfig.js`, service files, or screens.

### Token Injection

JWT token is injected by setting `axiosInstance.defaults.headers.common['Authorization']` immediately after login.
Do NOT read from AsyncStorage in the Axios request interceptor (causes race conditions).

```javascript
// ✅ CORRECT — set once on login
setAuthToken(accessToken);  // axiosConfig.js exports this helper

// ❌ FORBIDDEN — async read in interceptor
axiosInstance.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');  // race condition
  config.headers.Authorization = token;
});
```

### Navigation

All screen names are constants in `src/constants/index.js` under the `SCREENS` object.
Never use raw string screen names.

```javascript
// ✅ CORRECT
navigation.navigate(SCREENS.TRIP_DETAILS, { trip });

// ❌ FORBIDDEN
navigation.navigate('TripDetails', { trip });
```

New screens must be:
1. Added to `SCREENS` in `constants/index.js`
2. Registered in the appropriate navigator (`AuthNavigator`, `AppNavigator`, or `DriverNavigator`)

---

## Auth Flow

```
RoleSelectionScreen
    ├── Employee → LoginScreen → (OTP) → checkNeedsOnboarding
    │                                       ├── true  → RequestCabStep1 → RequestCabStep2 → Home
    │                                       └── false → HomeScreen (AppNavigator)
    └── Driver → DriverLoginScreen → (OTP) → DriverNavigator
```

### `needsOnboarding` Rule

`needsOnboarding` is `true` when:
- User is authenticated AND
- Role is not `driver` AND
- `user.homeAddress` (or `user.home_address`) is null/undefined

`RootNavigator` routes to cab setup flow when `needsOnboarding` is true.
Call `dispatch(completeOnboarding())` after employee successfully submits their cab request in Step 2.

---

## Socket.IO Architecture

### Hooks

| Hook | Used by | Purpose |
|------|---------|---------|
| `useTrackingSocket` | LiveTrackingScreen, DriverActiveTripScreen | Connect to `/tracking` namespace with JWT |
| `useDriverLocation` | DriverActiveTripScreen | Watch GPS + emit `update_location` |

### Socket URL Derivation

```javascript
// Derive socket URL by stripping /api/v1 from API_BASE_URL
const SOCKET_URL = API_BASE_URL.replace(/\/api\/v\d+$/, '');
// http://localhost:4001/api/v1 → http://localhost:4001
```

### WebSocket Events

| Direction | Event | Screen |
|-----------|-------|--------|
| Server → Client | `cab_location_update` | LiveTrackingScreen |
| Client → Server | `update_location` | DriverActiveTripScreen (via useDriverLocation) |

---

## Redux Slice Conventions

### Slice Shape
```javascript
const initialState = {
  list: [],
  selectedItem: null,
  isLoading: false,
  error: null,
};
```

### Thunk File per Slice

Each slice file (`{feature}Slice.js`) contains both the slice AND thunks for simplicity in mobile.
Services are in `src/services/api/`.

---

## GPS / Location Rules

- **Always request permission before starting tracking** — use `Location.requestForegroundPermissionsAsync()`
- **Background location is not enabled** — use `requestForegroundPermissionsAsync` only
- **Stop tracking on screen unmount** — call `stopTracking()` in useEffect cleanup
- **Update rate** — don't emit more than 1 update/second (matches BE rate limit for drivers)

---

## Screen Development Rules

- Every screen reads data from Redux — no direct API calls in components
- Loading states must show `ActivityIndicator`
- Error states must show a user-friendly message (no raw error objects)
- All mock data (`MOCK_*` constants) must be removed before marking a screen complete
- Figma screen numbers are noted in the file header comment (e.g., `// Figma Driver Handoff 4/17`)

---

## Commit Standards

Format: `type(scope): message`

Types: `feat`, `fix`, `docs`, `refactor`, `style`, `chore`

Examples:
```
feat(auth): add driver login screen and onboarding flow
feat(tracking): add useTrackingSocket and useDriverLocation hooks
fix(auth): inject token synchronously on login to prevent interceptor race
refactor(trip-details): replace mock stops with Redux fetchTripStops
```

---

## What NOT to Do

- Do NOT use `useState` for server/async data — use Redux
- Do NOT call Axios directly in screens — use service functions
- Do NOT hardcode API URLs — import from `env.js`
- Do NOT read token from AsyncStorage in the Axios interceptor
- Do NOT use raw string screen names — use `SCREENS` constants
- Do NOT leave `MOCK_*` data in screens when real API is available
- Do NOT forget to clear token on logout (`setAuthToken(null)`)
- Do NOT call `Location.requestForegroundPermissionsAsync` without handling the denied case
- Do NOT add new screens without registering them in `SCREENS` and the navigator
- Do NOT commit without updating `CHANGELOG.md`
