@echo off
REM ========================================
REM Reset Local H2 Database
REM ========================================

echo.
echo ========================================
echo Reset Local H2 Database
echo ========================================
echo.
echo This will DELETE all data in your local H2 database.
echo The database will be recreated fresh when you next start the app.
echo.
echo Database location: %CD%\data\
echo.

set /p confirm="Are you sure you want to delete all data? (yes/no): "

if /i not "%confirm%"=="yes" (
    echo.
    echo Operation cancelled.
    echo.
    pause
    exit /b 0
)

echo.
echo Deleting database files...

if exist "data" (
    rmdir /s /q "data"
    echo ✅ Database deleted successfully!
    echo.
    echo A fresh database will be created the next time you run the app.
) else (
    echo ℹ️  No database found. Nothing to delete.
)

echo.
pause
