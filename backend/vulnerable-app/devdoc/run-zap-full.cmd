@echo off
REM OWASP ZAP Full Scan Script
REM This runs a comprehensive security scan (takes longer)

echo ====================================
echo OWASP ZAP Full Security Scan
echo ====================================
echo.
echo WARNING: This scan is more aggressive and may take 10-30 minutes
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

echo Application is running. Starting ZAP full scan...
echo.

REM Create reports directory
if not exist "zap-reports" mkdir zap-reports

REM Run ZAP full scan
echo Running ZAP full scan (this will take a while)...
docker run -v "%cd%\zap-reports:/zap/wrk/:rw" -t ghcr.io/zaproxy/zaproxy:stable zap-full-scan.py -t http://host.docker.internal:8080 -r zap-full-report.html -J zap-full-report.json

echo.
echo ====================================
echo Scan complete!
echo Report saved to: zap-reports\zap-full-report.html
echo ====================================
echo.

REM Open the report
start "" "%cd%\zap-reports\zap-full-report.html"

pause
