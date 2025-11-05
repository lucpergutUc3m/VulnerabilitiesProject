@echo off
REM OWASP ZAP Baseline Scan Script
REM This runs a quick security scan of the running application

echo ====================================
echo OWASP ZAP Baseline Security Scan
echo ====================================
echo.

REM Check if application is running
echo Checking if application is running on port 8080...
netstat -ano | findstr :8080 >nul
if errorlevel 1 (
    echo ERROR: Application is not running on port 8080
    echo Please start the application first with: mvnw spring-boot:run
    echo.
    pause
    exit /b 1
)

echo Application is running. Starting ZAP scan...
echo.

REM Create reports directory
if not exist "zap-reports" mkdir zap-reports

REM Run ZAP baseline scan
echo Running ZAP baseline scan (this may take a few minutes)...
docker run -v "%cd%\zap-reports:/zap/wrk/:rw" -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t http://host.docker.internal:8080 -r zap-baseline-report.html -J zap-baseline-report.json

echo.
echo ====================================
echo Scan complete!
echo Report saved to: zap-reports\zap-baseline-report.html
echo ====================================
echo.

REM Open the report
start "" "%cd%\zap-reports\zap-baseline-report.html"

pause
