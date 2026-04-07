@echo off
setlocal
pushd "%~dp0.."
set "PROJ=%CD%"
popd

subst R: "%PROJ%" >nul 2>&1 && (set "DRV=R" & goto :have_drv)
subst S: "%PROJ%" >nul 2>&1 && (set "DRV=S" & goto :have_drv)
subst T: "%PROJ%" >nul 2>&1 && (set "DRV=T" & goto :have_drv)
subst U: "%PROJ%" >nul 2>&1 && (set "DRV=U" & goto :have_drv)
subst V: "%PROJ%" >nul 2>&1 && (set "DRV=V" & goto :have_drv)
subst W: "%PROJ%" >nul 2>&1 && (set "DRV=W" & goto :have_drv)
subst X: "%PROJ%" >nul 2>&1 && (set "DRV=X" & goto :have_drv)
subst Y: "%PROJ%" >nul 2>&1 && (set "DRV=Y" & goto :have_drv)
subst Z: "%PROJ%" >nul 2>&1 && (set "DRV=Z" & goto :have_drv)

echo No free SUBST drive letter. Free one with: subst Z: /d
exit /b 1

:have_drv
if exist "%DRV%:\android\app\.cxx" rmdir /s /q "%DRV%:\android\app\.cxx"
cd /d %DRV%:\android
echo Using %DRV%: ^<-^> "%PROJ%"
call gradlew.bat %*
set "ERR=%ERRORLEVEL%"
cd /d "%PROJ%"
subst %DRV%: /d >nul 2>&1
exit /b %ERR%
