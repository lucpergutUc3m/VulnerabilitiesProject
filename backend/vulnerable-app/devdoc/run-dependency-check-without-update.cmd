@echo off
REM Dependency-Check Without NVD Update
REM Runs dependency check using only cached/existing data

echo ====================================
echo DEPENDENCY-CHECK (NO UPDATE MODE)
echo ====================================
echo.
echo This runs dependency-check without attempting to update the NVD database.
echo This is useful when the NVD API is experiencing issues.
echo.
echo NOTE: Results may be outdated if the database hasn't been updated recently.
echo.

REM Change to project root directory
cd /d "%~dp0\.."

echo Running Dependency-Check analysis...
echo.

REM Run dependency-check with update disabled (using pom.xml configuration)
call mvnw dependency-check:check -DnvdApiServicesEnabled=false

echo.
echo ====================================
echo Analysis Complete
echo ====================================
echo.

if exist "target\dependency-check-report.html" (
    echo [OK] Report generated: target\dependency-check-report.html
    echo.
    echo Opening report...
    start "" "target\dependency-check-report.html"
) else (
    echo [ERROR] Report was not generated.
    echo Check the output above for errors.
)

echo.
pause
