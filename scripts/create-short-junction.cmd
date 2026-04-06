@echo off
setlocal
REM One-time: junction %USERPROFILE%\r -> project root so Ninja object paths stay under 260 chars.
REM After this, open the project ONLY via %USERPROFILE%\r in Terminal and Android Studio (File > Open that folder).
cd /d "%~dp0.."
set "TARGET=%CD%"
set "LINK=%USERPROFILE%\r"

if exist "%LINK%" (
    echo Junction already exists:
    echo   %LINK%
    echo If it should point elsewhere, run: rmdir "%LINK%"   ^(removes junction only^)
    exit /b 1
)

mklink /J "%LINK%" "%TARGET%"
if errorlevel 1 (
    echo mklink failed. Try: Settings -^> Privacy ^& security -^> For developers -^> Developer Mode ON
    echo Or run this script from an elevated Command Prompt.
    exit /b 1
)

echo.
echo OK — build from this short path from now on:
echo   %LINK%
echo.
echo Examples:
echo   cd /d "%LINK%"
echo   npm run android
echo.
exit /b 0
