@echo off
@rem One-time setup so Android Studio uses the same Gradle user home as gradlew.bat (LocalAppData, not %%USERPROFILE%%\.gradle).
@rem Run from Explorer (double-click) or:  cmd /c android\set-windows-gradle-home.bat
@rem Then fully quit Android Studio and reopen the project.

set "TARGET=%LOCALAPPDATA%\CabRoasterGradle"
echo Setting user environment variable GRADLE_USER_HOME=
echo   %TARGET%
echo.
setx GRADLE_USER_HOME "%TARGET%"
if errorlevel 1 (
  echo setx failed. Try running this script as your normal user from cmd.exe.
  pause
  exit /b 1
)
echo.
echo Done. Add a Windows Defender exclusion for this folder:
echo   %TARGET%
echo Also exclude your project folder if builds still fail.
echo Restart Android Studio after this.
pause
