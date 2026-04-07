@echo off
REM Double-click this (or run from cmd). Approve UAC, then REBOOT Windows.
REM Sets registry LongPathsEnabled=1 so CMake/Ninja can use paths over 260 chars.
cd /d "%~dp0"
echo Opening elevated PowerShell...
powershell -NoProfile -Command "Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File \"\"%CD%\enable-windows-long-paths.ps1\"\"'"
echo.
echo After the admin window finishes: restart the PC, then build again in Android Studio.
pause
