@echo off
REM Download NVD Database Mirror
REM Downloads a pre-built NVD database from a mirror to bypass API issues

echo ====================================
echo DOWNLOAD NVD DATABASE MIRROR
echo ====================================
echo.
echo The NVD API is currently experiencing issues that prevent normal updates.
echo This script will help you download a pre-built database mirror.
echo.
echo IMPORTANT: You need to manually download the database:
echo.
echo STEPS:
echo 1. Visit: https://github.com/jeremylong/Open-Vulnerability-Project/releases
echo 2. Download the latest "odc-data.zip" file
echo 3. Extract it to: %USERPROFILE%\.m2\repository\org\owasp\dependency-check-data\11.0\
echo.
echo ALTERNATIVE: Use OSS Index analyzer instead
echo.
echo The dependency-check tool can also use Sonatype OSS Index as a data source.
echo This doesn't require NVD API and works more reliably.
echo.
echo To enable OSS Index:
echo 1. Create a free account at: https://ossindex.sonatype.org/
echo 2. Get your API token
echo 3. Configure it in your settings
echo.
pause

REM Open the GitHub releases page
start "" "https://github.com/jeremylong/Open-Vulnerability-Project/releases"

echo.
echo Opened the releases page in your browser.
echo.
echo After downloading and extracting the database, run:
echo   run-dependency-check-without-update.cmd
echo.
pause
