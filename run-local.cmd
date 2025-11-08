@echo off
REM ========================================
REM Run Backend Locally (NO Docker needed)
REM Uses H2 file database with web console
REM ========================================

echo.
echo [1/1] Starting Spring Boot backend...
echo.
echo ========================================
echo Database: H2 (file-based)
echo GUI: H2 Console at http://localhost:8080/h2-console
echo Backend: http://localhost:8080
echo ========================================
echo.
echo H2 Console Login Details:
echo JDBC URL: jdbc:h2:file:%CD%/backend/vulnerable-app/data/vulnerableapp-dev
echo Username: sa
echo Password: (leave empty)
echo.
echo IMPORTANT: In the H2 console, REPLACE the default
echo "jdbc:h2:~/test" with the JDBC URL shown above!
echo ========================================
echo.

REM Change to backend project directory
cd /d "%~dp0\backend\vulnerable-app"

REM Start the application with local and seeder profiles
call mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=local,seeder

pause
