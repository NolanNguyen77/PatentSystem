# Test Backend API on localhost:4001

Write-Host "🧪 Testing Backend API..." -ForegroundColor Cyan
Write-Host "=" -ForegroundColor Cyan * 50
Write-Host ""

# Wait for server to be ready
Write-Host "⏳ Waiting for server..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Test 1: Health Check
Write-Host "Test 1️⃣: Health Check" -ForegroundColor Green
Write-Host "URL: http://localhost:4001/health" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "http://localhost:4001/health" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    $json = $response.Content | ConvertFrom-Json
    Write-Host "✅ Response: $($json | ConvertTo-Json)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 2: Login
Write-Host "Test 2️⃣: Login with test credentials" -ForegroundColor Green
Write-Host "URL: http://localhost:4001/api/auth/login" -ForegroundColor Gray

$loginBody = @{
    username = "tan286"
    password = "026339229"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:4001/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginBody `
        -TimeoutSec 10 `
        -ErrorAction Stop
    
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    $json = $response.Content | ConvertFrom-Json
    Write-Host "✅ User: $($json.user.userId)" -ForegroundColor Green
    Write-Host "✅ Token received: $($json.token.Substring(0, 30))..." -ForegroundColor Green
    Write-Host ""
    
    $token = $json.token
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 3: Get Current User (Authenticated)
Write-Host "Test 3️⃣: Get Current User (Authenticated)" -ForegroundColor Green
Write-Host "URL: http://localhost:4001/api/auth/me" -ForegroundColor Gray

$headers = @{
    "Authorization" = "Bearer $token"
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:4001/api/auth/me" `
        -Headers $headers `
        -TimeoutSec 10 `
        -ErrorAction Stop
    
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    $json = $response.Content | ConvertFrom-Json
    Write-Host "✅ User ID: $($json.data.id)" -ForegroundColor Green
    Write-Host "✅ Name: $($json.data.name)" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Test 4: Get All Titles
Write-Host "Test 4️⃣: Get All Titles (Authenticated)" -ForegroundColor Green
Write-Host "URL: http://localhost:4001/api/titles" -ForegroundColor Gray

try {
    $response = Invoke-WebRequest -Uri "http://localhost:4001/api/titles" `
        -Headers $headers `
        -TimeoutSec 10 `
        -ErrorAction Stop
    
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    $json = $response.Content | ConvertFrom-Json
    Write-Host "✅ Titles response received" -ForegroundColor Green
    
    if ($json.data) {
        Write-Host "✅ Total: $($json.data.Count) titles" -ForegroundColor Green
    } else {
        Write-Host "ℹ️  No titles in database yet" -ForegroundColor Yellow
    }
    Write-Host ""
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "=" -ForegroundColor Cyan * 50
Write-Host "✅ All tests passed!" -ForegroundColor Green
Write-Host ""
Write-Host "🎉 Backend API is working perfectly!" -ForegroundColor Yellow
Write-Host "   ✓ Database connection" -ForegroundColor Green
Write-Host "   ✓ Authentication" -ForegroundColor Green
Write-Host "   ✓ API endpoints" -ForegroundColor Green
Write-Host ""
