@echo off
REM OWASP ZAP Scan using Docker host network
REM This works when your app runs on localhost:8080 (either in Docker or directly)

echo ====================================
echo OWASP ZAP Scan - Host Network Mode
echo ====================================
echo.

cd /d "%~dp0"

REM Check if Docker is running
docker info >nul 2>&1
if errorlevel 1 (
    echo ERROR: Docker is not running
    echo Please start Docker Desktop
    echo.
    pause
    exit /b 1
)

REM Check if application is accessible
echo Checking if application is running on localhost:8080...
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:8080' -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop | Out-Null; exit 0 } catch { exit 1 }"
if errorlevel 1 (
    echo ERROR: Cannot reach application at http://localhost:8080
    echo Please make sure your app is running and accessible
    echo.
    pause
    exit /b 1
)

echo Application is accessible. Starting ZAP scan...
echo.

REM Create reports directory
if not exist "zap-reports" mkdir zap-reports

REM Prompt for scan type
echo Select scan type:
echo 1. Baseline scan (faster, ~10 minutes)
echo 2. Full scan (comprehensive, ~20-30 minutes)
echo.
set /p SCAN_TYPE="Enter your choice (1 or 2): "

if "%SCAN_TYPE%"=="1" goto baseline
if "%SCAN_TYPE%"=="2" goto fullscan
echo Invalid choice. Exiting.
pause
exit /b 1

:baseline
echo.
echo Running ZAP baseline scan...
docker run --rm --network host -v "%cd%\zap-reports:/zap/wrk/:rw" -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t http://localhost:8080 -r zap-baseline-report.html -J zap-baseline-report.json
echo.
echo ====================================
echo Scan complete!
echo Report saved to: zap-reports\zap-baseline-report.html
echo ====================================
echo.
if exist "%cd%\zap-reports\zap-baseline-report.html" (
    start "" "%cd%\zap-reports\zap-baseline-report.html"
)
goto end

:fullscan
echo.
echo Running ZAP full scan (this will take a while)...
docker run --rm --network host -v "%cd%\zap-reports:/zap/wrk/:rw" -t ghcr.io/zaproxy/zaproxy:stable zap-full-scan.py -t http://localhost:8080 -r zap-full-report.html -J zap-full-report.json
echo.
echo ====================================
echo Scan complete!
echo Report saved to: zap-reports\zap-full-report.html
echo ====================================
echo.
if exist "%cd%\zap-reports\zap-full-report.html" (
    start "" "%cd%\zap-reports\zap-full-report.html"
)
goto end

:end
pause
