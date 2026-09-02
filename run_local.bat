@echo off
TITLE AtmoGraph - Mission Control Launcher
COLOR 0B

echo ===================================================
echo     ATMOGRAPH - AI SUPPLY CHAIN TWIN LAUNCHER
echo ===================================================
echo.

echo [1/2] Checking Frontend Dependencies...
call npm install

echo.
echo [2/2] Starting Development Server on http://localhost:5173...
echo.
start http://localhost:5173
call npm run dev

pause
