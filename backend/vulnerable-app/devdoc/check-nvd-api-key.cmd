@echo off
REM Check NVD API Key Configuration
REM This script verifies if the NVD_API_KEY environment variable is set

echo ====================================
echo NVD API Key Configuration Check
echo ====================================
echo.

REM Check if NVD_API_KEY environment variable is set
if defined NVD_API_KEY (
    echo [OK] NVD_API_KEY is set
    echo.
    echo Full Key: %NVD_API_KEY%
    echo.
    REM Show last 4 characters for verification
    set "key=%NVD_API_KEY%"
    set "last4=%key:~-4%"
    echo Last 4 characters: ...%last4%
    echo.
) else (
    echo [NOT SET] NVD_API_KEY environment variable is NOT set
    echo.
    echo To set it:
    echo 1. Get an API key from: https://nvd.nist.gov/developers/request-an-api-key
    echo 2. Run: setx NVD_API_KEY "your-api-key-here"
    echo 3. Restart your terminal/IDE
    echo.
    echo See NVD_API_KEY_SETUP.md for detailed instructions.
    echo.
)

echo ====================================
echo Maven Property Check
echo ====================================
echo.

REM Check if it's set in Maven settings
if exist "%USERPROFILE%\.m2\settings.xml" (
    echo Maven settings.xml exists at: %USERPROFILE%\.m2\settings.xml
    echo.
    findstr /i "nvd.api.key" "%USERPROFILE%\.m2\settings.xml" >nul 2>&1
    if errorlevel 1 (
        echo [NOT FOUND] nvd.api.key property not found in settings.xml
    ) else (
        echo [FOUND] nvd.api.key property found in settings.xml
        echo.
        echo Content:
        findstr /i "nvd.api.key" "%USERPROFILE%\.m2\settings.xml"
    )
) else (
    echo [NOT FOUND] Maven settings.xml does not exist
    echo Location: %USERPROFILE%\.m2\settings.xml
)

echo.
echo ====================================
echo Current Session Variables
echo ====================================
echo.
echo Checking all environment variables with 'NVD' in the name:
set | findstr /i "NVD"

echo.
echo ====================================
echo Recommendation
echo ====================================
echo.
echo For best results, use the environment variable method:
echo   setx NVD_API_KEY "your-key-here"
echo.
echo Then restart your terminal/IDE.
echo.

pause
