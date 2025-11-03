@echo off
REM Check Docker Installation Script

echo ====================================
echo Checking Security Audit Prerequisites
echo ====================================
echo.

REM Check Java
echo [1/3] Checking Java...
java -version >nul 2>&1
if errorlevel 1 (
    echo ❌ Java NOT found - Install JDK 21
    set JAVA_OK=0
) else (
    echo ✅ Java found
    java -version 2>&1 | findstr /i "version"
    set JAVA_OK=1
)

echo.

REM Check Maven
echo [2/3] Checking Maven...
cd /d "%~dp0\.."
call mvnw -version >nul 2>&1
if errorlevel 1 (
    echo ❌ Maven NOT found - Maven wrapper should be in project
    set MAVEN_OK=0
) else (
    echo ✅ Maven found
    call mvnw -version 2>&1 | findstr /i "Maven"
    set MAVEN_OK=1
)
cd /d "%~dp0"

echo.

REM Check Docker
echo [3/3] Checking Docker...
docker --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Docker NOT found
    echo.
    echo Docker is required for OWASP ZAP scanning.
    echo Download from: https://www.docker.com/products/docker-desktop/
    echo.
    echo NOTE: You can still run static scans without Docker:
    echo   - run-quick-security-check.cmd (works without Docker)
    set DOCKER_OK=0
) else (
    echo ✅ Docker found
    docker --version
    set DOCKER_OK=1
)

echo.
echo ====================================
echo Summary
echo ====================================

if "%JAVA_OK%"=="1" if "%MAVEN_OK%"=="1" (
    echo ✅ Static analysis ready (Dependency-Check, SpotBugs)
    echo    Run: run-quick-security-check.cmd
) else (
    echo ❌ Static analysis NOT ready
)

echo.

if "%DOCKER_OK%"=="1" (
    echo ✅ Dynamic analysis ready (OWASP ZAP)
    echo    Run: run-zap-baseline.cmd or run-full-security-audit.cmd
) else (
    echo ⚠️  Dynamic analysis NOT ready (Docker required)
    echo    Install Docker for ZAP scanning
)

echo.
echo ====================================
pause
