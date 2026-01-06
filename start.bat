@echo off
title Dashboard Uskup - Development Server (Port 3001)
color 0A
cls
echo.
echo ========================================
echo   Dashboard Uskup - Development Server
echo ========================================
echo.

REM Kill any existing Node processes on port 3000 and 3001
echo [1/4] Checking for running processes...
taskkill /F /IM node.exe 2>nul
if %errorlevel%==0 (
    echo       Terminated existing Node processes.
) else (
    echo       No existing processes to terminate.
)

REM Clear Next.js cache
echo.
echo [2/4] Clearing Next.js cache...
if exist .next (
    rmdir /s /q .next 2>nul
    echo       .next cache cleared.
) else (
    echo       No .next cache to clear.
)

REM Clear npm cache for this project
echo.
echo [3/4] Clearing node_modules/.cache...
if exist node_modules\.cache (
    rmdir /s /q node_modules\.cache 2>nul
    echo       node_modules/.cache cleared.
) else (
    echo       No node_modules/.cache to clear.
)

echo.
echo [4/4] Starting development server...
echo.
echo ----------------------------------------
echo   PORT INFORMATION:
echo ----------------------------------------
echo   Frontend URL : http://localhost:3001
echo   Backend API  : http://localhost:3001/api
echo ----------------------------------------
echo.
echo   NOTE: Using port 3001 to avoid caching
echo   issues. Open browser at:
echo   http://localhost:3001
echo.
echo ========================================
echo   Press Ctrl+C to stop the server
echo ========================================
echo.

REM Start the development server on port 3001
next dev -p 3001

echo.
echo ========================================
echo   Server stopped.
echo ========================================
pause
