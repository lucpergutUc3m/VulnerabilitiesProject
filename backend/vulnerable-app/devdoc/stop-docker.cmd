@echo off
REM ========================================
REM Stop Docker Development Environment
REM ========================================

echo.
echo Stopping Docker containers...
echo.

docker compose --profile dev down

echo.
echo Docker containers stopped.
echo Database data is preserved in Docker volumes.
echo.
pause
