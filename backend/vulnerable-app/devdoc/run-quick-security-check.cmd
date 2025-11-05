@echo off
REM Quick Security Check Script
REM Runs only static analysis (no dynamic scan)

echo ====================================
echo QUICK SECURITY CHECK
echo ====================================
echo Running static security analysis...
echo.

REM Change to project root directory
cd /d "%~dp0\.."

echo [1/2] OWASP Dependency-Check...
call mvnw org.owasp:dependency-check-maven:check

echo.
echo [2/2] SpotBugs Security Analysis...
call mvnw spotbugs:check

echo.
echo ====================================
echo Quick security check complete!
echo ====================================
echo.

REM Check if reports were generated
set REPORTS_FOUND=0

if exist "target\dependency-check-report.html" (
    echo [OK] Dependency-Check report: target\dependency-check-report.html
    set REPORTS_FOUND=1
) else (
    echo [MISSING] Dependency-Check report not generated
    echo          This usually means the scan failed - check errors above
)

if exist "target\spotbugs.html" (
    echo [OK] SpotBugs report: target\spotbugs.html
    set REPORTS_FOUND=1
) else (
    echo [MISSING] SpotBugs report not generated
    echo          This usually means the scan failed - check errors above
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
)

if "%REPORTS_FOUND%"=="0" (
    echo.
    echo ====================================
    echo NO REPORTS GENERATED
    echo ====================================
    echo.
    echo Possible causes:
    echo 1. NVD data cache is corrupted - run: clear-dependency-check-cache.cmd
    echo 2. No NVD API key set - see: NVD_API_KEY_SETUP.md
    echo 3. Network connectivity issues
    echo 4. Maven build errors - check output above
    echo.
)

pause
