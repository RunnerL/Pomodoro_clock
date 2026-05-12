Write-Host "============================================"
Write-Host "  PomodoroClock Build Script v1.2.0"
Write-Host "============================================"
Write-Host ""

# Check Node.js
try {
    $nodeVer = node -v 2>$null
    $npmVer = npm -v 2>$null
    if (-not $nodeVer) { throw "Node.js not found" }
    Write-Host "[INFO] Node.js: $nodeVer"
    Write-Host "[INFO] npm: $npmVer"
} catch {
    Write-Host "[ERROR] Node.js is not installed."
    Write-Host "Download: https://nodejs.org/en/download/"
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""

# Enter script directory
Set-Location $PSScriptRoot

# Clean old build
Write-Host "[0/3] Cleaning old build artifacts..."
if (Test-Path "release") {
    try {
        Remove-Item -Recurse -Force "release" -ErrorAction Stop
        Write-Host "[OK] Old build cleaned"
    } catch {
        Write-Host "[WARN] release folder is locked. Close PomodoroClock first."
    }
}
Write-Host ""

# Install dependencies
Write-Host "[1/3] Installing dependencies..."
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] npm install failed."
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host "[OK] Dependencies installed"
Write-Host ""

# Build
Write-Host "[2/3] Building (Vite + TypeScript + electron-builder)..."
Write-Host "      This may take a few minutes..."
Write-Host ""
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Build failed."
    Read-Host "Press Enter to exit"
    exit 1
}
Write-Host ""
Write-Host "[OK] Build succeeded"
Write-Host ""

# Show output
Write-Host "============================================"
Write-Host "  Build Complete!"
Write-Host "============================================"
Write-Host ""
Write-Host "  Output files:"
Write-Host ""

$installer = Get-ChildItem "release\PomodoroClock Setup*.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
if ($installer) {
    Write-Host "  [OK] Installer: $($installer.FullName)"
} else {
    Write-Host "  [WARN] Installer not found"
}

if (Test-Path "release\win-unpacked\PomodoroClock.exe") {
    Write-Host "  [OK] Portable: release\win-unpacked\PomodoroClock.exe"
} else {
    Write-Host "  [WARN] Portable version not found"
}

Write-Host ""
Write-Host "============================================"
Write-Host "  Usage:"
Write-Host "    A) Run the installer (recommended)"
Write-Host "    B) Run release\win-unpacked\PomodoroClock.exe"
Write-Host "============================================"
Write-Host ""

Read-Host "Press Enter to exit"