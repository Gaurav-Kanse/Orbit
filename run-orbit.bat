@echo off
setlocal enabledelayedexpansion
title Orbit Desktop Productivity

echo ========================================================
echo   Orbit - Dynamic Island Desktop Productivity (Windows)
echo ========================================================
echo.

REM Verify Node.js / npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm was not found in PATH. Please install Node.js (https://nodejs.org/).
    pause
    exit /b 1
)

REM Verify Rust / Cargo
where cargo >nul 2>nul
if %errorlevel% neq 0 (
    echo [WARNING] cargo was not found in PATH.
    echo If building from source, please install Rust from https://rustup.rs/
    echo.
)

if "%1"=="build" goto do_build
if "%1"=="release" goto do_release

:do_dev
echo [Orbit] Starting Orbit in development mode...
call npm run tauri:dev
goto end

:do_build
echo [Orbit] Building production Windows installer / package...
call npm run tauri:build
goto end

:do_release
echo [Orbit] Checking for compiled executable...
if exist "src-tauri\target\release\orbit.exe" (
    echo [Orbit] Launching release binary...
    start "" "src-tauri\target\release\orbit.exe"
) else if exist "src-tauri\target\debug\orbit.exe" (
    echo [Orbit] Launching debug binary...
    start "" "src-tauri\target\debug\orbit.exe"
) else (
    echo [Orbit] No pre-built binary found. Running build now...
    call npm run tauri:build
)
goto end

:end
endlocal
