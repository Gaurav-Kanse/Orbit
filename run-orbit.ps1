# Orbit Windows PowerShell Launcher & Build Script
Param(
    [ValidateSet("dev", "build", "release")]
    [string]$Mode = "dev"
)

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Orbit - Dynamic Island Desktop Productivity (Windows)  " -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

if ($Mode -eq "build") {
    Write-Host "[Orbit] Building production installer for Windows..." -ForegroundColor Yellow
    npm run tauri:build
} elseif ($Mode -eq "release") {
    if (Test-Path "src-tauri\target\release\orbit.exe") {
        Write-Host "[Orbit] Launching release executable..." -ForegroundColor Green
        Start-Process "src-tauri\target\release\orbit.exe"
    } elseif (Test-Path "src-tauri\target\debug\orbit.exe") {
        Write-Host "[Orbit] Launching debug executable..." -ForegroundColor Green
        Start-Process "src-tauri\target\debug\orbit.exe"
    } else {
        Write-Host "[Orbit] Pre-compiled binary not found. Building now..." -ForegroundColor Yellow
        npm run tauri:build
    }
} else {
    Write-Host "[Orbit] Starting Orbit in development mode..." -ForegroundColor Green
    npm run tauri:dev
}
