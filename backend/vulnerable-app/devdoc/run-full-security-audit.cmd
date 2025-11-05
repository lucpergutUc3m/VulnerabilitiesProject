@echo off
REM Full Security Audit Script
REM Runs all security scans: Dependency-Check, SpotBugs, and ZAP

echo ====================================
echo FULL SECURITY AUDIT
echo ====================================
echo This will run all security scans:
echo 1. OWASP Dependency-Check (dependencies)
echo 2. SpotBugs + FindSecBugs (static analysis)
echo 3. OWASP ZAP (dynamic scan)
echo.
echo This may take 15-30 minutes...
echo ====================================
echo.

pause

REM Change to project root directory
cd /d "%~dp0\.."

REM Step 1: Build and run static scans
echo.
echo [1/4] Building application and running static analysis...
echo.
call mvnw clean compile

echo.
echo [2/4] Running OWASP Dependency-Check...
echo.
call mvnw org.owasp:dependency-check-maven:check

echo.
echo [3/4] Running SpotBugs Security Analysis...
echo.
call mvnw spotbugs:check

REM Step 2: Start application for dynamic scan
echo.
echo [4/4] Starting application for ZAP scan...
echo.

REM Build JAR
call mvnw package -DskipTests

REM Start application in background
start /B java -jar target\vulnerable-app-0.0.1-SNAPSHOT.jar > app.log 2>&1

REM Wait for application to start
echo Waiting for application to start (30 seconds)...
timeout /t 30 /nobreak >nul

REM Check if app is running
netstat -ano | findstr :8080 >nul
if errorlevel 1 (
    echo ERROR: Application failed to start
    echo Check app.log for details
    pause
    exit /b 1
)

echo Application started successfully!
echo.

REM Run ZAP scan
echo Running OWASP ZAP baseline scan...
if not exist "devdoc\zap-reports" mkdir devdoc\zap-reports
docker run -v "%cd%\devdoc\zap-reports:/zap/wrk/:rw" -t ghcr.io/zaproxy/zaproxy:stable zap-baseline.py -t http://host.docker.internal:8080 -r zap-baseline-report.html -J zap-baseline-report.json

REM Stop application
echo.
echo Stopping application...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080') do taskkill /F /PID %%a >nul 2>&1

echo.
echo ====================================
echo SECURITY AUDIT COMPLETE!
echo ====================================
echo.

REM Check if reports were generated
set REPORTS_FOUND=0

if exist "target\dependency-check-report.html" (
    echo [OK] Dependency-Check report: target\dependency-check-report.html
    set REPORTS_FOUND=1
) else (
    echo [MISSING] Dependency-Check report not generated
)

if exist "target\spotbugs.html" (
    echo [OK] SpotBugs report: target\spotbugs.html
    set REPORTS_FOUND=1
) else (
    echo [MISSING] SpotBugs report not generated
)

if exist "devdoc\zap-reports\zap-baseline-report.html" (
    echo [OK] ZAP report: devdoc\zap-reports\zap-baseline-report.html
    set REPORTS_FOUND=1
) else (
    echo [MISSING] ZAP report not generated
)

echo.

REM Open reports if they exist
if exist "target\dependency-check-report.html" (
    echo Opening Dependency-Check report...
    start "" "target\dependency-check-report.html"
    timeout /t 2 /nobreak >nul
)

if exist "target\spotbugs.html" (
    echo Opening SpotBugs report...
    start "" "target\spotbugs.html"
    timeout /t 2 /nobreak >nul
)

if exist "devdoc\zap-reports\zap-baseline-report.html" (
    echo Opening ZAP report...
    start "" "devdoc\zap-reports\zap-baseline-report.html"
)

if "%REPORTS_FOUND%"=="0" (
    echo.
    echo ====================================
    echo NO REPORTS GENERATED
    echo ====================================
    echo Check errors above for details.
    echo.
)

echo.
pause
