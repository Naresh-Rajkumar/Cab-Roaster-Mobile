# Cab-Roaster-Mobile

React Native (Expo) mobile app for the Cabroster vCommute Cab Roster Management System.

**Stack:** Expo SDK · React Native · Redux Toolkit · Axios · Socket.IO client · expo-location · React Navigation

**Branch:** `VT276-Cab-Roaster-Base-Setup`
**Backend API:** `http://localhost:4001/api/v1` (dev) · `https://api.vcommute.com/api/v1` (prod)

---

## Supported Roles

| Role | Flow |
|------|------|
| **Employee** | Login → Home → Request Cab → View Trips → Live Track → Notifications |
| **Driver** | Login → Active Trip → GPS Tracking → Attendance → Trip Summary |

---

## Quick Start

```bash
npm install
npx expo start
```

Scan QR code with Expo Go (Android/iOS) or press `a` for Android emulator / `i` for iOS simulator.

---

## Project Structure

```
src/
├── components/         — shared UI components
├── config/
│   └── env.js          — API URL, USE_MOCK flag, timeouts
├── constants/
│   └── index.js        — SCREENS, USER_ROLES, HANDOFF_STATUS, etc.
├── hooks/
│   ├── useDriverLocation.js    — GPS tracking (expo-location)
│   └── useTrackingSocket.js    — Socket.IO /tracking namespace
├── navigation/
│   ├── AuthNavigator.js        — unauthenticated screens
│   ├── AppNavigator.js         — employee tab navigator
│   ├── DriverNavigator.js      — driver tab navigator
│   └── RootNavigator.js        — root: auth vs app, role routing, onboarding guard
├── redux/
│   └── slices/
│       ├── authSlice.js        — login, logout, needsOnboarding
│       ├── tripSlice.js        — trip list, detail, stops, passengers
│       ├── driverSlice.js      — driver active trip, location updates
│       └── appSlice.js         — app boot, config
├── screens/
│   ├── Auth/
│   │   ├── LoginScreen.js          — Employee phone login
│   │   └── DriverLoginScreen.js    — Driver phone login
│   ├── Onboarding/
│   │   ├── OnboardingScreen.js     — Employee onboarding
│   │   └── DriverOnboardingScreen.js — Driver onboarding
│   ├── Employee/
│   │   ├── TripDetailsScreen.js    — Trip info + stops + passengers
│   │   ├── RideDetailsScreen.js    — Upcoming ride summary
│   │   └── HandoffListScreen.js    — Handoff/pickup status list
│   ├── Driver/
│   │   ├── AttendanceScreen.js     — Driver daily attendance
│   │   ├── DriverActiveTripScreen.js — Active trip with GPS
│   │   └── TripSummaryScreen.js    — Post-trip summary
│   ├── Requests/
│   │   ├── RequestCabStep1Screen.js  — Cab request: pickup details
│   │   ├── RequestCabStep2Screen.js  — Cab request: review + submit
│   │   ├── CancelRequestScreen.js
│   │   ├── LocationChangeScreen.js
│   │   └── ReportIssueScreen.js
│   ├── Tracking/
│   │   └── LiveTrackingScreen.js   — Real-time cab tracking via Socket.IO
│   ├── Trips/
│   │   ├── TripsScreen.js
│   │   └── NotificationsScreen.js
│   └── Home/
│       └── HomeScreen.js
├── services/
│   ├── axiosConfig.js          — Axios instance (base URL from env.js, token injection)
│   └── api/
│       ├── authService.js      — login, logout, profile
│       ├── tripService.js      — trip list, detail, stops, passengers
│       ├── driverService.js    — driver attendance, active trip
│       ├── configService.js    — routes, stops, shifts, work-locations
│       ├── profileService.js   — profile get/update/photo
│       └── requestsService.js  — cab requests CRUD + review
└── theme/                      — ThemeProvider, colors, spacing, typography
```

---

## Environment Config (`src/config/env.js`)

| Variable | Default | Description |
|----------|---------|-------------|
| `USE_MOCK` | `false` | `true` = simulated responses, `false` = real API |
| `API_BASE_URL` | `http://localhost:4001/api/v1` (dev) | Backend API base |
| `MOCK_DELAY_MIN` | `500` | Min mock delay (ms) |
| `MOCK_DELAY_MAX` | `1200` | Max mock delay (ms) |

> **Note:** `axiosConfig.js` imports `API_BASE_URL` from `env.js` — it is the single source of truth for the API URL.

---

## Auth Flow

```
RoleSelectionScreen
    │
    ├── Employee → LoginScreen → (OTPVerification) → HomeScreen
    │                               │
    │                        needsOnboarding?
    │                               └── RequestCabStep1 → RequestCabStep2 → HomeScreen
    │
    └── Driver → DriverLoginScreen → (OTPVerification) → DriverNavigator
```

The `needsOnboarding` flag in `authSlice` is `true` when an authenticated employee has no `homeAddress`. `RootNavigator` intercepts this and routes to the cab setup flow before allowing entry to the main app.

---

## WebSocket / Real-time Tracking

`useTrackingSocket` connects to `ws://localhost:4001/tracking` with JWT auth.

| Role | Events |
|------|--------|
| Employee (passenger) | Listens for `cab_location_update` |
| Driver | Emits `update_location` via `useDriverLocation` hook |

`useDriverLocation` requests `expo-location` foreground permission and watches the device GPS position, calling the `emitLocation` callback on each update.

---

## Conventions

- Feature state lives in Redux slices — no `useState` for server data
- All API calls through named functions in `src/services/api/`
- New screens must be registered in `constants/index.js` (`SCREENS`) and the appropriate navigator
- Token is injected via `axiosInstance.defaults.headers.common['Authorization']` on login (not AsyncStorage on every request)
- Add every change to `CHANGELOG.md` before marking work complete
