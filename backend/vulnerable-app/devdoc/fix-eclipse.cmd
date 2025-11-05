@echo off
echo Fixing Eclipse configuration...
echo.
echo Step 1: Cleaning target directory...
cd /d "%~dp0\.."
if exist target rmdir /s /q target
echo.
echo Step 2: Running Maven clean and compile...
call mvnw.cmd clean compile
echo.
echo Done! Now in Eclipse:
echo 1. Right-click project - Refresh (F5)
echo 2. Project menu - Clean...
echo 3. Right-click project - Maven - Update Project
echo.
pause
