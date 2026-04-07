# Changelog

All notable changes to Cab-Roaster-Mobile.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)

> **RULE:** Every code change — feature, fix, refactor, or removal — MUST be logged here before the work is considered complete.

---

## [Unreleased] - 2026-03-24

### Config
- **`EXPO_PUBLIC_API_BASE_URL`** — `src/config/env.js` reads this at build time so the app can use a public HTTPS API when the device is not on the same LAN as the dev machine (cellular / other Wi‑Fi / EAS APK). If unset, behavior falls back to the LAN `API_BASE_URL`. Added `.env.example` and ignored `.env` in `.gitignore`.
- **`eas.json` preview profile** — `EXPO_PUBLIC_API_BASE_URL` set for ngrok-backed API testing (update when the tunnel URL changes).
- **`eas.json` `cli.requireCommit`** — use `false` on Windows if EAS upload hits `ENOTEMPTY` on shallow-clone cleanup; use `true` when a clean git tree is required and upload works on your machine.

### Dependencies
- **Expo SDK 55 / EAS Android** — added `react-native-worklets` (Reanimated peer); aligned `expo`, `react-native`, and related packages for stable native builds.
- **`eas-cli`** — removed from `devDependencies` (use `npx eas-cli` / global install; avoids `expo doctor` failure on EAS).

### App / Debug
- **`App.js`** — in `__DEV__`, logs `API_BASE_URL` and pings `GET /health` once after startup; if it fails, Metro shows a hint about ngrok/port/`EXPO_PUBLIC_API_BASE_URL`.
- **`env.js`** — LAN fallback port aligned with Cabroster-BE default `PORT` (4000); adjust IP/PORT in local `.env` if needed.

### Auth / API
- **ngrok + OTP** — default Axios header `ngrok-skip-browser-warning` when `API_BASE_URL` contains `ngrok` (avoids ngrok HTML interstitial breaking API calls). Clearer messages for `Network Error` / timeouts on login, send OTP, verify OTP, and profile fetch.
- **`parseAxiosErrorMessage`** (`src/utils/parseAxiosError.js`) — maps Nest validation (`message` array) and network errors to user-facing strings; auth thunks use it. Network errors now include **`API_BASE_URL`** and a hint if the build still points at a **LAN IP** (won’t work on cellular).
- **Dev HTTP log** — in `__DEV__`, Axios request interceptor logs `METHOD` + full URL for each API call.

### Build / Git
- **`eas.json` `requireCommit`** — set to `false` so EAS CLI on Windows can complete tarball upload without `ENOTEMPTY` on shallow-clone cleanup (re-enable `true` on macOS/Linux or if upload is stable).
- **`android/` tracked in git** — EAS was failing with `ENOENT ... android/gradlew` because `/android` was fully gitignored and never uploaded. `.gitignore` now ignores only native build artifacts under `android/` / `ios/`, not the whole folders.
- **`.easignore`** — removed `.git` entry so EAS CLI does not rely on a temp shallow-clone (avoids Windows `ENOTEMPTY` during tarball upload with `requireCommit`).

### Changed — Real API Integration (Mock → NestJS Backend)

#### Config & Setup
- **`USE_MOCK` switched to `false`** (`src/config/env.js`) — app now calls real NestJS backend instead of simulated mock responses
- **`API_BASE_URL` updated** — dev URL changed from `http://localhost:3000/api` → `http://localhost:4001/api/v1` to match NestJS versioned API prefix
- **`axiosConfig.js` refactored** — hardcoded URL removed; now imports `API_BASE_URL` from `env.js`. Token injection added to request interceptor (attaches `Authorization` header from `axiosInstance.defaults.headers`)
- **`package.json` / `app.json`** — dependency and app config updates for Expo SDK alignment

#### Auth (`src/redux/slices/authSlice.js`, `src/services/api/authService.js`)
- **`fetchProfile` thunk added** — `GET /auth/me` for post-login profile enrichment
- **`completeOnboarding` action added** — sets `needsOnboarding: false` after employee completes cab setup
- **`needsOnboarding` state field added** — `true` when authenticated employee has no `homeAddress` (triggers first-run cab request flow)
- **Token injection on login** — `loginUser` and `verifyOTP` both call `setAuthToken()` to attach the access token to the Axios instance immediately after successful login
- **`verifyOTP` remapped** — previously called a separate OTP endpoint; now calls `employee-login` with `{ phone, password: otp }` to match NestJS single-step auth
- **`loginUser` sets `isAuthenticated`** — employee is authenticated directly on login response if `accessToken` is present (no two-step OTP required for most flows)
- **Token cleared on logout** — `logoutUser` calls `setAuthToken(null)` in `finally` block

#### Navigation (`src/navigation/`)
- **`DriverLoginScreen` registered** — added to `AuthNavigator` at `SCREENS.DRIVER_LOGIN`
- **`DriverOnboardingScreen` registered** — added to `AuthNavigator` at `SCREENS.DRIVER_ONBOARDING`
- **`needsOnboarding` route guard added** — `RootNavigator` checks `auth.needsOnboarding`; authenticated employees without home address are routed to cab request flow (Step1/Step2) before entering main app

