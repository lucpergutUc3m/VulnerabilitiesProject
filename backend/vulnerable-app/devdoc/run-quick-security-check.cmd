@echo off
REM Quick Security Check Script
REM Runs only static analysis (no dynamic scan)

echo ====================================
echo QUICK SECURITY CHECK
echo ====================================
echo Running static security analysis...
echo.
echo NOTE: This uses cached NVD data (no updates).
echo To update the database first, run: update-nvd-database.cmd
echo.

REM Change to project root directory
cd /d "%~dp0\.."

echo [1/2] OWASP Dependency-Check...
echo Analyzing dependencies (using cached data)...
call mvnw dependency-check:check -DnvdApiServicesEnabled=false

echo.
echo [2/2] SpotBugs Security Analysis...
echo Scanning for security vulnerabilities in code...
call mvnw spotbugs:spotbugs

echo.
echo ====================================
echo Quick security check complete!
echo ====================================
echo.

REM Check if reports were generated
set REPORTS_FOUND=0
set DEPENDENCY_CHECK_OK=0
set SPOTBUGS_OK=0

if exist "target\dependency-check-report.html" (
    echo [OK] Dependency-Check report: target\dependency-check-report.html
    set REPORTS_FOUND=1
    set DEPENDENCY_CHECK_OK=1
) else (
    echo [WARNING] Dependency-Check report not generated
    echo           First run? Update the NVD database: update-nvd-database.cmd
)

if exist "target\site\spotbugs.html" (
    echo [OK] SpotBugs report: target\site\spotbugs.html
    set REPORTS_FOUND=1
    set SPOTBUGS_OK=1
) else (
    echo [WARNING] SpotBugs report not found at target\site\spotbugs.html
)

echo.

REM Open reports if they exist
if "%DEPENDENCY_CHECK_OK%"=="1" (
    echo Opening Dependency-Check report...
    start "" "target\dependency-check-report.html"
    timeout /t 2 /nobreak >nul
)

if "%SPOTBUGS_OK%"=="1" (
    echo Opening SpotBugs report...
    start "" "target\site\spotbugs.html"
)

if "%REPORTS_FOUND%"=="0" (
    echo.
    echo ====================================
    echo FIRST TIME SETUP REQUIRED
    echo ====================================
    echo.
    echo To use Dependency-Check, you need to download the NVD database first.
    echo This is a one-time operation that can take 10-30 minutes.
    echo.
    echo Steps:
    echo 1. Make sure NVD_API_KEY is set (run check-nvd-api-key.cmd to verify)
    echo 2. Run: update-nvd-database.cmd
    echo 3. Then run this script again
    echo.
) else (
    if "%DEPENDENCY_CHECK_OK%"=="0" (
        echo.
        echo NOTE: To enable Dependency-Check, run: update-nvd-database.cmd
        echo.
    )
)

pause
