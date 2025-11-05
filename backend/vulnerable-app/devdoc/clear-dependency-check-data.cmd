@echo off
REM Clear OWASP Dependency-Check Data
REM Removes all cached NVD data to allow fresh download

echo ====================================
echo CLEAR DEPENDENCY-CHECK DATA
echo ====================================
echo.
echo This will delete all cached OWASP Dependency-Check data.
echo This is useful when:
echo - The database is corrupted
echo - You want to start fresh
echo - Switching between plugin versions
echo.
echo Data locations that will be cleared:
echo 1. %USERPROFILE%\.m2\repository\org\owasp\dependency-check-data
echo 2. Project target directory
echo.

set /p CONFIRM="Are you sure you want to delete all data? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo.
    echo Cancelled. No data was deleted.
    pause
    exit /b 0
)

echo.
echo Clearing Dependency-Check data...
echo.

REM Clear the main dependency-check data cache
set DATA_DIR=%USERPROFILE%\.m2\repository\org\owasp\dependency-check-data
if exist "%DATA_DIR%" (
    echo [1/3] Removing: %DATA_DIR%
    rmdir /s /q "%DATA_DIR%"
    if exist "%DATA_DIR%" (
        echo [ERROR] Failed to remove directory. It may be in use.
        echo Try closing Eclipse/IDE and running this again.
    ) else (
        echo [OK] Removed successfully
    )
) else (
    echo [1/3] Directory not found (already clean): %DATA_DIR%
)

echo.

REM Clear project target directory
cd /d "%~dp0\.."
if exist "target" (
    echo [2/3] Removing: target directory
    rmdir /s /q "target"
    if exist "target" (
        echo [ERROR] Failed to remove target directory
    ) else (
        echo [OK] Removed successfully
    )
) else (
    echo [2/3] Target directory not found (already clean)
)

echo.

REM Clear Maven plugin cache for dependency-check
set PLUGIN_CACHE=%USERPROFILE%\.m2\repository\org\owasp\dependency-check-maven
if exist "%PLUGIN_CACHE%" (
    echo [3/3] Removing: %PLUGIN_CACHE%
    rmdir /s /q "%PLUGIN_CACHE%"
    if exist "%PLUGIN_CACHE%" (
        echo [ERROR] Failed to remove plugin cache
    ) else (
        echo [OK] Removed successfully
    )
) else (
    echo [3/3] Plugin cache not found (already clean)
)

echo.
echo ====================================
echo CLEANUP COMPLETE
echo ====================================
echo.
echo All OWASP Dependency-Check data has been cleared.
echo.
echo NEXT STEPS:
echo.
echo Option 1: Try updating again (if NVD API is working)
echo   Run: update-nvd-database.cmd
echo.
echo Option 2: Run security check (will use only SpotBugs)
echo   Run: run-quick-security-check.cmd
echo.
echo Option 3: Download database manually
echo   Run: download-nvd-mirror.cmd
echo.

pause