#### Redux Slices (`src/redux/slices/`)
- **`tripSlice`** — `fetchTripDetails` and `fetchTripStops` thunks added; `selectedTrip`, `tripStops`, `driverInfo` state fields added. Employee screens now use Redux for trip data instead of mock constants
- **`driverSlice`** — `fetchActiveTrip`, `updateDriverLocation`, `completeTrip` thunks wired to real driver API
- **`authSlice`** — see Auth section above
- **`appSlice`** — initialization logic updated for real API boot sequence

#### Screens
- **`LoginScreen.js`** — updated for NestJS `employee-login` response shape (`data.data.accessToken`, `data.data.user`)
- **`HomeScreen.js`** — wired to real dashboard/trips APIs instead of mock data
- **`TripDetailsScreen.js`** — replaced all MOCK_STOPS and MOCK_TRIP_EMPLOYEES constants with Redux `fetchTripDetails` + `fetchTripStops`. Loading spinner added. Driver info resolved from `driverInfo` Redux state with fallback to trip params
- **`HandoffListScreen.js`** — refactored to use real passenger data from Redux
- **`RideDetailsScreen.js`** — minor alignment with NestJS field names
- **`RequestCabStep1Screen.js`** — major rewrite: removed mock stop/route/shift data; loads from `configService` API calls; form validation and submission wired to `requestsService`
- **`RequestCabStep2Screen.js`** — major rewrite: review & confirm screen now submits real cab request to `POST /requests`
- **`LiveTrackingScreen.js`** — wired to `useTrackingSocket` hook for real-time `cab_location_update` events
- **`TripsScreen.js`** — wired to real trips API with pull-to-refresh
- **`NotificationsScreen.js`** — wired to real notifications API
- **`AttendanceScreen.js`** (Driver) — wired to real driver attendance API
- **`DriverActiveTripScreen.js`** — wired to `useDriverLocation` + `useTrackingSocket` for GPS emit
- **`TripSummaryScreen.js`** (Driver) — displays real completed trip data
- **`CancelRequestScreen.js`**, **`LocationChangeScreen.js`**, **`ReportIssueScreen.js`** — form submissions wired to real requests API
- **`RoleSelectionScreen.js`** — minor cleanup for role routing

#### Services (`src/services/api/`)
- **`authService.js`** — login URL updated to `employee-login` endpoint; response field alignment
- **`driverService.js`** — endpoints updated to NestJS paths
- **`tripService.js`** — endpoints updated; added `fetchStops`, `fetchPassengers`

#### Constants & Hooks
- **`constants/index.js`** — `SCREENS.DRIVER_LOGIN`, `SCREENS.DRIVER_ONBOARDING` added
- **`hooks/index.js`** — exports updated for new hooks

---

### Added

#### New Screens
- **`src/screens/Auth/DriverLoginScreen.js`** — Phone number login screen for drivers. Dispatches `loginUser` → navigates to OTPVerificationScreen. Follows Figma Driver Handoff 4/17 design
- **`src/screens/Onboarding/DriverOnboardingScreen.js`** — First-run onboarding for new drivers. Collects vehicle preference and shows app intro

#### New Hooks
- **`src/hooks/useDriverLocation.js`** — GPS tracking hook for driver screens. Requests `expo-location` foreground permission, watches device position, and calls `emitLocation` callback (connected to `useTrackingSocket`). Used by `DriverActiveTripScreen`
- **`src/hooks/useTrackingSocket.js`** — Socket.IO `/tracking` namespace hook. Connects with JWT auth token from Redux store. Derives socket URL from `API_BASE_URL` (strips `/api/v1` suffix). Used by `LiveTrackingScreen` (employee) and `DriverActiveTripScreen` (driver)

#### New Services
- **`src/services/api/configService.js`** — API calls for app configuration data (routes, stops, shifts, work locations)
- **`src/services/api/profileService.js`** — `GET /profile`, `PUT /profile`, `POST /profile/photo`
- **`src/services/api/requestsService.js`** — `GET /requests`, `POST /requests`, `PUT /requests/:id/review`

---

### Lessons Learned

| What was tried | Why it failed | What worked |
|---|---|---|
| Separate OTP verify endpoint | NestJS uses single-step `employee-login` — no separate `/auth/verify-otp` endpoint | Map `verifyOTP` thunk to call `employee-login` with `{ phone, password: otp }` |
| Hardcoded `API_BASE_URL` in `axiosConfig.js` | Caused mismatch when `env.js` URL was updated | Import `API_BASE_URL` from `env.js` as single source of truth |
| Token injection via AsyncStorage read in interceptor | Async in interceptor causes race conditions on first request | Set token synchronously in `axiosInstance.defaults.headers.common['Authorization']` on login |

---

## Changelog Rules

### What to log:
- Every new screen, hook, or service
- Every API endpoint change or rename
- Every Redux state change
- Every navigation route addition
- Every bug fix with root cause

### Categories:
- **Added** — new screens, hooks, services, constants
- **Changed** — modifications to existing behavior
- **Fixed** — bug fixes
- **Removed** — deleted mock data, deprecated patterns
