@echo off
setlocal
REM Map repo to first free drive so Ninja object paths stay under Windows MAX_PATH.
cd /d "%~dp0.."
set "PROJ=%CD%"

subst R: "%PROJ%" >nul 2>&1 && (set "DRV=R" & goto :have_drv)
subst S: "%PROJ%" >nul 2>&1 && (set "DRV=S" & goto :have_drv)
subst T: "%PROJ%" >nul 2>&1 && (set "DRV=T" & goto :have_drv)
subst U: "%PROJ%" >nul 2>&1 && (set "DRV=U" & goto :have_drv)
subst V: "%PROJ%" >nul 2>&1 && (set "DRV=V" & goto :have_drv)
subst W: "%PROJ%" >nul 2>&1 && (set "DRV=W" & goto :have_drv)
subst X: "%PROJ%" >nul 2>&1 && (set "DRV=X" & goto :have_drv)
subst Y: "%PROJ%" >nul 2>&1 && (set "DRV=Y" & goto :have_drv)
subst Z: "%PROJ%" >nul 2>&1 && (set "DRV=Z" & goto :have_drv)

echo [run-android-subst] No free drive letter for SUBST. Run `subst` in cmd and remove an unused mapping, or enable long paths: android\enable-windows-long-paths.ps1
exit /b 1

:have_drv
cd /d %DRV%:\
if exist "%DRV%:\android\app\.cxx" (
    echo [run-android-subst] Removing android\app\.cxx via short path ^(%DRV%:^)
    rmdir /s /q "%DRV%:\android\app\.cxx"
)
echo [run-android-subst] Building from %DRV%:\ ^<-> "%PROJ%"
call npx expo run:android %*
set "ERR=%ERRORLEVEL%"

cd /d "%PROJ%"
subst %DRV%: /d >nul 2>&1
exit /b %ERR%
