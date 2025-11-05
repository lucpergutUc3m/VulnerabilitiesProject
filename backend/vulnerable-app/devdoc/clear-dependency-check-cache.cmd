@echo off
REM Clear OWASP Dependency-Check Cache
REM Use this if you get errors like NullPointerException or corrupted data

echo ====================================
echo Clear Dependency-Check Cache
echo ====================================
echo.
echo This will delete the cached NVD vulnerability data.
echo The next scan will download fresh data (may take 10-20 minutes).
echo.

set /p confirm="Are you sure you want to clear the cache? (yes/no): "

if /i not "%confirm%"=="yes" (
    echo.
    echo Operation cancelled.
    echo.
    pause
    exit /b 0
)

echo.
echo Clearing dependency-check cache...
echo.

REM Find the dependency-check data directory
set DC_DIR=%USERPROFILE%\.m2\repository\org\owasp\dependency-check-data

if exist "%DC_DIR%" (
    echo Found cache at: %DC_DIR%
    rmdir /s /q "%DC_DIR%"
    echo Cache directory deleted.
) else (
    echo Cache directory not found at: %DC_DIR%
)

REM Also clear the local Maven dependency-check plugin cache
set DC_PLUGIN=%USERPROFILE%\.m2\repository\org\owasp\dependency-check-maven

if exist "%DC_PLUGIN%\data" (
    echo Found plugin data cache...
    rmdir /s /q "%DC_PLUGIN%\data"
    echo Plugin data cache deleted.
)

echo.
echo ====================================
echo Cache cleared successfully!
echo ====================================
echo.
echo Next steps:
echo 1. Make sure you have an NVD API key set (see NVD_API_KEY_SETUP.md)
echo 2. Run: run-quick-security-check.cmd
echo.
echo The first scan will download fresh data (10-20 minutes with API key).
echo.

pause
