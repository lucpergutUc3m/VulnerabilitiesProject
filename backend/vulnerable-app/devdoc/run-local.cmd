@echo off
REM ========================================
REM Run Backend Locally (NO Docker needed)
REM Uses H2 file database with web console
REM ========================================

echo.
echo [3/3] Starting Spring Boot backend...
echo.
echo ========================================
echo Database: H2 (file-based)
echo GUI: H2 Console at http://localhost:8080/h2-console
echo Backend: http://localhost:8080
echo ========================================
echo.
echo H2 Console Login Details:
echo JDBC URL: jdbc:h2:file:%CD%/data/vulnerableapp-dev
echo Username: sa
echo Password: (leave empty)
echo.
echo IMPORTANT: In the H2 console, REPLACE the default
echo "jdbc:h2:~/test" with the JDBC URL shown above!
echo ========================================
echo.

REM Set the profile to 'local' with seeders enabled
set SPRING_PROFILES_ACTIVE=local,seeder

REM Change to project root directory
cd /d "%~dp0\.."

REM Start the application
call mvnw.cmd spring-boot:run

pause
