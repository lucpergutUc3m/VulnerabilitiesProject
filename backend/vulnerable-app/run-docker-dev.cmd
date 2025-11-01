@echo off
REM ========================================
REM Run Backend with Docker (Development)
REM Uses PostgreSQL + Adminer GUI
REM ========================================

echo.
echo ========================================
echo Starting Backend in DOCKER-DEV mode
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not running!
    echo Please start Docker Desktop and try again.
    pause
    exit /b 1
)

echo [1/3] Starting PostgreSQL and Adminer...
docker compose --profile dev up -d
if errorlevel 1 (
    echo [ERROR] Failed to start Docker containers!
    pause
    exit /b 1
)

echo.
echo [2/3] Waiting for PostgreSQL to be ready...
timeout /t 5 /nobreak >nul

echo.
echo [3/3] Starting Spring Boot backend...
echo.
echo ========================================
echo Database: PostgreSQL
echo Adminer GUI: http://localhost:8081
echo   - Server: postgres
echo   - Username: dbuser
echo   - Password: dbpassword
echo   - Database: vulnerableappdb
echo Backend: http://localhost:8080
echo ========================================
echo.

REM Set the profile to 'docker-dev'
set SPRING_PROFILES_ACTIVE=docker-dev

REM Start the application
call mvnw.cmd spring-boot:run

pause
