@echo off
REM Prueba interactiva de Bypass 403 - Viendo resultados reales
echo ================================================================
echo PRUEBA INTERACTIVA: Bypass 403 con Resultados Visibles
echo ================================================================
echo.

echo Primero, vamos a ver que endpoints existen en tu API...
echo.

REM Test 1: Ver endpoint /api sin bypass
echo [1] Intentando acceder a /api normalmente:
echo ----------------------------------------------------------------
curl -s http://localhost:8080/api
echo.
echo.

REM Test 2: Ver endpoint /api con bypass
echo [2] Accediendo a /api usando bypass (X-Original-URL):
echo ----------------------------------------------------------------
curl -s -H "X-Original-URL: /api" http://localhost:8080/
echo.
echo.

REM Test 3: Ver endpoint /api/tests
echo [3] Intentando acceder a /api/tests normalmente:
echo ----------------------------------------------------------------
curl -s http://localhost:8080/api/tests
echo.
echo.

REM Test 4: Ver endpoint /api/tests con bypass
echo [4] Accediendo a /api/tests usando bypass:
echo ----------------------------------------------------------------
curl -s -H "X-Original-URL: /api/tests" http://localhost:8080/
echo.
echo.

REM Test 5: Ver endpoint /api/admin (requiere autenticacion)
echo [5] Intentando acceder a /api/admin normalmente:
echo ----------------------------------------------------------------
curl -s -w "\nHTTP Status: %%{http_code}\n" http://localhost:8080/api/admin
echo.
echo.

REM Test 6: Ver endpoint /api/admin con bypass
echo [6] BYPASS: Accediendo a /api/admin sin autenticacion:
echo ----------------------------------------------------------------
curl -s -w "\nHTTP Status: %%{http_code}\n" -H "X-Original-URL: /api/admin" http://localhost:8080/
echo.
echo.

REM Test 7: Ver headers de respuesta
echo [7] Viendo HEADERS de la respuesta con bypass:
echo ----------------------------------------------------------------
curl -i -H "X-Original-URL: /api/admin" http://localhost:8080/ 2>&1 | findstr /i "HTTP Content-Type"
echo.
echo.

echo ================================================================
echo COMPARACION VISUAL:
echo ================================================================
echo.
echo Si el bypass funciona, los tests 2, 4 y 6 deberian mostrar
echo contenido diferente al HTML del frontend.
echo.
pause
