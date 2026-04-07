@echo off
@rem Fixes: LockTimeoutException / "Timeout waiting to lock build logic queue" / buildLogic.lock
@rem Cause: two Gradle clients at once (Android Studio sync + another Studio window, OR Studio + Cursor/terminal gradlew).
@rem
@rem 1) Close Android Studio completely (File > Exit). Close other terminals running gradlew in this repo.
@rem 2) Run this script from the android folder (double-click or cmd).
@rem 3) Reopen only one client and sync/build once.

cd /d "%~dp0"

echo Stopping Gradle daemons...
call gradlew.bat --stop 2>nul

echo Waiting for JVMs to release handles...
timeout /t 3 /nobreak >nul

if exist ".gradle\noVersion\buildLogic.lock" (
  echo Removing stale lock: .gradle\noVersion\buildLogic.lock
  del /f /q ".gradle\noVersion\buildLogic.lock" 2>nul
)

if exist ".gradle\noVersion\buildLogic.lock" (
  echo Lock file still present. End remaining Java processes for this project from Task Manager, then run again.
) else (
  echo OK: lock cleared or was absent.
)

echo.
echo Reopen Android Studio and sync. Do not run gradlew in a terminal while Studio is syncing the same project.
pause
