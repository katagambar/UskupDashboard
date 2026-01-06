@echo off
REM Dashboard Uskup - Docker Development Script
REM Solves Turbopack/cache issues by running in clean container

echo ========================================
echo  Dashboard Uskup - Docker Development
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

REM Stop existing containers
echo [1/3] Stopping existing containers...
docker-compose down 2>nul

REM Build fresh image (no cache)
echo [2/3] Building fresh image (no cache)...
docker-compose build --no-cache

REM Start container
echo [3/3] Starting container...
docker-compose up

pause
