#Requires -RunAsAdministrator
# Enables Windows long paths (MAX_PATH > 260) for Win32 apps — needed for CMake/Ninja with deep node_modules paths.
# Run in PowerShell (Admin):  Set-ExecutionPolicy -Scope Process Bypass -File android\enable-windows-long-paths.ps1
# Reboot after this, then you may set cabroster.nativeWindowsPathCheck=false in android\gradle.properties if the guard still trips.

$path = 'HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem'
$name = 'LongPathsEnabled'
$current = Get-ItemProperty -Path $path -Name $name -ErrorAction SilentlyContinue

if ($current.LongPathsEnabled -eq 1) {
    Write-Host "LongPathsEnabled is already 1. Reboot if you have not since enabling it."
    exit 0
}

New-ItemProperty -Path $path -Name $name -Value 1 -PropertyType DWord -Force | Out-Null
Write-Host "Set LongPathsEnabled=1. REBOOT Windows, then rebuild in Android Studio."
Write-Host "This repo already sets cabroster.nativeWindowsPathCheck=false in gradle.properties."
Read-Host "Press Enter to close"
