@echo off
REM Update NVD Database Script
REM Downloads and updates the NVD vulnerability database

echo ====================================
echo UPDATE NVD DATABASE
echo ====================================
echo.
echo This will download the latest vulnerability data from NVD API.
echo This requires an NVD API key to be set in environment variable NVD_API_KEY.
echo.
echo First run can take 10-30 minutes depending on network speed.
echo Subsequent updates are faster (only download changes).
echo.

REM Check if NVD_API_KEY is set
if not defined NVD_API_KEY (
    echo [ERROR] NVD_API_KEY environment variable is NOT set
    echo.
    echo Please set your API key first:
    echo 1. Get an API key from: https://nvd.nist.gov/developers/request-an-api-key
    echo 2. Run: setx NVD_API_KEY "your-api-key-here"
    echo 3. Restart your terminal/IDE
    echo.
    echo See NVD_API_KEY_SETUP.md for detailed instructions.
    echo.
    pause
    exit /b 1
)

echo [OK] NVD_API_KEY is set
echo.

REM Change to project root directory
cd /d "%~dp0\.."

echo Starting NVD database update...
echo This may take several minutes on first run.
echo.

REM Run dependency-check update only
call mvnw org.owasp:dependency-check-maven:11.1.0:update-only -DnvdApiKey=%NVD_API_KEY% -DnvdApiDelay=8000 -DnvdMaxRetryCount=10

echo.

REM Check if update was successful
if errorlevel 1 (
    echo.
    echo ====================================
    echo NVD DATABASE UPDATE FAILED
    echo ====================================
    echo.
    echo The NVD API is currently experiencing issues (this is a known problem).
    echo.
    echo WORKAROUND OPTIONS:
    echo.
    echo 1. Run dependency-check WITHOUT updates:
    echo    Use: run-dependency-check-without-update.cmd
    echo.
    echo 2. Try again later when NVD API is stable
    echo.
    echo 3. For now, you can still run:
    echo    - SpotBugs security analysis (works independently)
    echo    - Quick security check (SpotBugs only)
    echo.
    pause
    exit /b 1
)

echo ====================================
echo NVD Database Update Complete
echo ====================================
echo.
echo The vulnerability database has been updated.
echo You can now run security checks without waiting for updates.
echo.

pause
