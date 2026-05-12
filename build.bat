@echo off
title PomodoroClock Build Script
setlocal

echo ============================================
echo   PomodoroClock Build Script
echo ============================================
echo.

REM Check Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed.
    echo Download: https://nodejs.org/en/download/
    echo Recommended: Node.js 18 LTS or later
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node -v') do set NODE_VER=%%i
for /f "tokens=*" %%i in ('npm -v') do set NPM_VER=%%i
echo [INFO] Node.js: %NODE_VER%
echo [INFO] npm: %NPM_VER%
echo.

REM Enter script directory
cd /d "%~dp0"

REM Clean old build
echo [0/3] Cleaning old build artifacts...
if exist "release" (
    rmdir /s /q "release" 2>nul
    if exist "release" (
        echo [WARN] release folder is locked (PomodoroClock may be running), skipping clean
    ) else (
        echo [OK] Old build cleaned
    )
)
echo.

REM Install dependencies
echo [1/3] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install failed. Check your network or npm config.
    pause
    exit /b 1
)
echo [OK] Dependencies installed
echo.

REM Build
echo [2/3] Building project (Vite + TypeScript + electron-builder)...
echo       This may take a few minutes...
echo.
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed. Check the error messages above.
    pause
    exit /b 1
)
echo.
echo [OK] Build succeeded
echo.

REM Show output
echo ============================================
echo   Build Complete!
echo ============================================
echo.
echo   Output files:
echo.

if exist "release\PomodoroClock Setup"*.exe (
    for %%f in ("release\PomodoroClock Setup"*.exe) do (
        echo   [OK] Installer: %%f
    )
) else (
    echo   [WARN] Installer not found
)

if exist "release\win-unpacked\PomodoroClock.exe" (
    echo   [OK] Portable:  release\win-unpacked\PomodoroClock.exe
) else (
    echo   [WARN] Portable version not found
)

echo.
echo ============================================
echo   Usage:
echo     A) Run the installer (recommended)
echo     B) Run release\win-unpacked\PomodoroClock.exe
echo ============================================
echo.

pause
endlocal