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
REM Navigate to backend devdoc folder where compose.yaml is located
pushd "%~dp0\backend\vulnerable-app\devdoc"
docker compose --profile dev up -d
popd
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

REM Change to backend project directory
cd /d "%~dp0\backend\vulnerable-app"

REM Start the application with docker-dev and seeder profiles
call mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=docker-dev,seeder

pause
