@echo off
setlocal
REM After a debug install from Android Studio: run this so Metro is reachable on a USB device.
cd /d "%~dp0.."

if defined ANDROID_HOME (
  set "ADB=%ANDROID_HOME%\platform-tools\adb.exe"
) else (
  set "ADB=%LOCALAPPDATA%\Android\Sdk\platform-tools\adb.exe"
)

if exist "%ADB%" (
  echo [%~n0] adb reverse tcp:8081 tcp:8081
  "%ADB%" reverse tcp:8081 tcp:8081 2>nul
  if errorlevel 1 echo [%~n0] No device or reverse failed — use Wi‑Fi + same LAN or: npx expo start --tunnel
) else (
  echo [%~n0] adb not found. Set ANDROID_HOME or install Android SDK platform-tools.
)

echo [%~n0] Starting Expo ^(Metro^)...
call npx expo start --android %*
